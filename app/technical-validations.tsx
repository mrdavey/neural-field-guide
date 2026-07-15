import { MathText } from "./math-text";
import { validationArtifactFiles } from "./validation-artifacts";
import { ActivityInfo, LearningActivityContract, PredictionGate, technicalActivityGuidance } from "./activity-info";

type Validation = {
  title: string;
  artifact: string;
  revision: string;
  question: string;
  observations: string[];
  code?: string;
  expected: string;
  boundary: string;
  sources: { label: string; url: string }[];
};

export const technicalValidations: Record<string, Validation> = {
  tokenization: {
    title: "Production tokenizer contract test",
    artifact: "Run the exact GPT-2 and Qwen3.5 tokenizer files on English, Japanese, source code/indentation, emoji, and a replacement-character byte edge case. Preserve IDs, decoded text, offsets, and token count in the result artifact.",
    revision: "openai-community/gpt2@607a30d and Qwen/Qwen3.5-4B@1eef1f4; tokenizers v0.23.1; snapshot reviewed 13 Jul 2026.",
    question: "Before running, predict which pair will use fewer IDs for Japanese and which inputs will fail an exact text round trip. Do not infer model quality from token count alone.",
    observations: ["The two ID sequences are not interchangeable even when decoded strings match.", "Whitespace, Unicode normalization, and replacement characters are tested explicitly rather than hidden in a friendly sentence.", "The decision record combines task quality, context occupancy, round-trip behavior, and cost."],
    code: `from transformers import AutoTokenizer

pins = {
  "gpt2": ("openai-community/gpt2", "607a30d"),
  "qwen": ("Qwen/Qwen3.5-4B", "1eef1f4"),
}
cases = ["A short English sentence.", "東京で模型を試す", "def f(x):\\n    return x + 1", "🧪 café", b"bad:\\xff".decode("utf-8", "replace")]
for name, (model_id, revision) in pins.items():
  tok = AutoTokenizer.from_pretrained(model_id, revision=revision)
  for text in cases:
    ids = tok.encode(text, add_special_tokens=False)
    decoded = tok.decode(ids, clean_up_tokenization_spaces=False)
    print(name, repr(text), ids, repr(decoded), len(ids), text == decoded)`,
    expected: "Ten auditable rows: model name, original text, exact IDs, exact decode, count, and round-trip Boolean. At least the byte edge case must be interpreted as replacement text—not silently described as raw invalid UTF-8 reaching the tokenizer.",
    boundary: "This validates tokenizer behavior at the pinned files. It does not prove either paired model is more capable, fair, or economical on the deployment distribution.",
    sources: [{ label: "GPT-2 immutable model snapshot", url: "https://huggingface.co/openai-community/gpt2/tree/607a30d" }, { label: "Qwen3.5 tokenizer snapshot", url: "https://huggingface.co/Qwen/Qwen3.5-4B/blame/1eef1f4/tokenizer_config.json" }, { label: "Tokenizers v0.23.1 release", url: "https://github.com/huggingface/tokenizers/releases/tag/v0.23.1" }],
  },
  "embedding-layer": {
    title: "Real hidden-state identity test",
    artifact: "Use a real 124M-parameter causal Transformer to compare the same ‘ bank’ lookup row with its contextual hidden states in a river sentence and a finance sentence.",
    revision: "openai-community/gpt2@607a30d, loaded with output_hidden_states=True; snapshot reviewed 13 Jul 2026.",
    question: "Predict which cosine must equal one, and which cosines are empirical rather than guaranteed.",
    observations: ["The input token ID is checked rather than assumed from surface spelling.", "The embedding-table row is identical in both contexts by construction.", "Hidden states are extracted at named layer indices; full-dimensional cosine is reported before any 2-D projection."],
    code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from torch.nn.functional import cosine_similarity

pin = "607a30d"
tok = AutoTokenizer.from_pretrained("openai-community/gpt2", revision=pin)
tok.pad_token = tok.eos_token
model = AutoModelForCausalLM.from_pretrained("openai-community/gpt2", revision=pin, output_hidden_states=True).eval()
texts = ["We sat beside the river bank", "She visited the central bank"]
batch = tok(texts, return_tensors="pt", padding=True)
bank_id = tok.encode(" bank", add_special_tokens=False)[0]
positions = [(row == bank_id).nonzero()[-1].item() for row in batch.input_ids]
with torch.no_grad(): out = model(**batch)
lookup = model.get_input_embeddings().weight[bank_id]
print("lookup_cosine", cosine_similarity(lookup, lookup, dim=0).item())
for layer in [1, 6, 12]:
  a, b = out.hidden_states[layer][0, positions[0]], out.hidden_states[layer][1, positions[1]]
  print("layer", layer, "context_cosine", cosine_similarity(a, b, dim=0).item())`,
    expected: "lookup_cosine prints exactly 1 (within floating-point tolerance). Three named contextual cosines print measured values below or near 1; their direction is evidence for this prompt pair, not a universal monotonic-separation law.",
    boundary: "One prompt pair and one checkpoint demonstrate lookup identity versus contextual computation. They do not establish that cosine similarity alone explains model behavior.",
    sources: [{ label: "GPT-2 pinned model files", url: "https://huggingface.co/openai-community/gpt2/tree/607a30d" }, { label: "GPT-2 primary report", url: "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" }],
  },
  "pretraining-overview": {
    title: "Nominal-versus-loss-token reconciliation",
    artifact: "Attach a loss-token counter to the official OLMo 3 fixed-sequence loader and preserve one ordinary packed batch plus one partial/padded final batch in a small audit log.",
    revision: "allenai/OLMo-core v2.4.0 (release commit 1ed8900), official OLMo3 scripts in src/scripts/official/OLMo3; reviewed 13 Jul 2026.",
    question: "Predict whether nominal slots, attention-visible tokens, and loss-bearing labels will agree in each batch.",
    observations: ["Nominal capacity is micro-batch × sequence × devices × accumulation.", "Actual trained tokens count labels not equal to the ignore index across all ranks.", "The audit records packing policy, drop_last, sampler/data cursor, skipped batches, and final partial-batch handling before changing the step budget."],
    code: `# Insert beside the pinned training loop; reduce across ranks.
nominal = input_ids.numel()
visible = attention_mask.sum().item()
loss_tokens = (labels != -100).sum().item()
print({"step": step, "nominal": nominal,
       "visible": visible, "loss_tokens": loss_tokens,
       "utilization": loss_tokens / nominal})
# Reconcile sum(loss_tokens) with the run manifest; never replace it
# with steps * configured capacity when padding/partial batches exist.`,
    expected: "A fully packed ordinary batch may show equal counts. The preserved partial or masked fixture must show loss_tokens ≤ visible ≤ nominal, and the run total must equal the sum of logged loss_tokens after distributed reduction.",
    boundary: "The probe validates accounting against one pinned loader/config. It does not claim the public course ran OLMo 3 or reproduce its frontier-scale throughput.",
    sources: [{ label: "OLMo-core v2.4.0 release", url: "https://github.com/allenai/OLMo-core/releases/tag/v2.4.0" }, { label: "OLMo-core official OLMo3 scripts", url: "https://github.com/allenai/OLMo-core/tree/v2.4.0/src/scripts/official/OLMo3" }],
  },
  "advanced-objectives": {
    title: "Current decoder mixed-objective record",
    artifact: "Build a 50/50 causal/FIM course probe using StarCoder2's released FIM special-token contract, then compare it with a causal-only equal-token control. The 0.50 mixture is this probe's declared treatment—not an invented StarCoder2 release statistic.",
    revision: "bigcode/starcoder2-3b@733247c; primary release reports FIM training over 3+T tokens; course probe mixture=0.50, seed=17; reviewed 13 Jul 2026.",
    question: "Serialize prefix, suffix, and middle explicitly. Which positions receive next-token loss, and what equal-budget result would falsify the claim that FIM helps infilling here?",
    observations: ["Causal record: ordinary token order and causal next-token labels.", "FIM record: <fim_prefix> prefix <fim_suffix> suffix <fim_middle> middle, then causal prediction over the transformed stream.", "Ablation contract freezes source examples, trained tokens, optimizer, schedule, and seeds; it reports both infilling and ordinary completion to expose regression."],
    expected: "The data manifest reports approximately half FIM-transformed records at seed 17, exact serialized token IDs for sampled records, equal loss-bearing-token budgets, and paired infilling/completion metrics. The treatment fails if infilling does not improve beyond uncertainty or ordinary completion breaches its regression gate.",
    boundary: "StarCoder2 validates that a modern decoder used FIM. The course's 50/50 ablation is a transparent reproducible experiment, not a claim about the unreleased exact production mixture.",
    sources: [{ label: "StarCoder2-3B pinned release", url: "https://huggingface.co/bigcode/starcoder2-3b/tree/733247c" }, { label: "StarCoder2 primary report", url: "https://arxiv.org/abs/2402.19173" }, { label: "FIM primary paper", url: "https://arxiv.org/abs/2207.14255" }],
  },
  "instruction-tuning-rlhf": {
    title: "Release stages versus system controls",
    artifact: "Map the exact Tülu 3.1 recipe into the course taxonomy: base checkpoint → SFT demonstrations → DPO preferences → online RLVR rollouts. Keep tool authorization, credential scope, confirmation, and receipts in a separate runtime-control row.",
    revision: "allenai/open-instruct experiment commit 745bf58d321c for Llama-3.1-Tulu-3.1-8B; historical Tülu 3 RLVR code removal is explicitly documented; reviewed 13 Jul 2026.",
    question: "For each desired change, label the signal, learned artifact, evaluation, and the guarantee that still must be enforced outside weights.",
    observations: ["SFT changes imitation behavior from demonstrations.", "DPO changes relative response preference from chosen/rejected pairs.", "RLVR changes sampled behavior through verifiable rewards; it is online optimization, not another static label set.", "Runtime authorization is not a training stage and is never guaranteed by benchmark gain."],
    expected: "A four-row ledger with exact incoming/outgoing artifacts and a fifth runtime row. Any design placing credential authority or irreversible-action permission inside SFT/DPO/RLVR fails the boundary check.",
    boundary: "This is one open recipe, not a universal mandatory order. The repository itself marks older reproduction scripts as removed/legacy, which is why the experiment commit matters.",
    sources: [{ label: "Pinned Tülu 3.1 experiment commit", url: "https://github.com/allenai/open-instruct/tree/745bf58d321c" }, { label: "Tülu 3 reproduction document", url: "https://github.com/allenai/open-instruct/blob/745bf58d321c/docs/tulu3.md" }],
  },
  "posttraining-overview": {
    title: "End-to-end open post-training evidence ledger",
    artifact: "Audit Tülu 3.1 as a reproducible stage ledger with exact checkpoints, SFT and preference mixtures, RLVR verifier/rollout settings, and matched evaluation columns. Mark every recommendation as established mechanism, release-specific choice, or course inference.",
    revision: "allenai/open-instruct@745bf58d321c; Llama-3.1-Tulu-3.1-8B exact experiment; reviewed 13 Jul 2026.",
    question: "Which stage delta justifies keeping each stage, and which regression or evaluator failure would make you remove it?",
    observations: ["Established: demonstrations, preferences, and online rewards supply different learning signals.", "Recipe-specific: model family, datasets, DPO normalization/beta, verifiers, episode count, and infrastructure.", "Runtime-specific: tools, permissions, monitoring, and rollback remain deployment controls even if training improves tool-use behavior."],
    expected: "A stage table containing incoming checkpoint, exact data/reward artifact, objective, outgoing checkpoint, matched target metrics, broad regression slices, cost, and stop/rollback decision. Reward curves alone cannot fill the evaluation column.",
    boundary: "A released result supports what happened in this recipe. It does not prove every assistant needs DPO or online RL, nor that model weights can enforce runtime authority.",
    sources: [{ label: "Pinned Open Instruct recipe", url: "https://github.com/allenai/open-instruct/tree/745bf58d321c" }, { label: "Exact Tülu 3/3.1 commands", url: "https://github.com/allenai/open-instruct/blob/745bf58d321c/docs/tulu3.md" }, { label: "Tülu 3 primary paper", url: "https://arxiv.org/abs/2411.15124" }],
  },
};

