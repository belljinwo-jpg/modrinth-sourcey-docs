# GitHub Gists REST documentation generated with Sourcey

This repository builds a static, searchable Sourcey reference for twenty real
GitHub Gists REST operations from GitHub's maintained, MIT-licensed
`github/rest-api-description` repository at the immutable commit recorded in
`evidence.json`.

Live reference: https://github-gists-sourcey-docs.surge.sh/

## Build

```text
pnpm install --frozen-lockfile
pnpm run build
```

The build splits the Gists surface into two focused pages, recursively includes
only referenced OpenAPI components, minifies the generated HTML, and emits
search plus `llms.txt` context files. Hashes and reproducibility evidence are in
`evidence.json`.

## Validate

The companion `sourcey-validation` runx skill fetches the public site and
evidence bundle, checks the pinned MIT source, operation coverage, summary, and
observations, and seals the validation result in a runx receipt.
