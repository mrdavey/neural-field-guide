import type { ResourceKind } from "../lesson-guides";

export type GenerativeSource = { title: string; url: string; kind: ResourceKind; note: string };

export const generativeSources = {
  deepLearning: { title: "Deep Learning — Generative Models", url: "https://www.deeplearningbook.org/contents/generative_models.html", kind: "Article", note: "Use the chapter to verify the likelihood, latent-variable, and sampling taxonomy." },
  vae: { title: "Auto-Encoding Variational Bayes", url: "https://arxiv.org/abs/1312.6114", kind: "Paper", note: "Read for the ELBO, reparameterized estimator, and latent-variable assumptions." },
  realNvp: { title: "Density Estimation Using Real NVP", url: "https://arxiv.org/abs/1605.08803", kind: "Paper", note: "Read for invertible coupling layers, exact likelihood, and sampling." },
  ebm: { title: "How to Train Your Energy-Based Models", url: "https://arxiv.org/abs/2101.03288", kind: "Paper", note: "Read for the energy formulation, negative sampling, and failure modes." },
  score: { title: "Generative Modeling by Estimating Gradients of the Data Distribution", url: "https://arxiv.org/abs/1907.05600", kind: "Paper", note: "Read for score matching with multiple noise scales and Langevin sampling." },
  mala: { title: "Nonconvex sampling with the Metropolis-adjusted Langevin algorithm", url: "https://arxiv.org/abs/1902.08452", kind: "Paper", note: "Read for the MALA proposal, Metropolis acceptance behavior, regularity assumptions, and convergence analysis." },
  ddpm: { title: "Denoising Diffusion Probabilistic Models", url: "https://arxiv.org/abs/2006.11239", kind: "Paper", note: "Read for the forward process, variational objective, noise prediction, and reverse sampler." },
  ddim: { title: "Denoising Diffusion Implicit Models", url: "https://arxiv.org/abs/2010.02502", kind: "Paper", note: "Read for non-Markovian sampling paths and speed/trajectory trade-offs." },
  cfg: { title: "Classifier-Free Diffusion Guidance", url: "https://arxiv.org/abs/2207.12598", kind: "Paper", note: "Read for jointly trained conditional/unconditional scores and guidance." },
  precisionRecall: { title: "Assessing Generative Models via Precision and Recall", url: "https://arxiv.org/abs/1806.00035", kind: "Paper", note: "Read for separating fidelity-like precision from coverage-like recall." },
  privacy: { title: "Extracting Training Data from Diffusion Models", url: "https://arxiv.org/abs/2301.13188", kind: "Paper", note: "Read for the attack design, evidence threshold, and limits of memorization claims." },
  reproducibility: { title: "ML Reproducibility Checklist", url: "https://www.cs.mcgill.ca/~jpineau/ReproducibilityChecklist.pdf", kind: "Documentation", note: "Use the checklist to specify code, data, hyperparameters, compute, and evaluation evidence." },
  pytorch: { title: "PyTorch reproducibility notes", url: "https://pytorch.org/docs/stable/notes/randomness.html", kind: "Documentation", note: "Use the current official notes to bound seed and deterministic-algorithm claims." },
} satisfies Record<string, GenerativeSource>;
