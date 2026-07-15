export type ResourceKind = "Article" | "Course" | "Documentation" | "Model card" | "Paper" | "Video";

export type ObjectiveCoverage = {
  objective: string;
  explanation: string;
  mechanism: string;
  workedExample: string;
  boundary: string;
  check: {
    prompt: string;
    expected: string;
    retry: string;
  };
};

export type LessonGuide = {
  objectives: string[];
  vocabulary: { term: string; meaning: string }[];
  sections: { title: string; paragraphs: string[] }[];
  walkthrough: { title: string; body: string; checkpoint: string }[];
  guidedExample: { title: string; setup: string; steps: string[]; result: string };
  practice: { prompt: string; hint: string; answer: string };
  resources: { title: string; url: string; kind: ResourceKind; note: string }[];
};
