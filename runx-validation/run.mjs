const publicUrl = process.env.RUNX_INPUT_PUBLIC_URL ?? "";
const evidenceUrl = process.env.RUNX_INPUT_EVIDENCE_URL ?? "";
if (!publicUrl.startsWith("https://") || !evidenceUrl.startsWith("https://")) {
  process.stderr.write("public_url and evidence_url must be HTTPS URLs\n");
  process.exit(64);
}
const [siteResponse, evidenceResponse] = await Promise.all([
  fetch(publicUrl, { redirect: "follow" }),
  fetch(evidenceUrl, { redirect: "follow" }),
]);
if (!siteResponse.ok || !evidenceResponse.ok) {
  process.stderr.write(`HTTP failure: site=${siteResponse.status} evidence=${evidenceResponse.status}\n`);
  process.exit(1);
}
const html = await siteResponse.text();
const evidence = await evidenceResponse.json();
const operationCount = Number(evidence?.coverage?.operation_count ?? 0);
const observations = Array.isArray(evidence?.observations) ? evidence.observations : [];
const checks = {
  sourceyBranding: html.includes("GitHub REST API") && html.includes("Gists"),
  operationCoverage: operationCount >= 20,
  evidenceSummary: String(evidence?.summary ?? "").length > 80,
  evidenceObservations: observations.length >= 6,
  pinnedCommit: /^[0-9a-f]{40}$/.test(String(evidence?.library?.source_commit ?? "")),
  permissiveLicense: evidence?.library?.license === "MIT",
  runxVersionRecorded: observations.some((item) => JSON.stringify(item).includes("runx-cli 0.6.8")),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  process.stderr.write(`Validation failed: ${failed.join(", ")}\n`);
  process.exit(1);
}
process.stdout.write(`${JSON.stringify({ status: "validated", public_url: siteResponse.url,
  evidence_url: evidenceResponse.url, operation_count: operationCount,
  observation_count: observations.length, checks })}\n`);
