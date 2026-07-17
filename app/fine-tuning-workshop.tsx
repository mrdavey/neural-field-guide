"use client";

import { useMemo, useState } from "react";
import { ActivityInfo, LearningActivityContract, PredictionGate } from "./activity-info";
import { MotionReveal } from "./motion/motion-reveal";

const MODEL_ID = "Qwen/Qwen3-4B-Instruct-2507";
const MODEL_REVISION = "cdbee75f17c01a7cc42f958dc650907174af0554";
const REHEARSAL_MODEL_REVISION = "c1899de289a04d12100db370d81485cdf75e47ca";

const hardwareProfiles = [
  { id: "8", label: "8 GB or less", model: "Qwen/Qwen3-0.6B", revision: REHEARSAL_MODEL_REVISION, method: "Rehearse on Qwen3-0.6B", note: "Use the same workflow with a smaller checkpoint. A 4B run may be fragile once optimizer, activations, and sequence length are included." },
  { id: "16", label: "12–16 GB", model: MODEL_ID, revision: MODEL_REVISION, method: "Qwen3-4B with QLoRA", note: "The recommended workshop path: 4-bit frozen weights, the selected adapter rank, batch size 1, gradient accumulation, and a 512–1,024 token cap." },
  { id: "24", label: "24 GB", model: MODEL_ID, revision: MODEL_REVISION, method: "Qwen3-4B LoRA or QLoRA", note: "Use LoRA in bf16 for a cleaner comparison, or keep QLoRA and spend memory on longer sequences and evaluation batches." },
  { id: "48", label: "48 GB+", model: MODEL_ID, revision: MODEL_REVISION, method: "Run controlled method comparisons", note: "Compare LoRA and QLoRA before considering full tuning. Full-parameter updates add optimizer-state and checkpoint costs that are not justified by default." },
];

const readinessItems = [
  "I have permission to use every training example",
  "I removed secrets, personal data, and duplicated templates",
  "I reserved a truly held-out evaluation split",
  "I use the same chat format for training and deployment",
  "I measured the untouched base model first",
  "I defined both a target improvement and a regression budget",
];

