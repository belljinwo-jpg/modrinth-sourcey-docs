---
name: sourcey-validation
description: Validate a public Sourcey site and evidence bundle against the Frantic Sourcey bounty contract.
source:
  type: cli-tool
  command: node
  args: [run.mjs]
  timeout_seconds: 45
  sandbox:
    profile: readonly
    cwd_policy: skill-directory
inputs:
  public_url:
    type: string
    required: true
  evidence_url:
    type: string
    required: true
runx:
  category: ops
  input_resolution:
    required: [public_url, evidence_url]
---

# Sourcey validation

Fetch the public Sourcey site and JSON evidence. Seal a runx receipt only when
the target is identified, at least twenty operations are covered, and the
evidence records a pinned MIT source, summary, observations, and runx version.
