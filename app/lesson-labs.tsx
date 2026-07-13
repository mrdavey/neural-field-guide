"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "./course-data";

type LabType = NonNullable<Lesson["lab"]>;

const meta: Record<LabType, { title: string; instruction: string; observe: string }> = {
  tokens: { title: "Token microscope", instruction: "Edit the text and compare how a toy subword tokenizer cuts it up.", observe: "Token count—not word count—drives context use and compute." },
  vectors: { title: "Embedding atlas", instruction: "Select an anchor word to see relative similarity in a tiny learned space.", observe: "Related use patterns create neighborhoods; axes themselves need not have names." },
  positions: { title: "Order encoder", instruction: "Change a token’s position and watch its rotary coordinates turn.", observe: "The token stays the same while its position-dependent representation changes." },
  attention: { title: "Attention lens", instruction: "Choose which token is asking the question (the query).", observe: "Each query creates its own distribution of relevance over prior keys." },
  prediction: { title: "Next-token sampler", instruction: "Move temperature, then sample repeatedly from the reshaped distribution.", observe: "Decoding changes selection behavior; it does not retrain the model." },
  scaling: { title: "Compute budget desk", instruction: "Allocate a fixed budget between model size and training tokens.", observe: "An imbalanced run under-trains parameters or saturates a model with excess data." },
  optimizer: { title: "Loss-landscape descent", instruction: "Change the learning rate and advance optimization steps.", observe: "Tiny steps crawl; moderate steps converge; oversized steps can overshoot." },
  preference: { title: "Preference studio", instruction: "Compare two answers and inspect the signal each training method receives.", observe: "A preference states which is better, not an absolute or universal score." },
  lora: { title: "Adapter budget", instruction: "Raise the update rank and compare trainable parameter counts.", observe: "Rank buys adaptation capacity at a fraction of full fine-tuning state." },
  moe: { title: "Expert router", instruction: "Send different tokens through a top-2 expert router.", observe: "Only selected experts compute each token, while the full expert pool adds capacity." },
  distillation: { title: "Teacher temperature", instruction: "Soften the teacher distribution to reveal its second-best beliefs.", observe: "Soft targets carry similarity information beyond the winning class." },
  rl: { title: "Policy update sandbox", instruction: "Set reward and baseline separately, then apply a toy Bernoulli policy-gradient update.", observe: "Advantage—not raw reward alone—sets the update direction and strength." },
  block: { title: "Residual stream walkthrough", instruction: "Advance through a pre-norm block and watch same-width updates accumulate.", observe: "Norm prepares each sublayer; residual additions preserve the stream’s shape." },
  gpt: { title: "Tiny GPT shape tracer", instruction: "Advance a batch through GPT-2 and predict the tensor shape at each stage.", observe: "Most layers preserve [B,T,d]; only the vocabulary head changes d to V." },
  pipeline: { title: "Pre-training control room", instruction: "Advance one optimizer step and inspect the failure mode at each station.", observe: "Data, math, communication, and recovery form one dependency chain." },
  objectives: { title: "Objective construction bench", instruction: "Switch objectives to inspect visible context, serialized input, and loss positions.", observe: "An objective is concrete only when input, target, loss, and stage are named." },
  systems: { title: "Eight-device topology", instruction: "Choose a partition strategy and see what each device owns or communicates.", observe: "Parallelism partitions batches, tensors, or layers; sharding partitions model state." },
  evaluation: { title: "Training diagnostics", instruction: "Select a metric trace, then diagnose it before reading the explanation.", observe: "Objective fit, generalization, and systems health require different signals." }
};

export function LessonLab({ type }: { type: LabType; lesson: Lesson }) {
  const copy = meta[type];
  return <section className="lab-shell" data-lab={type}>
    <div className="lab-intro"><div><span className="eyebrow">Interactive lab · {type}</span><h2>{copy.title}</h2></div><div className="lab-prompt"><span>CHANGE</span><p>{copy.instruction}</p></div><div className="lab-prompt observe"><span>OBSERVE</span><p>{copy.observe}</p></div></div>
    <div className="lab-instrument">{renderLab(type)}</div>
  </section>;
}

