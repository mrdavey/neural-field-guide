import { ActivityInfo, LearningActivityContract, PredictionGate } from "../activity-info";
import { MathText } from "../math-text";
import { publicPath } from "../public-path";

type WorldModelValidation = {
  title: string;
  evidence: string;
  contract: string;
  trace: [string, string, string];
  expected: string;
  boundary: string;
};

export const worldModelTechnicalValidations: Record<string, WorldModelValidation> = {
  "belief-states-filtering": { title: "Recompute the filtering dossier", evidence: "belief-states-filtering", contract: "Two hidden states; declared transition and likelihood tables; transition-before-observation timing; all posterior mass must sum to one.", trace: ["Read the prior and action-conditioned transition row.", "Multiply predicted mass by the recorded observation likelihood.", "Normalize and compare every posterior value with the JSON row."], expected: "The contradiction at step two reduces belief in A without forcing it to zero, so later evidence can recover the correct state.", boundary: "This is exact arithmetic over a deterministic fixture, not a learned filter or environmental measurement." },
  "rssm-planet-case-study": { title: "Audit prior–posterior information flow", evidence: "rssm-planet-case-study", contract: "The prior receives memory and action only; the posterior may additionally receive the current observation; imagination uses the prior path.", trace: ["List the input dependency of each state update.", "Compare prior and posterior means on the contradictory observation.", "Inject the supplied leakage failure and confirm the dependency check rejects it."], expected: "Posterior error falls after observation while the leaked prior is invalid even if its numeric error looks better.", boundary: "The scalar trace validates information boundaries; it does not reproduce PlaNet training or benchmark performance." },
  "uncertainty-ensembles": { title: "Find the confident shared-bias miss", evidence: "uncertainty-ensembles", contract: "Three fixed model predictions per case; disagreement computed without reading the target; random baseline rejects the same number of cases.", trace: ["Recompute spread for in-support and disagreement rows.", "Apply the fixed threshold before seeing reference outcomes.", "Inspect the shared-bias row and identify the missing support signal."], expected: "The gate catches the wide ensemble but misses an agreed wrong prediction, falsifying disagreement-as-safety-certificate.", boundary: "Spread is not calibrated as a failure probability and ensemble members are hand-authored." },
  "dyna-tdmpc-case-study": { title: "Match the planner's expensive unit", evidence: "dyna-tdmpc-case-study", contract: "Both planners receive exactly 96 model transitions; reward timing, horizon, and terminal value application are explicit.", trace: ["Multiply candidates by horizon for both rows.", "Recompute the delayed return and the single terminal-value bootstrap.", "Bias the value toward the wrong branch and preserve the resulting reversal."], expected: "The short planner plus value finds delayed reward in the base fixture, but its advantage reverses when the terminal estimate is biased.", boundary: "The branch table tests budgeting and backup logic, not TD-MPC quality on an external environment." },
  "foundation-world-models-case-study": { title: "Verify an evidence-separated contract table", evidence: "foundation-world-models-case-study", contract: "Every system row names observations, action interface, target, decision use, evidence type, and unknown cells without imputation.", trace: ["Choose one task and mark its required interface columns.", "Eliminate rows lacking demonstrated required inputs or actions.", "Change the task and recompute rather than reusing the first ranking."], expected: "Interactive generation and image-goal robot planning produce different conditional selections; no universal ranking survives the task change.", boundary: "The table summarizes linked primary/official evidence and does not normalize compute or reproduce any system." },
  "world-model-operations-case-study": { title: "Rehearse compatibility and deadline rollback", evidence: "world-model-operations-case-study", contract: "A release is an immutable model/schema/planner/safeguard bundle; shadow proposals lack actuator authority; p99 must remain under 50 ms.", trace: ["Reject the width-incompatible bundle before proposal evaluation.", "Advance the compatible candidate into bounded authority.", "Trigger the recorded deadline regression and restore the complete known-good bundle."], expected: "Compatibility catches the first release; the deadline gate catches the second and rollback restores wm-16 rather than mixing components.", boundary: "The dossier validates release-state logic, not a production runtime or safety case." },
};

export function WorldModelTechnicalValidation({ lessonId }: { lessonId: string }) {
  const validation = worldModelTechnicalValidations[lessonId];
  if (!validation) return null;
  const artifactUrl = publicPath(`/capstone-artifacts/worldmodel/${validation.evidence}.json`);
  return <section className="technical-validation world-model-validation" aria-labelledby={`${lessonId}-wm-validation`}>
    <header><div><span className="eyebrow">Authentic validation · preserved local evidence</span><h2 id={`${lessonId}-wm-validation`}><MathText>{validation.title}</MathText></h2></div><ActivityInfo mode="inspect" /></header>
    <div className="validation-brief"><article><span>Contract</span><p><MathText>{validation.contract}</MathText></p></article><article><span>Evidence source</span><p>Reviewed deterministic JSON fixture generated for this course. It requires no account, model API, or external execution.</p></article></div>
    <LearningActivityContract
      question="Will the preserved fixture satisfy this contract, and which recomputation would expose the first invalid assumption?"
      action="Read the contract, predict the decisive row or comparison, then commit that prediction before the audit trace appears."
      observe="Recompute the named values from the JSON dossier and compare them with the reviewed expected observation."
      explain="Identify which result follows from exact fixture arithmetic and which broader claim remains unsupported."
      complete="Check all three trace steps, locate one possible failure, and restate the claim boundary in your own words."
      boundary={<MathText>{validation.boundary}</MathText>}
    />
    <PredictionGate prompt="Predict whether the contract passes, name the decisive trace step, and explain what result would make you reject the intended conclusion." title="Commit an audit prediction" commitLabel="Commit prediction and reveal audit trace">
      <ol>{validation.trace.map((step, index) => <li key={step}><span>{index + 1}</span><p><MathText>{step}</MathText></p></li>)}</ol>
      <div className="validation-result"><article><span>Expected observation</span><p><MathText>{validation.expected}</MathText></p></article><aside><span>Claim boundary</span><p><MathText>{validation.boundary}</MathText></p></aside></div>
      <a className="validation-artifact-link" href={artifactUrl} target="_blank" rel="noreferrer">Inspect the preserved machine-readable dossier <span>↗</span></a>
    </PredictionGate>
  </section>;
}

export default WorldModelTechnicalValidation;
