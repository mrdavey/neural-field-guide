import type { Lesson } from "./course-data";
import { conceptFirstOperationTraceFor, hasConceptFirstOperationTrace } from "./concept-first-operation-traces";
import type { LessonGuide, ObjectiveCoverage } from "./lesson-guides";

const formalObjectiveOpening = /^(?:calculate|compute|derive|apply the chain rule|predict the output of a matrix multiplication|turn a gradient into an explicit parameter update|compose and invert rigid transforms|execute one CEM sample)\b/i;
const formalMaterial = /(?:^|[^$])\$(?!\d)|\\(?:frac|sqrt|sum|log|exp|nabla|partial|operatorname|mathbb|mathcal|begin)\b|\b(?:calculate|compute|derive|differentiate|matrix multiplication|tensor shape|dot product|chain rule|jacobian|determinant|bellman equation|coordinate transform)\b|[A-Za-z][A-Za-z0-9_]*\s*=\s*(?:[-+]?\d|[A-Za-z][A-Za-z0-9_]*(?:\s*[+*/^×−-]))|[≈±]|\d\s*[+*/×]\s*\d/i;
const formalParagraphSyntax = /(?:^|[^$])\$(?!\d)|\\(?:frac|sqrt|sum|log|exp|nabla|partial|operatorname|mathbb|mathcal|begin)\b|\b(?:calculate|calculation|arithmetic|derive|differentiation|matrix multiplication|tensor shape|dot product|chain rule|jacobian|determinant|bellman equation|coordinate transform)\b|=|[≈±]|\d\s*[+*/×]\s*\d/i;
const orphanedWorkedCaseLanguage = /\b(?:read the example as a chain|calculation establishes|source of each number|the following comparison makes the rule concrete|recompute candidate|under the same values|these are not three separate tips)\b/i;

/**
 * Formal objectives remain taught, but they live in optional technical depth.
 * Core mastery asks learners to explain, trace, diagnose, compare, or decide.
 */
export function isFormalTechnicalObjective(objective: string) {
  return formalObjectiveOpening.test(objective.trim()) || /\bnumerically\b/i.test(objective);
}

export function hasDeferredTechnicalMaterial(lesson: Lesson, items: readonly ObjectiveCoverage[], additionalMaterial?: unknown) {
  const authoredMaterial = JSON.stringify([lesson, items, additionalMaterial]);
  return items.some((item) => isFormalTechnicalObjective(item.objective))
    || formalMaterial.test(authoredMaterial);
}

export function containsFormalParagraphMaterial(value: string) {
  const numericValues = value.match(/(?<![A-Za-z])[-+]?\d+(?:\.\d+)?/g) ?? [];
  return formalParagraphSyntax.test(value)
    || orphanedWorkedCaseLanguage.test(value)
    || numericValues.length >= 2;
}

export function conceptFirstBridgeFor(bridge: string, prior: Lesson, current: Lesson) {
  if (!containsFormalParagraphMaterial(bridge)) return bridge;
  return `The previous chapter established this result: ${sentence(conceptFirstPlainText(prior.simple))} This chapter reuses it to answer a new question: ${sentence(conceptFirstPlainText(current.simple))} Follow the information entering the new operation, the change it makes, and the result before opening the optional notation.`;
}

