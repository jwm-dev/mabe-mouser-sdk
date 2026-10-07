# API Definition
 
API definition (OpenAPI etc) files live here.

`openapi-source.json` is the original captured FastAPI specification. The
backend's `/api/files/{lab}/{filename}/stream` response is SSE, although that
specification advertises JSON. `../build/prepare-openapi.cjs` preserves the
snapshot and writes `openapi-sdk.json` with only that response media corrected.
`npm run generate` applies this SDK-side correction before building the model.
The backend is unchanged.
