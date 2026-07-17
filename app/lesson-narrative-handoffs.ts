type HandoffLesson = {
  id: string;
  keyIdeas: string[];
};

const authoredResults: Record<string, string> = {
  "llm:optimizers": "A gradient becomes a parameter update only through an optimizer rule, its state, and the learning-rate schedule.",
  "llm:layers-of-understanding": "Each block preserves the residual width while attention and MLP updates accumulate in the shared stream.",
  "llm:data-engineering": "Filtering, deduplication, mixing, and provenance define both the learning distribution and the workload that infrastructure must serve.",
  "llm:infrastructure": "Memory, communication, parallelism, and restart constraints determine which training objectives are feasible at scale.",
  "llm:advanced-objectives": "An objective decides which prediction errors become learning signals; held-out evaluation must test the intended gain and possible regressions.",
  "llm:preference-optimization": "Preference optimization changes the chosen-versus-rejected gap relative to a fixed reference, so the beta convention and drift boundary must stay explicit.",
  "llm:tulu3-case-study": "The supervision signal and evaluator must match the answer space, from exact verification to open-ended research rubrics.",
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
