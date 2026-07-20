import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const between = (source, start, end) => {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
};

const course = read("app/course-data.ts");
const foundations = read("app/lesson-guides/foundations-architecture.ts");
const training = read("app/lesson-guides/training.ts");
const coverage = read("app/lesson-objective-coverage.ts");
const evidence = read("app/lesson-evidence.ts");
const checks = read("app/lesson-transfer-checks.ts");
const distractors = read("app/lesson-transfer-distractors.ts");
const labs = read("app/lesson-labs.tsx");
const capstones = read("app/capstone-projects.ts");
const capstoneEvidence = read("app/capstone-evidence.ts");
const courseApp = read("app/course-app.tsx");
const readerSnapshot = read("scripts/course-page-reader-snapshot.mjs");

test("repair preserves the exact objective promises for the four blocker lessons", () => {
  assert.match(foundations, /objectives: \["Explain why LLMs represent many text positions with tensors and read their common shapes", "Predict the output of a matrix multiplication", "Explain broadcasting and why silent shape errors are dangerous"\]/);
  assert.match(foundations, /objectives: \["Explain why content-only attention cannot determine order", "Compare absolute, relative, and rotary position signals", "Describe how position design affects long-context behavior"\]/);
  assert.match(foundations, /objectives: \["Trace query-key-value attention from shapes to weighted output", "Explain causal masking and multi-head specialization", "Avoid treating attention weights as complete explanations"\]/);
  assert.match(foundations, /objectives: \["Construct shifted input-target pairs for causal language modeling", "Explain teacher forcing and parallel token loss", "Connect token loss to gradients without confusing prediction with truth"\]/);
});

test("tensor worked and transfer cases stay inside taught contraction and broadcasting", () => {
  const tensorEvidence = between(evidence, '"tensors-shapes": evidence(', '"probability-softmax": evidence(');
  const tensorChecks = between(checks, '"tensors-shapes": [', '"probability-softmax": [');
  assert.match(foundations, /displayed shape is \$\[T,d\]=\[2,2\]\$.*gives \$\[B,T,d\]=\[1,2,2\]\$/s);
  assert.match(tensorEvidence, /X\[2,3,4\].*W\[4,6\].*offsets.*\[3,1\]/s);
  assert.match(tensorEvidence, /output feature.*batch and token positions/s);
  assert.doesNotMatch(tensorEvidence, /grouped-query|h_q|h_\{kv\}/i);
  assert.match(tensorChecks, /Projection shape/);
  assert.match(tensorChecks, /Broadcast semantics/);
});

test("position claims separate unmasked equivariance, causal direction, and position geometry", () => {
  const positional = between(foundations, '"positional-encoding": {', "\n\n  attention: {");
  assert.match(positional, /unmasked, content-only self-attention/i);
  assert.match(positional, /causal mask.*earlier-versus-later/s);
  assert.match(positional, /\[dog, chased, cat\].*\[cat, chased, dog\]/s);
  assert.doesNotMatch(positional, /too large.*too small/s);
  assert.match(course, /Unmasked, content-only self-attention without positional signals is permutation-equivariant/);
  assert.match(coverage, /Reorder the same token vectors from \[dog, chased, cat\] to \[cat, chased, dog\]/);
});

test("attention worked trace uses a causally legal later query", () => {
  const attention = between(foundations, "\n  attention: {", '\n\n  "layers-of-understanding": {');
  assert.match(attention, /query at the later token ‘sturdy’/);
  assert.match(attention, /Every candidate key is at or before the query/);
  assert.doesNotMatch(attention, /query at ‘it’.*adjective ‘sturdy’/s);
  assert.match(course, /query at the later token “big”.*attend backward/s);
  assert.match(coverage, /worked trace therefore queries the later token ‘sturdy’/);
});

test("normalization transfer teaches initialization and serving contrast preserves its declared control", () => {
  const layers = between(foundations, '"layers-of-understanding": {', '\n\n  "learning-to-predict": {');
  const layersEvidence = between(evidence, '"layers-of-understanding": evidence(', '"learning-to-predict": evidence(');
  const layersChecks = between(checks, '"layers-of-understanding": [', '"learning-to-predict": [');
  const serving = between(course, 'id: "serving-systems"', 'id: "test-time-compute"');
  assert.match(layers, /1\/\\\\sqrt\{2L\}/);
  assert.match(layers, /activation and gradient norms/);
  assert.match(layersEvidence, /depth-scaled residual initialization or warm-up/);
  assert.match(layersChecks, /Initialization and checkpoint boundary/);
  assert.doesNotMatch(serving, /speculative decoding|speculation saves/i);
  assert.match(labs, /candidateLengths=.*Math\.min\(length,long\)/s);
});

