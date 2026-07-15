import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const percentile = (values, quantile) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * quantile) - 1];
const arms = ["static", "continuous"];

export function runInferenceBenchmarkFixture() {
  const rawRequests = [];
  for (const arm of arms) for (let index = 0; index < 10; index += 1) {
    const long = index % 3 === 2;
    const queue = arm === "static" ? 130 + index * 48 + (long ? 330 : 0) : 72 + index * 26 + (long ? 160 : 0);
    const prefill = (long ? 460 : 180) + (arm === "static" ? 85 : 35) + index * 9;
    const ttft = queue + prefill;
    const tpot = (arm === "static" ? 34 : 29) + (long ? 8 : 2) + (index % 4);
    const quality = 0.842 - (long ? 0.006 : 0) - (index % 2) * 0.002;
    rawRequests.push({
      id: `${arm}-${String(index + 1).padStart(2, "0")}`, arm, repetition: Math.floor(index / 4) + 1,
      workload: long ? "long-reasoning" : "short-chat", input_tokens: long ? 1024 : 128, output_tokens: long ? 128 : 64,
      arrival_ms: index * 250, queue_ms: queue, ttft_ms: ttft, tpot_ms: tpot,
      e2e_ms: ttft + tpot * ((long ? 128 : 64) - 1), quality, status: "ok",
    });
  }
  const aggregates = arms.map((arm) => {
    const rows = rawRequests.filter((row) => row.arm === arm);
    const meets = rows.filter((row) => row.ttft_ms <= 1200 && row.tpot_ms <= 45 && row.quality >= 0.83).length;
    return {
      arm, requests: rows.length, p50_ttft_ms: percentile(rows.map((row) => row.ttft_ms), 0.5),
      p95_ttft_ms: percentile(rows.map((row) => row.ttft_ms), 0.95), p95_tpot_ms: percentile(rows.map((row) => row.tpot_ms), 0.95),
      goodput_fraction: meets / rows.length, mean_quality: rows.reduce((sum, row) => sum + row.quality, 0) / rows.length,
    };
  });
  assert.equal(rawRequests.length, 20);
  assert.ok(aggregates[1].p95_ttft_ms < aggregates[0].p95_ttft_ms);
  assert.ok(aggregates[1].goodput_fraction > aggregates[0].goodput_fraction);
  return {
    artifact: "inference service benchmark executable fixture",
    schema_version: "1.0",
    scope: "dependency-free deterministic scheduling fixture; timings teach aggregation and SLO decisions and are not hardware/vLLM performance claims",
    manifest: {
      generator: "scripts/inference-benchmark-fixture.mjs", server_semantics_reference: "vLLM v0.23.0 / 91df0fa",
      model: "synthetic-decoder-fixture-v1", hardware: "deterministic course simulator (no accelerator claim)", client: "local fixture generator",
      repetitions: 3, requests_per_arm: 10, warmup_requests: 0, workload: "7 short chats + 3 long reasoning requests per arm",
    },
    command: "node scripts/inference-benchmark-fixture.mjs --verify",
    slo: { p95_ttft_ms_max: 1200, p95_tpot_ms_max: 45, goodput_fraction_min: 0.95, quality_min: 0.83 },
    raw_requests: rawRequests,
    aggregates,
    calculation_contract: "nearest-rank percentiles over every bundled request row; goodput counts rows meeting TTFT, TPOT, and quality gates",
    decision: aggregates[1].goodput_fraction >= 0.95 ? "accept continuous batching for the fixture" : "reject continuous batching for the fixture",
    falsifier: "reject when any rerun misses its predeclared latency, goodput, or quality gate",
  };
}

const result = runInferenceBenchmarkFixture();
if (process.argv.includes("--verify")) {
  const preserved = JSON.parse(await readFile(new URL("../public/capstone-artifacts/inference-service-benchmark.json", import.meta.url), "utf8"));
  assert.deepEqual(preserved, result);
  console.log("Verified inference aggregates from every preserved request row.");
} else console.log(JSON.stringify(result, null, 2));
