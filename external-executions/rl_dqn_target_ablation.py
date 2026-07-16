#!/usr/bin/env python3
"""Bounded paired DQN target-copy experiment for the Neural Field Guide."""
from __future__ import annotations
import argparse, hashlib, json, math, platform, random, subprocess, time
from dataclasses import asdict, dataclass
from pathlib import Path
import numpy as np
import torch
from torch import nn

SCHEMA_VERSION = "1.0"

class LineWorld:
    def __init__(self, seed: int, max_steps: int = 12):
        self.rng=random.Random(seed); self.max_steps=max_steps; self.position=0; self.steps=0
    def reset(self):
        self.position=0; self.steps=0; return self.position
    def step(self, action: int):
        self.steps += 1
        if self.rng.random() < .1: action=1-action
        self.position=max(0,min(4,self.position+(1 if action else -1)))
        terminated=self.position==4; truncated=self.steps>=self.max_steps and not terminated
        return self.position, (1.0 if terminated else -.01), terminated, truncated

class QNet(nn.Module):
    def __init__(self):
        super().__init__(); self.net=nn.Sequential(nn.Linear(5,32),nn.Tanh(),nn.Linear(32,2))
    def forward(self, state): return self.net(torch.nn.functional.one_hot(state.long(),5).float())

def state_hash(model: nn.Module) -> str:
    h=hashlib.sha256()
    for value in model.state_dict().values(): h.update(value.detach().cpu().numpy().tobytes())
    return h.hexdigest()

def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def command_output(command: list[str], fallback: str) -> str:
    try:
        result=subprocess.run(command,check=True,capture_output=True,text=True,timeout=10)
        return result.stdout.strip() or fallback
    except (OSError,subprocess.SubprocessError):
        return fallback

def hardware_record(device: str, driver_override: str | None) -> dict[str,object]:
    if device=="cuda":
        driver=driver_override or command_output(["nvidia-smi","--query-gpu=driver_version","--format=csv,noheader"],"unavailable")
        return {"resolved_device":device,"accelerator":torch.cuda.get_device_name(0),"cuda_runtime":torch.version.cuda,"driver_version":driver}
    return {"resolved_device":device,"accelerator":platform.processor() or platform.machine() or "CPU","cuda_runtime":None,"driver_version":driver_override or "not-applicable"}

@dataclass
class ArmResult:
    arm: str; seed: int; target_interval: int; initial_state_sha256: str
    environment_steps: int; gradient_updates: int; target_copies: int; episodes: int
    evaluation_success_rate: float; evaluation_mean_return: float
    final_loss: float; max_abs_q: float; finite: bool; runtime_seconds: float

def train_arm(seed:int, target_interval:int, steps:int, eval_episodes:int, device:str, initial_state:dict[str,torch.Tensor]) -> ArmResult:
    random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
    env=LineWorld(seed+700); online=QNet().to(device); target=QNet().to(device)
    online.load_state_dict(initial_state); target.load_state_dict(initial_state)
    initial_hash=state_hash(online); optimizer=torch.optim.Adam(online.parameters(),lr=2e-3)
    replay=[]; capacity=4000; batch_size=64; gamma=.97; updates=0; target_copies=0; episodes=0; losses=[]; state=env.reset(); start=time.time()
    for step in range(steps):
        epsilon=max(.05,1-step/max(1,steps*.7))
        if random.random()<epsilon: action=random.randrange(2)
        else:
            with torch.no_grad(): action=int(online(torch.tensor([state],device=device)).argmax(1).item())
        next_state,reward,terminated,truncated=env.step(action)
        replay.append((state,action,reward,next_state,terminated,truncated))
        if len(replay)>capacity: replay.pop(0)
        state=next_state
        if terminated or truncated: episodes+=1; state=env.reset()
        if len(replay)>=batch_size:
            batch=random.sample(replay,batch_size); s,a,r,ns,term,trunc=zip(*batch)
            st=torch.tensor(s,device=device); at=torch.tensor(a,device=device); rt=torch.tensor(r,dtype=torch.float32,device=device); nst=torch.tensor(ns,device=device); terminal=torch.tensor(term,dtype=torch.float32,device=device)
            q=online(st).gather(1,at[:,None]).squeeze(1)
            with torch.no_grad(): y=rt+gamma*(1-terminal)*target(nst).max(1).values
            loss=torch.nn.functional.smooth_l1_loss(q,y)
            optimizer.zero_grad(); loss.backward(); torch.nn.utils.clip_grad_norm_(online.parameters(),10); optimizer.step()
            losses.append(float(loss.item())); updates+=1
            if updates%target_interval==0:
                target.load_state_dict(online.state_dict()); target_copies+=1
    eval_env=LineWorld(seed+900); returns=[]; successes=0
    for _ in range(eval_episodes):
        s=eval_env.reset(); total=0.0
        while True:
            with torch.no_grad(): action=int(online(torch.tensor([s],device=device)).argmax(1).item())
            s,reward,terminated,truncated=eval_env.step(action); total+=reward
            if terminated or truncated: successes+=int(terminated); returns.append(total); break
    with torch.no_grad(): max_q=float(online(torch.arange(5,device=device)).abs().max().item())
    final_loss=losses[-1] if losses else math.nan
    finite=all(math.isfinite(x) for x in [final_loss,max_q,*returns]) if losses else False
    return ArmResult("fast-copy" if target_interval==20 else "slow-copy",seed,target_interval,initial_hash,steps,updates,target_copies,episodes,successes/eval_episodes,float(np.mean(returns)),final_loss,max_q,finite,time.time()-start)

