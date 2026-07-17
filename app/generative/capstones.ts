import type { CapstoneEvidencePack } from "../capstone-evidence";
import type { CapstoneProject } from "../capstone-projects";
import { publicPath } from "../public-path";
import { generativeSources, type GenerativeSource } from "./sources";

type ComparisonKind = "sample-count-intervention" | "cross-family-benchmark" | "nfe-intervention";
type Seed = { lessonId: string; title: string; outcome: string; prerequisite: string; question: string; fixture: string; baseline: string; changedCase: string; metric: string; failure: string; source: GenerativeSource; time: string; comparisonKind?: ComparisonKind; matchedFactors?: string; interpretationBoundary?: string; correctnessGate?: string };
const distributionSeedCount = 20;
const diffusionStartCount = 32;
const energyBudgets = "20, 100, and 500";

const seeds: Seed[] = [
  { lessonId: "distribution-workbench-capstone", title: "Build a distribution workbench", outcome: "Deliver a tested categorical sampler and a paired one-factor study of how 100→10,000 draws changes rare-mode miss rate.", prerequisite: "Probability, likelihood, sampling, and divergences", question: "Within one pinned categorical sampler, how does changing only sample count from 100 to 10,000 draws affect the probability of missing the 2% mode?", fixture: `a NumPy categorical package with p=[.02,.48,.50], declared support ordering, and ${distributionSeedCount} canonical paired seeds`, baseline: "N=100 draws for every canonical seed", changedCase: "N=10,000 draws for those same seeds, with sample count as the sole changed field", metric: "rare-mode miss-rate estimates and uncertainty, reported separately from exact normalization, support, count-conservation, and seed-replay correctness checks", failure: "an exact-frequency tolerance that rejects a statistically valid sampler; diagnose why that brittle check is not evidence about the sample-count effect", source: generativeSources.deepLearning, time: "2–3 hours", comparisonKind: "sample-count-intervention", matchedFactors: "probability vector, support order, NumPy version, PCG64 generator, canonical seed list, draw API, rare-mode definition, metric code, execution environment, and decision rule", interpretationBoundary: "Only the draw count changes. The paired miss-rate difference supports a bounded conclusion about this pinned categorical distribution and seed set; it does not prove that the sampler is correct or generalize to another generator or distribution.", correctnessGate: "First establish sampler correctness with exact normalization, support, count-conservation, and replay checks. Those checks validate implementation invariants but cannot establish the causal effect of drawing more samples." },
  { lessonId: "latent-models-capstone", title: "Build and diagnose a minimal VAE", outcome: "Implement a small VAE and run one matched posterior-collapse intervention.", prerequisite: "Latent variables, amortized inference, ELBO, and collapse probes", question: "Does KL annealing increase repeatable latent use without crossing the reconstruction regression gate?", fixture: "a tiny 8×8 binary-shape VAE with 2D latent, three declared seeds, and one-batch overfit test", baseline: "beta=1 from step zero", changedCase: "linear KL annealing over the first 30% of matched training steps", metric: "held-out reconstruction NLL, KL distribution, active units, and paired latent-swap effect", failure: "preserve a seed where active units rise but prior samples or reconstruction cross the gate", source: generativeSources.vae, time: "5–8 hours; optional GPU" },
  { lessonId: "flow-energy-capstone", title: "Compare flows and energy sampling", outcome: "Build a verified 2D flow and EBM, then run a bounded cross-family benchmark on one transparent cost axis without pretending the mechanisms are a one-factor experiment.", prerequisite: "Change of variables, flows, energy models, and Langevin sampling", question: "Across two genuinely different model families, how do coverage and failure diagnostics change along a quality-versus-work curve?", fixture: "an eight-mode 2D ring with fixed train/validation draws, generation seeds, evaluator, retained-sample count, and mode boundaries", baseline: "direct samples from the fitted invertible flow at 8 DWU per retained sample, with exact flow log density kept as a family-specific diagnostic", changedCase: `Langevin samples from the separately fitted EBM at ${energyBudgets} gradient steps per retained state (2740, 13700, and 68500 DWU); the EBM is a comparison family, not a treatment arm`, metric: "shared occupied-mode and distance-to-nearest-mode quality proxies versus deterministic work units (DWU), where one DWU is one declared scalar arithmetic, comparison, or transcendental operation and RNG/evaluator work is excluded; retain flow transform calls and round-trip/NLL diagnostics separately from EBM gradient calls, random variates, energy, and chain diagnostics", failure: "a shared low-energy pocket or flow scale-overflow case, with the family-specific diagnostic that catches it and no ranking of raw EBM energy against normalized flow NLL", source: generativeSources.realNvp, time: "5–8 hours; optional GPU", comparisonKind: "cross-family-benchmark", matchedFactors: "target train/validation draws, retained-sample count, generation seeds, mode boundaries, shared quality evaluator, numeric precision, and execution environment", interpretationBoundary: "This is a bounded benchmark of two different fitted systems, not a one-factor causal intervention. DWU is a reproducible wall-clock-independent algorithmic accounting axis, not a claim that a flow transform and an EBM gradient call are equivalent in latency, energy, or information.", correctnessGate: "Verify the flow inverse and log determinant and verify finite, exact-step-count EBM chains before comparing shared quality proxies. Keep held-out flow NLL, raw EBM energy, direct-transform calls, gradient calls, random variates, and chain diagnostics in family-specific columns." },
  { lessonId: "diffusion-model-capstone", title: "Build a small diffusion model", outcome: "Implement forward corruption, noise prediction, reverse sampling, resume, and a paired one-factor quality-versus-NFE study.", prerequisite: "Corruption, scores, DDPM objective, and sampler schedules", question: "For one fixed deterministic DDIM-style update rule, how does changing only denoiser evaluations from 50 to 20 alter fixed-start quality and trajectory failures?", fixture: `a 16×16 synthetic-shape diffusion model with one pinned epsilon-prediction checkpoint, ${diffusionStartCount} canonical fixed start tensors, a fixed evaluator, and smoke/full profiles`, baseline: "the fixed DDIM-style update rule at 50 denoiser calls", changedCase: "the same update rule at 20 denoiser calls, with NFE and its induced evenly spaced timestep grid as the sole changed field", metric: "fixed-start fidelity/coverage proxies and trajectory failures versus NFE, plus separately reported held-out noise loss, exact call counts, and hardware-specific runtime", failure: "an early trajectory divergence whose diagnosis separates NFE-induced timestep spacing from a target-conversion bug", source: generativeSources.ddpm, time: "6–10 hours; optional GPU", comparisonKind: "nfe-intervention", matchedFactors: "denoiser checkpoint, deterministic DDIM-style update equation, canonical starting tensors, evaluator and thresholds, data normalization, numeric precision, training run, hardware, software environment, and measurement code", interpretationBoundary: "The result is a quality-versus-NFE curve for one sampler implementation. It is not an equal-NFE sampler comparison between ancestral, DDIM, DPM, or other sampler families; that would be a separate experiment with NFE held fixed.", correctnessGate: "First verify corruption algebra, epsilon targets, checkpoint/resume equivalence, paired starts, exact call counts, and finite trajectories. These correctness checks make the intervention interpretable but do not themselves show that 20 or 50 evaluations has better quality." },
  { lessonId: "conditional-safety-capstone", title: "Audit a conditional generator", outcome: "Produce a condition×scale×seed safety and quality matrix with a deterministic release decision.", prerequisite: "Conditional generation, CFG, inverse problems, and composition", question: "Which guidance scale first meets joint adherence without failing diversity, consistency, conflict, or memorization gates?", fixture: "three shape/color conditions, four guidance scales, ten paired seeds, conflict cases, and canary controls", baseline: "native conditional prediction at guidance w=1", changedCase: "held-out attribute composition plus a contradictory-condition request", metric: "marginal/joint adherence, within-condition diversity, consistency residual, nearest-neighbor evidence, and hard gate status", failure: "preserve an exact canary match or validator disagreement and route it through block/review authority", source: generativeSources.cfg, time: "3–5 hours" },
  { lessonId: "generative-research-capstone", title: "Run a matched generative intervention study", outcome: "Reproduce one bounded baseline and publish an original controlled experiment with all seeds and failures.", prerequisite: "A completed family capstone plus reproducible GPU experiments", question: "Does one predeclared mechanism change improve the target construct under matched budgets and non-compensable gates?", fixture: "a learner-selected released capstone implementation with smoke/full profiles and machine-readable artifacts", baseline: "the reproduced pinned configuration passing its acceptance gate", changedCase: "one schedule, objective, architecture, sampler, or data intervention chosen before final execution", metric: "paired seed-level effect and interval, quality/cost curves, failure gates, and construct-specific slices", failure: "retain every NaN, excluded run, negative result, and strongest counterexample with a diagnostic retry", source: generativeSources.reproducibility, time: "8–16 hours; optional GPU" },
];

