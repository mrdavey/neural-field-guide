type HandoffLesson = {
  id: string;
  keyIdeas: string[];
};

const authoredResults: Record<string, string> = {
  "llm:introduction": "An LLM turns a prompt into a response one piece at a time; opening that process next requires a numerical representation for every current text position.",
  "llm:tensors-shapes": "An LLM projects hidden states $X[B,T,d]$ through an output weight $W[d,V]$ to raw vocabulary scores $[B,T,V]$, called logits; the next lesson normalizes the final $V$ axis into next-piece probabilities at every prompt-position.",
  "llm:optimizers": "A gradient becomes a parameter update only through an optimizer rule, its state, and the learning-rate schedule.",
  "llm:gpt2-from-scratch": "The assembled decoder maps position IDs through hidden states to next-token scores; pre-training is the repeated process that turns those randomly initialized transformations into a base model.",
  "llm:layers-of-understanding": "Each block preserves the residual width while attention and MLP updates accumulate in the shared stream.",
  "llm:data-engineering": "Filtering, deduplication, mixing, and provenance define both the learning distribution and the workload that infrastructure must serve.",
  "llm:infrastructure": "Memory, communication, parallelism, and restart constraints determine which training objectives are feasible at scale.",
  "llm:advanced-objectives": "An objective decides which prediction errors become learning signals; held-out evaluation must test the intended gain and possible regressions.",
  "llm:olmo3-case-study": "A complete pre-training recipe produces an auditable base model that can continue text, but it has not yet been shaped into a dependable assistant policy.",
  "llm:preference-optimization": "Preference optimization changes the chosen-versus-rejected gap relative to a fixed reference, so the beta convention and drift boundary must stay explicit.",
  "llm:tulu3-case-study": "Post-training shapes an assistant policy and its evaluation contract, but runtime decoding still decides which next-token scores become the visible response.",
  "llm:test-time-compute": "Inference-time compute changes how much search, sampling, or verification a model can perform; the next system decision is which instructions and evidence enter that computation as context.",
  "llm:observability-governance": "A governed trace links quality, latency, cost, risk, and decision ownership for the system users actually experience.",
  "rl:covariate-shift-dagger": "Keep the executed action separate from the expert label, and preserve learner-visited coverage plus query provenance by iteration.",
  "rl:safe-constrained-rl": "Separate reward, cost, and non-compensable action permissions before comparing feasible policies.",
};

export function lessonNarrativeResult(courseId: string, lesson: HandoffLesson) {
  return authoredResults[`${courseId}:${lesson.id}`]
    ?? lesson.keyIdeas.at(-1)
    ?? lesson.keyIdeas[0]
    ?? "Carry the chapter's mechanism and evidence boundary forward.";
}
