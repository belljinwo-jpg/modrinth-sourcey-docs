# Modrinth API documentation generated with Sourcey

This project builds a static, searchable reference for the real Modrinth API
from the upstream OpenAPI specification at the pinned `modrinth/code` commit
recorded in `evidence.json`.

Live reference: https://modrinth-sourcey-reference.surge.sh/

## Build

```text
pnpm install --frozen-lockfile
pnpm run build
```

The generated and minified site is written to `dist/`. Ten focused Sourcey pages contain 77 real API operations,
well above the bounty's minimum of 20, plus the upstream schemas and examples.

## Verify

Serve `dist/` with any static server and open `/`. Confirm that endpoint links
such as `GET /search` navigate to their operation anchors and that search finds
endpoint and model entries. Hashes, the exact upstream commit, adapter, source
file, and generated page list are recorded in `evidence.json`.
