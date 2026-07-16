"use client";

import { ActivityInfo, LearningActivityContract, PredictionGate } from "./activity-info";
import type { ExternalExperimentContract } from "./external-experiments";
import { publicPath } from "./public-path";

function Command({ label, value }: { label: string; value: string }) {
  return <div className="external-command">
    <span>{label}</span>
    <pre tabIndex={0}><code>{value}</code></pre>
  </div>;
}

export function ExternalExperimentView({ contract }: { contract: ExternalExperimentContract }) {
  const colab = contract.providers.find((provider) => provider.id === "colab")!;

  return <section className="external-experiment" aria-labelledby={`external-${contract.id}`}>
    <header>
      <div>
        <span className="eyebrow">Extend · optional authentic execution</span>
        <h2 id={`external-${contract.id}`}>{contract.title}</h2>
      </div>
      <ActivityInfo
        mode="external"
        title="An optional measured run outside this page"
        detail="The commands below execute the pinned repository runner. The browser lesson remains complete without them, and no learned numeric result is promised in advance."
        requirements={`${contract.hardware.minimum} ${contract.hardware.memory}`}
      />
    </header>

    <p className="external-objective">{contract.objective}</p>
    <LearningActivityContract
      question="Does changing the declared treatment alter the measured outcome when initialization, data or episodes, seeds, and exposure budgets remain paired?"
      action="Record the environment, run smoke unchanged, verify every exact invariant, then run every full seed without selecting favorable rows."
      observe="Inspect seed-level rows, failures, timing, and the declared variable observations—not just a summary average."
      explain="Separate deterministic implementation checks from stochastic measurements and name any confound before making a comparison."
      complete={`The JSON at ${contract.output.path} contains every required field and seed row, all exact invariants pass, and your conclusion matches the preserved evidence.`}
      boundary={contract.boundary}
    />

    <PredictionGate
      title="Predict before using accelerator time"
      prompt="State which fields must match exactly across the two arms and name at least one result that could legitimately be positive, null, mixed, or reversed."
      commitLabel="Commit prediction and reveal runbook"
      reviseLabel="Revise prediction and hide runbook"
    >
      <div className="external-runbook">
        <section>
          <span className="external-step">01 · Prepare</span>
          <h3>Install the pinned environment.</h3>
          <p>{colab.setup.join(" ")}</p>
          <Command label="Install" value={contract.commands.install} />
        </section>

        <section>
          <span className="external-step">02 · Smoke</span>
          <h3>Prove the runner is wired correctly.</h3>
          <p>{contract.budgets.smoke}. Smoke observations are not model-quality evidence.</p>
          <Command label="Bounded smoke command" value={contract.commands.smoke} />
        </section>

        <section>
          <span className="external-step">03 · Verify</span>
          <h3>Check exact results before spending the full budget.</h3>
          <ul>{contract.expected.invariants.map((invariant) => <li key={invariant}>{invariant}</li>)}</ul>
        </section>

        <section>
          <span className="external-step">04 · Full</span>
          <h3>Run every declared seed unchanged.</h3>
          <p>{contract.budgets.full}.</p>
          <Command label="Full accelerator command" value={contract.commands.full} />
          <p className="external-stop"><strong>Stop rule:</strong> {contract.budgets.stop}.</p>
        </section>

        <section>
          <span className="external-step">05 · Interpret</span>
          <h3>Preserve outcomes before choosing a story.</h3>
          <ul>{contract.expected.observations.map((observation) => <li key={observation}>{observation}</li>)}</ul>
        </section>

        <section>
          <span className="external-step">06 · Complete</span>
          <h3>Audit the authentic artifact.</h3>
          <p>Open <code>{contract.output.path}</code>. Confirm schema <code>{contract.output.schemaVersion}</code>, all seeds ({contract.seeds.join(", ")}), all invariant values, and these top-level fields:</p>
          <p className="external-fields">{contract.output.requiredFields.join(" · ")}</p>
          <p>A missing row, false invariant, non-finite value, unequal paired budget, or mismatched identity hash means the comparison is invalid—not negative.</p>
          {contract.runbook ? <a className="external-runbook-link" href={publicPath(contract.runbook.publicUrl)} download>{contract.runbook.label} <span aria-hidden="true">↓</span></a> : null}
        </section>
      </div>
    </PredictionGate>
  </section>;
}
