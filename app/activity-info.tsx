"use client";

import { useId, useState, type ReactNode } from "react";
import { MotionReveal } from "./motion/motion-reveal";

export type ActivityMode = "run" | "adapt" | "pseudocode" | "simulated" | "checked" | "reflect" | "external" | "inspect" | "project" | "optional";

type ActivityInfoProps = {
  mode: ActivityMode;
  title?: string;
  detail?: string;
  requirements?: string;
  children?: ReactNode;
};

type LearningActivityContractProps = {
  question: ReactNode;
  action: ReactNode;
  observe: ReactNode;
  explain: ReactNode;
  complete: ReactNode;
  boundary?: ReactNode;
};

type PredictionGateProps = {
  prompt: ReactNode;
  children: ReactNode;
  preview?: ReactNode;
  title?: string;
  placeholder?: string;
  commitLabel?: string;
  reviseLabel?: string;
  responseLabel?: string;
  minLength?: number;
  onRevise?: () => void;
};

const defaults: Record<ActivityMode, { badge: string; title: string; detail: string; requirements: string }> = {
  run: { badge: "RUN LOCALLY", title: "This snippet is runnable", detail: "Predict first, then copy the complete snippet into a local environment and compare the real output with the expected observation.", requirements: "The required language/library is named beside the code. Nothing runs inside this page." },
  adapt: { badge: "ADAPT FIRST", title: "Real syntax, incomplete program", detail: "Inspect the mechanism here. To execute it, supply the named model, tensors, dataset, or surrounding functions from your own environment.", requirements: "Do not paste it unchanged and interpret missing-name errors as a conceptual result." },
  pseudocode: { badge: "READ · DO NOT RUN", title: "Illustrative pseudocode", detail: "Trace the control flow and data responsibilities line by line. Interface names are intentionally generic and are not a copy-paste API.", requirements: "No software is required; answer the prediction and modification prompts on the page." },
  simulated: { badge: "SIMULATED LOCALLY", title: "Teaching simulation on this page", detail: "Change the controls and observe the deterministic toy result. It demonstrates the mechanism without calling an external model or service.", requirements: "No setup, account, network request, or GPU is required." },
  checked: { badge: "CHECKED ON THIS PAGE", title: "Self-contained assessment", detail: "Commit an answer, read the targeted feedback, and retry. Correctness is determined locally from the choices or calculation shown here.", requirements: "No teacher, external grader, API, or account is involved." },
  reflect: { badge: "COMPARE LOCALLY", title: "Guided reflection, not a grade", detail: "Write first, reveal the worked reasoning, then identify the first place your explanation differs and revise it.", requirements: "The page supplies the hint and worked answer. Your comparison is private and is not presented as automatically graded." },
  external: { badge: "OPTIONAL EXTERNAL RUN", title: "Run only in a prepared environment", detail: "This is an authentic reproduction or training procedure, not a browser simulation. The local lesson remains complete without executing it; run it only when you deliberately want the additional practical exercise.", requirements: "Dependencies, model/data payloads, compute, and exact revisions are listed in the section. No course assessment depends on the external run." },
  inspect: { badge: "INSPECT EVIDENCE", title: "Read the preserved evidence", detail: "Compare the artifact, source revision, observed result, and claim boundary. Do not treat published or simulated rows as a run performed in this browser.", requirements: "No execution is required unless you deliberately choose to reproduce the result." },
  project: { badge: "LOCAL SELF-PACED PROJECT", title: "Build and assess this project here", detail: "Work stage by stage. Notes save only in this browser; completeness checks, rubric, exemplar, and worked artifact provide the feedback loop.", requirements: "There is nothing to submit and no external assessor is required." },
  optional: { badge: "OPTIONAL EXTENSION", title: "The lesson is complete without this link", detail: "Use this source only for a second explanation, current implementation detail, or primary evidence after completing the local lesson.", requirements: "External sites may change or become unavailable; no assessment depends on them." },
};

