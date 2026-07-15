# Independent World Models objective-coverage grade

Reviewed: 14 July 2026  
Scope: all 46 World Models lessons and all 92 exact learner-visible outcomes

## Gate result

The independent semantic gate is closed: **92 PASS, 0 PARTIAL, and 0 FAIL**.

- Beginner explanation: **92/92 pass**
- Causal mechanism or evidence-driven decision process: **92/92 pass**
- Concrete worked value, shape, trace, or scenario: **92/92 pass**
- Boundary, failure case, or misconception: **92/92 pass**
- Commit-before-reveal check with expected reasoning and specific retry: **92/92 pass**

The review used the rendered teaching contract rather than field length. For every exact objective it checked that a learner could understand the promise, follow named inputs through a mechanism to outputs, inspect a concrete case, locate the claim boundary, and commit an answer before seeing reasoning and a relevant retry route.

## Review history

| Pass | PASS | PARTIAL | FAIL | Result |
|---|---:|---:|---:|---|
| Initial independent grade | 65 | 27 | 0 | Gate open |
| Full regrade after authored remediation | 88 | 4 | 0 | Gate open |
| Residual re-read after two concurrent repairs | 90 | 2 | 0 | Gate open |
| Focused final grade on current generated records | 92 | 0 | 0 | Gate closed |

The final prerequisite audit also passed: identifiability, $PA_i/U$, positivity, and rotation equivariance are introduced locally before use. Expected reasoning and retry content remain hidden until the learner commits a meaningful response.

## Complete row inventory

Legend: E = explanation, M = mechanism, W = worked evidence, B = boundary, C = committed check/retry.