function renderLab(type: LabType) {
  switch (type) {
    case "tokens": return <TokenLab />;
    case "vectors": return <VectorLab />;
    case "positions": return <PositionLab />;
    case "attention": return <AttentionLab />;
    case "prediction": return <PredictionLab />;
    case "scaling": return <ScalingLab />;
    case "optimizer": return <OptimizerLab />;
    case "preference": return <PreferenceLab />;
    case "lora": return <LoraLab />;
    case "moe": return <MoeLab />;
    case "distillation": return <DistillationLab />;
    case "rl": return <RLLab />;
    case "block": return <BlockLab />;
    case "gpt": return <GPTLab />;
    case "pipeline": return <PipelineLab />;
    case "objectives": return <ObjectivesLab />;
    case "systems": return <SystemsLab />;
    case "evaluation": return <EvaluationLab />;
  }
}

function TokenLab() {
  const [text, setText] = useState("unbelievable language models!");
  const pieces = useMemo(() => {
    const chunks = text.match(/[A-Za-z]+|\d+|[^\sA-Za-z\d]/g) ?? [];
    return chunks.flatMap((chunk) => {
      if (!/^[A-Za-z]+$/.test(chunk) || chunk.length < 7) return [chunk];
      const cuts = chunk.toLowerCase().startsWith("un") ? [2, Math.max(4, chunk.length - 4)] : [Math.ceil(chunk.length / 2)];
      let start = 0; const output: string[] = [];
      for (const cut of cuts) { if (cut > start && cut < chunk.length) { output.push(chunk.slice(start, cut)); start = cut; } }
      output.push(chunk.slice(start)); return output;
    });
  }, [text]);
  return <div className="token-lab"><label>Input text<input value={text} maxLength={70} onChange={(event) => setText(event.target.value)} /></label><div className="token-output" aria-live="polite">{pieces.map((piece, index) => <span key={`${piece}-${index}`} style={{ "--token-hue": `${18 + index * 34}` } as React.CSSProperties}><b>{piece || "space"}</b><small>ID {Math.abs([...piece].reduce((sum, char) => sum + char.charCodeAt(0), 0) * 17) % 10000}</small></span>)}</div><div className="lab-readout"><strong>{pieces.length}</strong><span>tokens · {text.trim().split(/\s+/).filter(Boolean).length} words</span></div></div>;
}

const vectorPoints = [
  { word: "cat", x: 18, y: 26 }, { word: "dog", x: 30, y: 32 }, { word: "tiger", x: 23, y: 50 },
  { word: "run", x: 70, y: 24 }, { word: "walk", x: 82, y: 36 }, { word: "sprint", x: 72, y: 52 },
  { word: "bank", x: 48, y: 76 }
];
function VectorLab() {
  const [anchor, setAnchor] = useState(vectorPoints[0]);
  const ranked = vectorPoints.filter((point) => point.word !== anchor.word).map((point) => ({ ...point, distance: Math.hypot(point.x - anchor.x, point.y - anchor.y) })).sort((a,b) => a.distance-b.distance);
  return <div className="vector-lab"><div className="vector-map" aria-label="Two-dimensional toy embedding map">{vectorPoints.map((point) => <button key={point.word} className={point.word === anchor.word ? "anchor" : ""} onClick={() => setAnchor(point)} style={{ left:`${point.x}%`, top:`${point.y}%` }}>{point.word}</button>)}</div><div className="similarity-list"><span className="lab-label">Nearest to “{anchor.word}”</span>{ranked.slice(0,3).map((point,index) => <div key={point.word}><span>{index+1}. {point.word}</span><meter min="0" max="100" value={Math.max(5,100-point.distance)} /></div>)}<p>This map compresses a high-dimensional idea into 2-D; real geometry is far richer.</p></div></div>;
}

function PositionLab() {
  const [position,setPosition] = useState(3); const angle = position * 28;
  return <div className="position-lab"><span className="toy-badge">TOY, FIXED TOKEN</span><div className="position-sequence">{Array.from({length:7}).map((_,index) => <span key={index} className={index === position ? "active" : ""}>{index === position ? "token" : "·"}<small>p{index}</small></span>)}</div><label>Move the same token to a new position<input type="range" min="0" max="6" value={position} onChange={(event)=>setPosition(+event.target.value)} /></label><div className="rotation-readout"><div className="rotation-ring"><i style={{ transform:`rotate(${angle}deg)` }} /></div><div><span className="lab-label">One RoPE frequency pair (illustrative)</span><strong>{angle}°</strong><p>Content stays “token” · position changes to {position}. Real RoPE rotates many coordinate pairs at different frequencies.</p></div></div></div>;
}