export function conceptFirstPlainText(value: string) {
  return value
    .replace(/\ban?\s+unobserved cause\s+\$z\$/gi, "an unobserved latent cause")
    .replace(/\bposterior\s+\$p[^$]*\$/gi, "posterior distribution")
    .replace(/\bapproximation\s+\$q[^$]*\$/gi, "learned approximation")
    .replace(/\b(?:time|step)\s+\$t\s*\+\s*1\$/gi, "the next time step")
    .replace(/\b(?:time|step)\s+\$t\$/gi, "the current time step")
    .replace(/\bindex\s+\$t\$/gi, "the current index")
    .replace(/\bw\s*=\s*1\b/gi, "a guidance scale of one")
    .replace(/\$\$[\s\S]*?\$\$/g, "the formal relationship")
    .replace(/\$([^$]+)\$/g, (_, notation: string) => notationLabel(notation))
    .replace(/`([^`]+)`/g, (_, code: string) => /[=()[\]{}<>/*+^]|--/.test(code) ? "the named implementation detail" : code)
    .replace(/\bmatrix multiplication\b/gi, (match) => /^[A-Z]/.test(match) ? "A learned transformation" : "the learned transformation")
    .replace(/\btensor arithmetic does\b/gi, "Representation operations do")
    .replace(/\btensor arithmetic\b/gi, "representation operations")
    .replace(/\btensor shapes?\b/gi, "representation layouts")
    .replace(/\bdot products?\b/gi, "alignment comparisons")
    .replace(/\bsum of elementwise products\b/gi, "comparison that combines matching feature entries")
    .replace(/\bchain rule\b/gi, "backward credit path")
    .replace(/\bmake inverse and jacobian determinant tractable\b/gi, "make the inverse and local volume correction tractable")
    .replace(/\btriangular jacobian\b/gi, "triangular local structure with a cheap volume correction")
    .replace(/\bjacobian determinants\b/gi, "local volume corrections")
    .replace(/\bjacobian determinant\b/gi, "local volume correction")
    .replace(/\bjacobian corrections\b/gi, "local volume corrections")
    .replace(/\bjacobian correction\b/gi, "local volume correction")
    .replace(/\bjacobians?\b/gi, "local change maps")
    .replace(/\babsolute determinant\b/gi, "absolute volume-change factor")
    .replace(/\bdeterminant computation\b/gi, "volume-correction cost")
    .replace(/\bbellman equations?\b/gi, "one-step value consistency rule")
    .replace(/\bcoordinate transforms?\b/gi, "frame conversions")
    .replace(/\bpartial derivatives?\b/gi, "local-change signals")
    .replace(/\b(?:reverse-mode )?differentiation\b/gi, "backward local-change tracking")
    .replace(/\bmultidimensional array of numbers\b/gi, "container that organizes many model values")
    .replace(/\bdata type and shape\b/gi, "storage type and layout")
    .replace(/\bsuperscripts?\s*\/\s*subscripts?\b/gi, "source and destination frame labels")
    .replace(/^compute\b/i, "Trace")
    .replace(/\bcalculate\b/gi, "trace")
    .replace(/\bderiv(?:e|ing)\b/gi, "explain")
    .replace(/\b[A-Za-z][A-Za-z0-9_]*\s*=\s*[^,.;:]+/g, "the named relationship")
    .replace(/\b\d+(?:\.\d+)?\s*[+*/×−-]\s*\d+(?:\.\d+)?(?:\s*=\s*\d+(?:\.\d+)?)?/g, "the worked relationship")
    .replace(/\[(?:\s*-?\d*\.?\d+\s*,){1,}\s*-?\d*\.?\d+\s*\]/g, "the described values")
    .replace(/\b(?:sin|cos|exp|log|sqrt)\s*\([^)]*\)/gi, "the named transformation")
    .replace(/[A-Za-z][A-Za-z0-9_]*\([^)]*\)\s*[+*/^×−-]\s*[A-Za-z0-9_()[\].+*/^×−-]+/g, "the named relationship")
    .replaceAll("\\pi", "policy")
    .replaceAll("\\lambda", "trace horizon")
    .replaceAll("\\gamma", "future weighting")
    .replaceAll("\\theta", "parameters")
    .replaceAll("\\epsilon", "noise")
    .replaceAll("\\mu", "mean")
    .replaceAll("\\sigma", "scale")
    .replace(/\\(?:hat|bar|operatorname|mathrm|text)\s*\{?([^{}]+)\}?/g, "$1")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}^]/g, "")
    .replace(/\b[A-Za-z]+_[A-Za-z0-9]+\b/g, "the named quantity")
    .replace(/\s*[≈±]\s*/g, " approximately ")
    .replace(/\s+/g, " ")
    .trim();
}

function notationLabel(notation: string) {
  const normalized = notation.toLowerCase();
  if (/^z(?:_|\b)/.test(normalized)) return "the latent variable";
  if (/^x(?:_|\b)/.test(normalized)) return "the observed input";
  if (/^q(?:_|\s*\()|\\phi/.test(normalized)) return "the learned approximation";
  if (/^t\s*\+\s*1/.test(normalized)) return "the next step";
  if (/^t(?:_|\b)/.test(normalized)) return "the current step";
  if (/^s(?:_|\b)/.test(normalized)) return "the state";
  if (/^a(?:_|\b)/.test(normalized)) return "the action";
  if (/^r(?:_|\b)/.test(normalized)) return "the reward";
  if (/^h(?:_|\b)/.test(normalized)) return "the hidden state";
  if (/^y(?:_|\b)/.test(normalized)) return "the target";
  if (/\\pi|policy/.test(normalized)) return "the policy";
  if (/\\theta|parameter/.test(normalized)) return "the model parameters";
  if (/\\gamma/.test(normalized)) return "the future-weighting setting";
  if (/\\lambda/.test(normalized)) return "the trace-horizon setting";
  if (/\\mu/.test(normalized)) return "the mean";
  if (/\\sigma/.test(normalized)) return "the scale";
  if (/\\mathbb|\\times|shape|\[[^\]]+\]/.test(normalized)) return "the described structure";
  if (/\bp\s*\(|prob|\\log/.test(normalized)) return "the relevant probability";
  return "that value";
}

export function splitObjectiveCoverage(items: readonly ObjectiveCoverage[]) {
  const core = items.filter((item) => !isFormalTechnicalObjective(item.objective));
  const technical = items.filter((item) => isFormalTechnicalObjective(item.objective));
  if (core.length === 0) throw new Error("Every lesson needs at least one explanation- or decision-led core objective.");
  return { core, technical };
}

function conceptualCoreCoverage(lesson: Lesson): ObjectiveCoverage {
  const ideas = conceptFirstOperationTraceFor(lesson.id, lesson.keyIdeas).map((idea) => sentence(conceptFirstPlainText(idea)));
  const correctAnswer = conceptFirstPlainText(lesson.quiz.options[lesson.quiz.answer]);
  const quizQuestion = conceptFirstPlainText(lesson.quiz.question);
  const quizExplanation = conceptFirstPlainText(lesson.quiz.explanation);
  const boundary = conceptFirstPlainText(lesson.misconception);
  return {
    objective: `Explain the operation behind ${lesson.title} without using a formula`,
    explanation: ideas[0],
    mechanism: `Name the information entering the operation, follow what changes, and identify the resulting representation, prediction, or decision. For this lesson, connect these ideas in order: ${ideas.join(" ")}`,
    workedExample: `Use the lesson's changed case: ${quizQuestion} The operation-level answer is “${correctAnswer}.” ${sentence(quizExplanation)}`,
    boundary,
    check: {
      prompt: `Without calculating, explain ${lesson.title}: what information enters, what operation changes it, what result comes out, and one condition that could make that result misleading.`,
      expected: `A complete explanation connects the operation in this order: ${ideas.join(" ")} For the changed case, ${sentence(quizExplanation)} Preserve this limit: ${sentence(boundary)}`,
      retry: "Use four short labels: input, operation, output, and limit. Fill each label from the walkthrough, then connect them with because—not with an equation.",
    },
  };
}

