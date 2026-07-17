import { lessonGuides } from "./lesson-guides";
import type { LessonGuide, ObjectiveCoverage } from "./lesson-guides";

type ContentPointer =
  | { kind: "literal"; text: string }
  | { kind: "paragraph"; section: number; paragraph: number }
  | { kind: "walkthrough"; index: number }
  | { kind: "checkpoint"; index: number }
  | { kind: "example-setup" }
  | { kind: "example-step"; index: number }
  | { kind: "example-result" }
  | { kind: "practice-answer" };

type ObjectiveCoveragePlan = {
  objectiveIndex: number;
  explanation: string;
  mechanism: ContentPointer[];
  workedExample: ContentPointer[];
  boundary: ContentPointer[];
  checkPrompt: string;
  expected: ContentPointer[];
  retry: ContentPointer[];
};

type ObjectiveCoverageRemediation = {
  mechanism?: string;
  workedExample?: string;
  check?: Partial<ObjectiveCoverage["check"]>;
};

const paragraph = (section: number, paragraphIndex: number): ContentPointer => ({ kind: "paragraph", section, paragraph: paragraphIndex });
const literal = (text: string): ContentPointer => ({ kind: "literal", text });
const walkthrough = (index: number): ContentPointer => ({ kind: "walkthrough", index });
const checkpoint = (index: number): ContentPointer => ({ kind: "checkpoint", index });
const exampleSetup = (): ContentPointer => ({ kind: "example-setup" });
const exampleStep = (index: number): ContentPointer => ({ kind: "example-step", index });
const exampleResult = (): ContentPointer => ({ kind: "example-result" });
const practiceAnswer = (): ContentPointer => ({ kind: "practice-answer" });

const cover = (
  objectiveIndex: number,
  explanation: string,
  mechanism: ContentPointer[],
  workedExample: ContentPointer[],
  boundary: ContentPointer[],
  checkPrompt: string,
  expected: ContentPointer[],
  retry: ContentPointer[],
): ObjectiveCoveragePlan => ({ objectiveIndex, explanation, mechanism, workedExample, boundary, checkPrompt, expected, retry });

/**
 * This is deliberately explicit rather than positional. Every outcome names the exact
 * explanation, mechanism, trace, boundary, and check that teaches it. Changing an
 * objective therefore requires changing its coverage record instead of silently
 * inheriting the next walkthrough or example step.
 */
