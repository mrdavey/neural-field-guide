import { publicPath } from "./public-path";

export type ValidationArtifactFile = {
  label: string;
  url: string;
  evidenceTier: string;
  contents: string[];
};

export const validationArtifactFiles: Record<string, ValidationArtifactFile> = {
  tokenization: {
    label: "Tokenizer contract reproduction dossier · JSON",
    url: publicPath("validation-artifacts/tokenizer-contract-result.json"),
    evidenceTier: "Pinned schema + explicit execution boundary",
    contents: ["five risk cases", "ten-row output contract", "decision gate", "no guessed IDs"],
  },
  "embedding-layer": {
    label: "Hidden-state identity probe · JSON",
    url: publicPath("validation-artifacts/embedding-hidden-state-result.json"),
    evidenceTier: "Corrected executable probe contract",
    contents: ["padding repair", "attention mask", "exact position rule", "measurement boundary"],
  },
  "pretraining-overview": {
    label: "Distributed token-accounting result · JSON",
    url: publicPath("validation-artifacts/pretraining-token-accounting-result.json"),
    evidenceTier: "Executed deterministic fixture",
    contents: ["raw per-rank rows", "ordinary and partial batches", "reduced totals", "scope boundary"],
  },
  "advanced-objectives": {
    label: "Causal/FIM ablation result · JSON",
    url: publicPath("validation-artifacts/fim-causal-ablation-result.json"),
    evidenceTier: "Executed serialization checks + labeled simulated metrics",
    contents: ["serialized records", "equal-token manifest", "paired metrics", "uncertainty and regression gate"],
  },
  "instruction-tuning-rlhf": {
    label: "Tülu stage/runtime ledger · JSON",
    url: publicPath("validation-artifacts/tulu-stage-runtime-ledger.json"),
    evidenceTier: "Filled primary-release evidence ledger",
    contents: ["exact checkpoint IDs", "signals and learned artifacts", "reported deltas", "runtime boundary"],
  },
  "posttraining-overview": {
    label: "Tülu matched-result ledger · JSON",
    url: publicPath("validation-artifacts/tulu-posttraining-result-ledger.json"),
    evidenceTier: "Completed matched-column release audit",
    contents: ["stage metrics", "cost evidence", "regressions", "keep/rollback decisions"],
  },
};