export function ActivityInfo({ mode, title, detail, requirements, children }: ActivityInfoProps) {
  const [pinned, setPinned] = useState(false);
  const id = useId();
  const copy = defaults[mode];
  return <div className="activity-info" data-pinned={pinned ? "true" : undefined}>
    <button type="button" className="activity-info-trigger" aria-expanded={pinned} aria-describedby={id} onClick={() => setPinned((value) => !value)}>
      <span aria-hidden="true">i</span><strong>{copy.badge}</strong><span className="sr-only"> — open instructions</span>
    </button>
    <div className="activity-info-popover" id={id} role="tooltip">
      <span>{copy.badge}</span><strong>{title ?? copy.title}</strong><p>{detail ?? copy.detail}</p>
      <small>{requirements ? <>{requirements} <span>{copy.requirements}</span></> : copy.requirements}</small>{children}
    </div>
  </div>;
}

export function LearningActivityContract({ question, boundary }: LearningActivityContractProps) {
  return <section className="learning-activity-contract" aria-label="Activity learning contract">
    <p><strong>Question:</strong> {question}</p>
    {boundary && <p className="learning-activity-boundary"><strong>Scope:</strong> {boundary}</p>}
  </section>;
}

export function PredictionGate({ prompt, children, preview, title = "Pause and predict", placeholder = "State what you expect to happen and why…", commitLabel = "Commit prediction and begin", reviseLabel = "Revise prediction and reset activity", responseLabel = "Your committed prediction", minLength = 18, onRevise }: PredictionGateProps) {
  const [draft, setDraft] = useState("");
  const [committed, setCommitted] = useState(false);
  const id = useId();

  const revise = () => {
    setCommitted(false);
    onRevise?.();
  };

  return <div className="activity-prediction-gate">
    {preview && <div className="activity-prediction-preview">{preview}</div>}
    {!committed ? <div className="activity-prediction-entry">
      <label htmlFor={id}><strong>{title}</strong><p>{prompt}</p><textarea id={id} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} /></label>
      <button type="button" disabled={draft.trim().length < minLength} onClick={() => setCommitted(true)}>{commitLabel}</button>
      <small>Private; not graded.</small>
    </div> : <div className="activity-prediction-locked">
      <div><span>{responseLabel}</span><p>{draft}</p></div>
      <button type="button" onClick={revise}>{reviseLabel}</button>
    </div>}
    {committed && <MotionReveal stateKey="committed" className="activity-after-commit">{children}</MotionReveal>}
  </div>;
}

export type CodeGuidance = { mode: Extract<ActivityMode, "run" | "adapt" | "pseudocode">; requirements: string };

const run = (requirements: string): CodeGuidance => ({ mode: "run", requirements });
const adapt = (requirements: string): CodeGuidance => ({ mode: "adapt", requirements });
const pseudo = (requirements = "No runtime is required; trace the mechanism and answer the prompts on this page."): CodeGuidance => ({ mode: "pseudocode", requirements });

