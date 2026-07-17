import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  workshop: "../app/fine-tuning-workshop.tsx",
  courseView: "../app/course-app.tsx",
  course: "../app/course-data.ts",
  guides: "../app/lesson-guides/training.ts",
  styles: "../app/globals.css",
};

const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [
  key,
  await readFile(new URL(path, import.meta.url), "utf8"),
])));

test("the practical workshop is placed directly inside supervised fine-tuning", () => {
  assert.match(source.courseView, /lazy\(\(\) => import\("\.\/fine-tuning-workshop"\)\)/);
  assert.match(source.courseView, /<Suspense fallback=/);
  assert.match(source.courseView, /lesson\.id === "sft" && <Suspense/);
  assert.match(source.courseView, /<FineTuningWorkshop \/>/);
  assert.match(source.course, /id: "sft"[^\n]+duration: 75/);
  assert.match(source.workshop, /Practical workshop · optional GPU exercise/);
});

test("model choice balances current quality, licensing, and reproducibility", () => {
  for (const phrase of [
    "Qwen/Qwen3-4B-Instruct-2507",
    "Apache-2.0",
    "A reproducible 4B adapter run",
    "Qwen3.5-4B after the text path",
    "Prompting or retrieval solves the problem",
  ]) {
    assert.ok(source.workshop.includes(phrase), `missing model-choice rationale: ${phrase}`);
  }
  assert.match(source.workshop, /Reviewed July 2026|reviewed July 2026/);
  assert.match(source.guides, /Qwen3-4B-Instruct-2507 model card/);
});

test("the runbook covers the full fine-tuning lifecycle", () => {
  const stageBody = source.workshop.slice(source.workshop.indexOf("const stages = ["), source.workshop.indexOf("const evaluationRows"));
  for (const stage of ["baseline", "data", "inspect", "configure", "train", "evaluate", "package"]) {
    assert.match(stageBody, new RegExp(`id: "${stage}"`), `missing ${stage} stage`);
  }
  assert.equal((stageBody.match(/^    id: "/gm) ?? []).length, 7);
  assert.equal((stageBody.match(/checkpoint:/g) ?? []).length, 7);
  assert.equal((stageBody.match(/code: `/g) ?? []).length, 7);
});

test("the code path contains a defensible QLoRA experiment contract", () => {
  for (const contract of [
    "baseline_outputs.json",
    "held_out_prompts.json",
    "train_test_split",
    "apply_chat_template",
    "BitsAndBytesConfig",
    "bnb_4bit_quant_type=\"nf4\"",
    "LoraConfig",
    "target_modules=\"all-linear\"",
    "SFTConfig",
    "assistant_only_loss=True",
    "SFTTrainer",
    "trainer.evaluate()",
    "adapted_outputs.json",
    "adapter_config.json",
    "evaluation_report.json",
    "environment.lock.txt",
    "MODEL_REVISION",
    "revision=MODEL_REVISION",
    "AutoModelForCausalLM.from_pretrained",
    "processing_class=tokenizer",
    "return_assistant_tokens_mask=True",
    "assistant_masks",
    "0 < sum(assistant_mask) < len(mask_probe[\"input_ids\"])",
  ]) {
    assert.ok(source.workshop.includes(contract), `missing QLoRA contract: ${contract}`);
  }
  const trainerCall = source.workshop.match(/trainer = SFTTrainer\(\n([\s\S]*?)\n\)/)?.[1];
  assert.ok(trainerCall, "SFTTrainer construction should remain inspectable");
  assert.doesNotMatch(trainerCall, /quantization_config/);
  assert.doesNotMatch(source.workshop, /pip install -U/);
  assert.match(source.workshop, /trl\[peft\]==1\.7\.1/);
  assert.match(source.workshop, /cdbee75f17c01a7cc42f958dc650907174af0554/);
  assert.match(source.workshop, /c1899de289a04d12100db370d81485cdf75e47ca/);
  assert.match(source.workshop, /pip freeze --all > environment\.lock\.txt/);
  assert.match(source.workshop, /pip install -r environment\.lock\.txt/);
});

test("the workshop teaches governance, regression testing, and active planning", () => {
  assert.equal((source.workshop.match(/^  "I /gm) ?? []).length, 6, "six pre-flight checks expected");
  assert.equal((source.workshop.match(/^  \{ name:/gm) ?? []).length, 4, "four evaluation slices expected");
  assert.equal((source.workshop.match(/^  \{ id: "(?:8|16|24|48)"/gm) ?? []).length, 4, "four hardware profiles expected");
  for (const safeguard of ["permission", "secrets", "personal data", "held-out", "regression budget", "known failures", "Do not upload private data", "bitsandbytes-supported"] ) {
    assert.match(source.workshop, new RegExp(safeguard, "i"), `missing safeguard ${safeguard}`);
  }
  assert.match(source.workshop, /type="range"/);
  assert.match(source.workshop, /type="checkbox"/);
  assert.match(source.workshop, /role="tablist"/);
});

test("planner choices flow into reproducible stage code", () => {
  assert.match(source.workshop, /Training compute precision/);
  assert.match(source.workshop, /"bfloat16" \| "float16"/);
  assert.match(source.workshop, /replaceAll\("__RANK__", String\(rank\)\)/);
  assert.match(source.workshop, /replaceAll\("__DATASET_SIZE__", datasetSize\.toLocaleString\(\)\)/);
  assert.match(source.workshop, /replaceAll\("__COMPUTE_DTYPE__", precision\)/);
  assert.match(source.workshop, /bf16=__BF16__/);
  assert.match(source.workshop, /fp16=__FP16__/);
  assert.match(source.workshop, /<code>\{stageCode\}<\/code>/);
});

test("primary resources and narrow-screen code handling are wired", () => {
  for (const url of [
    "https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507",
    "https://huggingface.co/Qwen/Qwen3.5-4B",
    "https://huggingface.co/docs/trl/sft_trainer",
    "https://huggingface.co/docs/trl/main/en/peft_integration",
    "https://huggingface.co/docs/transformers/quantization/bitsandbytes",
  ]) {
    assert.ok(source.workshop.includes(url), `missing primary resource ${url}`);
  }
  assert.match(source.styles, /\.runbook-stage pre\{[^}]*overflow:auto/);
  assert.match(source.styles, /@media\(max-width:780px\)[^{]*\{[^\n]*\.workshop-runbook\{display:block/);
  assert.match(source.styles, /\.evaluation-table\{overflow-x:auto\}/);
});
