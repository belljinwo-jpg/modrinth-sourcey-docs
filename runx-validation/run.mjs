import https from "node:https";

const publicUrl = process.env.RUNX_INPUT_PUBLIC_URL ?? "";
const evidenceUrl = process.env.RUNX_INPUT_EVIDENCE_URL ?? "";
if (!publicUrl.startsWith("https://") || !evidenceUrl.startsWith("https://")) {
  process.stderr.write("public_url and evidence_url must be HTTPS URLs\n");
  process.exit(64);
}
function readHttps(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "user-agent": "runx-sourcey-validation/0.1" } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 5) {
        response.resume();
        resolve(readHttps(new URL(response.headers.location, url).href, redirects + 1));
        return;
      }
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, url, body }));
    }).on("error", reject);
  });
}

const [siteResponse, evidenceResponse] = await Promise.all([readHttps(publicUrl), readHttps(evidenceUrl)]);
if (siteResponse.status !== 200 || evidenceResponse.status !== 200) {
  process.stderr.write(`HTTP failure: site=${siteResponse.status} evidence=${evidenceResponse.status}\n`);
  process.exit(1);
}
const html = siteResponse.body;
const evidence = JSON.parse(evidenceResponse.body);
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