const attentionTokens = ["The","trophy","didn’t","fit","because","it","was","big"];
const attentionPatterns: Record<number, number[]> = { 1:[.05,.55,.04,.06,.04,.08,.08,.1], 5:[.05,.44,.04,.08,.05,.18,.07,.09], 7:[.03,.31,.03,.07,.05,.16,.09,.26] };
function AttentionLab() {
  const [query,setQuery] = useState(5); const [sharpness,setSharpness]=useState(1); const raw=attentionPatterns[query] ?? attentionTokens.map((_,i)=>i===query?.45:.55/(attentionTokens.length-1)); const visible=raw.map((value,index)=>index<=query?Math.pow(value,sharpness):0); const total=visible.reduce((a,b)=>a+b,0); const weights=visible.map(value=>value/total);
  return <div className="attention-lab"><span className="toy-badge">HAND-AUTHORED TOY SCORES</span><div className="query-picker"><span className="lab-label">1 · Query token</span>{attentionTokens.map((token,index)=><button key={`${token}-${index}`} onClick={()=>setQuery(index)} className={index===query?"active":""}>{token}</button>)}</div><label className="attention-control">2 · Change score contrast <strong>{sharpness.toFixed(1)}×</strong><input type="range" min=".5" max="2" step=".1" value={sharpness} onChange={(event)=>setSharpness(+event.target.value)}/></label><div className="attention-stages"><span>scores q·k</span><b>→ scale √d</b><b>→ mask future</b><b>→ softmax</b><b>→ Σ weight·V</b></div><div className="attention-bars">{attentionTokens.map((token,index)=><div key={`${token}-${index}`} className={index>query?"masked":""}><span>{token}</span><i style={{height:`${index>query?8:Math.max(8,weights[index]*190)}px`,opacity:index>query?1:.35+weights[index]}}/><small>{index>query?"MASK":`${Math.round(weights[index]*100)}%`}</small></div>)}</div><p className="lab-caption">Future keys are zeroed before softmax, then visible weights renormalize to 100%. These weights illustrate routing, not a complete causal explanation of the model’s decision.</p></div>;
}

function softmax(logits:number[], temperature:number) { const values=logits.map(v=>Math.exp(v/temperature)); const sum=values.reduce((a,b)=>a+b,0); return values.map(v=>v/sum); }
function PredictionLab() {
  const [temperature,setTemperature]=useState(1); const [samples,setSamples]=useState<string[]>([]); const words=["model","system","network","idea"]; const probabilities=softmax([2.4,1.7,1.1,.4],temperature);
  const sample=()=>{const r=Math.random();let sum=0;let chosen=words[0];for(let i=0;i<words.length;i++){sum+=probabilities[i];if(r<=sum){chosen=words[i];break}}setSamples(current=>[chosen,...current].slice(0,8))};
  return <div className="prediction-lab"><div className="distribution"><span className="prompt-chip">The language</span>{words.map((word,index)=><div key={word}><span>{word}</span><i><b style={{width:`${probabilities[index]*100}%`}}/></i><strong>{Math.round(probabilities[index]*100)}%</strong></div>)}</div><div className="sampler-controls"><label>Temperature <strong>{temperature.toFixed(1)}</strong><input type="range" min="0.3" max="2" step="0.1" value={temperature} onChange={(event)=>setTemperature(+event.target.value)}/></label><button onClick={sample}>Sample next token</button><div className="sample-stream" aria-live="polite">{samples.length? samples.map((word,index)=><span key={`${word}-${index}`}>{word}</span>):<em>Your samples appear here</em>}</div></div></div>;
}

function ScalingLab() {
  const [model,setModel]=useState(50); const tokens=100-model; const balance=100-Math.abs(model-tokens); const projected=(2.8-(balance/100)*.7).toFixed(2);
  return <div className="scaling-lab"><span className="toy-badge">ILLUSTRATIVE CURVE — NOT A UNIVERSAL 50/50 OPTIMUM</span><label>Fixed compute allocation<input type="range" min="10" max="90" value={model} onChange={(event)=>setModel(+event.target.value)}/></label><div className="budget-bar"><span style={{width:`${model}%`}}>PARAMETERS {model}%</span><span style={{width:`${tokens}%`}}>TOKENS {tokens}%</span></div><div className="scaling-meters"><div><span>Capacity</span><strong>{model<35?"Constrained":model>70?"Under-trained":"Balanced"}</strong></div><div><span>Data exposure</span><strong>{tokens<35?"Too little":tokens>70?"Diminishing return":"Balanced"}</strong></div><div><span>Toy validation loss ↓</span><strong>{projected}</strong></div></div><p className="lab-caption">Real optima come from fitted exponents, constants, data, hardware, and deployment goals; parameters and tokens are not literally commensurate percentage buckets.</p></div>;
}