test("causal-LM packing retains EOS supervision and blocks cross-document attention", () => {
  const learningGuide = between(foundations, '"learning-to-predict": {', '\n\n  "gpt2-from-scratch": {');
  const learningEvidence = between(evidence, '"learning-to-predict": evidence(', '"gpt2-from-scratch": evidence(');
  const learningChecks = between(checks, '"learning-to-predict": [', '"gpt2-from-scratch": [');
  const learningDistractors = between(distractors, '"learning-to-predict": [', '"gpt2-from-scratch": [');
  assert.match(learningGuide, /final content token must predict that EOS/);
  assert.match(learningGuide, /block-diagonal causal mask/);
  assert.match(learningGuide, /Resetting position IDs alone is not isolation/);
  assert.match(learningEvidence, /fox→EOS.*moon→EOS/s);
  assert.match(learningEvidence, /omit.*EOS→.*BOS/s);
  assert.match(learningChecks, /EOS supervision/);
  assert.match(learningChecks, /Document isolation/);
  assert.match(learningDistractors, /Resetting position IDs.*sufficient/);
  assert.doesNotMatch(`${learningEvidence}\n${learningChecks}\n${learningDistractors}`, /assistant|system\/user|chat roles/i);
});

test("six audited pages use distinct lesson-specific lab contracts", () => {
  const expected = [
    ["data-engineering", "dataPipeline", "DataPipelineLab"],
    ["olmo3-case-study", "olmoFlow", "OlmoFlowLab"],
    ["posttraining-overview", "posttrainingMap", "PosttrainingMapLab"],
    ["sft", "sftMasking", "SftMaskLab"],
    ["rlhf", "rlhfPipeline", "RlhfPipelineLab"],
    ["tulu3-case-study", "tuluRecipe", "TuluRecipeLab"],
  ];
  for (const [lessonId, labType, component] of expected) {
    assert.match(course, new RegExp(`id: "${lessonId}"[\\s\\S]*?lab: "${labType}"`));
    assert.match(labs, new RegExp(`${labType}: \\{ title:`));
    assert.match(labs, new RegExp(`case "${labType}": return <${component} \\/>`));
    assert.match(labs, new RegExp(`function ${component}\\(`));
  }
  assert.match(labs, /dataPipeline: "pipeline"/);
  assert.match(labs, /sftMasking: "preference"/);
});

test("reader contrast moves LoRA rank and distillation temperature in the taught direction", () => {
  assert.match(labs, /function LoraLab\(\) \{\s*const \[rank,setRank\]=useState\(4\)/);
  assert.match(labs, /function DistillationLab\(\) \{\s*const \[temperature,setTemperature\]=useState\(2\)/);
});

test("beta, provenance, fixture scope, and telemetry boundaries are explicit", () => {
  assert.match(training, /fixed log-ratio margin.*larger beta sharpens/s);
  assert.match(training, /fixed reward gap.*larger beta implies a policy closer to the reference/s);
  assert.match(course, /README at revision `92d63d4`.*DCLM CORE.*training commit is `a825e63`.*8×H100/);
  assert.match(capstones, /Hypothetical credible-run plan—not a measured result/);
  assert.match(capstones, /No 4-layer result or measured ablation is supplied/);
  assert.match(capstoneEvidence, /one-block, one-head, width-3/);
  assert.match(capstoneEvidence, /Status: Development/);
  assert.match(capstoneEvidence, /OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental/);
});

test("shared renderer gives honest next-page handoffs and keeps optional runs after required Test", () => {
  assert.match(courseApp, /nextUsesThisLesson = Boolean\(next\?\.prerequisites\?\.includes\(lesson\.id\)\)/);
  assert.match(courseApp, /This chapter closes its present thread with this result/);
  assert.match(courseApp, /The next chapter, \$\{next\.title\}, begins/);
  assert.ok(courseApp.indexOf('<section className="knowledge-check">') < courseApp.indexOf("<ExternalExperimentView"));
  assert.ok(courseApp.indexOf("<LessonFurtherReading") < courseApp.indexOf("<ExternalExperimentView"));
  assert.match(readerSnapshot, /continuityRelationshipFor\(\{ courseId: course\.id, fromLessonId: lesson\.id, toLessonId: next\.id, sameTrack: lesson\.track === next\.track, directDependency \}\)/);
  assert.match(readerSnapshot, /relationship === "synthesis" \? "To combine" : "To learn"/);
});