const stages = [
  {
    id: "baseline",
    label: "Baseline",
    title: "Freeze the question before changing the model",
    purpose: "Write one behavioral goal, a held-out prompt set, and a stop condition. Fine-tuning without a frozen baseline makes every result look persuasive after the fact.",
    actions: [
      "Choose one narrow behavior, such as schema-valid support-ticket triage—not ‘make the model better.’",
      "Create 20–50 held-out prompts spanning normal, edge, adversarial, and out-of-domain cases.",
      "Run the untouched model with fixed decoding settings and save raw outputs plus scores.",
    ],
    checkpoint: "You can state the desired improvement and the maximum acceptable loss on general capability before training begins.",
    code: `# Create a clean discovery environment before Stage 01:
# python -m venv .venv-discovery
# source .venv-discovery/bin/activate
# python -m pip install "trl[peft]==1.7.1" bitsandbytes datasets accelerate
# python -m pip check
# python -m pip freeze --all > environment.lock.txt

from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import json

MODEL_ID = "__MODEL_ID__"
MODEL_REVISION = "__MODEL_REVISION__"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, revision=MODEL_REVISION)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    revision=MODEL_REVISION,
    device_map="auto",
    dtype="auto",
)
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

held_out = [
    "Classify this support request as billing, account, or technical: ...",
    "Return only JSON with keys category and rationale: ...",
]

outputs = []
for prompt in held_out:
    result = generator(
        [{"role": "user", "content": prompt}],
        max_new_tokens=120,
        do_sample=False,
    )[0]["generated_text"][-1]["content"]
    outputs.append({"prompt": prompt, "response": result})

with open("baseline_outputs.json", "w") as file:
    json.dump(outputs, file, indent=2)

with open("held_out_prompts.json", "w") as file:
    json.dump(held_out, file, indent=2)`,
  },
  {
    id: "data",
    label: "Data",
    title: "Build demonstrations that teach the actual boundary",
    purpose: "SFT imitates the distribution you provide. Coverage, correctness, role formatting, and counterexamples matter more than collecting a large pile of near-duplicates.",
    actions: [
      "Write or carefully review hundreds of demonstrations; the three rows below are only a pipeline smoke test.",
      "Include ambiguity, refusals, malformed inputs, rare classes, and concise explanations where the product needs them.",
      "Split by source or template family where possible so paraphrases do not leak across train and evaluation.",
    ],
    checkpoint: "A reviewer can inspect a random sample and explain why each assistant answer is correct, permitted, and representative.",
    code: `# Real run target from planner: __DATASET_SIZE__ reviewed demonstrations
from datasets import Dataset

rows = [
    {"messages": [
        {"role": "system", "content": "Classify support requests. Return valid JSON."},
        {"role": "user", "content": "I was charged twice for one month."},
        {"role": "assistant", "content": '{"category":"billing","rationale":"duplicate charge"}'},
    ]},
    {"messages": [
        {"role": "system", "content": "Classify support requests. Return valid JSON."},
        {"role": "user", "content": "My reset email never arrived."},
        {"role": "assistant", "content": '{"category":"account","rationale":"password recovery"}'},
    ]},
    {"messages": [
        {"role": "system", "content": "Classify support requests. Return valid JSON."},
        {"role": "user", "content": "The app crashes when I upload a PDF."},
        {"role": "assistant", "content": '{"category":"technical","rationale":"application crash"}'},
    ]},
]

dataset = Dataset.from_list(rows)
splits = dataset.train_test_split(test_size=0.20, seed=42)
splits.save_to_disk("support_sft_dataset")`,
  },
  {
    id: "inspect",
    label: "Inspect",
    title: "Render tokens before spending GPU time",
    purpose: "The JSON conversation is not what the model sees. Inspect the chat template, role markers, and truncation with the exact pinned tokenizer. In Configure, TRL installs its Qwen3 training template and the code refuses to proceed unless that template produces a real assistant-token mask.",
    actions: [
      "Render at least one normal, longest, multi-turn, and refusal example.",
      "Confirm the final assistant turn and end token appear exactly once.",
      "Measure token-length percentiles before choosing max_length; do not silently truncate the answer you want learned.",
      "Treat the assistant mask as a hard precondition, not an assumption: Configure checks that both excluded prompt tokens and included assistant tokens exist.",
    ],
    checkpoint: "You have inspected decoded training text and token lengths; the next stage must also pass the explicit assistant-mask assertion before training.",
    code: `from transformers import AutoTokenizer

MODEL_ID = "__MODEL_ID__"
MODEL_REVISION = "__MODEL_REVISION__"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, revision=MODEL_REVISION)
example = splits["train"][0]["messages"]

rendered = tokenizer.apply_chat_template(
    example,
    tokenize=False,
    add_generation_prompt=False,
)
token_ids = tokenizer.apply_chat_template(
    example,
    tokenize=True,
    add_generation_prompt=False,
)

print(rendered)
print("token count:", len(token_ids))
assert len(token_ids) <= 1024, "Decide how to handle truncation before training"`,
  },
  {
    id: "configure",
    label: "Configure",
    title: "Configure a conservative QLoRA run",
    purpose: "QLoRA loads the base through a 4-bit quantization configuration, keeps those weights frozen, and learns higher-precision low-rank adapters. Loading the quantized model before constructing the trainer makes the execution boundary explicit and avoids relying on an ambiguous trainer argument.",
    actions: [
      "Use NF4 plus double quantization for the frozen base and target all linear layers with LoRA.",
      "Start with rank 16, one epoch, a 1e-4 adapter learning rate, and assistant-only loss.",
      "Use the pinned TRL/Qwen3 training template, then stop unless its generation markers produce a non-empty assistant mask and exclude prompt tokens.",
      "Use bf16 only on compatible hardware; otherwise set bf16=False and fp16=True.",
    ],
    checkpoint: "The pinned model loads in 4-bit, the assistant-mask assertion passes, the trainable-parameter count is a small fraction of the base, and one tiny batch completes before a full run starts.",
    code: `import torch
from datasets import load_from_disk
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

MODEL_ID = "__MODEL_ID__"
MODEL_REVISION = "__MODEL_REVISION__"
splits = load_from_disk("support_sft_dataset")

quantization = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.__COMPUTE_DTYPE__,
    bnb_4bit_use_double_quant=True,
)

# Quantize the base explicitly before SFTTrainer sees it. This is the standard
# Transformers loading boundary; SFTTrainer receives an already-loaded model.
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    revision=MODEL_REVISION,
    quantization_config=quantization,
    device_map="auto",
    dtype=torch.__COMPUTE_DTYPE__,
)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, revision=MODEL_REVISION)

adapter = LoraConfig(
    r=__RANK__,
    lora_alpha=__ALPHA__,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules="all-linear",
)

args = SFTConfig(
    output_dir="./qwen3-4b-support-adapter",
    max_length=1024,
    assistant_only_loss=True,
    packing=True,
    num_train_epochs=__EPOCHS__,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=8,
    learning_rate=1e-4,
    eval_strategy="steps",
    eval_steps=50,
    save_steps=50,
    logging_steps=5,
    bf16=__BF16__,
    fp16=__FP16__,
    gradient_checkpointing=True,
    report_to="none",
    seed=42,
)

trainer = SFTTrainer(
    model=model,
    args=args,
    train_dataset=splits["train"],
    eval_dataset=splits["test"],
    processing_class=tokenizer,
    peft_config=adapter,
)

# TRL 1.7.1 patches known Qwen3 templates with {% generation %}
# markers when assistant_only_loss=True. Refuse to train if that contract ever
# changes: a missing mask would silently teach the prompt as well as the answer.
mask_probe = trainer.processing_class.apply_chat_template(
    splits["train"][0]["messages"],
    tokenize=True,
    add_generation_prompt=False,
    return_dict=True,
    return_assistant_tokens_mask=True,
)
assistant_mask = mask_probe.get("assistant_masks")
assert assistant_mask is not None, "No assistant mask: inspect the training chat template"
assert 0 < sum(assistant_mask) < len(mask_probe["input_ids"]), (
    "Expected included assistant tokens and excluded system/user tokens"
)
trainer.model.print_trainable_parameters()`,
  },
  {
    id: "train",
    label: "Train",
    title: "Run a smoke test, then the measured experiment",
    purpose: "A successful training loop is not evidence of a useful model. First prove the pipeline on a tiny subset; then record data version, package versions, seed, hardware, throughput, losses, and checkpoints.",
    actions: [
      "Run 5–10 steps and inspect memory, loss, decoded samples, and saved adapter files.",
      "Restart the measured run from a clean process with frozen configuration and versioned data.",
      "Watch training and evaluation loss for divergence, but do not choose a checkpoint from loss alone.",
    ],
    checkpoint: "The run is reproducible from one environment file, one data version, one configuration, and one command.",
    code: `# Stage 01 created a discovery lock. Before the measured run, recreate it:
# python -m venv .venv-measured
# source .venv-measured/bin/activate
# python -m pip install -r environment.lock.txt
# python -m pip check
# python -c "import trl; assert trl.__version__ == '1.7.1'"
# A discovery run is not the measured run; begin only from this recreated lock.

train_result = trainer.train()
eval_metrics = trainer.evaluate()

trainer.save_model("./qwen3-4b-support-adapter/final")
trainer.processing_class.save_pretrained("./qwen3-4b-support-adapter/final")

print({
    "train_loss": train_result.training_loss,
    "eval_loss": eval_metrics.get("eval_loss"),
    "steps": train_result.global_step,
})

# Also record exact package versions and GPU details with the experiment report.
# Do not upload private data, credentials, or proprietary adapter weights.`,
  },
  {
    id: "evaluate",
    label: "Evaluate",
    title: "Compare behavior, not just validation loss",
    purpose: "Re-run the frozen baseline suite with identical decoding. Score target behavior, format validity, general retention, safety boundaries, latency, and representative failures.",
    actions: [
      "Use the same held-out prompts and decoding settings as the untouched baseline.",
      "Blind or randomize comparisons where human judgment is involved.",
      "Inspect every regression slice; a target-task win does not excuse new unsafe or broken behavior.",
    ],
    checkpoint: "You can show a before/after table, confidence intervals or counts, failure examples, and an explicit ship/no-ship decision.",
    code: `import json
from transformers import AutoTokenizer

model = trainer.model.eval()
tokenizer = trainer.processing_class

with open("held_out_prompts.json") as file:
    held_out = json.load(file)

def generate(messages):
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt",
        return_dict=True,
    ).to(model.device)
    output = model.generate(**inputs, max_new_tokens=120, do_sample=False)
    new_tokens = output[0, inputs["input_ids"].shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True)

adapted_outputs = [
    {"prompt": prompt, "response": generate([{"role": "user", "content": prompt}])}
    for prompt in held_out
]

with open("adapted_outputs.json", "w") as file:
    json.dump(adapted_outputs, file, indent=2)

# Score baseline_outputs.json and adapted_outputs.json with the same rubric.
# Keep a separate general-capability and safety regression set.`,
  },
  {
    id: "package",
    label: "Package",
    title: "Ship an adapter with evidence, not a mystery folder",
    purpose: "The useful artifact is an adapter plus a contract: exact base model and revision, chat template, training-data description, configuration, license analysis, evaluation report, known failures, and intended use.",
    actions: [
      "Keep the adapter separate unless deployment requires a merged checkpoint; this preserves provenance and makes rollback easier.",
      "Document the base model license and every dataset license separately—the base license does not clean the data.",
      "Run the final artifact through the actual inference stack before declaring the experiment complete.",
    ],
    checkpoint: "Another student can reproduce, evaluate, and safely remove the adaptation without guessing what changed.",
    code: `from pathlib import Path
import json

artifact = Path("./qwen3-4b-support-adapter/final")
assert (artifact / "adapter_config.json").exists()

report = {
    "base_model": "__MODEL_ID__",
    "base_revision": "__MODEL_REVISION__",
    "method": "QLoRA SFT",
    "data": "versioned dataset identifier and license summary",
    "target_metric": "held-out task score before -> after",
    "regression_budget": "general and safety score limits",
    "known_failures": ["record concrete failure cases here"],
}

(artifact / "evaluation_report.json").write_text(json.dumps(report, indent=2))
print("Adapter package ready for a final deployment-stack test:", artifact)`,
  },
];

