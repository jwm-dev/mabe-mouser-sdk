# Voxgig first mini-task: developer experience

## Original submission snapshot

The observations, test failures and timing below describe original commit `9bffff72b6c2d4bcd46e6dce811bbd4a5dc97468`, submitted on 7 October 2026. They are retained as the historical assessment record. Subsequent maintenance is recorded separately at the end of this report.

Jeffrey Gregory · 7 October 2026 · AI assistance used

Built a TypeScript SDK for my existing MABe-mouser FastAPI service, using Voxgig's OpenAPI-to-model-to-SDK workflow. The SDK repository is public and MIT-licensed, with copyright to Jeffrey Gregory and retained Voxgig notices. The existing backend was neither modified nor relicensed. The catalogue check returned all 804 public voxgig-sdk repositories and no mabe/mouser match in names or descriptions.

The entity model and repeatable generation are useful: nine entities cover ten GET routes, and the generated TypeScript compiled. Source installation, synthetic validation scripts, dependency locks and CI are included. No registry package was published.

Windows setup was the main friction. System Node 22.21.0 was below the current guide's requirement; portable Node 24.21.0/npm 11.19.0 worked. create-sdkgen 0.30.6 failed to spawn npm (ENOENT); explicit installation recovered it. Its apidef ~8.22.1 pin conflicted with sdkgen 4.34.1's peer requirement, so I updated it to ~8.24.0. Model generation then hit a confirmed Windows path-resolution defect in multisource 0.5.8. A small version-checked, repeatable dependency workaround fixed native Windows paths while preserving memfs behavior. Generated SDK source was not hand-edited.

Results:

| Check | Result |
| --- | --- |
| Model/SDK generation after workaround | Passed |
| TypeScript build | Passed |
| Generated offline suite | 245 passed, 1 failed, 13 skipped (259 total) |
| Live generated SDK against synthetic API | 12 passed, 1 failed |
| Direct synthetic API baseline | 13 passed, 0 failed |
| npm audit during both installs | 0 reported vulnerabilities |
| Publication privacy review | No detected credentials, private paths, research datasets or runtime logs |

Two functional issues remain. The generated FrameEntity basic test supplies only id and omits required parent path parameters. A real frame call with file_id, filename and id succeeds. Stream.load fails with response_content_type even though the API returns HTTP 200 SSE; direct SSE verification succeeds. The original FastAPI schema advertises JSON for that route and omits most response schemas. Generated response interfaces are therefore sparse. Tests were retained and CI is expected to expose these failures, not report an all-green SDK.

I would improve Windows scaffold execution and pin compatibility, nested-path offline fixtures, and diagnostics for weak response schemas or streaming media. Other language targets, production use, registry release and full security/performance review were not tested.

Validation used only 24 invented Parquet tracking rows, six frames, two mice and synthetic annotations. No paid service, new SaaS account, research dataset or credential was needed. See SETUP.md and validation/ for commands and evidence.
Implementation froze at 2026-10-07 13:23:23 UTC, after 18m 5s of automated execution from 13:05:19 UTC, within the 30-minute implementation time-box. This is AI execution time, not human work. No interactive human implementation was observed; Jeffrey's earlier briefing and later review time were not measured. Publication/CI verification follows the freeze.

Guide: https://github.com/voxgig/create-sdkgen/blob/main/AGENTS.md (checked live; revision bc24c9d72b27f55ac0ef78f34a86f076ccb0aa85).
Backend tested: 27f495abb2f65435a1445fbb7b2aa859eb0696af.
Toolchain: create-sdkgen 0.30.6; apidef 8.24.0; sdkgen 4.34.1; model 12.0.1; docgen 0.30.1; aontu 0.76.0; multisource 0.5.8. Python 3.14.0; FastAPI 0.142.2; uvicorn 0.54.0; pandas 3.0.6; pyarrow 25.0.1.

## Post-submission maintenance — 7 October 2026

Jeffrey separately requested repair of the failed GitHub Actions checks after submission. This maintenance is outside the original assessment time-box; the historical results and timing above are unchanged.

The Frame test generator now carries the required parent path bindings into its generated load call, while retaining the fixture ID and returned-ID assertion. Two generator regressions execute the rendered call, vary the flow bindings and confirm that an incorrect returned ID fails.

The stream issue needed both an API-definition correction and runtime support. A small generation-time overlay changes only the stream route's successful response media to SSE; the original captured OpenAPI and backend remain unchanged. The generated decoder handles incremental UTF-8, CR/LF framing, multiline data, comments, IDs and early cancellation. Stream.load buffers the JSON payloads; Stream.stream yields them incrementally. JSON HTTP errors, malformed payloads and API error events are covered. The offline transports now emit actual SSE for this route and verify all buffered payloads. Thirteen additional offline tests exercise these behaviors, including delivery before the final network chunk and rejection of missing metadata.

| Maintenance local check | Result |
| --- | --- |
| Fresh model/SDK generation | Passed |
| TypeScript source and test build | Passed |
| Offline suite | 259 passed, 0 failed, 13 existing skips (272 total) |
| Generator regression tests | 2 passed, 0 failed, 0 skipped |
| Live SDK against the synthetic API | 14 passed, 0 failed, 0 unrun |
| Direct synthetic API baseline | 13 passed, 0 failed |
| Git diff whitespace check | Passed |
| Maintenance privacy and license review | No detected credentials, private machine paths or research data; original licenses retained |

Verification commands were `npm run generate --prefix .sdk`, `npm test --prefix ts`, `node --test scripts/generator-regression.test.cjs` and `node scripts/verify-sdk.cjs --output validation/maintenance-sdk-live-results.json`, using Node 24.21.0/npm 11.19.0 and the same pinned backend/Python environment. SDK CI now installs the generator and regenerates from committed inputs before its offline tests; both existing workflows are retained. Published-commit workflow conclusions are verified separately after pushing, so the table records local execution only.

Maintenance began at approximately 13:52 UTC; build, unit and live checks completed by 14:09 UTC, about 17 minutes of AI execution wall time. Repeated generation, publication and hosted CI verification follow those checks. No interactive human implementation was observed; the request and review time were not measured. This time is not represented as human assessment work.

Most upstream response schemas remain sparse. The finite SSE reader does not reconnect; production use, other language targets, package release and full security/performance review remain unrun. No tests were disabled or newly skipped to obtain the passing result.