function OptimizerLab() {
  const [rate,setRate]=useState(.2); const [position,setPosition]=useState(-4); const loss=(x:number)=>Math.pow(x-1.2,2)+.25; const gradient=(x:number)=>2*(x-1.2);
  const step=()=>setPosition(current=>Math.max(-5,Math.min(5,current-rate*gradient(current)))); const reset=()=>setPosition(-4);
  return <div className="optimizer-lab"><div className="loss-curve"><div className="optimum">OPTIMUM</div><span className="optimizer-ball" style={{left:`${(position+5)*10}%`,bottom:`${Math.min(82,12+loss(position)*2.5)}%`}}/><div className="curve-line">∪</div></div><div className="optimizer-controls"><label>Learning rate η <strong>{rate.toFixed(2)}</strong><input type="range" min=".02" max="1.2" step=".02" value={rate} onChange={(event)=>setRate(+event.target.value)}/></label><div><button onClick={step}>Take one step</button><button className="secondary" onClick={reset}>Reset</button></div><p>x = {position.toFixed(2)} · loss = {loss(position).toFixed(2)} · gradient = {gradient(position).toFixed(2)}</p></div></div>;
}

function PreferenceLab() {
  const [chosen,setChosen]=useState<"a"|"b"|null>(null);
  return <div className="preference-lab"><div className="response-pair"><button className={chosen==="a"?"chosen":""} onClick={()=>setChosen("a")}><span>RESPONSE A</span><p>Paris is the capital of France.</p><small>Concise · direct · correct</small></button><button className={chosen==="b"?"chosen":""} onClick={()=>setChosen("b")}><span>RESPONSE B</span><p>I’m absolutely certain the capital is Lyon, a renowned French city.</p><small>Fluent · confident · incorrect</small></button></div><div className="preference-signal" aria-live="polite">{chosen?<><strong>{chosen.toUpperCase()} ≻ {chosen==="a"?"B":"A"}</strong><p>{chosen==="a"?"This comparison rewards correctness and directness. SFT would need an ideal answer; preference learning needs the better of sampled alternatives.":"A preference pipeline will faithfully learn poor criteria too. Label quality defines the target."}</p></>:<p>Choose the answer you would want the model to produce.</p>}</div></div>;
}

function LoraLab() {
  const [rank,setRank]=useState(8); const d=4096; const full=d*d; const lora=2*d*rank;
  return <div className="lora-lab"><div className="matrix-visual"><div className="full-matrix">W <small>{d}×{d}<br/>frozen</small></div><span>+</span><div className="factor b">B<small>{d}×{rank}</small></div><span>×</span><div className="factor a">A<small>{rank}×{d}</small></div></div><label>Adapter rank r = <strong>{rank}</strong><input type="range" min="1" max="64" value={rank} onChange={(event)=>setRank(+event.target.value)}/></label><div className="lora-stats"><div><span>Full update</span><strong>{(full/1e6).toFixed(1)}M</strong></div><div><span>LoRA update</span><strong>{(lora/1e3).toFixed(0)}K</strong></div><div><span>Reduction</span><strong>{Math.round(full/lora)}×</strong></div></div></div>;
}

const expertRoutes:Record<string,number[]>={"function":[1,3],"poetry":[0,2],"equation":[1,2],"bonjour":[0,3]};
function MoeLab() {
  const [token,setToken]=useState("function"); const routes=expertRoutes[token]; const names=["Language","Code","Math","General"];
  return <div className="moe-lab"><span className="toy-badge">HAND-AUTHORED ROUTES — REAL ROUTERS ARE LEARNED</span><div className="token-router"><span className="lab-label">Route token</span>{Object.keys(expertRoutes).map(item=><button key={item} onClick={()=>setToken(item)} className={item===token?"active":""}>{item}</button>)}</div><div className="router-lines"><span className="routed-token">{token}</span><span>TOP-2 ROUTER →</span></div><div className="expert-pool">{names.map((name,index)=><div key={name} className={routes.includes(index)?"active":""}><b>E{index+1}</b><span>{name}</span><small>{routes.includes(index)?"ACTIVE":"idle"}</small></div>)}</div><p className="lab-caption">2 of 4 experts active. Human-readable expert names are only a teaching aid; learned experts need not have clean semantic roles.</p></div>;
}