export function TechnicalValidation({ lessonId }: { lessonId: string }) {
  const validation = technicalValidations[lessonId];
  const resultFile = validationArtifactFiles[lessonId];
  const guidance = technicalActivityGuidance[lessonId];
  if (!validation) return null;
  return <section className="technical-validation" aria-labelledby={`validation-${lessonId}`}>
    <header><div><span className="eyebrow">Pinned technical validation</span><h2 id={`validation-${lessonId}`}><MathText>{validation.title}</MathText></h2><ActivityInfo mode={guidance.mode} detail={guidance.detail} requirements={guidance.requirements} /></div><p><MathText>{validation.revision}</MathText></p></header>
    <div className="validation-brief"><article><span>AUTHENTIC ARTIFACT</span><p><MathText>{validation.artifact}</MathText></p></article><article><span>PREDICT / AUDIT</span><p><MathText>{validation.question}</MathText></p></article></div>
    <LearningActivityContract
      question={<MathText>{validation.question}</MathText>}
      action="Inspect the pinned revision, artifact contract, and reproduction code. Write the evidence pattern you expect before opening the reviewed observations."
      observe="After committing, compare the expected rows, values, or stage deltas with your prediction and the preserved dossier."
      explain="Separate what follows from the mechanism, what is specific to this pinned run, and what the evidence cannot support."
      complete="Commit a prediction, trace or inspect every listed observation, and state one condition that would falsify the intended claim."
      boundary={<MathText>{validation.boundary}</MathText>}
    />
    {validation.code && <details className="validation-code-disclosure"><summary>Open the reproduction code</summary><pre tabIndex={0}><code>{validation.code}</code></pre></details>}
    <PredictionGate prompt={<MathText>{validation.question}</MathText>} title="Commit your expected evidence" placeholder="I expect the preserved run to show… This would support… but would not establish…" commitLabel="Commit prediction and reveal evidence">
      <ol>{validation.observations.map((item) => <li key={item}><MathText>{item}</MathText></li>)}</ol>
      <div className="validation-result"><article><span>EXPECTED EVIDENCE</span><p><MathText>{validation.expected}</MathText></p></article><article><span>CLAIM BOUNDARY</span><p><MathText>{validation.boundary}</MathText></p></article></div>
      {resultFile && <a className="validation-artifact-file" href={resultFile.url} target="_blank" rel="noreferrer"><span>INSPECT THE PRESERVED RESULT DOSSIER</span><strong>{resultFile.label}</strong><p>{resultFile.evidenceTier}</p><small>{resultFile.contents.join(" · ")} ↗</small></a>}
    </PredictionGate>
    <div className="validation-sources">{validation.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>Primary · pinned</span><strong>{source.label}</strong><small>Read for the exact artifact/revision supporting the validation claim ↗</small></a>)}</div>
  </section>;
}