const coveragePlans: Record<string, ObjectiveCoveragePlan[]> = {
  introduction: [
    cover(0, "An LLM can perform many language tasks through ordinary-language instructions, making it useful to understand as a flexible tool rather than a mysterious answer machine.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0), exampleStep(1)], [paragraph(0, 1)], "Name two different useful jobs an LLM could do with the same meeting notes, then state one reason the output still deserves inspection.", [paragraph(0, 0), exampleStep(0), exampleStep(1), paragraph(0, 1)], [walkthrough(0)]),
    cover(1, "A prompt supplies a job and relevant text; the model then constructs a response in small pieces from learned language patterns and the available context.", [paragraph(1, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "Trace the meeting-note example from prompt to response, and explain why a newly assembled answer is not automatically a human-like understanding of the meeting.", [paragraph(1, 0), exampleStep(0), exampleStep(1), exampleStep(2)], [walkthrough(1)]),
    cover(2, "The required check depends on the task: supplied-text transformation may be directly inspectable, changing facts need current evidence, expert decisions need qualified judgment, and consequential actions need authority and confirmation.", [paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [paragraph(0, 1), checkpoint(2)], "A polished answer names which restaurants are open tonight from a two-month-old list. Explain why the list is insufficient and name the evidence needed before relying on the answer.", [practiceAnswer(), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "tensors-shapes": [
    cover(0, "A tensor shape tells you how numbers are organized; naming each axis tells you what those numbers mean.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(2)], [checkpoint(0)], "Read [4,128,768] as batch, token, and feature axes, then state what changes when only the first number doubles.", [paragraph(0, 0), checkpoint(0)], [walkthrough(0)]),
    cover(1, "Matrix multiplication contracts one matching axis and preserves the axes that are not summed over.", [paragraph(0, 1), paragraph(1, 0), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "Predict the output shape of X[2,5,4]W[4,7] and calculate how many terms contribute to one output feature.", [paragraph(0, 1), paragraph(1, 0)], [walkthrough(1), walkthrough(2)]),
    cover(2, "Broadcasting reuses a smaller tensor across compatible axes, which is useful only when the aligned axes have the intended meaning.", [paragraph(1, 1)], [literal("For X[2,3,6], adding bias[6] deliberately reuses the six feature values at all six batch-token positions. By contrast, a mask[3,1] may broadcast across a [2,3,3] score tensor while masking query rows instead of forbidden key columns—the shapes run, but the semantics are wrong.")], [literal("Broadcast compatibility proves only that dimensions can be expanded. It cannot prove that the expanded axis represents the intended batch, query, key, token, or feature role.")], "A bias [6] broadcasts over X[2,3,6]. Explain why that is valid and give one semantically wrong broadcast that could still run.", [paragraph(1, 1)], [paragraph(1, 1)]),
  ],
  "probability-softmax": [
    cover(0, "Logits are unrestricted relative scores; softmax turns their gaps into positive probabilities that sum to one.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [practiceAnswer()], [paragraph(0, 1), checkpoint(0)], "Explain why [2,1,0] and [12,11,10] have identical softmax probabilities, then predict what doubling all gaps does.", [practiceAnswer()], [paragraph(0, 0), paragraph(0, 1)]),
    cover(1, "Cross-entropy is the negative log of the probability assigned to the observed target, so confident neglect of that target is costly.", [paragraph(1, 0), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(2)], "Compare the loss for a correct token assigned probability 0.8 with the same token assigned 0.01; state which produces the stronger correction and why.", [paragraph(1, 0), exampleStep(2)], [walkthrough(2)]),
    cover(2, "Entropy measures one distribution's spread, cross-entropy scores predictions against targets, perplexity exponentiates average token loss, and calibration compares confidence with observed frequency.", [paragraph(1, 1)], [literal("For a binary prediction [0.5,0.5], entropy is $-2(0.5\\ln 0.5)\\approx0.693$. If the observed target has probability 0.5, its cross-entropy is also 0.693; an average cross-entropy of 0.693 has perplexity $e^{0.693}\\approx2$. Separately, if 80%-confidence predictions are correct only 55 times in 100 matched cases, the model is overconfident and miscalibrated.")], [literal("Equal numerical values in this toy case do not make entropy, cross-entropy, perplexity, and calibration interchangeable: they use different inputs and answer different questions. Perplexity comparisons also require compatible data and tokenization.")], "A model has lower perplexity but its 80% predictions are right only 55% of the time. Name the two different measurements and the calibration failure.", [paragraph(1, 1)], [paragraph(1, 1)]),
  ],
  "gradients-backprop": [
    cover(0, "A computation graph records how inputs and parameters produced the loss so sensitivity can be traced backward through the same operations.", [paragraph(0, 0), paragraph(0, 1), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0)], "For a=wx, y=a², L=(y-t)², list the forward intermediates and then the reverse order used during backward.", [exampleStep(0), exampleStep(1)], [walkthrough(0), walkthrough(1)]),
    cover(1, "The chain rule multiplies local derivatives along a path and adds contributions when a value reaches the loss by several paths.", [paragraph(1, 0), walkthrough(1)], [exampleStep(1), exampleStep(2)], [checkpoint(1)], "Using x=2, w=1, t=1, reproduce dL/dw and identify each local derivative in the product.", [exampleStep(1), exampleStep(2)], [paragraph(1, 0)]),
    cover(2, "Backpropagation computes local slopes; an optimizer separately decides how those slopes change parameters.", [paragraph(1, 1), walkthrough(2)], [exampleStep(2)], [checkpoint(2)], "A finite-difference check agrees with autograd, but one update raises loss. Explain why this can be an optimizer problem rather than a backpropagation error.", [paragraph(1, 1), checkpoint(2)], [walkthrough(2)]),
  ],
  optimizers: [
    cover(0, "An optimizer turns a gradient into motion by choosing a direction and a step size for each parameter.", [paragraph(0, 0), walkthrough(0), walkthrough(2)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "With θ=3, gradient g=2, and learning rate 0.1, calculate the SGD update and explain the minus sign.", [paragraph(0, 0), checkpoint(0)], [walkthrough(0)]),
    cover(1, "SGD uses the current gradient, momentum smooths gradient history, Adam adapts using first and second moments, and AdamW decouples weight decay from that adaptation.", [paragraph(1, 0), paragraph(1, 1), walkthrough(1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "For gradients (4,1), (-3,1), (4,1), explain how raw SGD and momentum differ, then name the extra state Adam keeps.", [exampleStep(0), exampleStep(1), paragraph(1, 0)], [walkthrough(1)]),
    cover(2, "Training failures can come from the learning-rate schedule, corrupt optimizer state, extreme gradients, or numerical precision—not just the model architecture.", [paragraph(0, 1), paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2)], "Loss becomes NaN exactly when warmup reaches its peak rate. Name three measurements that distinguish gradient, precision, and update-scale failures.", [practiceAnswer()], [paragraph(0, 1), walkthrough(2)]),
  ],
  tokenization: [
    cover(0, "Tokens give a model a finite reusable alphabet: common strings can stay compact while rare strings can be assembled from smaller pieces.", [paragraph(0, 0)], [exampleStep(0), exampleStep(2)], [paragraph(1, 0)], "Explain why one ID per word fails for new names, code, and many languages, and why bytes alone make sequences expensive.", [paragraph(0, 0)], [paragraph(0, 0)]),
    cover(1, "Encoding selects vocabulary pieces and maps them to IDs; decoding maps those tokenizer-specific IDs back to pieces and joins them.", [paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0), checkpoint(2)], "Trace ‘unplayable’ through normalization, piece selection, IDs, and decoding for the toy vocabulary.", [walkthrough(0), walkthrough(1), walkthrough(2), exampleStep(2)], [paragraph(0, 1)]),
    cover(2, "More tokens consume more context positions, attention work, generation steps, and often cost; uneven segmentation can also change difficulty across languages and formats.", [paragraph(1, 0), paragraph(1, 1)], [practiceAnswer()], [paragraph(1, 1)], "Compare encodings of 2,600 and 4,100 tokens for the same document across context capacity, compute, generation, and language coverage.", [practiceAnswer()], [paragraph(1, 0)]),
  ],
  "embedding-layer": [
    cover(0, "An embedding lookup replaces an arbitrary token ID with one learned row from a [vocabulary, model-width] table.", [paragraph(0, 0), walkthrough(0)], [exampleStep(0)], [checkpoint(0)], "If E has shape [50,000,768] and the input IDs have shape [2,4], state exactly what is selected and the output shape.", [paragraph(0, 0), walkthrough(0)], [paragraph(0, 0)]),
    cover(1, "A token embedding is the fixed starting row for a token type; a contextual hidden state is computed from that row, position, and surrounding tokens.", [paragraph(1, 0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "Trace ‘bat’ in the flying and baseball sentences from identical lookup rows to different final hidden states.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 0)]),
    cover(2, "Vector similarity is one geometric clue, not a complete or unbiased account of meaning or model behavior.", [paragraph(0, 1), paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2), paragraph(1, 1)], "A 2-D plot places ‘bank’ near ‘loan’. Explain two reasons this cannot prove how the model handles ‘river bank’, and name a better comparison.", [practiceAnswer()], [paragraph(1, 1)]),
  ],
  "positional-encoding": [
    cover(0, "Without a varying position signal, self-attention can compare token content but cannot tell which occurrence came first.", [paragraph(0, 0), walkthrough(0)], [exampleStep(0)], [checkpoint(0)], "Swap two token vectors while giving every position the same position vector. Explain why plain self-attention cannot recover the original order.", [practiceAnswer()], [paragraph(0, 0)]),
    cover(1, "Absolute methods label each index, relative methods bias pairwise distances, and rotary methods rotate queries and keys so their dot product carries relative displacement.", [paragraph(0, 1), paragraph(1, 0), walkthrough(1)], [exampleStep(1)], [checkpoint(1)], "For absolute, relative-bias, and RoPE signals, state where the position information enters the attention computation.", [paragraph(0, 1), paragraph(1, 0)], [walkthrough(1)]),
    cover(2, "A configured long window only proves that inputs fit; useful long-context behavior also depends on training lengths, frequency scaling, attention, data, and evaluation.", [paragraph(1, 1), walkthrough(2)], [exampleStep(2)], [checkpoint(2)], "A 2K-trained model now accepts 16K tokens. Name one order-sensitive and one retrieval-sensitive test that could falsify effective 16K use.", [paragraph(1, 1), walkthrough(2)], [paragraph(1, 1)]),
  ],
  attention: [
    cover(0, "Attention lets each token query other visible positions, score their keys, and combine their value vectors into an information update.", [paragraph(0, 0), paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "Starting from Q,K,V shaped [B,h,T,d_h], trace the score shape, softmax axis, weighted-value shape, and final residual-width output.", [paragraph(0, 0), paragraph(0, 1), walkthrough(2)], [walkthrough(0), walkthrough(1), walkthrough(2)]),
    cover(1, "A causal mask removes future keys before softmax, while multiple heads learn parallel routing patterns in different projected subspaces.", [paragraph(1, 0), walkthrough(1)], [practiceAnswer()], [checkpoint(1)], "A future key has the highest score. State when it is masked, why normalization must happen afterward, and how several heads can still read different visible features.", [practiceAnswer(), paragraph(1, 0)], [walkthrough(1)]),
    cover(2, "Attention weights describe one routing calculation, but values, projections, residuals, later layers, and interactions determine causal influence.", [paragraph(1, 1)], [exampleStep(2), exampleResult()], [paragraph(1, 1), checkpoint(2)], "A heatmap gives one word 0.9 attention. Explain why this is not sufficient causal evidence and name an intervention that would test the claim.", [paragraph(1, 1)], [paragraph(1, 1)]),
  ],
  "layers-of-understanding": [
    cover(0, "A pre-norm block normalizes the residual stream, applies attention, adds its update, then normalizes again, applies an MLP, and adds again.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)], "Write the ordered operations of one pre-norm block and annotate the [B,T,d] shape after every residual addition.", [paragraph(0, 0), paragraph(0, 1)], [walkthrough(0), walkthrough(1), walkthrough(2)]),
    cover(1, "The residual stream preserves an evolving shared state; attention moves information across positions and MLPs transform feature combinations within each position.", [paragraph(0, 1), paragraph(1, 0), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1), checkpoint(2)], "In the Ada/pronoun trace, identify what attention imports, what residual addition preserves, and what the MLP can transform.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 0)]),
    cover(2, "Capabilities emerge through repeated, distributed updates: later layers can use relations formed earlier, and no single unit must own the whole behavior.", [paragraph(1, 0), paragraph(1, 1)], [exampleStep(2), exampleResult()], [paragraph(1, 1)], "Explain why finding one strongly activated neuron neither proves that it alone implements a capability nor that other layers are irrelevant.", [paragraph(1, 1)], [paragraph(1, 0)]),
  ],
  "learning-to-predict": [
    cover(0, "Causal training shifts a sequence so every input prefix is paired with the token immediately to its right.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "For [The, cat, sat, .], list all input-prefix/target pairs and state which edge tokens are omitted from input and labels.", [paragraph(0, 0)], [walkthrough(0)]),
    cover(1, "Teacher forcing supplies every true prefix, allowing all legal token losses to be computed in parallel while the causal mask blocks future leakage.", [paragraph(0, 1), walkthrough(1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "A batch has 4 sequences of 128 tokens. Calculate valid next-token targets before padding masks and explain why parallel training remains causal.", [exampleStep(0), exampleStep(1), exampleStep(2), checkpoint(1)], [paragraph(0, 1)]),
    cover(2, "Cross-entropy gradients reward better prediction of observed tokens, but low average token loss does not make every generated claim true.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleStep(2), exampleResult()], [checkpoint(2), paragraph(1, 1)], "A model lowers validation loss on a corpus containing errors. Explain what improved and what factual guarantee still does not follow.", [paragraph(1, 1)], [paragraph(1, 0)]),
  ],
  "gpt2-from-scratch": [
    cover(0, "A decoder-only Transformer keeps [B,T,d] through its blocks, then maps each token state to [B,T,V] vocabulary logits.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(1)], [checkpoint(0)], "Trace IDs [2,32] through embeddings, two residual blocks, and a 50,000-token output head; state every major shape.", [paragraph(0, 0), walkthrough(0)], [walkthrough(0)]),
    cover(1, "Causal attention, residual computation, and next-token training are enduring ideas; exact position, normalization, activation, and attention variants are replaceable design choices.", [paragraph(0, 1)], [literal("Compare two valid decoder implementations: a GPT-2-style block uses learned absolute positions, LayerNorm, GELU, and full multi-head attention; a newer block may use RoPE, RMSNorm, SwiGLU, and grouped-query attention. Both can preserve the enduring left-to-right mask, residual-width contract, and shifted next-token objective even though their exact weights and efficiency differ.")], [literal("Calling a newer variant an implementation choice does not mean it is drop-in compatible or universally better. Shape, normalization, position, tokenizer, and checkpoint assumptions must match the actual model.")], "Classify causal masking, learned absolute positions, GELU, and grouped-query attention as enduring contract or implementation choice, and justify each.", [paragraph(0, 1)], [paragraph(0, 1)]),
    cover(2, "A credible tiny training run verifies data, masking, targets, optimization, held-out behavior, checkpoint completeness, and deterministic resume—not merely that code executes.", [paragraph(1, 0), paragraph(1, 1), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(2)], "Design a micro-batch overfit and resume test that would distinguish a correct loop from data leakage, target leakage, or incomplete checkpoint state.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "pretraining-overview": [
    cover(0, "Pre-training teaches a base model reusable language and world patterns by repeatedly reducing next-token prediction error across a broad corpus.", [paragraph(0, 0), paragraph(0, 1)], [paragraph(0, 0)], [paragraph(0, 1)], "Explain what a falling next-token loss can teach a base model and why it does not automatically create an instruction-following assistant.", [paragraph(0, 0), paragraph(0, 1)], [paragraph(0, 0)]),
    cover(1, "One training batch moves from governed documents to packed tokens, parallel predictions, masked loss, gradients, an optimizer update, telemetry, and checkpoint state.", [paragraph(1, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0), checkpoint(1)], "Trace one batch from tokenized documents through the parameter update and name which values must be masked or synchronized.", [paragraph(1, 0), walkthrough(0), walkthrough(1)], [walkthrough(0), walkthrough(1)]),
    cover(2, "Pre-training cost and reliability depend jointly on tokens, model compute, accelerator communication, evaluations, checkpoints, data quality, and optimization stability.", [paragraph(1, 1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2), exampleResult()], [checkpoint(2)], "The ideal token arithmetic predicts 2,000 seconds. Name four reasons wall-clock time or final quality can still fail that estimate.", [paragraph(1, 1), exampleStep(2), exampleResult()], [walkthrough(2)]),
  ],
  "objectives-details": [
    cover(0, "Causal loss shifts one token sequence into aligned inputs and next-token targets, then averages negative log-probability only over valid target positions.", [paragraph(0, 0), walkthrough(0), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0), checkpoint(2)], "Derive the three target pairs for [BOS,cats,purr,EOS] and identify the input position that has no target.", [exampleStep(0), exampleStep(1)], [walkthrough(0), walkthrough(2)]),
    cover(1, "The target shift defines what must be predicted, while the causal mask defines which information each prediction is allowed to use; both must enforce the same contract.", [paragraph(0, 0), paragraph(1, 1), walkthrough(1)], [exampleStep(2), exampleResult()], [checkpoint(1)], "Show how an off-by-one label and an unmasked future edge create two different invalid training tasks.", [paragraph(1, 1), exampleStep(2)], [walkthrough(1)]),
    cover(2, "Residual paths preserve signal and gradients, normalization controls activation scale, and initialization sets starting magnitudes so deep layers can be optimized together.", [paragraph(1, 0)], [literal("In a toy residual block, let the incoming stream have norm 1 while an unscaled residual branch initially returns an update with norm 4. Adding many such branches can let updates dominate the carried signal. Smaller initialization or depth-aware scaling reduces the initial branch magnitude; normalization keeps the sublayer input scale controlled; the residual path still preserves a direct route for information and gradients.")], [literal("Stable normalization and initialization cannot repair a leaked causal mask or wrong target shift. Trainability checks and objective-correctness checks must both pass on the same tiny batch.")], "For a deep model that diverges immediately, explain what evidence would distinguish missing residual scaling, unstable normalization, and a masking bug.", [paragraph(1, 0), paragraph(1, 1)], [paragraph(1, 0)]),
  ],
  "scaling-laws": [
    cover(0, "Scaling curves are empirical fits inside measured conditions, not universal laws that survive arbitrary changes in data, architecture, or domain.", [paragraph(0, 0), paragraph(0, 1), walkthrough(2)], [exampleStep(0), exampleStep(2)], [checkpoint(2), paragraph(0, 1)], "A fitted curve covers 100M–2B parameters. Explain why a 70B forecast needs uncertainty, a withheld-scale check, and updated data assumptions.", [paragraph(0, 1), walkthrough(2)], [paragraph(0, 1)]),
    cover(1, "With fixed compute, increasing parameters leaves fewer tokens and increasing tokens leaves less model capacity, so the allocation must be tested rather than guessed.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "Compare 1B×20B tokens with 2B×10B tokens under 6ND and name two product costs that equal training FLOPs do not equalize.", [exampleStep(0), exampleStep(1), exampleStep(2)], [walkthrough(0)]),
    cover(2, "A scaling comparison is invalid when learning rate, batch, precision, initialization, data quality, or tuning competence changes the optimization regime.", [paragraph(1, 0), paragraph(1, 1), walkthrough(1)], [practiceAnswer()], [checkpoint(1)], "A larger model loses to a smaller one at equal tokens. List three optimization or experiment confounds to test before rejecting the curve.", [practiceAnswer()], [paragraph(1, 0)]),
  ],
  "data-engineering": [
    cover(0, "A governed data pipeline records rights and origin, transforms text with auditable rules, freezes clean splits, and preserves removal and lineage paths.", [paragraph(0, 0), paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "Design the ordered path from a newly licensed source to a versioned training shard, including deletion and audit evidence.", [paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [walkthrough(0)]),
    cover(1, "Deduplication, filtering, and mixture weights save compute and shape behavior, but every threshold can remove legitimate language, domain, or template patterns.", [paragraph(1, 0), walkthrough(1)], [practiceAnswer()], [checkpoint(1)], "A filter removes 70% of one language and 10% of English. Specify the sample audit and reversible mixture decision required before training.", [practiceAnswer()], [paragraph(1, 0)]),
    cover(2, "Contamination prevention keeps evaluation documents outside training before chunking, while lineage makes every source and transformation traceable and removable.", [paragraph(1, 1), walkthrough(0), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(2)], "A benchmark solution appears in a scraped repository. Trace the repair from source records to new shards and a newly valid evaluation.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 1)]),
  ],
  infrastructure: [
    cover(0, "Parallelism divides examples, matrix dimensions, layer depth, or token length across devices when one device cannot hold or process the full training state.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "For data, tensor, pipeline, and sequence parallelism, state what is partitioned, what remains replicated, and why the split is useful.", [paragraph(0, 0)], [walkthrough(0)]),
    cover(1, "Performance depends on matching each partition's communication frequency and volume to the physical network topology.", [paragraph(0, 1), walkthrough(1)], [practiceAnswer()], [checkpoint(1)], "Throughput falls only across two nodes. Name the collectives, links, placement, and straggler evidence to inspect before changing model code.", [practiceAnswer()], [paragraph(0, 1)]),
    cover(2, "Reliable distributed training monitors numerical health and proves that complete model, optimizer, RNG, scheduler, and data position state can restart correctly.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [paragraph(1, 1)], [checkpoint(2)], "Design a kill-and-resume test and list the numerical signals and checkpoint fields needed to compare it with an uninterrupted run.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [paragraph(1, 1)]),
  ],
  "advanced-objectives": [
    cover(0, "Causal, masked, span-corruption, and infilling objectives differ in which context is visible and what kind of output must be reconstructed or generated.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0)], "For open continuation, document classification, damaged-span repair, and code middle editing, choose the matching visibility/target contract.", [paragraph(0, 0)], [walkthrough(0)]),
    cover(1, "An auxiliary objective helps only when its extra signal transfers to the desired interface without consuming updates or creating gradients that harm core behavior.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2)], "Masked accuracy rises while generation worsens. Explain the information mismatch and specify the equal-compute ablation needed.", [practiceAnswer(), paragraph(1, 1)], [paragraph(1, 0)]),
    cover(2, "Choose an objective by writing the deployment-visible inputs and required output first, then matching training masks and targets to that interface.", [paragraph(0, 1), walkthrough(0)], [exampleStep(0), exampleStep(1), exampleStep(2), exampleResult()], [paragraph(0, 1)], "An editor sees a prefix and tests in a suffix and must generate the missing code. Explain why FIM matches this interface better than ordinary left-only use.", [exampleStep(0), exampleStep(1), exampleResult()], [walkthrough(0)]),
  ],
  "pretraining-evaluation": [
    cover(0, "Training and held-out loss diagnose prediction optimization; capability suites separately test tasks such as instruction following, coding, safety, and usefulness.", [paragraph(0, 0), paragraph(0, 1)], [exampleSetup(), exampleStep(1)], [paragraph(0, 0)], "Held-out loss improves while arithmetic falls. State what each metric establishes and why neither should overwrite the other.", [exampleResult()], [paragraph(0, 0)]),
    cover(1, "A reproducible benchmark freezes data, prompts, decoding, extraction, scoring code, model settings, uncertainty, and contamination checks.", [paragraph(1, 0), walkthrough(0), walkthrough(1)], [exampleStep(0)], [checkpoint(0), checkpoint(1)], "Write the protocol fields needed to reproduce a one-point checkpoint comparison and determine whether it exceeds uncertainty.", [paragraph(1, 0), walkthrough(0), walkthrough(1)], [walkthrough(0)]),
    cover(2, "Learning curves become decisions only when predefined stop, continue, or repair rules connect aggregate and sliced evidence to action.", [paragraph(1, 1), walkthrough(2)], [exampleStep(1), exampleStep(2)], [checkpoint(2)], "Given lower loss but a five-point clean arithmetic regression, choose stop, continue, or repair and name the evidence that could reverse the choice.", [exampleStep(1), exampleStep(2), exampleResult()], [paragraph(1, 1)]),
  ],
  "olmo3-case-study": [
    cover(0, "OLMo 3's model flow moves from the broad 5.9T-token Dolma 3 Mix through 100B targeted Dolmino and 50B long-context Longmino stages.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 0)], "Draw the three named stages in order and attach each stage's token budget, training purpose, and strongest evaluation claim.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [paragraph(0, 0)]),
    cover(1, "The open flow ties governed data, causal training, scaling, distributed execution, checkpoints, and standardized evaluation into one inspectable system.", [paragraph(0, 1), paragraph(1, 0)], [paragraph(0, 1)], [paragraph(1, 0)], "For a code gain after Dolmino, connect one data, systems, objective, and evaluation decision and limit the claim to what the comparison supports.", [paragraph(0, 1), paragraph(1, 0)], [paragraph(1, 0)]),
    cover(2, "Open intermediate checkpoints make a controlled stage ablation possible when one treatment changes and data, tokens, schedule, and evaluator remain comparable.", [paragraph(1, 1)], [literal("Start treatment and control from the same released pre-stage checkpoint. Give both the same additional token and optimizer budget; only the treatment samples the targeted Dolmino-style mixture while the control samples a declared baseline mixture. Run the same held-out loss, code/math slices, contamination checks, and uncertainty analysis, and predeclare a regression that would reject the targeted stage.")], [literal("An open checkpoint permits this comparison but does not erase hardware nondeterminism, unavailable source data, or recipe knowledge. A stage result supports the matched treatment, not every model or data scale.")], "Design a small Dolmino or Longmino treatment/control ablation with one changed stage, fixed budgets, a falsifier, and preserved artifacts.", [paragraph(1, 1)], [paragraph(1, 1)]),
  ],
  "posttraining-overview": [
    cover(0, "A base model predicts continuations from its corpus distribution; an assistant also needs demonstrations and feedback that make user-directed behavior likely and legible.", [paragraph(0, 0), paragraph(0, 1)], [paragraph(0, 0)], [paragraph(0, 1)], "Contrast how a base model and a post-trained assistant may continue ‘Explain photosynthesis’, and identify what behavior—not knowledge guarantee—changed.", [paragraph(0, 0), paragraph(0, 1)], [paragraph(0, 0)]),
    cover(1, "A post-training pipeline can move through supervised demonstrations, preference learning, online or verifiable rewards, safety/tool tuning, and stage-specific evaluation.", [paragraph(1, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 1)], "Trace one assistant behavior gap through the minimum ordered stages and state what new supervision each stage contributes.", [paragraph(1, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [paragraph(1, 0)]),
    cover(2, "Post-training can improve instruction behavior while trading away diversity, calibration, safety usefulness, or base capabilities, so every stage needs held-out controls.", [paragraph(1, 1)], [exampleResult()], [paragraph(1, 1)], "A preference stage improves style scores but lowers factuality and raises refusal. Explain why the aggregate gain is insufficient and which slices decide release.", [paragraph(1, 1)], [paragraph(1, 1)]),
  ],
  "instruction-tuning-rlhf": [
    cover(0, "Post-training starts from the broad predictive capabilities learned during pre-training and reshapes which behaviors are likely under assistant-formatted prompts.", [paragraph(0, 0)], [literal("Before post-training, ‘Explain photosynthesis’ may be continued as scraped prose, another question, or a dialogue fragment because the base model predicts corpus-like continuations. An SFT example with system/user/assistant roles assigns loss to a direct explanatory answer, making that response format more likely while reusing language and subject patterns learned during pre-training.")], [literal("Post-training can add or suppress task behavior, and its data can teach some new facts, but it does not make the assistant a truth oracle or replace the broad capability foundation learned during pre-training.")], "Explain which capabilities come from base pre-training and which interaction patterns are added by assistant post-training.", [paragraph(0, 0)], [paragraph(0, 0)]),
    cover(1, "SFT imitates demonstrations, preference optimization ranks alternatives, RL explores against rewards, and tool/safety tuning teaches constrained action and policy boundaries.", [paragraph(0, 1), paragraph(1, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 1)], "For format imitation, subtle quality ranking, executable correctness, and tool authorization, assign the appropriate training stage and runtime boundary.", [paragraph(0, 1), paragraph(1, 0)], [walkthrough(0), walkthrough(1), walkthrough(2)]),
    cover(2, "Use the least complex stage whose supervision directly addresses the observed behavior gap, then add later stages only when their evidence is necessary.", [paragraph(1, 1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 1)], "Choose the minimum stage for malformed JSON, preferred tone, math with unit tests, and unauthorized tool calls; justify why later stages are or are not needed.", [paragraph(1, 1)], [paragraph(1, 1)]),
  ],
  sft: [
    cover(0, "A high-quality demonstration serializes roles and boundaries, contains a correct assistant response, and represents the task distribution the assistant should imitate.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Construct a two-turn demonstration with system, user, assistant, and end markers, then name the quality and provenance checks it needs.", [paragraph(0, 0), walkthrough(0)], [walkthrough(0)]),
    cover(1, "Assistant-only supervised loss keeps all roles visible as context but assigns training targets only to assistant tokens selected by the label mask.", [paragraph(0, 1), walkthrough(1)], [exampleStep(1)], [checkpoint(1)], "Given a serialized conversation, mark which system, user, tool-result, and assistant tokens receive loss and explain why visibility differs from scoring.", [paragraph(0, 1), walkthrough(1)], [walkthrough(1)]),
    cover(2, "SFT can copy verbosity, refusals, annotation quirks, and narrow formats or forget base skills, so clean held-out comparisons and replay are needed.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleStep(2), exampleResult()], [checkpoint(2)], "An SFT model follows format but becomes verbose and loses completion quality. Name likely imitation artifacts and a controlled repair.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "preference-optimization": [
    cover(0, "A preference pair says one response is better than another for the same prompt under a rubric; it does not supply a unique target answer or strength of preference.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0)], [checkpoint(0), checkpoint(1)], "Turn two responses into an informative comparison without letting order, length, or ten simultaneous differences reveal the label shortcut.", [paragraph(0, 0), walkthrough(1)], [walkthrough(0)]),
    cover(1, "DPO raises the chosen-versus-rejected log-probability gap relative to a fixed reference, with beta controlling how strongly the policy moves.", [paragraph(0, 1), walkthrough(2)], [exampleStep(0), exampleStep(1)], [checkpoint(2)], "For one chosen/rejected pair, describe the policy gap, reference gap, and effect of increasing beta without claiming the chosen text is uniquely correct.", [paragraph(0, 1)], [walkthrough(2)]),
    cover(2, "Preference optimization exploits label shortcuts and proxy gaps, so length, factuality, safety, diversity, reference drift, and fresh human judgments must be monitored separately.", [paragraph(1, 0), paragraph(1, 1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 1)], "DPO loss improves while factuality falls and answers lengthen. Diagnose the likely label bias, stop condition, and counterfactual data repair.", [practiceAnswer(), exampleStep(1)], [paragraph(1, 1)]),
  ],
  "rl-fundamentals": [
    cover(0, "During generation the state is the prompt and prefix, an action is the next token or tool call, rewards score outcomes, and returns assign future reward to earlier decisions.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Map a code-solving trajectory into states, token/tool actions, termination, a test reward, and the return seen by an early decision.", [paragraph(0, 0), walkthrough(0)], [walkthrough(0)]),
    cover(1, "A policy gradient increases log-probability for positive-advantage sampled choices and decreases it for negative ones while baselines reduce variance and KL limits drift.", [paragraph(1, 0), paragraph(1, 1), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1), checkpoint(2)], "For rewards [1,1,0,0], compute the mean baseline and advantages, then explain the direction of the probability update.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(1, 0)]),
    cover(2, "Supervised imitation learns from fixed demonstrated actions; online RL samples current behavior and can discover alternatives, but its outcome feedback is noisier and incomplete.", [paragraph(0, 1)], [practiceAnswer()], [paragraph(0, 1)], "A correct 500-token trajectory gets one final reward. Explain why this is not 500 supervised token labels and how exploration changes the evidence.", [practiceAnswer(), paragraph(0, 1)], [paragraph(0, 1)]),
  ],
  rlhf: [
    cover(0, "Classic RLHF starts with SFT, gathers human response comparisons, trains a reward model, samples the current policy, and updates it under a reference constraint.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)], "Draw the ordered SFT→comparison→reward-model→rollout→policy-update loop and state what artifact each stage produces.", [paragraph(0, 0), paragraph(0, 1)], [walkthrough(0), walkthrough(1), walkthrough(2)]),
    cover(1, "The reward model cheaply predicts preferences, PPO-style updates use on-policy advantages, and clipping plus KL control limit destructive movement from prior behavior.", [paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleStep(1), exampleStep(2)], [checkpoint(0), checkpoint(1)], "Explain why reward validation, fresh rollouts, PPO clipping, and reference KL solve different parts of the update problem.", [paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [walkthrough(1), walkthrough(2)]),
    cover(2, "Reward hacking occurs when the policy improves the measured proxy through behavior that lowers the intended quality; stable reward curves do not rule it out.", [paragraph(1, 0), paragraph(1, 1)], [exampleStep(0), exampleStep(1), exampleStep(2), exampleResult()], [checkpoint(2)], "Reward rises 25% while length doubles and users prefer outputs less. Diagnose the exploit, repair the evaluator, and name the rollback or stop evidence.", [exampleStep(0), exampleStep(1), exampleStep(2), exampleResult()], [paragraph(1, 0)]),
  ],
  "tools-safety": [
    cover(0, "A tool call is a proposed structured action with a named schema, typed arguments, effects, permissions, and a result that must be validated before use.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleStep(1), exampleStep(2)], [checkpoint(0)], "Represent an email action with schema, arguments, authorization, confirmation, execution result, and a recovery path for failure.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [walkthrough(0)]),
    cover(1, "Safety tuning must cover realistic capabilities and attack paths, but runtime least privilege and authorization—not model text—enforce consequential boundaries.", [paragraph(0, 1), paragraph(1, 0), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(2)], "Threat-model the injected calendar event across untrusted data, model proposal, tool permissions, confirmation, and logging.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)]),
    cover(2, "Useful safety is multidimensional: measure harmful compliance, benign refusal, call selection, schema validity, permissions, injection resistance, and recovery separately.", [paragraph(1, 1)], [practiceAnswer()], [paragraph(1, 1)], "Harmful answers fall from 8% to 2% while benign refusal rises from 3% to 25%. Decide whether to ship and name the separate repair metrics.", [practiceAnswer()], [paragraph(1, 1)]),
  ],
  "tulu3-case-study": [
    cover(0, "Tülu 3 moves from curated demonstrations through SFT, length-normalized DPO, and then RLVR on tasks with stable machine-checkable outcomes.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleStep(0)], [paragraph(0, 1), checkpoint(1)], "Trace the Tülu 3 stages in order and state the supervision, shortcut risk, and required control at each handoff.", [paragraph(0, 0), paragraph(0, 1)], [walkthrough(0), walkthrough(1)]),
    cover(1, "DR Tulu starts from Qwen3, teaches research trajectories, uses MCP search/browsing, and applies online reinforcement learning with task-specific evolving rubrics.", [paragraph(1, 0), walkthrough(2)], [exampleStep(1)], [paragraph(1, 1), checkpoint(2)], "For an open-ended current research task, explain why MCP evidence and an evolving rubric replace a single exact answer checker.", [paragraph(1, 0), exampleStep(1)], [walkthrough(2)]),
    cover(2, "Use exact verifiers for stable outcomes, preferences for relative quality, evolving rubrics for open-ended evidence work, and runtime controls for every real tool effect.", [paragraph(1, 1)], [exampleStep(0), exampleStep(1), exampleStep(2), exampleResult()], [checkpoint(1), checkpoint(2)], "Assign SFT, DPO, RLVR, RLER, and runtime controls across exact tax calculations and policy research, then justify every boundary.", [practiceAnswer()], [exampleResult()]),
  ],
  "decoding-sampling": [
    cover(0, "The model supplies logits and probabilities; the decoder turns that distribution into one selected token and repeats the process.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0)], [paragraph(0, 1)], "Given four logits, trace probability creation, candidate filtering, one selected token, and the enlarged context for the next step.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [walkthrough(0)]),
    cover(1, "Temperature rescales all logit gaps, top-k keeps a fixed number of candidates, and top-p keeps the smallest set whose cumulative probability reaches a threshold.", [paragraph(0, 0), walkthrough(1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)], "For probabilities [0.5,0.3,0.15,0.05], identify the candidates kept by top-k=2 and top-p=0.8, then predict a lower temperature's effect.", [paragraph(0, 0), exampleStep(0), exampleStep(1)], [walkthrough(1)]),
    cover(2, "Decoding settings must be chosen by task-level correctness, diversity, calibration, validity, latency, and reproducibility—not a universal creativity setting.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleResult()], [paragraph(1, 1)], "Choose and justify decoding policies for exact extraction, creative ideation, and code generation with tests, including each policy's evaluation metric.", [paragraph(1, 1)], [paragraph(1, 0)]),
  ],
  "generation-kv-cache": [
    cover(0, "Prefill processes the whole prompt in parallel and creates cached keys/values; decode processes one new token at a time while extending that cache.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0)], [paragraph(0, 0)], "For a 1,000-token prompt and 20 generated tokens, separate the work done once in prefill from the work repeated during decode.", [paragraph(0, 0)], [walkthrough(0), walkthrough(1)]),
    cover(1, "The KV cache reuses immutable past keys and values, so each new query attends to stored history instead of recomputing every earlier layer state.", [paragraph(0, 1), walkthrough(1)], [exampleStep(0), exampleStep(1)], [paragraph(0, 1)], "Compare attention work for generating token t with and without cached past K/V, naming exactly what remains newly computed.", [paragraph(0, 1)], [walkthrough(1)]),
    cover(2, "Cache memory grows with layers, sequence length, batch, KV heads, head width, and precision, so batching and context compete for the same serving capacity.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleStep(1), exampleStep(2)], [paragraph(1, 1)], "Use the cache-size factors to explain why two long prompts can crowd out many short decoding requests and how grouped-query attention changes the budget.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "quantization-memory": [
    cover(0, "Inference memory includes weights, KV cache, activations, temporary workspaces, runtime overhead, and quantization metadata—not parameter bytes alone.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Estimate ideal 16-, 8-, and 4-bit weight bytes for 7B parameters, then name four additional allocations required at inference.", [paragraph(0, 0)], [walkthrough(0)]),
    cover(1, "Quantization maps values into a smaller integer grid using scales and zero points; granularity and calibration determine how much outlier information is lost.", [paragraph(0, 1), paragraph(1, 0), walkthrough(1)], [exampleStep(0), exampleStep(1)], [paragraph(0, 1)], "Trace one weight group through scale selection, integer rounding, storage, and dequantized multiplication, then state why activation ranges are harder.", [paragraph(0, 1), paragraph(1, 0)], [walkthrough(1)]),
    cover(2, "A precision format is acceptable only when actual hardware kernels improve memory or speed and representative quality slices remain within declared limits.", [paragraph(1, 1), walkthrough(2)], [exampleStep(2), exampleResult()], [paragraph(1, 1)], "Choose between 8-bit and 4-bit using measured latency, peak memory, throughput, rare-language quality, and kernel support rather than nominal bit count.", [paragraph(1, 1)], [walkthrough(2)]),
  ],
  "serving-systems": [
    cover(0, "Latency measures how long users wait, throughput measures aggregate work, utilization measures hardware occupancy, and goodput counts work completed within the product's quality and SLO rules.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0)], "Two servers have different token throughput and SLO pass rates. Calculate which has higher goodput and explain why utilization alone cannot decide.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 0)]),
    cover(1, "Static batches wait for fixed groups, dynamic batches gather briefly, and continuous batching inserts and removes sequences at decode boundaries.", [paragraph(0, 1), walkthrough(1)], [exampleStep(1)], [checkpoint(1)], "For bursty interactive traffic with uneven output lengths, compare queueing and wasted slots under static, dynamic, and continuous batching.", [paragraph(0, 1)], [walkthrough(1)]),
    cover(2, "Capacity control uses request classes, bounded queues, admission, token budgets, fallbacks, and autoscaling so overload degrades predictably under an explicit SLO.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleStep(2)], [checkpoint(2)], "Design overload behavior for an interactive tier and batch tier, including rejection, degraded service, and the metrics that trigger scaling.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "test-time-compute": [
    cover(0, "Extra inference compute can create more candidate solutions, deeper search, critique, or tool evidence, increasing opportunity for success without guaranteeing it.", [paragraph(0, 0), paragraph(0, 1), walkthrough(0)], [exampleSetup(), exampleStep(0)], [paragraph(0, 1), checkpoint(0)], "Explain how five diverse attempts can beat one attempt and give one correlated-error case where they provide almost no new evidence.", [paragraph(0, 0), paragraph(0, 1)], [walkthrough(0)]),
    cover(1, "Sampling creates candidates, self-consistency aggregates them, search expands intermediate states, critique revises, and verifiers independently score or check outcomes.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "For an exact math answer and an open-ended plan, choose among sampling, voting, search, critique, and external verification and justify the selector.", [exampleStep(1), exampleStep(2)], [walkthrough(1)]),
    cover(2, "Reasoning budgets should rise only when measured marginal success or risk reduction exceeds added latency and cost, with early stopping on verified success.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2), paragraph(1, 1)], "pass@16 rises but deployed best-of-16 does not. Decide whether to buy more samples, improve verification, or stop, using value-of-compute evidence.", [practiceAnswer()], [paragraph(1, 1)]),
  ],
  "context-engineering": [
    cover(0, "A complete prompt interface states the goal, audience, allowed evidence, constraints, uncertainty behavior, and output contract while separating trusted instructions from data.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0)], "Turn a vague request to summarize a report into a complete contract that handles missing information and forbids unsupported recommendations.", [walkthrough(0), exampleStep(0), exampleStep(1)], [paragraph(0, 0)]),
    cover(1, "Context order and labels guide attention but do not guarantee priority; every instruction, example, document, tool schema, and output token also consumes a finite budget.", [paragraph(0, 1), paragraph(1, 0), walkthrough(1)], [exampleStep(1)], [checkpoint(1)], "A prompt exceeds budget with instructions, history, and ten documents. Prioritize, compress, or retrieve content while preserving trust and citation metadata.", [paragraph(1, 0), walkthrough(1)], [paragraph(0, 1)]),
    cover(2, "Prompt robustness requires versioned tests over paraphrase, order, missing evidence, contradiction, irrelevant text, and injection—not one successful demonstration.", [paragraph(1, 1), walkthrough(2)], [exampleStep(2)], [checkpoint(2)], "Create a perturbation matrix for the report prompt covering empty, contradictory, long, reordered, and malicious documents and define pass criteria.", [paragraph(1, 1), walkthrough(2)], [paragraph(1, 1)]),
  ],
  rag: [
    cover(0, "RAG ingests versioned sources into searchable chunks, retrieves authorized evidence for a query, reranks it, and asks the generator to answer or abstain with support.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "Trace one policy document from parsing and metadata through retrieval, context assembly, cited answer, and abstention when support is absent.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [walkthrough(0)]),
    cover(1, "Chunk size controls evidence units, embeddings and lexical search expose different matches, reranking trades latency for precision, and filters enforce date and permissions.", [paragraph(0, 1), paragraph(1, 1), walkthrough(1)], [exampleStep(0), exampleStep(1)], [checkpoint(1)], "For a versioned policy corpus with exact identifiers and paraphrased questions, choose chunks, hybrid retrieval, reranking, k, and filters.", [paragraph(0, 1), paragraph(1, 1)], [walkthrough(1)]),
    cover(2, "Retrieval recall asks whether the needed passage arrived; grounded-generation evaluation asks whether the answer used only that passage and cited it correctly.", [paragraph(1, 0), walkthrough(2)], [exampleStep(2), practiceAnswer()], [checkpoint(2)], "Accuracy rises from 60% to 90% when the correct passage is inserted manually. Diagnose the bottleneck and name separate retrieval and generation metrics.", [practiceAnswer(), paragraph(1, 0)], [walkthrough(2)]),
  ],
  "agent-loops": [
    cover(0, "A workflow follows transitions written in code; an agent dynamically chooses the next action when the path cannot be enumerated in advance.", [paragraph(0, 0)], [practiceAnswer()], [paragraph(0, 0)], "Classify a fixed three-step document process and an open-ended research task, then justify the least autonomy each requires.", [practiceAnswer()], [paragraph(0, 0)]),
    cover(1, "A bounded agent loop observes typed state, proposes an action, validates it, executes one tool, records the result, and chooses continue, recover, escalate, or stop.", [paragraph(0, 1), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0)], "Write the state transition for a sold-out booking attempt, including success evidence, bounded alternatives, and a termination rule.", [paragraph(0, 1), exampleStep(0), exampleStep(1), exampleStep(2)], [walkthrough(0), walkthrough(1), walkthrough(2)]),
    cover(2, "Tool containment uses least privilege, schema validation, idempotency, bounded retries, confirmations, budgets, and explicit recovery so model errors cannot silently compound.", [paragraph(1, 0), paragraph(1, 1), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1), checkpoint(2)], "A non-idempotent tool times out after execution. Design operation IDs, retry decisions, permission limits, and cost/loop stops.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(1), walkthrough(2)]),
  ],
  "evaluation-design": [
    cover(0, "An evaluation portfolio starts from a shipping decision and decomposes user outcomes and failure costs into observable quality, safety, latency, and cost dimensions.", [paragraph(0, 0), walkthrough(0)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Turn ‘ship the better support model’ into a decision claim, critical slices, failure costs, metrics, and a release rule.", [paragraph(0, 0), walkthrough(0)], [walkthrough(0)]),
    cover(1, "Use deterministic graders for exact contracts, humans for nuanced judgment, and calibrated model graders for scale, then triangulate where their blind spots differ.", [paragraph(0, 1), paragraph(1, 0), walkthrough(1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1)], "Assign graders to JSON validity, citation entailment, nuanced tone, and large-scale pairwise ranking, including calibration for each non-exact grader.", [paragraph(0, 1), paragraph(1, 0)], [walkthrough(1)]),
    cover(2, "Reliable decisions report paired uncertainty and sliced regressions, preserve frozen cases, and inspect severe failures instead of hiding them in one average.", [paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2)], "An aggregate score gains 3 points while a rare high-risk slice loses 12. Apply uncertainty and predefined gates to the ship decision.", [practiceAnswer(), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "security-privacy": [
    cover(0, "Threat modeling maps sensitive data and actions, actors, trust boundaries, untrusted inputs, privileged tools, and plausible abuse paths across the complete application.", [paragraph(0, 1), walkthrough(0)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Draw assets and trust boundaries for a multi-tenant RAG assistant with private documents and an outbound email tool, then identify one exfiltration path.", [paragraph(0, 1), walkthrough(0)], [walkthrough(0)]),
    cover(1, "Prompt injection works because instructions and untrusted data become tokens inside the same model computation; labels help but cannot enforce a privilege boundary.", [paragraph(0, 0)], [practiceAnswer()], [paragraph(0, 0)], "Explain why ‘ignore document instructions’ cannot contain an injected web page once the model also has secrets and an unrestricted tool.", [practiceAnswer(), paragraph(0, 0)], [paragraph(0, 0)]),
    cover(2, "Least privilege and data minimization keep secrets out of context, authorize retrieval before exposure, scope tools narrowly, validate calls, limit retention, and monitor abuse.", [paragraph(1, 0), paragraph(1, 1), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1), checkpoint(2)], "Design layered controls for cross-tenant retrieval and external sending, including authorization, minimization, confirmation, logging, and attack tests.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(1), walkthrough(2)]),
  ],
  "observability-governance": [
    cover(0, "A production trace links routing, retrieval, prompts, model calls, tools, validation, and outcome with versioned inputs, while metrics summarize user-visible health.", [paragraph(0, 0), paragraph(0, 1), walkthrough(0)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Specify spans, identifiers, versions, redaction, and metrics needed to reproduce one failed RAG-and-tool request without logging unnecessary secrets.", [paragraph(0, 0), paragraph(0, 1)], [walkthrough(0)]),
    cover(1, "Stage-level traces attribute quality, latency, and cost by showing where evidence volume, retries, model time, tool failure, or validation changed.", [paragraph(0, 1), walkthrough(1)], [exampleStep(0), exampleStep(1)], [checkpoint(1)], "Cost per success doubles after a release. Use trace spans to separate retrieval growth, prompt length, retries, and model latency before choosing a repair.", [exampleStep(0), exampleStep(1)], [walkthrough(1)]),
    cover(2, "Governance turns evidence into release gates, canaries, ownership, rollback, incident response, budgets, and regression tests with an auditable decision trail.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleStep(2)], [checkpoint(2)], "Design a canary, automatic rollback threshold, incident evidence pack, owner, and post-incident regression for the cost regression.", [paragraph(1, 0), paragraph(1, 1), exampleStep(2)], [walkthrough(2)]),
  ],
  distillation: [
    cover(0, "Response distillation imitates teacher outputs, logit distillation matches the teacher distribution, and feature distillation aligns selected internal representations.", [paragraph(0, 0)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)], "For a cat/dog/car prediction, explain what hard response labels omit that teacher logits reveal, and what feature matching would additionally constrain.", [paragraph(0, 0), exampleStep(0), exampleStep(1)], [paragraph(0, 0)]),
    cover(1, "The student can learn only behavior represented in validated teacher data and within its capacity, context, tokenizer, and architecture limits.", [paragraph(0, 1), walkthrough(0), walkthrough(1)], [exampleStep(1), exampleStep(2)], [checkpoint(1)], "Design a teacher-data slice for a narrow student and explain how teacher confidence, missing domains, and student capacity bound transfer.", [paragraph(0, 1), walkthrough(0), walkthrough(1)], [walkthrough(1)]),
    cover(2, "Compression value must include teacher generation, filtering, training, refresh, inherited errors, calibration, serving quality, latency, memory, and cost per success.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2)], "A student matches teacher accuracy but is overconfident. Name the calibration tests, training signals, inherited-error audit, and total-cost comparison required.", [practiceAnswer(), paragraph(1, 0), paragraph(1, 1)], [walkthrough(2)]),
  ],
  lora: [
    cover(0, "LoRA freezes W and learns a rank-r delta BA, reducing trainable parameters from d_out×d_in to r(d_out+d_in).", [paragraph(0, 0)], [exampleSetup(), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)], "For a 4,096×4,096 weight and rank 16, derive A and B shapes, trainable parameters, scale, and forward update.", [paragraph(0, 0), exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 0)]),
    cover(1, "Rank controls adapter capacity, target modules choose where change enters, and deployment can merge one adapter or route versioned adapters at runtime.", [paragraph(0, 1), paragraph(1, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [practiceAnswer()], [checkpoint(0), checkpoint(1), checkpoint(2)], "A rank-8 adapter underfits. Plan data, target-module, learning-rate, and rank ablations before choosing merge or runtime routing.", [practiceAnswer(), paragraph(1, 0)], [walkthrough(0), walkthrough(1)]),
    cover(2, "LoRA saves trainable-state memory but still runs the full base model; full tuning offers more capacity, while QLoRA stores the frozen base at low precision with new numerical trade-offs.", [paragraph(1, 1)], [exampleStep(2)], [paragraph(1, 1)], "Compare full tuning, LoRA, and QLoRA across trainable state, base-weight storage, activation compute, quality, and adapter deployment.", [paragraph(1, 1), exampleStep(2)], [paragraph(1, 1)]),
  ],
  moe: [
    cover(0, "A sparse MoE router scores each token, selects top-k experts, dispatches the token, and combines the selected expert outputs by router weights.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [exampleSetup(), exampleStep(0)], [checkpoint(0)], "Trace one token through E router logits, top-2 selection, dispatch, expert MLPs, weighted combination, and the residual stream.", [paragraph(0, 0), walkthrough(0), walkthrough(1), walkthrough(2)], [walkthrough(0)]),
    cover(1, "Capacity limits allocate expert slots from tokens, expert count, and a capacity factor; imbalance creates overflow that must be dropped, rerouted, or otherwise handled.", [paragraph(0, 1), walkthrough(1), walkthrough(2)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(1), checkpoint(2)], "For 1,024 tokens, 8 experts, and factor 1.25, calculate slots per expert and handle an expert receiving 210 tokens.", [exampleStep(0), exampleStep(1), exampleStep(2)], [paragraph(0, 1)]),
    cover(2, "MoE can expose many total parameters while activating few per token, but full expert memory, routing, all-to-all communication, imbalance, and small batches still affect serving cost.", [paragraph(1, 0), paragraph(1, 1)], [practiceAnswer()], [paragraph(1, 1)], "Explain how an 8× parameter MoE can have dense-like active FLOPs yet worse latency and memory behavior in production.", [practiceAnswer(), paragraph(1, 0), paragraph(1, 1)], [paragraph(1, 0)]),
  ],
  "multimodal-models": [
    cover(0, "A modality encoder converts image patches or audio/video frames into positioned feature vectors that a connector exposes to the language model.", [paragraph(0, 0), walkthrough(0), walkthrough(1)], [exampleSetup(), exampleStep(0), exampleStep(1)], [checkpoint(0)], "For a 224×224 image with 16×16 patches, calculate visual tokens and trace them through encoder, connector, and language context.", [exampleStep(0), exampleStep(1), paragraph(0, 0)], [walkthrough(0)]),
    cover(1, "Projection maps modality features into decoder width, cross-attention lets language queries read a separate modality memory, and unified-token designs process all modalities in one sequence.", [paragraph(0, 0), paragraph(0, 1), walkthrough(1)], [exampleStep(1), exampleStep(2)], [checkpoint(1)], "Compare where modality information lives and how it is accessed in projection, cross-attention, and unified-token designs.", [paragraph(0, 0), paragraph(0, 1)], [walkthrough(1)]),
    cover(2, "Fluent multimodal output can follow language priors rather than the signal, so grounding tests need localized evidence, counterfactual edits, modality ablations, and modality-specific slices.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [practiceAnswer()], [checkpoint(2)], "The answer stays correct after replacing the image with gray noise. Diagnose the failure and design counterfactual, OCR, spatial, and ablation checks.", [practiceAnswer(), paragraph(1, 1)], [walkthrough(2)]),
  ],
  "interpretability-editing": [
    cover(0, "Behavioral tests observe outputs, attribution associates components with outputs, probes test decodable information, and causal methods intervene to test whether a component changes behavior.", [paragraph(0, 0), paragraph(0, 1)], [exampleSetup(), exampleStep(0)], [paragraph(0, 1)], "A probe predicts sentiment at 99% and an attention map highlights one token. State what each establishes and what neither proves about causal use.", [practiceAnswer(), paragraph(0, 0)], [paragraph(0, 0)]),
    cover(1, "Activation ablation or patching replaces or removes a controlled internal state and measures a downstream logit or behavior change against matched controls.", [walkthrough(0), walkthrough(1)], [exampleStep(0), exampleStep(1), exampleStep(2)], [checkpoint(0), checkpoint(1)], "Design a clean/corrupted activation-patching test for Paris versus Rome, including aligned positions, intervention, metric, and control layers.", [exampleStep(0), exampleStep(1), exampleStep(2)], [walkthrough(0), walkthrough(1)]),
    cover(2, "A model edit must work on targets and paraphrases while preserving related and unrelated behavior; efficacy alone ignores specificity, generalization, and side effects.", [paragraph(1, 0), paragraph(1, 1), walkthrough(2)], [exampleStep(2)], [checkpoint(2), paragraph(1, 1)], "Evaluate a factual edit with exact prompts, paraphrases, neighboring facts, unrelated controls, adversarial contexts, rollback, and an alternative retrieval design.", [paragraph(1, 0), paragraph(1, 1)], [walkthrough(2)]),
  ],
};

/**
 * Independent semantic review found cases where the original guide pointer was related
 * but did not actually exercise the promised outcome. These keyed, authored overrides
 * supply the missing case data and result without weakening or rewriting the source
 * objective. Keys use the learner-visible one-based objective number.
 */
export const objectiveCoverageRemediations: Record<string, ObjectiveCoverageRemediation> = {
  "introduction#2": {
    workedExample: "One staged case: the prompt says ‘Turn these notes into a friendly update’ and supplies ‘Launch moved to Friday; Mira owns the checklist.’ The model uses the instruction and both supplied facts to construct ‘Quick update: our launch is now Friday, and Mira is taking care of the checklist.’ The response is newly assembled, but its useful claims remain traceable to the prompt rather than to human-like knowledge of the meeting.",
  },
  "tensors-shapes#2": {
    check: {
      expected: "The contracted feature axis has length 4, so $X[2,5,4]W[4,7]$ produces $Y[2,5,7]$. Every one of the 70 output values is a dot product that sums four products. Batch 2 and token count 5 survive; output width 7 replaces input width 4.",
      retry: "Re-label the axes as [batch, token, input feature] × [input feature, output feature]. Cross out the repeated input-feature label, then copy the three surviving labels in order.",
    },
  },
  "tensors-shapes#3": {
    workedExample: "For X[2,3,4], adding bias[4] deliberately reuses four feature offsets at all 2×3 batch-token locations. A tensor shaped [3,1] also broadcasts to [2,3,4], but it repeats one value across all four features at each token position. If the intent was one independent offset per feature, the program runs while applying the wrong meaning.",
  },
  "probability-softmax#2": {
    mechanism: "For one observed target, read its predicted probability $p_{target}$ and compute $L=-\\ln(p_{target})$. At 0.8 the loss is about 0.223; at 0.01 it is about 4.605. The second prediction is more surprising and therefore receives the larger training penalty. The next lesson explains how that penalty is turned into parameter sensitivities; no gradient notation is required here.",
  },
  "gradients-backprop#3": {
    workedExample: "Keep the correct local derivative $dL/dw=48$ from the toy graph with $w=1$. A learning rate of 0.001 proposes $w'=1-0.001(48)=0.952$; recomputing gives $a=1.904$, $y\\approx3.625$, and loss about 6.89, below 9. A learning rate of 0.1 proposes $w'=1-0.1(48)=-3.8$; recomputing gives $a=-7.6$, $y=57.76$, and $L\\approx3{,}221.7$, a severe overshoot. Backprop supplied the same correct slope; the optimizer chose two different step sizes.",
  },
  "optimizers#1": {
    workedExample: "For $\\theta=3$, $g=2$, and $\\eta=0.1$, SGD computes $\\theta'=\\theta-\\eta g=3-0.1\\times2=2.8$. Because a positive gradient says increasing $\\theta$ locally increases loss, subtracting it moves toward lower loss for a sufficiently small step.",
    check: {
      expected: "$\\theta'=3-0.1\\times2=2.8$. The minus sign moves opposite the positive local slope: if increasing $\\theta$ raises loss here, a small decrease is the descent direction. This is a local claim, so the step size still needs validation.",
      retry: "Write the three values directly under $\\theta'=\\theta-\\eta g$, multiply $0.1\\times2$ first, then use the gradient sign to say which direction locally raises loss.",
    },
  },
  "tokenization#2": {
    workedExample: "Toy tokenizer contract: lowercase normalization leaves ‘unplayable’ unchanged; the vocabulary assigns un→17, play→42, a→6, b→7, l→11, e→8. Longest-match selection yields [un, play, a, b, l, e], which encodes as [17,42,6,7,11,8]. Decoding maps those IDs back to the six stored strings and concatenates them to ‘unplayable’.",
    check: {
      expected: "Normalize to ‘unplayable’; select [un, play, a, b, l, e]; map to [17,42,6,7,11,8]; reverse the same vocabulary rows during decoding and join them to recover ‘unplayable’. These IDs belong only to this toy vocabulary.",
      retry: "Return to the four named stages—normalize, segment, map pieces to IDs, map IDs back—and write one intermediate value after each stage before trying again.",
    },
  },
  "embedding-layer#1": {
    workedExample: "Let the ID batch be [[12,900,12,5],[7,8,9,10]], shape [2,4]. Each of its eight entries selects one row from E[50,000,768]; ID 12 selects the same row twice. Stacking the selected rows preserves batch and token axes and adds the 768-feature axis, producing [2,4,768].",
    check: {
      expected: "Eight IDs perform eight row selections from E[50,000,768]. The two batch rows and four token positions remain, and every selected table row contributes 768 features, so the result is [2,4,768]. Repeated IDs repeat the same starting row.",
      retry: "Draw the [2,4] ID grid, replace each scalar ID with one length-768 row, and then read the three nested counts: batches, positions, features.",
    },
  },
  "embedding-layer#2": {
    mechanism: "Both uses of ‘bat’ begin from the same table row. The later network then repeatedly reads information from surrounding token positions and computes an update for each position; one part moves information between positions, and another transforms the combined features at one position. Thus ‘flew’ and ‘dusk’ can change one bat state while ‘swing’ and ‘hard’ change the other. Later lessons name these two operations attention and the MLP.",
  },
  "embedding-layer#3": {
    check: {
      expected: "First, a 2-D projection is lossy and can distort neighbors that differ in the full 768-dimensional space. Second, the plotted raw row is type-level and context-free, whereas river-bank behavior depends on a later contextual state; metric choice and training-data bias add further limits. Compare the full-dimensional hidden state for the same ‘bank’ token at named layers in matched river and finance sentences, then relate it to downstream behavior.",
      retry: "Separate the visualization question from the representation question: list what a 2-D projection discards, then list what the raw table row has not yet observed. Only then design the matched contextual comparison.",
    },
  },
  "positional-encoding#1": {
    mechanism: "A query is a token-derived vector that asks which positions are relevant; a key is the token-derived vector each position offers for that comparison; and a value is the information copied when a match receives weight. In content-only attention, the same learned matrix transformations turn every token vector into its query, key, and value. Reordering the input therefore only reorders those vectors: the query-key score table has its rows and columns permuted, and the weighted outputs are permuted in the same way. This property is called permutation equivariance. Because no input to the calculation identifies an index or direction, it cannot determine which otherwise identical content came first. A position-dependent signal must break that symmetry.",
    workedExample: "Take two content vectors A=[1,0] and B=[0,1]. With no position signal, a content comparison forms the same pairwise score table after swapping A,B, only with its rows and columns swapped; the resulting output vectors swap in the same way. Nothing in either run labels ‘A was first’. Here a query is the vector used to ask which positions match, and a key is the vector each position exposes for that comparison.",
  },
  "positional-encoding#2": {
    mechanism: "A query is a token-derived vector that asks what should influence the current position, and a key is the token-derived vector another position exposes for matching. Absolute encoding takes token content $x_i$ and an index-specific vector $p_i$, inserts position before the query/key transformations by forming $x_i+p_i$, and produces a position-marked hidden representation. Relative-bias encoding takes the displacement $i-j$ between a query position and key position, inserts its learned bias into their query-key score before softmax, and produces a position-aware comparison score without changing the input token vector. Rotary encoding takes a token-derived query or key plus its index, inserts position by rotating coordinate pairs after the query/key transformations and before their dot product, and produces a score whose phase difference depends on relative displacement. Thus the designs differ in input, insertion point, and the representation or score they change.",
    workedExample: "Use tokens A at position 0 and B at position 2. Absolute encoding adds different stored index vectors p0 and p2 to A and B before later layers. A relative-bias method leaves content vectors unchanged but adds a learned bias for displacement 2 directly to their comparison score. RoPE rotates A’s query by angle 0 and B’s key by an angle for position 2, so their dot product depends on the angle difference 2. Query/key mean the vectors compared to decide which position should influence another.",
  },
  "positional-encoding#3": {
    workedExample: "Evaluate a model trained to 2K at 16K with evidence placed near tokens 200, 8,000, and 15,800. Order test: present event A then B and ask which came first at each distance; fail if accuracy drops below the predeclared 90% gate or reverses order. Retrieval test: place a unique code at each distance among distractors and require exact recovery; fail if end-position accuracy falls more than 5 points below the 2K baseline. Accepting all 16K tokens without these results proves capacity only.",
    check: {
      expected: "Run an order-sensitive A-before-B test and an exact unique-code retrieval test with evidence near the start, middle, and end—such as positions 200, 8,000, and 15,800. Falsify effective extension if order accuracy misses its 90% gate or exact retrieval loses more than 5 points versus the 2K baseline. A short pronoun example tests local order, not 16K use.",
      retry: "Write three evidence positions first. For each requested test, name its input manipulation, exact output metric, and a numeric failure gate; do not use ‘the prompt fits’ as a success criterion.",
    },
  },
  "attention#1": {
    mechanism: "Inputs Q,K,V each have shape [B,h,T,d_h]. Multiply Q by transposed K on d_h to obtain scores [B,h,T,T], where the last axis enumerates candidate key positions. Mask illegal positions, then apply softmax over that key axis. Multiply weights [B,h,T,T] by V [B,h,T,d_h] to get one weighted value [B,h,T,d_h] per query. Concatenate heads to [B,T,h·d_h], project to model width [B,T,d], and add that update to the residual stream [B,T,d].",
    workedExample: "With B=2, h=4, T=3, d_h=8, and d=32: Q,K,V are [2,4,3,8]; scores and normalized weights are [2,4,3,3]; weighted values are [2,4,3,8]; concatenated heads are [2,3,32]; the output projection and residual addition both produce [2,3,32]. Softmax runs across the final length-3 key axis for each batch, head, and query.",
    check: {
      expected: "Q,K,V [B,h,T,d_h] → scores and weights [B,h,T,T], normalized over the final key-position axis → weighted values [B,h,T,d_h] → concatenation [B,T,h·d_h] → output projection [B,T,d] → residual output [B,T,d].",
      retry: "Start with the four named axes. Contract only d_h in QKᵀ, keep both token axes in the score table, then contract the key-token axis when weights multiply V.",
    },
  },
  "gpt2-from-scratch#1": {
    workedExample: "For IDs [2,32] and model width d, token lookup and position addition produce [2,32,d]. Block 1 and block 2 each preserve [2,32,d]; final normalization also returns [2,32,d]. The vocabulary head with V=50,000 produces logits [2,32,50,000]. For causal loss, logits at positions 0…30 align with target IDs at positions 1…31, giving targets [2,31] after the final input-only position is excluded.",
    check: {
      expected: "IDs [2,32] → token+position states [2,32,d] → block 1 [2,32,d] → block 2 [2,32,d] → final norm [2,32,d] → logits [2,32,50,000]. Align logits at 0…30 with next-token targets at 1…31, producing 62 target decisions before any padding mask.",
      retry: "Keep [batch=2, time=32] fixed through the residual stack, change only the final feature axis from d to 50,000, then shift logits left and targets right by one.",
    },
  },
  "gpt2-from-scratch#2": {
    check: {
      expected: "Causal masking is the enduring left-to-right information contract: a prediction cannot read future targets. Learned absolute positions are an implementation choice; other valid models use relative or rotary signals. GELU is an implementation choice; other nonlinearities can fill the MLP role. Grouped-query attention is also an implementation choice that changes KV sharing and efficiency while preserving causal routing.",
      retry: "For each item, ask whether removing that exact technique breaks left-to-right next-token modeling or whether another mechanism can satisfy the same role. Classify the contract separately from its implementation.",
    },
  },
  "gpt2-from-scratch#3": {
    check: {
      expected: "First overfit one fixed tiny batch until its loss becomes very small; this checks that forward, loss, backward, and update can cooperate. Keep a document-level clean holdout separate. Unit-test the causal mask and one-token target shift so future tokens and identity labels cannot leak. Save weights, optimizer moments, scheduler step, RNG states, and sampler/data position; after resume, the next batches, losses, and updates should match an uninterrupted control within the declared numerical tolerance.",
      retry: "Divide the protocol into four independent claims—micro-batch fit, clean holdout, mask/shift unit test, exact resume—and name the artifact or comparison that falsifies each one.",
    },
  },
  "pretraining-overview#1": {
    workedExample: "Suppose the corpus contains news prose ‘Photosynthesis converts light…’, classroom questions ‘Explain photosynthesis’, encyclopedia definitions, and dialogue fragments. Pre-training shifts every token sequence, predicts its next tokens, and updates shared parameters when those predictions are wrong. The parameters can therefore learn language and recurring photosynthesis relations, but the raw prompt ‘Explain photosynthesis’ still has several corpus-like continuations; no assistant contract has selected one response style.",
  },
  "pretraining-overview#2": {
    workedExample: "Toy global batch: two packed rows of six IDs, [[11,12,13,2,0,0],[21,22,2,31,32,2]], where 2 marks a document end and 0 is padding. Inputs use positions 0…4; labels use 1…5. Padding labels and any forbidden cross-document target are set to ignore_index, so only valid within-document next tokens contribute. The model emits logits [2,5,V], valid token losses average to one scalar, backward creates parameter gradients, workers reduce or shard those gradients, and the optimizer updates parameters plus its synchronized/sharded state.",
    check: {
      expected: "Tokenize and pack the two rows; shift inputs left and labels right; set padding and disallowed document-crossing labels to ignore_index; compute logits [2,5,V]; average only valid token losses; backpropagate the scalar; reduce or shard parameter gradients across workers; update parameters and the corresponding optimizer state. Input IDs are not synchronized as gradients, and masked labels contribute no loss or gradient.",
      retry: "Draw one row with input IDs directly above shifted labels. Cross out padding and cross-document labels, then follow the remaining labels through logits → scalar loss → gradients → synchronized/sharded update.",
    },
  },
  "objectives-details#3": {
    check: {
      expected: "Bad residual scaling appears as residual-branch/update norms growing relative to the carried stream as depth increases. Unstable normalization appears in per-layer activation means/variances or norms that explode, vanish, or become non-finite around normalization sites. A masking bug is different: a tiny hand-built causal case gets deceptively low loss or changes earlier logits when a future target changes. Check all three because good norm statistics cannot rule out information leakage.",
      retry: "Make three columns—residual scaling, normalization, causal objective. Under each, write one layerwise measurement and the unique failure signature it would produce.",
    },
  },
  "infrastructure#1": {
    workedExample: "Four-way device-mesh comparison, treating each axis in isolation. Data parallelism partitions mini-batch examples; every rank retains a full model replica; ranks all-reduce gradients; the benefit is more examples processed per step. Tensor parallelism partitions selected weight matrices and their matrix multiplications; small unsharded parameters such as normalization parameters remain present on each tensor-parallel rank; ranks all-reduce, all-gather, or reduce-scatter partial activations; the benefit is fitting and computing a wider layer. Pipeline parallelism partitions layer weights by depth; each stage retains only its assigned layers rather than a replicated stage-local model; a schedule moves microbatches through the stages while activations travel forward and activation gradients travel backward across stage boundaries; the benefit is splitting depth and weight memory, with pipeline bubbles as a utilization cost. Megatron-style sequence parallelism partitions the token axis of selected LayerNorm and dropout activations across tensor-parallel ranks; the small unsharded parameters remain present across those ranks and their parameter gradients are reduced; all-gather and reduce-scatter operations join partitioned and non-partitioned regions; the benefit is lower activation memory. This is narrower than context parallelism, which partitions all layer activations along sequence length and exchanges the key/value information attention needs for long contexts.",
    check: {
      expected: "Data — partitioned: mini-batch examples; retained/replicated: a full model replica per data rank; communication: gradient all-reduce; benefit: higher data throughput. Tensor — partitioned: selected matrix rows or columns and their compute; retained/replicated: small unsharded parameters such as normalization parameters on each tensor rank; communication: all-reduce, all-gather, or reduce-scatter of partial activations; benefit: a wider layer fits and its compute is shared. Pipeline — partitioned: layer weights by depth; retained/replicated: each stage retains only its assigned weights, with no pipeline-axis replica implied; communication: forward activations and backward activation gradients at stage boundaries while scheduled microbatches move through stages; benefit: depth and weight memory are split, at the cost of bubbles. Megatron-style sequence — partitioned: the token axis of selected LayerNorm and dropout activations; retained/replicated: small unsharded parameters remain on each tensor-parallel rank and their gradients are reduced; communication: all-gather and reduce-scatter around partitioned regions; benefit: lower activation memory. Unlike this selected-operation scheme, context parallelism partitions all layer activations along sequence length and communicates attention key/value information for long contexts.",
      retry: "Make four rows—data, tensor, pipeline, and Megatron-style sequence—and fill the same four columns: partitioned object, retained or replicated object, communication, and benefit. For pipeline, write ‘assigned layer weights’ and ‘scheduled microbatches’, not replicated execution. For sequence, name selected LayerNorm/dropout activations, then add one sentence distinguishing context parallelism’s all-layer sequence partition.",
    },
  },
  "pretraining-evaluation#1": {
    check: {
      expected: "Checkpoint B’s lower held-out loss establishes better next-token prediction on that held-out text distribution under the fixed tokenizer. The frozen arithmetic suite falling from 62% to 57% establishes a five-point arithmetic regression under that task protocol. Neither metric cancels the other because they measure different outcomes; the deployment decision must use the intended-use gate and uncertainty for both.",
      retry: "Write one sentence beginning ‘held-out loss establishes…’ and another beginning ‘62%→57% establishes…’. If either sentence claims universal model quality, narrow it to its dataset and protocol.",
    },
  },
  "pretraining-evaluation#3": {
    check: {
      expected: "Under a declared gate that arithmetic must not regress by more than 2 points, pause and repair the data mixture rather than ship or continue unchanged: 62%→57% misses the gate even though held-out loss improves. The decision could reverse if a paired confidence interval shows the arithmetic difference includes zero, a protocol bug invalidates the drop, or arithmetic is explicitly outside the intended-use contract and the remaining release gates pass.",
      retry: "State the numeric gate before the decision. Then compare the observed five-point change with that gate and list only evidence that would invalidate the measurement or change the intended-use requirement.",
    },
  },
  "olmo3-case-study#3": {
    check: {
      expected: "Start treatment and control from the same released entering checkpoint. Match additional tokens, optimizer, schedule, seeds where practical, compute budget, and evaluator; change only the declared Dolmino- or Longmino-style mixture. Predeclare a target gain and a general-loss or capability regression that would reject the stage. Preserve configs, data-mixture manifests, logs, evaluator versions, and resulting checkpoints so the comparison remains inspectable.",
      retry: "Make a two-column treatment/control table. Copy every row unchanged except ‘data mixture’, then add one target metric, one regression falsifier, and the artifacts needed to audit both runs.",
    },
  },
  "posttraining-overview#1": {
    workedExample: "Same prompt, two continuations. Base-model-style continuation: ‘Explain photosynthesis — a common exam prompt followed by notes and sample questions…’. Post-trained assistant continuation: ‘Photosynthesis is the process plants use to convert light, water, and carbon dioxide into stored chemical energy…’. The second is direct and user-oriented because assistant-formatted behavior became more likely; neither continuation by itself verifies every factual claim.",
    check: {
      expected: "The base continuation may imitate a corpus fragment, heading, or neighboring question; the assistant continuation directly answers in the requested format. Post-training changed the conditional distribution over interaction styles and policies. It did not turn fluent text into a factuality guarantee, and both answers still require evidence appropriate to the claim.",
      retry: "Write two literal continuations of the same prompt before naming the change. Then separate ‘response format became more likely’ from ‘the content is verified’.",
    },
  },
  "posttraining-overview#2": {
    check: {
      expected: "Behavior gap: an assistant produces correct content but ignores a required concise JSON format. Minimum path: first curate a demonstration artifact showing the exact dialogue/template and valid JSON; run SFT and a deterministic schema regression. If several valid outputs remain but one style is preferred, add a chosen/rejected comparison artifact and preference tuning. Add verifier/reward rollouts only when exploration against an executable outcome is needed. Add tool/safety trajectory data only for tool-selection or boundary gaps, and retain stage-specific regression evidence at every handoff.",
      retry: "Choose one observed gap, name the supervision artifact that directly labels it, and stop. Add the next stage only if you can name new evidence the earlier stage cannot provide.",
    },
  },
  "posttraining-overview#3": {
    workedExample: "Before/after teaching fixture for one preference stage: instruction-format pass 71%→88% (behavior gain); factual QA 76%→72% (capability regression); harmful compliance 8%→3% (safety gain); benign refusal 4%→18% (usefulness regression). A release rule requiring factual QA ≥75% and benign refusal ≤8% blocks the checkpoint despite the format and harmful-compliance gains; repair or select an earlier checkpoint.",
  },
  "instruction-tuning-rlhf#1": {
    check: {
      expected: "Pre-training supplies broad language, code, domain, factual-pattern, and continuation capabilities by next-token learning. Post-training reshapes assistant role following, dialogue formatting, response ranking, refusal/alternative behavior, tool-call proposals, and boundary behavior through demonstrations, comparisons, rewards, and safety/tool trajectories. Runtime authorization still governs real effects, and neither stage alone guarantees truth.",
      retry: "Split the answer into ‘patterns needed before an assistant format exists’ and ‘behaviors selected after the base model exists’. Put tool authorization in a third runtime column rather than either training column.",
    },
  },
  "instruction-tuning-rlhf#2": {
    check: {
      expected: "Format imitation → SFT demonstrations. Subtle ranking among acceptable answers → chosen/rejected preference data. Executable success with useful exploration → verifiable reward and online RL; use supervised examples alone when exploration adds no value. Authorization → deterministic runtime controls; tool/safety tuning can shape whether and how the model proposes actions but cannot grant permission.",
      retry: "For each gap ask what evidence is available: target response, relative comparison, executable outcome, or permission decision. Map those four evidence types before naming an algorithm.",
    },
  },
  "instruction-tuning-rlhf#3": {
    mechanism: "Select the minimum stage from the supervision actually available. A known target response supports SFT; relative judgments among valid responses support preference tuning; an executable outcome plus a need to discover new trajectories can justify RL; unsafe authority requires deterministic runtime enforcement, with training used only to improve proposals and refusals. Add a stage only when it contributes evidence the previous stage lacks.",
    check: {
      expected: "Malformed JSON → SFT on exact templates plus a deterministic parser/schema check. Preferred tone → clear demonstrations first; add preference pairs only if several valid answers need relative ranking. Unit-tested math → supervised solutions may suffice; use verifier-backed RL only if online exploration can discover better solutions. Unauthorized calls → runtime identity, scope, confirmation, and tool authorization, plus targeted tool/safety data to improve proposed behavior.",
      retry: "Label each case with its available supervision—target, comparison, executable verifier, or authorization rule. Pick the least complex matching stage and explain what evidence a later stage would add.",
    },
  },
  "sft#1": {
    workedExample: "Complete two-turn record using the deployment template: <system>You are a concise science tutor.</system><user>Why do leaves look green?</user><assistant>Chlorophyll absorbs more red and blue light and reflects more green light, which reaches our eyes.</assistant><eos><user>One sentence only.</user><assistant>Leaves look green because chlorophyll reflects more green light than it absorbs.</assistant><eos>. Store source/provenance ‘expert-authored, reviewed 2026-07-14’, factual-review status, template version, dedup hash, and coverage tags so the set can be checked for correctness, diversity, and near duplicates.",
    check: {
      expected: "Use the exact deployment role and end markers for both turns; include correct assistant targets after each user message; preserve system/user context; attach author/source, review status, template version, dedup identity, and distribution tags. Review factual correctness, policy fit, diversity across tasks and response lengths, duplicates, and whether training serialization exactly matches deployment.",
      retry: "Write the serialized conversation first, including both <eos> boundaries. Then audit it with six labels: provenance, factual review, policy review, template version, dedup identity, and distribution/diversity tag.",
    },
  },
  "sft#2": {
    mechanism: "Serialize every role because earlier system, user, and tool-result tokens are inputs needed to predict the assistant response. Shift labels one position as in causal training, then replace every label not designated as assistant output by ignore_index=-100. Cross-entropy reads only labels not equal to -100, so context remains visible without training the model to imitate users, system text, or tool results.",
    workedExample: "Toy token sequence: [<sys>,safe,<user>,sum,2,3,<assistant>,5,<tool>,ok,<assistant>,done,<eos>]. Inputs at positions 0…11 predict the next-token label row [-100,-100,-100,-100,-100,-100,5,-100,-100,-100,done,<eos>]. All role/context tokens remain in the causal input, while only 5, done, and <eos> contribute loss. If tool-call syntax were a policy-designated assistant span, its tokens would also receive real labels.",
    check: {
      expected: "Keep system, user, tool-result, and prior assistant tokens visible in the serialized input. After the one-token target shift, write -100 for labels belonging to system/user/tool-result text and real token IDs only for policy-designated assistant spans. In the toy case, only 5, done, and <eos> score loss; the other labels are ignored even though their input tokens remain visible.",
      retry: "Draw two aligned rows: input token and next-token label. Circle assistant output spans in the label row, replace every uncircled label with -100, and leave the input row untouched.",
    },
  },
  "sft#3": {
    check: {
      expected: "Select or roll back to the last checkpoint before the regression, reduce update strength if drift is excessive, rebalance or downsample long answers, add concise counterexamples, and mix a controlled amount of base/replay data for lost completion behavior. Re-run the same fixed format-validity, response-length, completion-quality, factuality, and safety slices; keep the repair only if the targeted behavior improves without reopening the regressions.",
      retry: "Name one reversible checkpoint action, one data-mixture action, and one fixed before/after evaluation for each observed regression. A cause without a controlled repair is incomplete.",
    },
  },
  "preference-optimization#2": {
    workedExample: "For one prompt, let the policy log-probabilities be chosen=-0.2 and rejected=-1.4, so its gap is 1.2. Let the fixed reference be chosen=-0.4 and rejected=-1.0, gap 0.6. DPO therefore sees a relative gap advantage of 1.2-0.6=0.6. In the displayed logistic loss, beta=0.1 scales that to 0.06 while beta=1 scales it to 0.6; larger beta makes the loss respond more sharply to the same relative gap. In the constrained-policy interpretation used here, beta is also the KL/reward temperature: larger beta favors staying closer to the reference for a fixed reward difference, so report the convention whenever comparing runs.",
    check: {
      expected: "Policy chosen-minus-rejected = (-0.2)-(-1.4)=1.2. Reference chosen-minus-rejected = (-0.4)-(-1.0)=0.6. The policy improves the relative gap by 0.6. Multiplying by beta gives 0.06 at beta 0.1 and 0.6 at beta 1, sharpening the displayed logistic objective; under the course’s constrained-policy convention, larger beta corresponds to stronger reference/KL restraint for a fixed reward scale. Beta is not evidence that the chosen answer is uniquely correct.",
      retry: "Compute the policy gap and reference gap on separate lines, subtract them, then state both roles of beta: numeric scaling in the shown loss and reference restraint under the declared convention.",
    },
  },
  "rl-fundamentals#1": {
    workedExample: "Code-solving episode: state s0 contains the prompt ‘write add(a,b)’ and an empty prefix. Action a0 emits ‘def add(a,b):’; the state becomes that prefix. Later an action emits ‘return a+b’; a test-tool action runs three unit tests. The episode terminates when tests finish or a 100-token limit is reached. Reward is 1 only if all tests pass, otherwise 0; with undiscounted return, the early a0 receives return 1 in the successful trajectory even though the terminal tool produced the evidence.",
    check: {
      expected: "State = prompt plus current code prefix and allowed tool observations. Actions = next code tokens or the test-tool call. Each action appends text or records a test result, producing the next state. Termination = all tests run, explicit stop, or budget limit. Terminal reward = 1 for all tests passing, 0 otherwise; the return attributed to the early function-definition action is 1 on the successful trajectory, not a separate supervised label saying that token was uniquely responsible.",
      retry: "Write the episode as s0 → action → s1 → action → tool result → terminal reward. Only after the timeline is complete should you assign the terminal return back to the early action.",
    },
  },
  "rlhf#1": {
    workedExample: "Prompt: ‘Explain why the sky is blue in two sentences.’ The SFT policy samples A, a correct concise Rayleigh-scattering answer, and B, a longer answer claiming oceans reflect blue upward. A human labels A chosen and B rejected; that pair becomes one reward-model training artifact. The current policy later samples C, scored reward 1.1 against a baseline 0.7, so advantage is +0.4. A KL-constrained policy update raises C’s token log-probabilities while penalizing movement from the reference SFT policy.",
  },
  "rlhf#2": {
    workedExample: "One rollout has learned reward 1.2 and value baseline 0.8, so advantage A=0.4. Its old-policy sequence probability is 0.20 and new-policy probability is 0.26, ratio r=1.30. With PPO clip ε=0.20, the positive-advantage term uses min(1.30×0.4,1.20×0.4)=0.48 rather than 0.52. If the reference probability is 0.22, a simple sampled log-ratio proxy is ln(0.26/0.22)≈0.167; with KL coefficient 0.1 the penalty contribution is about 0.0167. Reward supplies direction, baseline reduces variance, clipping limits one update, and reference KL limits drift across behavior.",
  },
  "tools-safety#1": {
    workedExample: "Schema: send_email({to:string, subject:string, body:string, idempotency_key:string}). Proposal: {to:'lee@example.com',subject:'Meeting notes',body:'Attached summary',idempotency_key:'req-1842'}. Runtime checks user scope email:send and confirms the exact recipient/body with confirmation token confirm-77. Execution returns {status:'sent',message_id:'m-903'}. If the network times out, the runtime queries idempotency key req-1842 before retrying; if status remains unknown it escalates rather than sending a duplicate.",
    check: {
      expected: "Validate the send_email schema and typed arguments; authenticate the user and require email:send scope; bind an explicit confirmation token to recipient, subject, and body; execute with idempotency key req-1842; accept the returned message_id as the receipt. On timeout, look up req-1842 before retrying, and escalate or compensate when status is unknown. The model proposes the action but never grants authorization.",
      retry: "Fill seven fields in order: schema, proposed arguments, permission, confirmation, idempotency key, execution receipt, timeout recovery. Do not merge model intent with runtime authority.",
    },
  },
  "tulu3-case-study#1": {
    workedExample: "End-to-end teaching trace: curation stores prompt ‘What is 17×6?’ with reviewed assistant demonstration ‘102’ and provenance; SFT raises probability of the correct response format. Preference data then pairs chosen ‘102’ with rejected ‘The detailed calculation gives 112’ and applies length normalization so verbosity does not decide the pair. RLVR samples ‘102’, the exact parser/verifier returns reward 1, and a failed ‘112’ rollout returns 0. Compare the final checkpoint with the SFT-only and SFT+DPO controls on the same exact-math suite before attributing a gain to RLVR.",
  },
  "decoding-sampling#1": {
    workedExample: "Toy vocabulary [red, blue, green, stop] has logits [2,1,0,-1]. Stable softmax subtracts 2, exponentiates [0,-1,-2,-3] to about [1,0.368,0.135,0.050], and normalizes to [0.644,0.237,0.087,0.032]. A top-k=2 policy keeps red and blue and renormalizes them to about [0.731,0.269]. Greedy selection within that filtered set chooses red, appends it, and the next model call receives the old context followed by red.",
    check: {
      prompt: "For tokens [red, blue, green, stop] with logits [2,1,0,-1], apply stable softmax, top-k=2 filtering, renormalization, then greedy selection. What token is appended and what is the next context?",
      expected: "Subtract max logit 2 → [0,-1,-2,-3]; exponentiate → about [1,0.368,0.135,0.050]; divide by 1.553 → probabilities [0.644,0.237,0.087,0.032]. Top-k=2 keeps red and blue; renormalizing their 0.881 mass gives about [0.731,0.269]. Greedy selects red. Append red to the original context and use that enlarged sequence for the next model call.",
      retry: "Write one row for each operation: subtract max, exponentiate, divide by total, select two indices, divide by kept mass, choose maximum, append. Do not skip directly from logits to a word.",
    },
  },
  "decoding-sampling#2": {
    check: {
      expected: "For [0.5,0.3,0.15,0.05], top-k=2 keeps exactly the first two tokens. Under the stated inclusive top-p convention, cumulative mass reaches 0.8 after those same two, so top-p=0.8 also keeps exactly them; both renormalize 0.5/0.8=0.625 and 0.3/0.8=0.375. Lower temperature sharpens their relative odds, increasing mass on the 0.5 token without adding knowledge.",
      retry: "Sort probabilities, compute the cumulative totals 0.5 then 0.8, and state the inclusive cutoff rule. Treat temperature as rescaling logit gaps before softmax, not deleting a fixed number of tokens.",
    },
  },
  "decoding-sampling#3": {
    workedExample: "Three task-policy decisions: invoice extraction uses greedy or schema-constrained decoding at temperature 0 and measures exact field/schema validity; ideation draws five outputs from fixed seeds at moderate temperature/top-p and measures distinct ideas plus human-rated coherence; code generation samples eight candidates, runs unit tests, and selects a passing candidate, reporting pass@8 and selector success rather than hidden oracle quality.",
  },
  "generation-kv-cache#1": {
    workedExample: "A 1,000-token prompt enters prefill once: all 1,000 positions are processed in parallel and their K/V tensors are stored at every layer. To produce 20 more tokens, decode runs sequentially. Step 1 chooses from the prefill output; before step 2 the selected token gets one new Q/K/V and its K/V is appended. Continuing this way, each decode step computes one new token’s projections and its query reads a cache growing from 1,000 through 1,019 positions.",
    check: {
      expected: "Prefill processes 1,000 prompt positions once and stores their layerwise K/V. Generation then makes 20 sequential choices. At each decode iteration, only the newest selected token receives new layer states and Q/K/V; its K/V is appended, and its query attends to the growing stored prefix. Across the sequence of choices, visible cache lengths grow from 1,000 to 1,019 rather than rebuilding old K/V.",
      retry: "Draw one prefill box labeled 1,000 positions, followed by 20 one-position decode boxes. Above each decode box write the cache length it reads and mark exactly one K/V append.",
    },
  },
  "generation-kv-cache#2": {
    mechanism: "Without a cache, each decode call reruns every layer on the entire longer prefix, recreating old hidden states and K/V projections; prefix work therefore repeats and ordinary full-attention work for that rerun grows roughly with prefix length squared. With a cache, old K/V remain valid. Each layer projects only the new token’s Q/K/V, while that one query still scores all t stored keys and mixes their values, so new attention work per step grows roughly O(t) and cache memory grows O(t).",
    workedExample: "Prompt length 3, then two generated choices. No-cache implementation processes prefix lengths 3 and 4 for the two choices: 7 token positions’ layer projections are executed, including the first three twice; its full prefix attention tables contain 3²+4²=25 query-key score cells. With cache, prefill projects 3 positions once and the next decode projects only the first generated token, 4 projected positions total for the same two choices; after appending that token’s K/V, its query reads 4 keys including itself. If another token is requested, one more projection is added and its query reads 5 keys.",
    check: {
      expected: "Without cache for prompt 3 and two choices, rerun prefixes 3 and 4: 7 token-position projections and 9+16=25 full-prefix score cells. With cache, project the 3 prompt positions once, then one newly selected token before the second choice: 4 token-position projections; after its K/V is appended, the new query scores 4 keys including itself. Each later step adds one projection and O(t) query-to-cache scores instead of recomputing all old layer states and an O(t²) prefix table.",
      retry: "List the prefix length seen by each model call. Sum all positions for the no-cache column; in the cache column count the prompt once plus one new position per later call, then separately count keys read by the newest query.",
    },
  },
  "quantization-memory#3": {
    workedExample: "Decision fixture—not a course hardware measurement. A pinned deployment benchmark reports: 8-bit latency 72 ms/token-batch, throughput 58 tok/s, peak memory 9.6 GB, rare-language accuracy delta -0.4 points, task delta -0.2, fused kernel supported; 4-bit reports 61 ms, 70 tok/s, 6.5 GB, rare-language delta -1.4, task delta -0.8, fused kernel supported. Acceptance gates are latency ≤65 ms, peak memory ≤8 GB, rare-language delta no worse than -2, task delta no worse than -1.5, and a supported production kernel.",
    check: {
      prompt: "Using this scenario benchmark—8-bit: 72 ms, 58 tok/s, 9.6 GB, rare-language Δ-0.4, task Δ-0.2, fused kernel yes; 4-bit: 61 ms, 70 tok/s, 6.5 GB, rare-language Δ-1.4, task Δ-0.8, fused kernel yes—choose a format under gates latency ≤65 ms, memory ≤8 GB, both quality deltas above -2/-1.5, and supported kernel. This is a decision fixture, not a claimed device measurement.",
      expected: "Choose 4-bit for this fixture: 61≤65 ms, 6.5≤8 GB, rare-language -1.4 is within the -2 gate, task -0.8 is within the -1.5 gate, and the fused kernel is supported; it also has higher measured fixture throughput at 70 tok/s. Reject 8-bit for this deployment because 72 ms and 9.6 GB miss the latency and memory gates even though its quality deltas are smaller. A real deployment must rerun the same protocol on its actual model, hardware, traffic, and slices.",
      retry: "Create one row per acceptance gate and mark pass/fail for both formats. Make the decision only after every row is filled; quality, memory, and kernel evidence are co-equal constraints.",
    },
  },
  "serving-systems#2": {
    workedExample: "Arrival timeline: requests A(4 decode steps) and B(2) arrive at t=0; C(1) arrives at t=1. Static batch size 2 starts A+B, pads B for two idle steps, and C waits until the batch ends. Dynamic batching waits a 1-tick collection window, can start A+B together, but C still waits after missing that window. Continuous batching starts A+B, removes B when it finishes at step 2, and inserts waiting C into the freed slot for the next decode boundary while A continues.",
  },
  "serving-systems#3": {
    workedExample: "Interactive tier SLO: p95 first token ≤800 ms and p95 inter-token ≤80 ms at 20 requests/s; queue bound 40, max 2,000 input and 500 output tokens, concurrency 32. Above queue 40, reject low-priority requests with retry-after; at 70% cache memory or p95 first-token >700 ms for 3 minutes, add a replica. Batch tier SLO: 95% complete within 30 minutes at 5 jobs/min; queue bound 500, per-job 50k tokens, concurrency 8, and overload pauses admission rather than stealing interactive decode slots.",
    check: {
      expected: "Interactive: protect p95 TTFT 800 ms/inter-token 80 ms with queue 40, 2k+500 token caps and concurrency 32; reject low priority beyond the queue, and scale at 70% cache memory or TTFT >700 ms for three minutes. Batch: protect 30-minute completion with queue 500, 50k-token job cap and concurrency 8; pause batch admission or defer jobs under pressure. Never let an unbounded batch queue consume the interactive reservation.",
      retry: "For each tier fill SLO, arrival rate, queue bound, token cap, concurrency, overload action, and scaling trigger. A control with no numeric trigger cannot be tested.",
    },
  },
  "test-time-compute#2": {
    workedExample: "Matched methods: exact math samples five independently seeded answers, self-consistency counts repeated results, and an external calculator verifies the leading candidate; a verifier beats agreement when all samples share one misconception. For an open migration plan, sample three structurally different plans, critique each against a separately tested risk rubric, revise the strongest, or use bounded search when intermediate dependencies branch. Stop at the fixed candidate/node budget and preserve rubric scores because no exact answer checker exists.",
    check: {
      expected: "Exact math: sample candidates; self-consistency can prioritize an answer but does not prove it; use an external calculator/test verifier for the final decision. Open plan: generate diverse candidates, use critique-and-revision against a calibrated rubric, and use bounded search only when exploring intermediate branches adds value. The rubric/verifier must be evaluated separately, and both cases need explicit candidate, node, token, and stop budgets.",
      retry: "Make five rows—sampling, self-consistency, search, critique, verifier. For each case mark create, aggregate, explore, revise, or check; then identify which method supplies independent outcome evidence.",
    },
  },
  "context-engineering#2": {
    workedExample: "Budget 4,000 tokens: trusted instructions 500, recent history 700, user request 200, and ten retrieved documents of 500 each would total 6,400. Keep all 500 instructions and 200 request tokens; keep the most relevant 400 history tokens and summarize 300 into 100; retrieve/rerank instead of including all documents, selecting four 500-token passages with source IDs and trust labels; reserve 800 tokens for the answer. Used context =500+200+400+100+2,000=3,200, leaving the 800-token output reserve; six documents are dropped from context but remain retrievable.",
    check: {
      expected: "Start with 4,000 total and reserve 800 for output, leaving 3,200 input tokens. Keep 500 trusted instructions and 200 user-request tokens. Keep 400 recent-history tokens and replace 300 older tokens with a 100-token labeled summary. Rerank ten 500-token documents and include only four=2,000 tokens with source/trust metadata. Total input 500+200+400+100+2,000=3,200; omit six documents while retaining retrieval access.",
      retry: "Reserve output first. Subtract trusted instructions and the user request next, then allocate the remainder to recent history, labeled summary, and ranked evidence; show an addition that lands exactly within budget.",
    },
  },
  "context-engineering#3": {
    check: {
      expected: "Pass criteria: every output has the required schema/sections; missing evidence produces the literal value ‘Not stated’; contradictory sources are both cited and the conflict is reported rather than silently resolved; factual claims cite supporting passages; embedded instructions in documents cause no tool action or priority change; reordered and lengthened evidence preserves schema validity and materially equivalent supported conclusions. Record each criterion independently for every perturbation.",
      retry: "Turn each perturbation into an observable assertion: expected field, abstention phrase, conflict behavior, citation entailment, forbidden action, and stable schema. ‘Looks robust’ is not a criterion.",
    },
  },
  "agent-loops#1": {
    check: {
      expected: "The fixed three-step document process is a workflow: encode its known sequence and error branches in deterministic code, using a model only inside defined steps. Open-ended research may justify a bounded agent because the next query or source choice depends on newly observed evidence. Even there, deterministic runtime code enforces tool permissions, source and token budgets, approval points, trace logging, and termination.",
      retry: "Ask whether the next transition can be enumerated before execution. If yes, choose a workflow; if observations genuinely determine unknown next actions, justify a bounded agent and list its non-model controls.",
    },
  },
  "agent-loops#3": {
    workedExample: "A non-idempotent purchase call uses operation ID order-771 and times out after dispatch. Before retrying, query the provider by order-771. If status=completed, record the receipt and do not retry; if status=not_found, retry once with the same ID; if status=unknown, stop and escalate for reconciliation or issue a defined compensation after approval. The tool credential permits only this merchant and ≤$50. Terminate after 1 retry, 2 minutes, $0.10 tool cost, or two repeated state/action pairs.",
    check: {
      expected: "On ambiguous timeout, look up operation ID order-771 before any retry. Completed → use receipt; not found → one retry with the same ID; unknown → no blind retry, escalate or perform an approved compensation. Scope permission to the merchant and $50 limit. Stop at one retry, two minutes, ten cents, or two repeated state/action pairs so uncertainty cannot become duplicate writes or runaway cost.",
      retry: "Branch explicitly on completed, not-found, and unknown lookup states. Add permission scope and four numeric stop limits before describing any retry.",
    },
  },
  "evaluation-design#1": {
    workedExample: "Ship decision: replace the current support assistant only if paired task success improves without breaching risk or service gates. Portfolio: resolved-without-recontact rate, citation-supported factuality, harmful-action rate, p95 latency, and cost per successful case. Critical slices are billing disputes, account recovery, Spanish, long conversations, and accessibility requests; account-recovery safety failures are severe blockers. Require +5 points task success with a 95% paired interval above 0, ≥98% citation support, zero increase beyond 0.2% harmful actions, p95 ≤2.0 s, and cost/success ≤$0.08.",
    check: {
      expected: "Use the explicit replacement decision and paired current-system control. Measure task success, factual support, safety, p95 latency, and cost per success across billing, account recovery, Spanish, long, and accessibility slices. Block release on severe account-recovery failures. Ship only if task success gains at least 5 points with the 95% paired interval above zero, citation support is ≥98%, harmful actions do not rise beyond 0.2%, p95 is ≤2.0 s, and cost/success is ≤$0.08.",
      retry: "Write one release decision, five metric families, five critical slices, one severity rule, and a numeric gate for every metric. A benchmark name without a decision threshold is not a portfolio.",
    },
  },
  "distillation#2": {
    workedExample: "Narrow 1B student targets English billing support with 2k context. Teacher set: 40k billing prompts, 10k refunds, 5k account-access cases; it contains only 200 Spanish cases and no tax-law cases. Validate teacher answers with policy rules and sampled human review, and reject low-confidence or contradictory outputs. The student cannot inherit reliable Spanish/tax behavior absent coverage and cannot serve 8k-document tasks beyond its context; evaluate those as declared out-of-scope rather than assuming broad teacher capability transfers.",
  },
  "lora#3": {
    mechanism: "Full fine-tuning updates every selected base weight and keeps optimizer state for them, maximizing adaptation capacity at high memory cost. LoRA freezes base weights and backpropagates through the full model while storing optimizer state only for low-rank adapters; it can merge one adapter or route several. QLoRA keeps that adapter training pattern but stores the frozen base in calibrated low-bit form, reducing weight memory while adding dequantization, kernel, and quantization-error constraints. All three still pay activation and backward compute through the base network.",
    workedExample: "Decision table for a 7B model on one 24GB GPU: full tuning updates 7B parameters and does not fit with ordinary optimizer state; LoRA rank 16 updates about 20M adapter parameters but bf16 base+activations peak at 22GB and fits; QLoRA rank 16 updates the same adapters, stores the base at 4-bit, peaks at 14GB, but loses 1.2 points on a rare-language slice in this teaching fixture. If the gate allows at most 0.5-point loss, choose LoRA; if memory cap were 16GB, neither full tuning nor this LoRA fits and QLoRA needs a quality repair or different base.",
    check: {
      expected: "Full tuning: all base parameters and optimizer state, highest capacity, no adapter routing, largest memory. LoRA: frozen higher-precision base, low-rank trainable/optimizer state, full activation/backward path, merge or route adapters. QLoRA: same adapter state with low-bit frozen-base storage, dequantization/kernel and quantization-error risk, full activation/backward path. Under the fixture’s 24GB and ≤0.5-point quality-loss gates, choose LoRA at 22GB; QLoRA’s -1.2 fails quality and full tuning does not fit.",
      retry: "Compare the three methods row by row: trainable weights, optimizer state, base storage, activations/backward, numerical risk, capacity, deployment, measured memory, measured quality. Apply the hardware and quality gates last.",
    },
  },
  "moe#1": {
    workedExample: "For one token state, router logits for experts E1,E2,E3 are [2,1,0]. Softmax gives about [0.665,0.245,0.090]; top-2 selects E1 and E2 and renormalizes their weights to about [0.731,0.269]. Suppose E1 returns [2,0] and E2 returns [0,4]. The routed update is 0.731[2,0]+0.269[0,4]=[1.462,1.076]. Adding it to residual [1,1] produces [2.462,2.076].",
    check: {
      expected: "Softmax([2,1,0])≈[0.665,0.245,0.090]. Select E1,E2; renormalize to [0.731,0.269]. Weight outputs: 0.731[2,0]+0.269[0,4]=[1.462,1.076]. Add residual [1,1] to obtain [2.462,2.076]. E3 is not executed for this top-2 token.",
      retry: "Compute router probabilities, cross out unselected experts, renormalize selected weights, multiply each expert vector, sum coordinatewise, then add the incoming residual last.",
    },
  },
  "multimodal-models#2": {
    workedExample: "Represent the same 196 image features three ways. Projection design maps each feature to width d and inserts 196 visual tokens beside text, so decoder self-attention sees one longer sequence. Cross-attention keeps 196 visual features in separate memory; text queries read them through dedicated cross-attention, avoiding visual tokens in every self-attention layer but adding a separate module. Unified-token design discretizes or embeds image and text tokens in one shared stream with common attention, simplifying one interface but increasing sequence competition and requiring careful modality/position labels.",
  },
  "interpretability-editing#1": {
    workedExample: "One sentiment case: input ‘The service was painfully slow’ yields a negative label—behavioral evidence. Attribution highlights ‘painfully slow’ as associated with that output—importance evidence, not causation. A layer-8 linear probe predicts sentiment on held-out activations with 99% accuracy—decodability evidence. Zeroing or patching the nominated activation direction then changes the negative-vs-positive logit gap on matched controls—causal evidence if the intervention is specific and reproducible.",
  },
  "interpretability-editing#3": {
    workedExample: "Edit-evaluation fixture for changing ‘Project Atlas launch year’ to 2025: exact target prompts 20/20 correct after edit; paraphrases 17/20; neighboring Atlas budget facts fall from 18/20 to 13/20; 100 unrelated controls fall from 94% to 92%; adversarial phrasing succeeds 6/10; rollback restores all pre-edit scores. The edit has target efficacy but weak generalization and unacceptable locality. A versioned retrieval record could update the changing date without altering neighboring weights and is preferable here.",
  },
};

function requireContent(value: string | undefined, context: string): string {
  if (!value?.trim()) throw new Error(`Missing objective-coverage content at ${context}`);
  return value;
}

function readContent(guide: LessonGuide, pointer: ContentPointer, context: string): string {
  switch (pointer.kind) {
    case "literal": return requireContent(pointer.text, `${context}.literal`);
    case "paragraph": return requireContent(guide.sections[pointer.section]?.paragraphs[pointer.paragraph], `${context}.sections[${pointer.section}].paragraphs[${pointer.paragraph}]`);
    case "walkthrough": return requireContent(guide.walkthrough[pointer.index]?.body, `${context}.walkthrough[${pointer.index}].body`);
    case "checkpoint": return requireContent(guide.walkthrough[pointer.index]?.checkpoint, `${context}.walkthrough[${pointer.index}].checkpoint`);
    case "example-setup": return requireContent(guide.guidedExample.setup, `${context}.guidedExample.setup`);
    case "example-step": return requireContent(guide.guidedExample.steps[pointer.index], `${context}.guidedExample.steps[${pointer.index}]`);
    case "example-result": return requireContent(guide.guidedExample.result, `${context}.guidedExample.result`);
    case "practice-answer": return requireContent(guide.practice.answer, `${context}.practice.answer`);
  }
}

function joinContent(guide: LessonGuide, pointers: ContentPointer[], context: string): string {
  if (pointers.length === 0) throw new Error(`Objective-coverage field has no sources at ${context}`);
  return pointers.map((pointer, index) => readContent(guide, pointer, `${context}.sources[${index}]`)).join(" ");
}

export const lessonObjectiveCoverage: Record<string, ObjectiveCoverage[]> = Object.fromEntries(
  Object.entries(coveragePlans).map(([lessonId, plans]) => {
    const guide = lessonGuides[lessonId];
    if (!guide) throw new Error(`Objective coverage references unknown lesson: ${lessonId}`);
    if (plans.length !== guide.objectives.length) throw new Error(`${lessonId} has ${guide.objectives.length} objectives but ${plans.length} coverage records`);
    const coveredIndices = plans.map((item) => item.objectiveIndex).sort((a, b) => a - b);
    if (!coveredIndices.every((index, position) => index === position)) throw new Error(`${lessonId} coverage must name every objective index exactly once`);
    return [lessonId, plans.map((item): ObjectiveCoverage => {
      const context = `${lessonId}.objective[${item.objectiveIndex}]`;
      const remediationKey = `${lessonId}#${item.objectiveIndex + 1}`;
      const remediation = objectiveCoverageRemediations[remediationKey];
      const base: ObjectiveCoverage = {
        objective: requireContent(guide.objectives[item.objectiveIndex], `${context}.objective`),
        explanation: requireContent(item.explanation, `${context}.explanation`),
        mechanism: joinContent(guide, item.mechanism, `${context}.mechanism`),
        workedExample: joinContent(guide, item.workedExample, `${context}.workedExample`),
        boundary: joinContent(guide, item.boundary, `${context}.boundary`),
        check: {
          prompt: requireContent(item.checkPrompt, `${context}.check.prompt`),
          expected: joinContent(guide, item.expected, `${context}.check.expected`),
          retry: `Return to the mechanism and locate the first omitted causal step: ${joinContent(guide, item.retry, `${context}.check.retry`)}`,
        },
      };
      if (!remediation) return base;
      return {
        ...base,
        mechanism: remediation.mechanism ? requireContent(remediation.mechanism, `${context}.remediation.mechanism`) : base.mechanism,
        workedExample: remediation.workedExample ? requireContent(remediation.workedExample, `${context}.remediation.workedExample`) : base.workedExample,
        check: {
          prompt: remediation.check?.prompt ? requireContent(remediation.check.prompt, `${context}.remediation.check.prompt`) : base.check.prompt,
          expected: remediation.check?.expected ? requireContent(remediation.check.expected, `${context}.remediation.check.expected`) : base.check.expected,
          retry: remediation.check?.retry ? requireContent(remediation.check.retry, `${context}.remediation.check.retry`) : base.check.retry,
        },
      };
    })];
  }),
);

for (const remediationKey of Object.keys(objectiveCoverageRemediations)) {
  const [lessonId, objectiveNumberText] = remediationKey.split("#");
  const objectiveNumber = Number(objectiveNumberText);
  if (!lessonGuides[lessonId]) throw new Error(`Objective remediation references unknown lesson: ${remediationKey}`);
  if (!Number.isInteger(objectiveNumber) || objectiveNumber < 1 || objectiveNumber > lessonGuides[lessonId].objectives.length) {
    throw new Error(`Objective remediation references an invalid objective number: ${remediationKey}`);
  }
}