const evaluationRows = [
  { name: "Target task", baseline: "Measure first", gate: "+15 percentage points or a predeclared useful effect" },
  { name: "Format validity", baseline: "Parser success rate", gate: "No malformed outputs in the critical held-out set" },
  { name: "General retention", baseline: "Representative base tasks", gate: "No more than 2 points worse without review" },
  { name: "Safety boundary", baseline: "Allowed/refused edge cases", gate: "No new severe failure; track over-refusal too" },
];

export function FineTuningWorkshop() {
  const [hardware, setHardware] = useState("16");
  const [datasetSize, setDatasetSize] = useState(800);
  const [epochs, setEpochs] = useState(1);
  const [rank, setRank] = useState(16);
  const [precision, setPrecision] = useState<"bfloat16" | "float16">("bfloat16");
  const [activeStage, setActiveStage] = useState(0);
  const [readiness, setReadiness] = useState<boolean[]>(readinessItems.map(() => false));

  const profile = hardwareProfiles.find((item) => item.id === hardware)!;
  const effectiveBatch = 8;
  const estimatedSteps = Math.ceil(datasetSize / effectiveBatch) * epochs;
  const readinessScore = useMemo(() => readiness.filter(Boolean).length, [readiness]);
  const stage = stages[activeStage];
  const stageCode = stage.code
    .replaceAll("__MODEL_ID__", profile.model)
    .replaceAll("__MODEL_REVISION__", profile.revision)
    .replaceAll("__DATASET_SIZE__", datasetSize.toLocaleString())
    .replaceAll("__RANK__", String(rank))
    .replaceAll("__ALPHA__", String(rank * 2))
    .replaceAll("__EPOCHS__", String(epochs))
    .replaceAll("__COMPUTE_DTYPE__", precision)
    .replaceAll("__BF16__", precision === "bfloat16" ? "True" : "False")
    .replaceAll("__FP16__", precision === "float16" ? "True" : "False");

  const toggleReadiness = (index: number) => setReadiness((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value));

  return <section className="fine-tuning-workshop" aria-labelledby="fine-tuning-workshop-title">
    <header className="fine-tuning-hero">
      <div><span className="eyebrow">Practical workshop · optional GPU exercise</span><h2 id="fine-tuning-workshop-title">Fine-tune a modern open-weight model—properly</h2><p>Move from demonstrations to a measured QLoRA adapter. The goal is not merely to make training loss fall; it is to change one behavior without hiding regressions.</p><ActivityInfo mode="external" title="The planner is local; training is not" detail="You can complete the planning and readiness work entirely on this page. The stage code runs only after you deliberately create the external Python/GPU environment." requirements="Do not expect sliders to train a model. They update estimates and code placeholders only." /></div>
      <aside><span>Teaching target · reviewed July 2026</span><strong>{MODEL_ID}</strong><p>Apache-2.0 · text-only causal LM · stable TRL/PEFT path · strong enough to be meaningful and small enough to teach.</p><a href="https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507" target="_blank" rel="noreferrer">Open official model card ↗</a></aside>
    </header>

    <section className="model-choice-rationale">
      <article><span className="workshop-index">Model and compute envelope</span><h3>A reproducible 4B adapter run</h3><p>A 4B instruct model exposes the data, template, adapter, optimization, and evaluation decisions while remaining feasible on commonly rented or local accelerator hardware. Larger open-weight models can require hundreds of gigabytes and distributed training.</p></article>
      <article><span className="workshop-index">Newer extension</span><h3>Qwen3.5-4B after the text path</h3><p>Qwen3.5-4B is newer and multimodal. Treat it as a follow-on VLM project: processors, image tokens, collators, and truncation add another layer that would obscure the first fine-tuning experiment.</p><a href="https://huggingface.co/Qwen/Qwen3.5-4B" target="_blank" rel="noreferrer">Inspect the Qwen3.5 model card ↗</a></article>
      <article><span className="workshop-index">Do not fine-tune yet when…</span><h3>Prompting or retrieval solves the problem</h3><p>Use fine-tuning for repeated behavior, style, structure, or domain task patterns. Use retrieval for changing facts and private knowledge; use tools for deterministic operations. Always test the cheaper baseline first.</p></article>
    </section>

    <LearningActivityContract
      question="What is the smallest defensible first fine-tuning run for the selected hardware, data, and adaptation budget?"
      action="Choose the hardware envelope, demonstration count, epochs, rank, and precision. Predict the recommended path and optimizer-step count before revealing the estimate."
      observe="Compare the recommendation and arithmetic with your prediction; then change one control and predict the direction of the next update."
      explain="Connect memory to method choice and connect dataset size × epochs ÷ effective batch to optimizer steps."
      complete="Commit one baseline prediction, test a contrasting configuration, and finish every pre-flight check before opening external run stages."
      boundary="The planner performs transparent course arithmetic. It does not allocate hardware or measure memory, throughput, convergence, or model quality."
    />
    <section className="workshop-planner">
      <div className="planner-controls"><span className="eyebrow">Experiment planner</span><h3>Size the first run</h3><ActivityInfo mode="simulated" title="Planning estimate only" detail="These controls update a transparent step estimate and recommended path; they do not allocate hardware or execute training." />
        <label>Available accelerator memory<select value={hardware} onChange={(event) => setHardware(event.target.value)}>{hardwareProfiles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>Training demonstrations <strong>{datasetSize.toLocaleString()}</strong><input type="range" min="100" max="5000" step="100" value={datasetSize} onChange={(event) => setDatasetSize(Number(event.target.value))} /></label>
        <label>Epochs <strong>{epochs}</strong><input type="range" min="1" max="3" value={epochs} onChange={(event) => setEpochs(Number(event.target.value))} /></label>
        <label>LoRA rank<select value={rank} onChange={(event) => setRank(Number(event.target.value))}>{[8,16,32,64].map((value) => <option key={value} value={value}>r = {value}</option>)}</select></label>
        <label>Training compute precision<select value={precision} onChange={(event) => setPrecision(event.target.value as "bfloat16" | "float16")}><option value="bfloat16">bfloat16 · modern compatible GPU</option><option value="float16">float16 · fallback</option></select></label>
      </div>
      <PredictionGate prompt={`With ${profile.label} of accelerator memory, ${datasetSize.toLocaleString()} demonstrations, ${epochs} epoch${epochs === 1 ? "" : "s"}, and rank ${rank}, predict the recommended method and approximate optimizer-step count. Show the arithmetic or decision rule.`} commitLabel="Commit planner prediction and reveal estimate">
        <div className="planner-readout" aria-live="polite"><span>Recommended path</span><strong>{profile.method}</strong><p>{profile.note}</p><dl><div><dt>Approx. optimizer steps</dt><dd>{estimatedSteps.toLocaleString()}</dd></div><div><dt>Effective batch</dt><dd>{effectiveBatch}</dd></div><div><dt>Adapter rank</dt><dd>{rank}</dd></div></dl><small>The Data and Configure stage code updates to match these choices. This remains a planning estimate: sequence length, kernels, checkpointing, platform, and package versions change real memory and speed. The code assumes a current bitsandbytes-supported accelerator/backend; Apple Silicon may require a different backend or MLX-oriented workflow.</small></div>
      </PredictionGate>
    </section>

    <section className="data-readiness">
      <div><span className="eyebrow">Pre-flight gate</span><h3>{readinessScore === readinessItems.length ? "Ready for a smoke test" : `${readinessScore}/${readinessItems.length} checks complete`}</h3><p>A training command is the middle of the experiment, not the beginning. Complete these checks before renting or occupying a GPU.</p></div>
      <div>{readinessItems.map((item, index) => <label key={item}><input type="checkbox" checked={readiness[index]} onChange={() => toggleReadiness(index)} /><span>{item}</span></label>)}</div>
    </section>

    <section className="workshop-runbook">
      <div className="runbook-nav" role="tablist" aria-label="Fine-tuning stages">{stages.map((item, index) => <button key={item.id} role="tab" aria-selected={index === activeStage} className={index === activeStage ? "active" : ""} onClick={() => setActiveStage(index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong></button>)}</div>
      <MotionReveal as="article" stateKey={activeStage} className="runbook-stage">
        <span className="eyebrow">Stage {String(activeStage + 1).padStart(2, "0")} of {stages.length}</span><h3>{stage.title}</h3><p className="stage-purpose">{stage.purpose}</p>
        <ol>{stage.actions.map((action) => <li key={action}>{action}</li>)}</ol>
        <div className="workshop-checkpoint"><span>Do not continue until</span><p>{stage.checkpoint}</p></div>
        <ActivityInfo mode="external" title={`Run stage ${activeStage + 1} in sequence`} detail="Copy this stage only after completing every earlier stage and replacing the planner placeholders. Preserve outputs before continuing." requirements="Requires a compatible Python environment, pinned packages, model/data access, and suitable hardware. Nothing executes in this browser." />
        <details className="workshop-code-disclosure"><summary>Open stage code</summary><pre tabIndex={0} aria-label={`${stage.label} fine-tuning code`}><code>{stageCode}</code></pre></details>
        <div className="stage-switcher"><button disabled={activeStage === 0} onClick={() => setActiveStage((current) => current - 1)}>← Previous stage</button><button disabled={activeStage === stages.length - 1} onClick={() => setActiveStage((current) => current + 1)}>Next stage →</button></div>
      </MotionReveal>
    </section>

    <section className="evaluation-contract">
      <div><span className="eyebrow">Evaluation contract</span><h3>Decide what would count as success</h3><p>Replace these teaching gates with values justified by your application before training. Do not move the goalposts after seeing outputs.</p></div>
      <div className="evaluation-table"><div className="evaluation-row evaluation-head"><span>Slice</span><span>Baseline</span><span>Example gate</span></div>{evaluationRows.map((row) => <div className="evaluation-row" key={row.name}><strong>{row.name}</strong><span>{row.baseline}</span><span>{row.gate}</span></div>)}</div>
    </section>

    <footer className="workshop-resources"><span className="eyebrow">Use the current primary documentation</span><div><a href="https://huggingface.co/docs/trl/sft_trainer" target="_blank" rel="noreferrer"><strong>TRL SFTTrainer</strong><span>Dataset formats, assistant-only loss, packing, trainer API ↗</span></a><a href="https://huggingface.co/docs/trl/main/en/peft_integration" target="_blank" rel="noreferrer"><strong>TRL + PEFT</strong><span>LoRA and QLoRA integration ↗</span></a><a href="https://huggingface.co/docs/transformers/quantization/bitsandbytes" target="_blank" rel="noreferrer"><strong>bitsandbytes</strong><span>NF4, hardware support, and 4-bit configuration ↗</span></a></div></footer>
  </section>;
}

export default FineTuningWorkshop;