def main():
    parser=argparse.ArgumentParser(); parser.add_argument("--profile",choices=["smoke","full"],default="smoke"); parser.add_argument("--device",default="auto"); parser.add_argument("--repository-revision",help="Override the detected Git commit or immutable archive revision"); parser.add_argument("--driver-version",help="Override the detected accelerator driver version"); parser.add_argument("--output",type=Path,default=Path("external-executions/runs/rl-dqn-target.json")); args=parser.parse_args()
    device=("cuda" if torch.cuda.is_available() else "cpu") if args.device=="auto" else args.device
    if device=="cuda" and not torch.cuda.is_available(): raise SystemExit("CUDA requested but unavailable")
    config={"smoke":{"steps":200,"eval_episodes":8,"seeds":[11]},"full":{"steps":20000,"eval_episodes":100,"seeds":[11,23,41,53,67]}}[args.profile]
    pairs=[]
    for seed in config["seeds"]:
        torch.manual_seed(seed); base=QNet(); initial={k:v.detach().clone() for k,v in base.state_dict().items()}
        pair=[train_arm(seed,interval,config["steps"],config["eval_episodes"],device,initial) for interval in (20,100)]
        if pair[0].initial_state_sha256!=pair[1].initial_state_sha256: raise RuntimeError("paired initialization mismatch")
        pairs.append({"seed":seed,"arms":[asdict(row) for row in pair],"paired_success_effect":pair[0].evaluation_success_rate-pair[1].evaluation_success_rate})
    invariant_rows=[row for pair in pairs for row in pair["arms"]]
    invariants={"paired_initialization":all(pair["arms"][0]["initial_state_sha256"]==pair["arms"][1]["initial_state_sha256"] for pair in pairs),"matched_environment_steps":all(pair["arms"][0]["environment_steps"]==pair["arms"][1]["environment_steps"] for pair in pairs),"matched_gradient_updates":all(pair["arms"][0]["gradient_updates"]==pair["arms"][1]["gradient_updates"] for pair in pairs),"treatment_exercised":all(row["target_copies"]>=1 for row in invariant_rows),"all_finite":all(row["finite"] for row in invariant_rows),"all_seeds_present":len(pairs)==len(config["seeds"])}
    if not all(invariants.values()): raise RuntimeError(f"invariant failure: {invariants}")
    runner_path=Path(__file__).resolve(); requirements_path=runner_path.with_name("requirements-rl.txt")
    revision=args.repository_revision or command_output(["git","-C",str(runner_path.parent.parent),"rev-parse","HEAD"],"unavailable")
    dossier={"schema_version":SCHEMA_VERSION,"provenance":{"repository_revision":revision,"runner_sha256":file_hash(runner_path),"requirements_sha256":file_hash(requirements_path)},"execution":{"profile":args.profile,"hardware":hardware_record(device,args.driver_version),"python":platform.python_version(),"torch":torch.__version__,"numpy":np.__version__,"platform":platform.platform()},"config":config,"pairs":pairs,"invariants":invariants,"decision":"Smoke proves integration only." if args.profile=="smoke" else "Interpret the complete paired seed rows; no target interval is promised to win.","scope_boundary":"This course-scale LineWorld experiment tests target-copy interval under a small DQN and fixed budget. It does not establish general DQN or benchmark superiority."}
    args.output.parent.mkdir(parents=True,exist_ok=True); args.output.write_text(json.dumps(dossier,indent=2)+"\n"); print(json.dumps({"output":str(args.output),"invariants":invariants},indent=2))
if __name__=="__main__": main()
