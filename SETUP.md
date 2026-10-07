# Local setup and verification

This first-exercise SDK is source code, not a published npm release. The API is Jeffrey Gregory's existing [MABe-mouser](https://github.com/jwm-dev/MABe-mouser) FastAPI service. The backend is not copied into this repository or relicensed.

Use Node 24 or later for generation. The original Windows system had Node 22.21.0; this run used the official portable Node 24.21.0 distribution and npm 11.19.0.

```sh
cd .sdk
npm ci
cd ..
node scripts/fix-windows-multisource.cjs
cd .sdk
npm run generate
cd ../ts
npm ci
npm run build
npm test
```

The workaround script does nothing on other platforms. On Windows it validates and patches the known `@tabnas/multisource@0.5.8` native-filesystem path issue in ignored dependencies. It does not modify generated SDK source. The scaffold's incompatible `apidef` pin was updated to `~8.24.0`; the lockfile records the installed toolchain.

The first scaffold command was:

```sh
npx --yes @voxgig/create-sdkgen@0.30.6 mabe-mouser -d openapi-source.json -o mabe-mouser-sdk -t ts -f test
```

It failed on Windows with `spawn npm ENOENT`. Recovery used `--no-install`, explicit installation, `npm run add-target -- ts`, and `npm run add-feature -- test`. Because the interrupted scaffold had not copied/parsed the input, the original exported schema was copied to `.sdk/def/openapi-source.json` and parsed with:

```sh
node .sdk/node_modules/@voxgig/apidef/bin/voxgig-apidef mabe-mouser --folder .sdk --def .sdk/def/openapi-source.json --prefix=
```

To repeat local integration checks, use an isolated Python environment with `scripts/requirements-validation.txt`, and clone the backend at the exact tested revision:

```sh
git clone https://github.com/jwm-dev/MABe-mouser.git backend-reference
git -C backend-reference checkout 27f495abb2f65435a1445fbb7b2aa859eb0696af
python -m pip install -r scripts/requirements-validation.txt
python -X utf8 -B scripts/create_fixture.py validation/synthetic-data
python -X utf8 -B scripts/serve_api.py --backend backend-reference --data validation/synthetic-data --port 8765
```

Run the server in a separate terminal, then:

```sh
node scripts/verify-sdk.cjs
```

The server binds only to loopback. The fixtures are invented; no competition data, research records, Kaggle credentials, or paid services are needed. Do not use the backend's `run.py`, which downloads competition data. Backend version and dependencies are pinned for repeatability; other platforms were not locally tested.

The generated client accepts `server: { base: 'http://127.0.0.1:8765' }`. The API's original OpenAPI document omits a server URL and most response schemas. Some semantic names differ from raw API parameters: `Frame().load({ file_id: 'synthetic_lab', filename: 'synthetic_video.parquet', id: 2 })` addresses frame 2; `File().load({ lab: 'synthetic_lab', filename: 'synthetic_video.parquet', start_frame: 1, max_frame: 2 })` addresses a range. See the experience report for verified results and remaining failures.