function project(seed: Seed): CapstoneProject {
  const isBenchmark = seed.comparisonKind === "cross-family-benchmark";
  const hasAuditedComparison = seed.comparisonKind !== undefined;
  const comparisonTitle = isBenchmark ? "Bounded cross-family benchmark" : hasAuditedComparison ? "Matched one-factor intervention" : "Matched changed-case study";
  const comparisonDescription = isBenchmark
    ? `Evaluate the flow and EBM on matched target data with one shared quality evaluator. Put those shared measures on the declared DWU curve, but keep each family's native diagnostics in separate columns; this is not a causal treatment comparison.`
    : seed.comparisonKind === "sample-count-intervention"
      ? `Run ${seed.baseline}. The sole intervention is ${seed.changedCase}. Hold fixed ${seed.matchedFactors}.`
      : seed.comparisonKind === "nfe-intervention"
        ? `Run ${seed.baseline}. The sole intervention is ${seed.changedCase}. Hold fixed ${seed.matchedFactors}.`
        : hasAuditedComparison
      ? `Run ${seed.baseline}, then ${seed.changedCase}. Hold fixed ${seed.matchedFactors}.`
      : `${seed.baseline}; then ${seed.changedCase}.`;
  const specifyInstructions = isBenchmark
    ? [seed.question, `Define ${seed.fixture}.`, `Predeclare the shared quality evaluator and the DWU ledger: ${seed.metric}.`, `State what is matched across families (${seed.matchedFactors}) and what necessarily differs because a flow and EBM are different systems.`]
    : hasAuditedComparison
      ? [seed.question, `Define ${seed.fixture}.`, `Name the intervention before running either arm: ${seed.baseline}; ${seed.changedCase}.`, `Predeclare ${seed.metric}, the paired units, threshold, stop rule, and every fixed factor: ${seed.matchedFactors}.`]
      : [seed.question, `Define ${seed.fixture}.`, `Predeclare ${seed.metric}, seed list, matched budget, stop rule, and rejection threshold.`];
  const fullRunPurpose = seed.comparisonKind === "sample-count-intervention"
    ? "the complete paired 100-versus-10,000 draw matrix over all 20 canonical seeds"
    : seed.comparisonKind === "cross-family-benchmark"
      ? "the expanded flow/EBM quality-versus-DWU benchmark, with family-specific operation and chain diagnostics"
      : seed.comparisonKind === "nfe-intervention"
        ? "the complete paired 50-versus-20 NFE curve over all 32 canonical starts"
        : `the expanded local baseline: ${seed.baseline}`;
  const smokeRunMeaning = seed.comparisonKind === "sample-count-intervention"
    ? "This command runs both sample-count arms for a small paired seed subset and reports sampler correctness separately from the miss-rate effect."
    : seed.comparisonKind === "cross-family-benchmark"
      ? "This command fits both course-scale systems, checks each mechanism, and reports a shared quality-versus-DWU curve plus native diagnostics."
      : seed.comparisonKind === "nfe-intervention"
        ? "This command fits one denoiser, freezes its checkpoint, and evaluates both NFE arms on the same start tensors and evaluator."
        : "The latent, flow/energy, and diffusion projects train or fit complete course-scale CPU baselines rather than scalar placeholders.";
  const buildCheckpoint = seed.comparisonKind === "sample-count-intervention"
    ? "Smoke and full checks pass, every row regenerates from its manifest, and the paired matrix keeps exact sampler evidence separate from the sample-count effect."
    : seed.comparisonKind === "cross-family-benchmark"
      ? "Smoke and full checks pass, both fitted systems regenerate from their manifests, and every shared DWU value and family-specific diagnostic recomputes."
      : seed.comparisonKind === "nfe-intervention"
        ? "Smoke and full checks pass, the fitted checkpoint regenerates, and all paired starts share every field except NFE and its induced timestep grid."
        : "Smoke and full checks pass, every output regenerates from its manifest, and model-building projects contain genuine trained/fitted metrics.";
  const studyStage = isBenchmark
    ? {
        id: "benchmark",
        title: "Run the bounded benchmark",
        goal: "Compare different mechanisms without turning their differences into a causal-treatment claim.",
        instructions: [
          `Build both fitted systems. Evaluate ${seed.baseline}. Separately evaluate ${seed.changedCase}.`,
          `Hold fixed ${seed.matchedFactors}.`,
          `Plot the shared quality proxies against DWU, then show direct transform calls, EBM gradient steps, random variates, round-trip error, flow NLL, raw energy, and chain behavior in separate family-specific columns. ${seed.interpretationBoundary}`,
          `Force or retain this failure: ${seed.failure}.`,
        ],
        checkpoint: "Every declared system/budget cell is present, DWU recomputes from the operation ledger, shared quality metrics use one evaluator, and no conclusion calls the EBM a treatment of the flow.",
        hint: "A common numeric axis enables a bounded cost curve; it does not make the underlying operations or fitted models equivalent.",
        workspacePrompt: "Paste the DWU derivation, shared quality rows, family-specific diagnostics, failures, uncertainty, and limits of the cross-family comparison.",
      }
    : hasAuditedComparison
      ? {
          id: "intervene",
          title: seed.comparisonKind === "sample-count-intervention" ? "Change only the sample count" : "Change only the denoiser evaluation count",
          goal: "Estimate one paired intervention while keeping every non-intervention factor fixed.",
          instructions: [
            `Run the control: ${seed.baseline}. Then run ${seed.changedCase}.`,
            `Verify that these factors match row for row: ${seed.matchedFactors}.`,
            `Preserve all paired rows for ${seed.metric}. ${seed.correctnessGate}`,
            `Force or retain this failure: ${seed.failure}.`,
          ],
          checkpoint: seed.comparisonKind === "sample-count-intervention"
            ? "Every one of the 20 seeds has both N=100 and N=10,000 rows; a manifest diff shows that only sample count changes; correctness gates and the paired miss-rate conclusion are reported separately."
            : "Every one of the 32 fixed starts has both 50-NFE and 20-NFE rows; a manifest diff shows that only NFE and its induced timestep grid change; the claim remains about one sampler's quality-versus-NFE curve.",
          hint: seed.comparisonKind === "sample-count-intervention"
            ? "Exact sampler checks answer whether the implementation obeys its contract. Paired rare-mode misses answer a different question: what changed when this pinned sampler drew more values."
            : "Reducing NFE necessarily thins the timestep grid. Changing the update equation or sampler family would add another intervention and require another study.",
          workspacePrompt: "Paste the matched-factor audit, paired raw rows, effect and uncertainty, correctness-gate results, failure diagnosis, retry, and remaining confound.",
        }
      : { id: "intervene", title: "Run the changed case", goal: "Change one factor under a matched comparison.", instructions: [`Run this changed case: ${seed.changedCase}.`, `Preserve all rows for ${seed.metric}.`, `Force or retain this failure: ${seed.failure}.`], checkpoint: "Every declared seed/case has an artifact or a justified predeclared exclusion, and budgets match.", hint: "A failed run is part of treatment reliability, not a row to delete.", workspacePrompt: "Paste raw rows, paired effects, uncertainty, failure diagnosis, retry, and any remaining confound." };
  const comparisonRubric = isBenchmark
    ? { criterion: "Benchmark design", developing: "Ranks direct flow transforms against EBM gradient calls as though they were the same operation or calls the EBM a treatment.", proficient: "Uses one recomputable DWU axis for shared quality curves and preserves family-specific diagnostic units.", excellent: "Audits the DWU ledger, reports uncertainty, and explains why wall-clock, energy, normalized density, and raw energy require separate evidence." }
    : hasAuditedComparison
      ? { criterion: "Experimental control", developing: "Changes more than the declared count or conflates correctness checks with the causal result.", proficient: `Changes only ${seed.comparisonKind === "sample-count-intervention" ? "sample count" : "NFE and its induced timestep grid"}, matches every declared fixed factor, and preserves all paired rows.`, excellent: "Adds a manifest-diff audit, paired uncertainty, a predeclared stop rule, and an alternative test without changing the intervention after seeing results." }
      : { criterion: "Experimental control", developing: "Treatment changes several factors or cherry-picks outputs.", proficient: "One change, matched budget, and all rows are preserved.", excellent: "Paired design, uncertainty, stop rule, and alternative test are predeclared." };
  const exemplarDecisions = isBenchmark
    ? ["Flow correctness and EBM chain correctness pass before quality is compared.", "The shared DWU curve and family-specific diagnostic columns remain separate.", "The report says cross-family benchmark, not intervention, and never ranks raw EBM energy against normalized flow NLL."]
    : hasAuditedComparison
      ? [seed.correctnessGate ?? "Correctness gates pass before the intervention is interpreted.", `The manifest pins every fixed factor: ${seed.matchedFactors}.`, seed.interpretationBoundary ?? "The claim stays within the executed comparison."]
      : ["Correctness gates required before intervention are explicit.", "The complete declared matrix stays visible, including planned or null cells.", "Executed starter rows and planned intervention cells use different evidence labels."];
  const exemplarSummary = seed.comparisonKind === "sample-count-intervention"
    ? "The smoke/full CPU execution runs one pinned categorical sampler at both 100 and 10,000 draws for paired seeds. Exact sampler invariants are reported separately from the paired miss-rate effect and uncertainty. The static fixture shows the full planned matrix and a brittle-frequency-test failure; it does not claim production quality or a learner result that was never run."
    : seed.comparisonKind === "cross-family-benchmark"
      ? "The smoke/full CPU execution fits and verifies a course-scale flow and EBM on the same target. Shared quality measures are plotted against a recomputable DWU ledger, while transform calls, gradient calls, NLL, raw energy, and chain diagnostics remain family-specific. The static fixture demonstrates that evidence shape; it does not claim production quality, a universal family winner, or an executed learner benchmark."
      : seed.comparisonKind === "nfe-intervention"
        ? "The smoke/full CPU execution fits one epsilon-prediction checkpoint and evaluates the same deterministic DDIM-style update at 50 and 20 denoiser calls for paired starts. Checkpoint, starts, evaluator, training run, hardware, and measurement code remain fixed, so the result is a quality-versus-NFE curve rather than an equal-NFE sampler comparison. The static fixture shows the planned matrix; it does not claim production quality or an executed learner result."
        : `The reference specifies ${seed.fixture}, supplies smoke/full CPU execution for the course-scale build, predeclares ${seed.baseline} and ${seed.changedCase}, and shows the artifact schema and decision logic for ${seed.metric}, including ${seed.failure}. Local starter execution is real, but it does not claim production quality, an external benchmark reproduction, or that the learner's intervention was executed by the static fixture.`;
  return { lessonId: seed.lessonId, title: seed.title, outcome: seed.outcome, estimatedTime: seed.time,
    prerequisites: [seed.prerequisite, "Python 3 and local deterministic tests", "Evidence labels and version control"],
    materials: [seed.fixture, `Runnable NumPy CPU baseline: ${publicPath("capstone-artifacts/generative/generative_capstone_starter.py")}`, `Pinned free dependency file: ${publicPath("capstone-artifacts/generative/requirements-capstones.txt")}`, "The lesson code ladder and downloadable reference JSON", "A local CPU environment for required checks", "Optional pinned GPU service for the labeled extension"],
    deliverables: [{ title: "Pinned build", description: `Implement ${seed.fixture} with assertions, run manifest, and failure log.` }, { title: comparisonTitle, description: comparisonDescription }, { title: "Evidence package", description: `Raw rows for ${seed.metric}, decision, limitations, and retry.` }],
    stages: [
      { id: "specify", title: "Specify before building", goal: isBenchmark ? "Make the systems, common evaluator, and cost ledger inspectable before comparing them." : "Make the build and experiment falsifiable.", instructions: specifyInstructions, checkpoint: "Another learner can predict pass, reject, and invalid outcomes before code runs.", hint: "Write exact input/output types and evidence units; avoid words such as better without a measurement.", workspacePrompt: isBenchmark ? "Record both system contracts, shared evaluator, DWU operation ledger, family-specific diagnostics, seeds, thresholds, and stop rule." : "Record question, hypothesis, interfaces, constants, fixed factors, paired units, metric, threshold, and stop rule." },
      { id: "build", title: "Build and verify the mechanism", goal: "Create the smallest complete working system and prove its deterministic contracts.", instructions: [`Install the pinned free dependency once with python3 -m pip install -r requirements-capstones.txt.`, `Run python3 generative_capstone_starter.py --project ${seed.lessonId} --profile smoke --output ${seed.lessonId}-smoke.json; expect every printed check to be true. ${smokeRunMeaning}`, `Inspect the smoke dossier, checkpoint where applicable, raw rows, and evidence boundary. Then run python3 generative_capstone_starter.py --project ${seed.lessonId} --profile full --output ${seed.lessonId}-full.json for ${fullRunPurpose}.`, seed.correctnessGate ?? "Run shape, arithmetic, overfit or round-trip, seed replay, checkpoint/resume, and failure assertions relevant to the family.", "Preserve a hand-calculated trace and the first implementation failure."], checkpoint: buildCheckpoint, hint: "Do not move to an optional heavyweight run until one tiny batch or analytic fixture behaves exactly as predicted.", workspacePrompt: "Record smoke/full commands, environment, invariant results, learned/fitted metrics, discrepancy, fix, and acceptance decision." },
      studyStage,
      { id: "decide", title: "Decide and package", goal: "Apply the original rule and make the evidence inspectable.", instructions: ["Apply hard gates before trade-offs and do not move thresholds after seeing results.", seed.interpretationBoundary ?? "Write a bounded conclusion, strongest alternative explanation, and the next falsifying experiment.", "Export manifest, raw rows, checks, logs, samples, failures, decision, and evidence boundary."], checkpoint: "Readable report and machine-readable artifact agree; null or negative results remain publishable.", hint: isBenchmark ? "State the exact fitted systems, target data, shared evaluator, DWU definition, native operation counts, and non-causal comparison boundary." : "State the exact dataset, model, intervention, paired units, fixed factors, and metric in the conclusion.", workspacePrompt: "Write decision, bounded claim, failure scope, alternatives, residual risk, and next experiment." },
    ],
    rubric: [{ criterion: "Working system", developing: "Only a diagram or partial class exists.", proficient: "End-to-end interfaces and local checks run.", excellent: "Independent invariant, resume, and failure-injection tests pass." }, comparisonRubric, { criterion: "Failure learning", developing: "Failures are hidden or called noise.", proficient: "One failure is preserved and diagnosed.", excellent: "A targeted retry distinguishes competing causal explanations." }, { criterion: "Evidence honesty", developing: "Fixtures or samples become universal claims.", proficient: "Claims stay within provenance and metrics.", excellent: "Every stronger claim names missing evidence and a concrete next reproduction." }],
    exemplar: { title: "A bounded course-scale baseline reference", summary: exemplarSummary, decisions: exemplarDecisions },
    reflection: ["Which invariant prevented the most expensive mistaken interpretation?", "Which confound remains most capable of reversing the result?", "What single next experiment would most efficiently falsify your conclusion?"],
  };
}