| Lesson | # | Exact objective | E | M | W | B | C | Overall |
|---|---:|---|:---:|:---:|:---:|:---:|:---:|---|
| `world-models` | 1 | Trace the state-action-consequence contract of a world model | P | P | P | P | P | PASS |
| `world-models` | 2 | Distinguish a decision-useful world model from an uncontrolled sequence generator | P | P | P | P | P | PASS |
| `dynamics-tensors` | 1 | Trace trajectory tensor shapes through one latent transition | P | P | P | P | P | PASS |
| `dynamics-tensors` | 2 | Detect a time-alignment bug that valid tensor shapes cannot reveal | P | P | P | P | P | PASS |
| `stochastic-futures` | 1 | Represent multiple possible next states with a probability distribution | P | P | P | P | P | PASS |
| `stochastic-futures` | 2 | Choose between expected-value and risk-sensitive decisions under uncertainty | P | P | P | P | P | PASS |
| `learning-dynamics` | 1 | Trace one forward, backward, and update step for a transition model | P | P | P | P | P | PASS |
| `learning-dynamics` | 2 | Diagnose why lower one-step loss can coexist with worse imagined control | P | P | P | P | P | PASS |
| `sequential-state` | 1 | Trace the observation-state-action timing of one trajectory | P | P | P | P | P | PASS |
| `sequential-state` | 2 | Test whether a proposed state is sufficient for predicting a changed future | P | P | P | P | P | PASS |
| `rewards-returns-policies` | 1 | Calculate a discounted return and relate it to policy value | P | P | P | P | P | PASS |
| `rewards-returns-policies` | 2 | Separate reward optimization from hard constraints and outcome evaluation | P | P | P | P | P | PASS |
| `mdps-bellman` | 1 | Compute a Bellman backup using a transition distribution | P | P | P | P | P | PASS |
| `mdps-bellman` | 2 | Identify how transition error changes a backed-up action value | P | P | P | P | P | PASS |
| `belief-states-filtering` | 1 | Calculate a discrete belief update from a prior and observation likelihood | P | P | P | P | P | PASS |
| `belief-states-filtering` | 2 | Use a belief-state audit to detect hidden-state aliasing before planning | P | P | P | P | P | PASS |
| `sensor-representations` | 1 | Trace sensor observations through an encoder into a predictive feature state | P | P | P | P | P | PASS |
| `sensor-representations` | 2 | Audit a feature bottleneck for nuisance invariance and hazard sensitivity | P | P | P | P | P | PASS |
| `autoencoders-latents` | 1 | Trace an autoencoder bottleneck and reconstruction loss | P | P | P | P | P | PASS |
| `autoencoders-latents` | 2 | Decide when a lower reconstruction loss still fails the control task | P | P | P | P | P | PASS |
| `stochastic-latents-vaes` | 1 | Trace posterior sampling and the two VAE loss terms | P | P | P | P | P | PASS |
| `stochastic-latents-vaes` | 2 | Diagnose posterior collapse and an uninformative prior | P | P | P | P | P | PASS |
| `action-conditioned-transitions` | 1 | Trace action injection through a latent transition | P | P | P | P | P | PASS |
| `action-conditioned-transitions` | 2 | Test whether a transition uses actions rather than policy correlations | P | P | P | P | P | PASS |
| `recurrent-state-space` | 1 | Trace prior and posterior state updates through observation and imagination | P | P | P | P | P | PASS |
| `recurrent-state-space` | 2 | Diagnose reset leakage and prior-posterior drift | P | P | P | P | P | PASS |
| `rssm-planet-case-study` | 1 | Reconstruct the data, state, learning, and control flow of World Models and PlaNet | P | P | P | P | P | PASS |
| `rssm-planet-case-study` | 2 | Design a controlled tiny RSSM build that tests representation before planning claims | P | P | P | P | P | PASS |
| `prediction-targets` | 1 | Align observation, reward, and continuation targets with latent time steps | P | P | P | P | P | PASS |
| `prediction-targets` | 2 | Choose loss normalization and weights without hiding a failing prediction head | P | P | P | P | P | PASS |
| `reconstruction-feature-prediction` | 1 | Contrast pixel reconstruction and future-feature prediction objectives | P | P | P | P | P | PASS |
| `reconstruction-feature-prediction` | 2 | Design a collapse and task-relevance audit for the chosen target space | P | P | P | P | P | PASS |
| `multistep-overshooting` | 1 | Trace how one-step error compounds during an open-loop latent rollout | P | P | P | P | P | PASS |
| `multistep-overshooting` | 2 | Choose and evaluate a multi-step training horizon without hiding stochastic uncertainty | P | P | P | P | P | PASS |
| `latent-prior-posterior` | 1 | Trace information and gradients through prior and posterior KL terms | P | P | P | P | P | PASS |
| `latent-prior-posterior` | 2 | Use telemetry and interventions to distinguish collapse from prior lag | P | P | P | P | P | PASS |
| `trajectory-data-replay` | 1 | Design a trajectory and replay schema that preserves temporal and provenance boundaries | P | P | P | P | P | PASS |
| `trajectory-data-replay` | 2 | Detect an unsupported planner query using a state-action coverage audit | P | P | P | P | P | PASS |
| `uncertainty-ensembles` | 1 | Separate stochastic outcome spread from ensemble model disagreement | P | P | P | P | P | PASS |
| `uncertainty-ensembles` | 2 | Build a calibration and fallback decision from held-out uncertainty evidence | P | P | P | P | P | PASS |
| `imagined-rollouts` | 1 | Trace latent states, rewards, continuation, and discount through an imagined return | P | P | P | P | P | PASS |
| `imagined-rollouts` | 2 | Bound an imagined-return claim using model and horizon evidence | P | P | P | P | P | PASS |
| `shooting-cem` | 1 | Execute one CEM sample–score–elite–refit iteration | P | P | P | P | P | PASS |
| `shooting-cem` | 2 | Compare planners under a matched model-evaluation budget | P | P | P | P | P | PASS |
| `model-predictive-control` | 1 | Trace one complete observe–plan–act–reobserve MPC cycle | P | P | P | P | P | PASS |
| `model-predictive-control` | 2 | Choose a replanning rate and fallback from dynamics and latency evidence | P | P | P | P | P | PASS |
| `differentiable-planning` | 1 | Differentiate a predicted return with respect to a continuous action | P | P | P | P | P | PASS |
| `differentiable-planning` | 2 | Diagnose a gradient-planning shortcut outside model support | P | P | P | P | P | PASS |
| `actor-critic-lambda` | 1 | Trace actor, critic, and λ-return roles through one update | P | P | P | P | P | PASS |
| `actor-critic-lambda` | 2 | Separate critic error from world-model error when policy learning fails | P | P | P | P | P | PASS |
| `dreamer-imagination` | 1 | Trace Dreamer's collection–model–imagination–behavior loop | P | P | P | P | P | PASS |
| `dreamer-imagination` | 2 | Audit a Dreamer comparison for matched data, compute, and model-error evidence | P | P | P | P | P | PASS |
| `muzero-tree-search` | 1 | Trace MuZero representation, dynamics, prediction, and MCTS backup | P | P | P | P | P | PASS |
| `muzero-tree-search` | 2 | Bound what task-relevant dynamics do and do not establish about the world | P | P | P | P | P | PASS |
| `dyna-tdmpc-case-study` | 1 | Compare Dyna, Dreamer, MuZero, and TD-MPC by model target and compute placement | P | P | P | P | P | PASS |
| `dyna-tdmpc-case-study` | 2 | Run a matched-budget planning tournament and make a bounded controller decision | P | P | P | P | P | PASS |
| `video-tokenization` | 1 | Compute spatiotemporal token counts from video shape and stride | P | P | P | P | P | PASS |
| `video-tokenization` | 2 | Audit a tokenizer for motion and control information lost at its boundaries | P | P | P | P | P | PASS |
| `autoregressive-diffusion-dynamics` | 1 | Trace autoregressive and diffusion generation processes for the same future block | P | P | P | P | P | PASS |
| `autoregressive-diffusion-dynamics` | 2 | Design a matched evaluation of speed, diversity, control, and long-horizon consistency | P | P | P | P | P | PASS |
| `latent-actions-passive-video` | 1 | Trace latent-action inference and action-conditioned future prediction | P | P | P | P | P | PASS |
| `latent-actions-passive-video` | 2 | Test whether a learned action code represents controllable change rather than correlated motion | P | P | P | P | P | PASS |
| `jepa-vjepa` | 1 | Trace context and target branches through a JEPA-style feature-prediction objective | P | P | P | P | P | PASS |
| `jepa-vjepa` | 2 | Separate action-free representation evidence from action-conditioned planning evidence | P | P | P | P | P | PASS |
| `genie-interactive-worlds` | 1 | Trace Genie's tokenizer, latent actions, autoregressive dynamics, and interaction loop | P | P | P | P | P | PASS |
| `genie-interactive-worlds` | 2 | Design an evidence-separated evaluation of controllability and consistency | P | P | P | P | P | PASS |
| `foundation-world-models-case-study` | 1 | Compare DreamerV3, MuZero, V-JEPA 2, and Genie through an explicit contract table | P | P | P | P | P | PASS |
| `foundation-world-models-case-study` | 2 | Make a task-specific selection without turning incomparable evidence into a universal ranking | P | P | P | P | P | PASS |
| `world-model-evaluation` | 1 | Design a world-model evaluation matrix from a stated downstream decision | P | P | P | P | P | PASS |
| `world-model-evaluation` | 2 | Interpret conflicting prediction and control metrics without collapsing them into one score | P | P | P | P | P | PASS |
| `compounding-error-exploitation` | 1 | Distinguish compounding rollout error from planner exploitation in a recorded trace | P | P | P | P | P | PASS |
| `compounding-error-exploitation` | 2 | Select and test a mitigation using horizon, support, uncertainty, and feedback evidence | P | P | P | P | P | PASS |
| `goal-conditioned-robotics` | 1 | Trace a goal-conditioned world-model controller from sensing through one executed action | P | P | P | P | P | PASS |
| `goal-conditioned-robotics` | 2 | Design a locally checkable success and safety contract for a robot goal | P | P | P | P | P | PASS |
| `system-identification-sim-to-real` | 1 | Estimate a simple dynamics parameter from an excitation trace and state its identifiability limit | P | P | P | P | P | PASS |
| `system-identification-sim-to-real` | 2 | Choose calibration, randomization, adaptation, or robust control for a diagnosed transfer gap | P | P | P | P | P | PASS |
| `safe-constrained-planning` | 1 | Trace reward, constraint, uncertainty, monitor, and fallback through a planning decision | P | P | P | P | P | PASS |
| `safe-constrained-planning` | 2 | Write a falsifiable runtime safety contract with limits and remaining assumptions | P | P | P | P | P | PASS |
| `world-model-operations-case-study` | 1 | Design a staged release and telemetry contract for a world-model controller | P | P | P | P | P | PASS |
| `world-model-operations-case-study` | 2 | Diagnose an incident across sensing, model, objective, planner, actuator, and operations evidence | P | P | P | P | P | PASS |
| `object-centric-dynamics` | 1 | Trace a scene through slot assignment, interaction dynamics, and permutation-aware decoding | P | P | P | P | P | PASS |
| `object-centric-dynamics` | 2 | Design evidence that separates object segmentation from identity and intervention claims | P | P | P | P | P | PASS |
| `hierarchical-multiscale` | 1 | Trace information and control across a two-level temporal world model | P | P | P | P | P | PASS |
| `hierarchical-multiscale` | 2 | Evaluate whether hierarchy improves long-horizon decisions under matched compute | P | P | P | P | P | PASS |
| `geometry-physical-priors` | 1 | Test a stated geometric or continuous-time prior with a numerical counterexample | P | P | P | P | P | PASS |
| `geometry-physical-priors` | 2 | Choose a prior by matching its assumptions to the system and failure costs | P | P | P | P | P | PASS |
| `causal-counterfactual-models` | 1 | Distinguish observational, interventional, and counterfactual queries in one dynamics scenario | P | P | P | P | P | PASS |
| `causal-counterfactual-models` | 2 | Audit whether data and assumptions identify a proposed action-effect claim | P | P | P | P | P | PASS |
| `language-multimodal-world-models` | 1 | Trace synchronized language, sensory, state, and action inputs through a multimodal prediction contract | P | P | P | P | P | PASS |
| `language-multimodal-world-models` | 2 | Design interventions that test grounding, missing-modality robustness, and leakage | P | P | P | P | P | PASS |
| `world-model-research-capstone` | 1 | Design and execute a self-contained world-model study with a falsifiable changed-case hypothesis | P | P | P | P | P | PASS |
| `world-model-research-capstone` | 2 | Package evidence, failures, limitations, and a next experiment without overstating the result | P | P | P | P | P | PASS |

## Gate decision

The World Models objective gate is closed for the reviewed revision. Structural tests remain necessary for exact joins and regressions, but they did not assign these semantic grades. Any objective, guide, example, assessment, prerequisite, or coverage-record change reopens the affected rows.