function DistillationLab() {
  const [temperature,setTemperature]=useState(1); const probs=softmax([4,2.4,.6],temperature); const labels=["cat","dog","car"];
  return <div className="distillation-lab"><label>Teacher temperature T = <strong>{temperature.toFixed(1)}</strong><input type="range" min=".5" max="4" step=".1" value={temperature} onChange={(event)=>setTemperature(+event.target.value)}/></label><div className="teacher-student"><div><span className="lab-label">Teacher soft targets</span>{labels.map((label,index)=><p key={label}><span>{label}</span><i><b style={{width:`${probs[index]*100}%`}}/></i><strong>{(probs[index]*100).toFixed(1)}%</strong></p>)}</div><span className="distill-arrow">knowledge →</span><div className="student-card"><strong>Student</strong><p>learns that <b>dog</b> is more cat-like than <b>car</b>, even though “cat” remains the target.</p></div></div></div>;
}

function RLLab() {
  const [reward,setReward]=useState(1); const [baseline,setBaseline]=useState(.2); const [logit,setLogit]=useState(-.62); const probability=1/(1+Math.exp(-logit)); const advantage=reward-baseline; const update=()=>setLogit(current=>current+.6*advantage*(1-probability));
  return <div className="rl-lab"><span className="toy-badge">TOY BERNOULLI POLICY · SELECTED ACTION GRADIENT</span><div className="policy-choice"><span className="prompt-chip">State: user asks for a hint</span><div><span>Sampled action: give a useful hint</span><meter min="0" max="1" value={probability}/><strong>{Math.round(probability*100)}%</strong></div></div><div className="reward-controls"><label>Return R <strong>{reward.toFixed(1)}</strong><input type="range" min="-1" max="1" step=".1" value={reward} onChange={(event)=>setReward(+event.target.value)}/></label><label>Value baseline b <strong>{baseline.toFixed(1)}</strong><input type="range" min="-1" max="1" step=".1" value={baseline} onChange={(event)=>setBaseline(+event.target.value)}/></label><p>Advantage A = R − b = <strong>{advantage.toFixed(1)}</strong></p><button onClick={update}>Update logit with A·∇log π</button><button className="secondary" onClick={()=>setLogit(-.62)}>Reset</button><p>{advantage>0?"Above-baseline return makes the sampled action more likely.":advantage<0?"Below-baseline return makes the sampled action less likely.":"Return equals baseline, so this sample has zero advantage."}</p></div></div>;
}

function BlockLab(){const steps=[{name:"Residual stream x",shape:"[B,T,d]",note:"The shared information highway."},{name:"Norm → masked attention",shape:"update [B,T,d]",note:"Normalize for the sublayer; route information between positions."},{name:"Residual add",shape:"h = x + attn",note:"Add the same-width update without discarding x."},{name:"Norm → MLP",shape:"update [B,T,d]",note:"Transform features independently at each position."},{name:"Residual add",shape:"y = h + mlp",note:"The block returns the same B×T×d interface."}];const [step,setStep]=useState(0);return <div className="step-lab"><div className="step-track">{steps.map((item,index)=><button key={item.name} className={index<=step?"active":""} onClick={()=>setStep(index)}><span>{index+1}</span>{item.name}</button>)}</div><div className="step-readout"><span className="lab-label">Step {step+1}</span><h3>{steps[step].shape}</h3><p>{steps[step].note}</p><small>Pre-norm shown. Post-norm moves normalization after the residual addition.</small></div></div>}

function GPTLab(){const stages=[{name:"Token IDs",shape:"[B,T]"},{name:"Token + position embeddings",shape:"[B,T,d]"},{name:"12 GPT-2 blocks",shape:"[B,T,d]"},{name:"Final LayerNorm",shape:"[B,T,d]"},{name:"Vocabulary projection",shape:"[B,T,V]"},{name:"Shifted CE labels",shape:"logits [:,:-1] ↔ IDs [:,1:]"}];const [stage,setStage]=useState(0);return <div className="step-lab"><div className="step-track">{stages.map((item,index)=><button key={item.name} className={index<=stage?"active":""} onClick={()=>setStage(index)}><span>{index+1}</span>{item.name}</button>)}</div><div className="step-readout"><span className="lab-label">Tensor checkpoint</span><h3>{stages[stage].shape}</h3><p>{stage<4?"Residual width d stays constant so residual additions are valid.":stage===4?"Only the output head replaces d with vocabulary size V.":"Each position is trained against the token immediately to its right."}</p><code>zero_grad → forward → shifted CE → backward → optimizer.step</code></div></div>}