export const codeActivityGuidance: Record<string, CodeGuidance> = {
  introduction: pseudo(),
  "tensors-shapes": run("Python 3 and NumPy. Run the complete block as shown."),
  "probability-softmax": run("Python 3 and NumPy. Run the complete block as shown."),
  "gradients-backprop": run("Python 3 and PyTorch. CPU is sufficient."),
  optimizers: run("Python 3 and PyTorch. CPU is sufficient."),
  tokenization: run("Python 3 standard library only; no tokenizer download is used in this byte demonstration."),
  "embedding-layer": run("Python 3 and PyTorch. This creates a fresh toy embedding table; it does not load a pretrained model."),
  "positional-encoding": run("Python 3 and NumPy. This rotates one toy coordinate pair."),
  attention: run("Python 3 and PyTorch. CPU is sufficient; random values make exact weights vary."),
  "layers-of-understanding": adapt("Python 3 and PyTorch-compatible norm, attention, and MLP modules are required. The block function alone is not a full program."),
  "learning-to-predict": adapt("Provide model logits and token_ids tensors with shapes [B,T,V] and [B,T]."),
  "gpt2-from-scratch": adapt("Provide token IDs plus token_embedding, position_embedding, blocks, final_norm, and language_model_head modules."),
  "pretraining-overview": pseudo(),
  "objectives-details": run("Python 3 and PyTorch. Run the complete toy target/mask block as shown."),
  "scaling-laws": run("Python 3 standard library only. This is an arithmetic proxy, not a quality predictor."),
  "data-engineering": adapt("Provide document objects plus write_windows and tokenize functions connected to your own data pipeline."),
  infrastructure: pseudo("Distributed frameworks use different synchronization APIs; use this only to map ownership and communication."),
  "advanced-objectives": adapt("Provide a tokenizer whose vocabulary contains the chosen FIM markers before executing."),
  "pretraining-evaluation": run("Python 3 and NumPy. Run the complete fixed-loss example as shown."),
  sft: pseudo("The role renderer and loss API are illustrative. Use the practical workshop for an executable training path."),
  "preference-optimization": adapt("Provide chosen/rejected policy and reference log-probabilities plus beta as PyTorch tensors."),
  "rl-fundamentals": adapt("Provide policy, state, environment, and baseline implementations in a PyTorch training loop."),
  rlhf: pseudo(),
  "tools-safety": pseudo("The authorization functions represent deterministic runtime controls; they are not model APIs."),
  "decoding-sampling": run("Python 3 and NumPy. Run the complete fixed-distribution example as shown."),
  "generation-kv-cache": run("Python 3 standard library only. Change the arguments for your model contract."),
  "quantization-memory": run("Python 3 and NumPy. This is a toy symmetric quantizer, not a production kernel benchmark."),
  "serving-systems": run("Python 3 standard library only. The four rows are a fixed teaching fixture."),
  "test-time-compute": pseudo(),
  "context-engineering": pseudo(),
  rag: adapt("Provide embed, chunks, query, and generate_with_citations from your retrieval system."),
  "agent-loops": pseudo(),
  "evaluation-design": adapt("Provide evaluation_set, run_system, and score; then add your own paired uncertainty analysis."),
  "security-privacy": pseudo(),
  "observability-governance": pseudo("Tracing interfaces are illustrative; adapt them to the telemetry library and privacy policy you actually use."),
  distillation: adapt("Provide teacher_logits and student_logits PyTorch tensors from a controlled teacher/student experiment."),
  lora: adapt("Python 3 and PyTorch are required. Instantiate the class with a compatible torch.nn.Linear base to observe output and parameter counts."),
  moe: pseudo("Routing, dispatch, capacity, and expert APIs vary by implementation; this is a responsibility trace."),
  "multimodal-models": run("Python 3 and PyTorch. CPU is sufficient for this patch-shape example."),
  "interpretability-editing": pseudo("Hook/cache names are conceptual. Use a pinned interpretability library for a real intervention."),
};

export const technicalActivityGuidance: Record<string, { mode: Extract<ActivityMode, "external" | "simulated" | "inspect">; detail: string; requirements: string }> = {
  tokenization: { mode: "external", detail: "The page provides the exact ten-row contract, but does not execute the pinned GPT-2 and Qwen tokenizer payloads.", requirements: "Install the pinned tokenizer runtime, download both pinned snapshots, run the shown command, and preserve exact IDs/offsets/round trips." },
  "embedding-layer": { mode: "external", detail: "The corrected GPT-2 probe is shown, but the heavyweight checkpoint is not bundled or executed in the page.", requirements: "Install PyTorch/Transformers, load the pinned revision, and preserve token positions plus full-dimensional layer cosines." },
  "pretraining-overview": { mode: "simulated", detail: "The preserved rows come from a deterministic OLMo-compatible teaching fixture, not an OLMo 3 training run.", requirements: "Use the official pinned loader only if you choose to reproduce the production integration." },
  "advanced-objectives": { mode: "simulated", detail: "Serialization and equal-budget metrics use a deterministic course fixture; model-quality rows are explicitly simulated.", requirements: "A real claim requires executing the declared paired causal/FIM model probe." },
  "instruction-tuning-rlhf": { mode: "inspect", detail: "This section inspects released Tülu stage artifacts and separates learned checkpoints from runtime controls.", requirements: "No local training is required; follow the pinned links when verifying a published number." },
  "posttraining-overview": { mode: "inspect", detail: "This is a filled ledger of a published post-training recipe, not a run performed by the course.", requirements: "Inspect the artifact and its revision before generalizing the recipe." },
};