export const generativeCapstoneProjects = Object.fromEntries(seeds.map((seed) => [seed.lessonId, project(seed)])) as Record<string, CapstoneProject>;

function evidencePack(seed: Seed): CapstoneEvidencePack {
  const isBenchmark = seed.comparisonKind === "cross-family-benchmark";
  const studyField = isBenchmark
    ? { field: "Systems and benchmark design", help: "Name both fitted systems, the shared evaluator and cost axis, the matched inputs, and the family-specific diagnostics; do not invent a treatment arm.", example: `${seed.baseline}; ${seed.changedCase}; ${seed.interpretationBoundary}` }
    : seed.comparisonKind
      ? { field: "Control, intervention, and fixed factors", help: "Name the sole changed count and audit every factor that must match across paired rows.", example: `${seed.baseline}; ${seed.changedCase}; hold fixed ${seed.matchedFactors}.` }
      : { field: "Baseline and intervention", help: "Name the matched control and single changed factor.", example: `${seed.baseline}; ${seed.changedCase}` };
  const standardSections = [
    { heading: "1 · Contract", content: `${seed.question} The reference specifies ${seed.fixture} and labels local execution, deterministic checks, planned cells, and external evidence separately.` },
    { heading: "2 · Runnable CPU baseline", content: `Run the downloadable starter with --project ${seed.lessonId} --profile smoke, inspect its checks and raw rows, then run --profile full. For model-building projects this trains or fits the declared course-scale system; preserve its manifest, checkpoint/resume checks, and evidence boundary.` },
    { heading: "3 · Baseline acceptance", content: `The proposed baseline is ${seed.baseline}. Smoke/full rows are genuine local CPU evidence only when generated by the learner's command; the downloadable static JSON remains a reviewed decision fixture rather than a claimed run.` },
    { heading: "4 · Intervention specification", content: `The proposed changed case is ${seed.changedCase}. Every canonical fixture or planned row remains in the artifact, including the decision example: ${seed.failure}. Planned or null cells are instructions, not observations.` },
    { heading: "5 · Decision boundary", content: `The predeclared evidence is ${seed.metric}. A learner conclusion must stay within the pinned implementation, generated data, seeds, budgets, proxies, and preserved run rows; optional accelerator or external-data claims need their own provenance.` },
  ];
  const auditedSections = seed.comparisonKind === "sample-count-intervention"
    ? [
        { heading: "1 · One question and one intervention", content: `${seed.question} The control is ${seed.baseline}; ${seed.changedCase}. The manifest must show that all non-intervention fields match: ${seed.matchedFactors}.` },
        { heading: "2 · Run the paired matrix", content: `Run --profile smoke to inspect both sample-count arms on a small paired seed subset, then --profile full to execute all ${distributionSeedCount} seeds at both N=100 and N=10,000. Rows generated by those commands are genuine local CPU evidence; the downloadable static JSON is a reviewed decision fixture.` },
        { heading: "3 · Correctness is not the treatment result", content: `${seed.correctnessGate} Report normalization, support, count conservation, and replay in a sampler-correctness block. Report paired miss rates and their uncertainty in a separate intervention-results block.` },
        { heading: "4 · Interpret the changed count", content: `Preserve every paired seed row and the failure example: ${seed.failure}. Planned or null cells are instructions, not observations. A difference in this completed paired matrix can be attributed to sample count within the pinned setup because generator, distribution, seeds, metrics, and environment remain fixed.` },
        { heading: "5 · Bounded conclusion", content: `${seed.interpretationBoundary} State the observed paired miss-rate difference and uncertainty; do not turn exact sampler checks, one finite seed set, or the analytic expectation into a fabricated universal measurement.` },
      ]
    : seed.comparisonKind === "cross-family-benchmark"
      ? [
          { heading: "1 · A benchmark, not an intervention", content: `${seed.question} Compare ${seed.baseline} with ${seed.changedCase}. They are different fitted model families, so this page asks for a bounded benchmark and never treats one as a causal treatment of the other.` },
          { heading: "2 · Run and verify both systems", content: `Run --profile smoke, inspect both mechanisms, then run --profile full. Generated rows are genuine local CPU evidence; the static JSON remains a reviewed decision fixture. ${seed.correctnessGate}` },
          { heading: "3 · One shared cost ledger", content: `Use deterministic work units (DWU): one declared scalar arithmetic, comparison, or transcendental operation in the generation path counts as one unit. Exclude RNG generation and the shared quality evaluator, record both separately, and publish the operation formula so every DWU value recomputes without a clock. This is a transparent algorithmic work axis, not latency, energy, or hardware equivalence.` },
          { heading: "4 · Shared curves, native diagnostics", content: `Plot the common occupied-mode and nearest-mode-distance proxies against DWU while keeping direct transforms, flow round-trip error and NLL separate from EBM gradient steps, random variates, raw energy, and chain diagnostics. Preserve or induce this diagnostic failure: ${seed.failure}. Planned or null cells are instructions, not observations.` },
          { heading: "5 · Bounded conclusion", content: `${seed.interpretationBoundary} Match ${seed.matchedFactors}. Report where each course-scale system lies on the declared quality-versus-work curve; do not announce a universal family winner.` },
        ]
      : seed.comparisonKind === "nfe-intervention"
        ? [
            { heading: "1 · One sampler and one intervention", content: `${seed.question} The control is ${seed.baseline}; ${seed.changedCase}. The sampler update equation stays fixed, so the induced timestep-grid thinning belongs to the NFE intervention rather than becoming a second sampler-family change.` },
            { heading: "2 · Run the paired NFE curve", content: `Run --profile smoke to inspect both NFE arms on a small fixed-start subset, then --profile full to execute all ${diffusionStartCount} starts at both 50 and 20 denoiser calls. Generated rows are genuine local CPU evidence; the static JSON remains a reviewed decision fixture.` },
            { heading: "3 · Freeze the denoiser and evaluator", content: `${seed.correctnessGate} Match ${seed.matchedFactors}. Preserve a checkpoint identity and start-tensor digest in every arm so a manifest diff can expose an accidental model, data, evaluator, or hardware change.` },
            { heading: "4 · Interpret quality versus NFE", content: `Preserve every paired start, exact NFE, shared evaluator output, and the failure example: ${seed.failure}. Planned or null cells are instructions, not observations. Summarize the paired quality change and trajectory failures across NFE.` },
            { heading: "5 · Keep the next question separate", content: `${seed.interpretationBoundary} An equal-NFE sampler comparison would hold NFE fixed and vary the sampler family; it cannot be inferred from this 50→20 NFE intervention.` },
          ]
        : standardSections;
  const comparisonCheck = isBenchmark
    ? { label: "Cross-family cost and diagnostic units are not conflated", terms: ["benchmark", "dwu", "family"] }
    : seed.comparisonKind
      ? { label: "The sole intervention and every fixed factor are audited", terms: ["control", "intervention", "fixed"] }
      : { label: "Baseline and treatment have matched budgets", terms: ["baseline", "treatment", "budget"] };
  return {
    starter: { title: `${seed.title} evidence frame`, fields: [{ field: "Question and falsifier", help: "Commit comparison and rejection before final results.", example: seed.question }, { field: "Fixture and provenance", help: "Pin interfaces, revisions, data, seeds, and evidence type.", example: seed.fixture }, studyField, { field: "Measurement and failure", help: "Keep raw units, gates, and failure evidence.", example: `${seed.metric}; ${seed.failure}` }] },
    reference: { title: `Reviewed evidence contract: ${seed.title}`, sections: auditedSections },
    checks: [{ label: "Question, fixture, and evidence type are explicit", terms: ["question", "fixture", "evidence"] }, { label: "Starter and working-system checks are preserved", terms: ["starter", "check", "system"] }, comparisonCheck, { label: "Failure, uncertainty, and boundary are preserved", terms: ["failure", "uncertainty", "boundary"] }],
    sources: [{ label: seed.source.title, revision: "Primary or official source reviewed 15 Jul 2026; pin mutable implementations before execution", url: seed.source.url, readFor: seed.source.note, kind: seed.source.kind === "Paper" ? "PRIMARY / FOUNDATIONAL PAPER" : "OFFICIAL / TECHNICAL SOURCE" }],
  };
}

export const generativeCapstoneEvidencePacks = Object.fromEntries(seeds.map((seed) => [seed.lessonId, evidencePack(seed)])) as Record<string, CapstoneEvidencePack>;

export const generativeCapstoneArtifactFiles = Object.fromEntries(seeds.map((seed) => [seed.lessonId, { label: `${seed.title} · JSON`, url: publicPath(`capstone-artifacts/generative/${seed.lessonId}.json`), contents: ["starter command and expected checks", "run manifest", "complete canonical fixture/planned matrix", "execution-status labels", "failure decision fixture", "bounded evidence rule"] }])) as Record<string, { label: string; url: string; contents: string[] }>;