function PipelineLab(){const stations=["sample + tokenize","forward pass","loss","backward","gradient sync","optimizer step","checkpoint + eval"];const [station,setStation]=useState(0);const failures=["bad mixture or duplicates","NaNs or shape error","target misalignment","exploding gradients","network straggler","unstable learning rate","missing RNG/data state"];return <div className="pipeline-lab"><div className="pipeline-stations">{stations.map((item,index)=><button key={item} onClick={()=>setStation(index)} className={index===station?"active":""}><span>{index+1}</span>{item}</button>)}</div><div className="failure-card"><span className="lab-label">What can go wrong here?</span><strong>{failures[station]}</strong><p>One optimizer step depends on every earlier station; observability localizes the failing subsystem.</p></div></div>}

function ObjectivesLab(){const [kind,setKind]=useState<"causal"|"masked"|"fim"|"span">("causal");const data={causal:{input:"Birds  can  fly",visible:"triangular left context",target:"next token at every position",loss:"token cross-entropy"},masked:{input:"Birds  [MASK]  long distances",visible:"left and right context around mask",target:"fly at masked position",loss:"masked-position cross-entropy"},fim:{input:"<PRE> def area(r): <SUF> <eos> <MID> return π*r*r",visible:"reordered prefix + suffix",target:"missing middle, left-to-right",loss:"causal token cross-entropy"},span:{input:"Birds <X> long distances",visible:"corrupted source",target:"<X> can fly",loss:"decoder token cross-entropy"}}[kind];return <div className="objectives-lab"><div className="objective-tabs">{(["causal","masked","fim","span"] as const).map(item=><button key={item} className={kind===item?"active":""} onClick={()=>setKind(item)}>{item}</button>)}</div><code>{data.input}</code><div className="objective-grid"><div><span>VISIBLE</span><strong>{data.visible}</strong></div><div><span>TARGET</span><strong>{data.target}</strong></div><div><span>LOSS</span><strong>{data.loss}</strong></div></div></div>}

function SystemsLab(){const [mode,setMode]=useState<"dp"|"tp"|"pp">("dp");const detail={dp:"Each device owns a model replica and different batch shard. Gradients all-reduce.",tp:"Pairs split each large matrix operation. Activations communicate inside each pair.",pp:"Devices own consecutive layer ranges. Microbatches flow between stages."}[mode];return <div className="systems-lab"><div className="objective-tabs">{(["dp","tp","pp"] as const).map(item=><button key={item} className={mode===item?"active":""} onClick={()=>setMode(item)}>{item.toUpperCase()}</button>)}</div><div className="device-grid">{Array.from({length:8}).map((_,index)=><div key={index}><b>GPU {index}</b><span>{mode==="dp"?`batch shard ${index}`:mode==="tp"?`tensor half ${index%2+1} · replica ${Math.floor(index/2)+1}`:`layers ${index*4}–${index*4+3}`}</span></div>)}</div><p className="lab-caption">{detail} ZeRO/FSDP is different: it shards parameters, gradients, and/or optimizer states to reduce memory.</p></div>}

function EvaluationLab(){const [trace,setTrace]=useState<"healthy"|"overfit"|"spike">("healthy");const values={healthy:[88,75,64,55,48,43],overfit:[65,55,50,54,63,75],spike:[72,63,59,92,68,60]}[trace];const diagnosis={healthy:"Validation loss falls smoothly: learning and generalization look healthy.",overfit:"Validation loss turns upward while train loss would keep falling: investigate overfitting or distribution mismatch.",spike:"A sudden spike suggests a bad batch, numeric instability, or learning-rate/system event."}[trace];return <div className="evaluation-lab"><div className="objective-tabs">{(["healthy","overfit","spike"] as const).map(item=><button key={item} className={trace===item?"active":""} onClick={()=>setTrace(item)}>{item}</button>)}</div><div className="metric-trace">{values.map((value,index)=><i key={index} style={{height:`${value}%`}}><span>{index+1}</span></i>)}</div><div className="diagnosis"><span className="lab-label">Diagnosis</span><p>{diagnosis}</p><small>NLL 2.0 → perplexity e² ≈ 7.39. Compare only on compatible data and tokenization.</small></div></div>}