export function conceptFirstCoverageFor(lesson: Lesson, items: readonly ObjectiveCoverage[], additionalMaterial?: unknown) {
  const split = splitObjectiveCoverage(items);
  if (!hasDeferredTechnicalMaterial(lesson, items, additionalMaterial) && !hasConceptFirstOperationTrace(lesson.id)) return split;
  return { core: [conceptualCoreCoverage(lesson)], technical: [...items] };
}

export function conceptFirstSummaryFor(lesson: Lesson, coverage: readonly ObjectiveCoverage[], additionalMaterial?: unknown) {
  const { core, technical } = conceptFirstCoverageFor(lesson, coverage, additionalMaterial);
  if (technical.length === 0) return lesson.simple;
  const summary = conceptFirstPlainText(lesson.simple);
  return /\b(?:the named|that value)\b/i.test(summary) ? core[0].explanation : summary;
}

function sentence(value: string) {
  const text = value.trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * Lessons with a formal objective receive a deliberately concept-first core
 * guide. Their complete original guide is retained by TechnicalDepthView.
 */
export function conceptFirstGuideFor(
  lesson: Lesson,
  guide: LessonGuide,
  coverage: readonly ObjectiveCoverage[],
): LessonGuide {
  const { core, technical } = conceptFirstCoverageFor(lesson, coverage, guide);
  if (technical.length === 0) return guide;

  const anchor = core[0];
  const operationTrace = conceptFirstOperationTraceFor(lesson.id, lesson.keyIdeas);
  const [authoredOpening, ...authoredChapters] = guide.sections;
  const filteredParagraphs = (paragraphs: readonly string[]) => paragraphs
    .filter((paragraph) => !containsFormalParagraphMaterial(paragraph))
    .map(conceptFirstPlainText)
    .filter((paragraph) => !/\b(?:the named (?:quantity|relationship|implementation detail)|the worked relationship|that value)\b/i.test(paragraph));
  const openingSection = authoredOpening ? {
    title: conceptFirstPlainText(authoredOpening.title),
    paragraphs: filteredParagraphs(authoredOpening.paragraphs).length > 0
      ? filteredParagraphs(authoredOpening.paragraphs)
      : [conceptFirstSummaryFor(lesson, coverage, guide), conceptFirstPlainText(lesson.mentalModel)],
  } : undefined;
  const conceptualSections = authoredChapters.map((section) => ({
    title: conceptFirstPlainText(section.title),
    paragraphs: filteredParagraphs(section.paragraphs),
  })).filter((section) => section.paragraphs.length > 0);
  const fallbackSection = {
    title: `Understand ${lesson.title} as a cause-and-effect process`,
    paragraphs: [conceptFirstPlainText(lesson.simple), conceptFirstPlainText(lesson.mentalModel), ...operationTrace.map(conceptFirstPlainText)],
  };
  const conceptualVocabulary = guide.vocabulary
    .filter((item) => !containsFormalParagraphMaterial(JSON.stringify(item)))
    .slice(0, 4)
    .map((item) => ({ term: conceptFirstPlainText(item.term), meaning: conceptFirstPlainText(item.meaning) }));
  return {
    objectives: core.map((item) => item.objective),
    vocabulary: conceptualVocabulary.length > 0 ? conceptualVocabulary : [{ term: "Operation", meaning: `The cause-and-effect change explained in ${lesson.title}.` }],
    sections: [
      ...(openingSection ? [openingSection, ...conceptualSections] : [fallbackSection, ...conceptualSections]),
      { title: `Use ${lesson.title} in a changed case`, paragraphs: [anchor.workedExample, sentence(anchor.boundary)] },
    ],
    walkthrough: operationTrace.map((idea, index) => ({
      title: operationHeading(idea, index),
      body: conceptFirstPlainText(idea),
      checkpoint: index === 0 ? anchor.check.prompt : index === operationTrace.length - 1 ? anchor.boundary : anchor.check.retry,
    })),
    guidedExample: {
      title: `Follow ${lesson.title} without calculating it`,
      setup: anchor.workedExample,
      steps: operationTrace.map((idea) => sentence(conceptFirstPlainText(idea))),
      result: `${sentence(anchor.explanation)} ${sentence(anchor.boundary)}`,
    },
    practice: {
      prompt: anchor.check.prompt,
      hint: anchor.check.retry,
      answer: anchor.check.expected,
    },
    resources: [...guide.resources],
  };
}

function operationHeading(idea: string, index: number) {
  const prefix = ["Input", "Operation", "Result", "Limit"][index] ?? `Step ${index + 1}`;
  const plain = conceptFirstPlainText(idea).replace(/[.!?]+$/, "");
  return `${prefix} · ${plain.length > 68 ? `${plain.slice(0, 65).trimEnd()}…` : plain}`;
}
