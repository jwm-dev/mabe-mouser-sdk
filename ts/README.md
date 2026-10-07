# MabeMouser TypeScript SDK



The TypeScript SDK for the MabeMouser API — a type-safe, entity-oriented client with full async/await support.

The API is exposed as capitalised, semantic **Entities** — e.g.
`client.Activity()` — each with a small set of operations (`load`)
instead of raw URL paths and query parameters. This keeps the surface
predictable and low-friction for both humans and AI agents.


## Install
This package is not yet published to npm. Install it from the GitHub
release tag (`ts/vX.Y.Z`, see [Tags](https://github.com/jwm-dev/mabe-mouser-sdk/tags)), or from a
clone, which carries the compiled `dist/`:

```bash
git clone https://github.com/jwm-dev/mabe-mouser-sdk
npm install ./mabe-mouser-sdk/ts
```


## Tutorial: your first API call

This tutorial walks through creating a client, listing entities, and
loading a specific record.

### 1. Create a client

```ts
import { MabeMouserSDK } from '@jwm-dev/mabe-mouser-sdk'

const client = new MabeMouserSDK({
  // Required: this API's server URL is templated on these.
  server: {
    base: '<base>',
  },
})
```

### 3. Load a frame

Frame is nested under file, so provide the `file_id`.
`load()` returns the entity directly and throws on failure:

```ts
try {
  const frame = await client.Frame().load({
    file_id: 'example_file_id',
    filename: 'example_filename',
    id: 1,
  })
  console.log(frame)
} catch (err) {
  console.error('load failed:', err)
}
```


## Error handling

Entity operations reject on failure, so wrap them in `try` / `catch`:

```ts
try {
  const browser = await client.Browser().load()
  console.log(browser)
} catch (err) {
  console.error('load failed:', err)
}
```

The low-level `direct()` method does **not** throw — it returns the
result envelope. Branch on `ok`; on failure `status` holds the HTTP status
(for error responses) and `err` holds the error:

```ts
const result = await client.direct({
  path: '/api/resource/{id}',
  method: 'GET',
  params: { id: 'example_id' },
})

if (!result.ok) {
  console.error('request failed:', result.status, result.err)
}
```


## How-to guides

### Make a direct HTTP request

For endpoints not covered by entity methods:

```ts
const result = await client.direct({
  path: '/api/resource/{id}',
  method: 'GET',
  params: { id: 'example' },
})

if (result.ok) {
  console.log(result.status)  // 200
  console.log(result.data)    // response body
}
```

### Prepare a request without sending it

```ts
const fetchdef = await client.prepare({
  path: '/api/resource/{id}',
  method: 'DELETE',
  params: { id: 'example' },
})

// Inspect before sending
console.log(fetchdef.url)
console.log(fetchdef.method)
console.log(fetchdef.headers)
```

### Use test mode

Create a mock client for unit testing — no server required:

```ts
const client = MabeMouserSDK.test()

const browser = await client.Browser().load()
// browser is the entity, populated with mock response data
// — call browser.data() for the record itself
console.log(browser)
```

You can also use the instance method:

```ts
const client = new MabeMouserSDK()
const testClient = client.tester()
```

### Retain entity state across calls

Entity instances remember their last match and data:

```ts
const entity = client.Browser()

// First call runs the operation and stores its result
await entity.load()

// Subsequent calls reuse the stored state
const data = entity.data()
console.log(data)
```

### Add custom middleware

Pass features via the `extend` option:

```ts
const logger = {
  hooks: {
    PreRequest: (ctx: any) => {
      console.log('Requesting:', ctx.spec.method, ctx.spec.path)
    },
    PreResponse: (ctx: any) => {
      console.log('Status:', ctx.out.request?.status)
    },
  },
}

const client = new MabeMouserSDK({
  extend: [logger],
})
```

### Run live tests

Create a `.env.local` file at the project root:

```
MABE_MOUSER_TEST_LIVE=TRUE
```

Then run:

```bash
cd ts && npm test
```

Live entity tests continue independent operations after errors and attempt
supported cleanup. Their final result reports failures and missing prerequisites
after the remaining work completes. The model and test inputs determine which
API operations the generated scenarios cover.


## Reference

### MabeMouserSDK

#### Constructor

```ts
new MabeMouserSDK(options?: {
  server?: { base: string }
  base?: string
  prefix?: string
  suffix?: string
  feature?: Record<string, { active: boolean }>
  extend?: Feature[]
})
```

| Option | Type | Description |
| --- | --- | --- |
| `server` | `object` | **Required.** Values for the server-URL variables: `base`. The API base URL is a template over them. |
| `base` | `string` | Base URL of the API server. |
| `prefix` | `string` | URL path prefix prepended to all requests. |
| `suffix` | `string` | URL path suffix appended to all requests. |
| `feature` | `object` | Feature activation flags (e.g. `{ test: { active: true } }`). |
| `extend` | `Feature[]` | Additional feature instances to load. |

#### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `options()` | `object` | Deep copy of current SDK options. |
| `utility()` | `Utility` | Deep copy of the SDK utility object. |
| `prepare(fetchargs?)` | `Promise<FetchDef>` | Build an HTTP request definition without sending it. |
| `direct(fetchargs?)` | `Promise<DirectResult>` | Build and send an HTTP request. |
| `Activity(data?)` | `ActivityEntity` | Create an Activity entity instance. |
| `Browser(data?)` | `BrowserEntity` | Create a Browser entity instance. |
| `File(data?)` | `FileEntity` | Create a File entity instance. |
| `Frame(data?)` | `FrameEntity` | Create a Frame entity instance. |
| `Heatmap(data?)` | `HeatmapEntity` | Create a Heatmap entity instance. |
| `Overview(data?)` | `OverviewEntity` | Create an Overview entity instance. |
| `RootGet(data?)` | `RootGetEntity` | Create a RootGet entity instance. |
| `Social(data?)` | `SocialEntity` | Create a Social entity instance. |
| `Stream(data?)` | `StreamEntity` | Create a Stream entity instance. |
| `tester(testopts?, sdkopts?)` | `MabeMouserSDK` | Create a test-mode client instance. |

#### Static methods

| Method | Returns | Description |
| --- | --- | --- |
| `MabeMouserSDK.test(testopts?, sdkopts?)` | `MabeMouserSDK` | Create a test-mode client. |

### Entity interface

All entities share the same interface.

#### Methods

| Method | Signature | Description |
| --- | --- | --- |
| `load` | `load(reqmatch?, ctrl?): Promise<Entity>` | Load a single entity by match criteria. |
| `data` | `data(data?: Partial<Entity>): Entity` | Get or set entity data. |
| `match` | `match(match?: Partial<Entity>): Partial<Entity>` | Get or set entity match criteria. |
| `make` | `make(): Entity` | Create a new instance with the same options. |
| `client` | `client(): MabeMouserSDK` | Return the parent SDK client. |
| `entopts` | `entopts(): object` | Return a copy of the entity options. |

#### Return values

Entity operations resolve to the entity data directly — there is no
result envelope:

- `load` resolves to a single entity object.

On a failed request these methods **throw**, so wrap calls in
`try`/`catch` to handle errors. Only `direct()` returns the result
envelope described below.

### DirectResult shape

The `direct()` method returns:

```ts
{
  ok: boolean
  status: number
  headers: object
  data: any
}
```

On error, `ok` is `false` and an `err` property contains the error.

### FetchDef shape

The `prepare()` method returns:

```ts
{
  url: string
  method: string
  headers: Record<string, string>
  body?: any
}
```

### Entities

#### Activity

| Field | Description |
| --- | --- |

Operations: load.

API path: `/api/analytics/activity`

#### Browser

| Field | Description |
| --- | --- |

Operations: load.

API path: `/api/analytics/browser`

#### File

| Field | Description |
| --- | --- |
| `id` |  |

Operations: load.

API path: `/api/files/{lab}/{filename}`

#### Frame

| Field | Description |
| --- | --- |
| `id` |  |

Operations: load.

API path: `/api/files/{lab}/{filename}/frame/{frame_number}`

#### Heatmap

| Field | Description |
| --- | --- |

Operations: load.

API path: `/api/analytics/heatmap`

#### Overview

| Field | Description |
| --- | --- |

Operations: load.

API path: `/api/analytics/overview`

#### RootGet

| Field | Description |
| --- | --- |

Operations: load.

API path: `/`

#### Social

| Field | Description |
| --- | --- |

Operations: load.

API path: `/api/analytics/social`

#### Stream

| Field | Description |
| --- | --- |

Operations: load.

API path: `/api/files/{lab}/{filename}/stream`



## Entities


### Activity

Create an instance: `const activity = client.Activity()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const activity = await client.Activity().load()
```


### Browser

Create an instance: `const browser = client.Browser()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const browser = await client.Browser().load()
```


### File

Create an instance: `const file = client.File()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` |  |

#### Example: Load

```ts
const file = await client.File().load({ filename: 'filename', lab: 'lab' })
```


### Frame

Create an instance: `const frame = client.Frame()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Fields

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` |  |

#### Example: Load

```ts
const frame = await client.Frame().load({ id: 1, file_id: 'file_id', filename: 'filename' })
```


### Heatmap

Create an instance: `const heatmap = client.Heatmap()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const heatmap = await client.Heatmap().load()
```


### Overview

Create an instance: `const overview = client.Overview()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const overview = await client.Overview().load()
```


### RootGet

Create an instance: `const root_get = client.RootGet()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const root_get = await client.RootGet().load()
```


### Social

Create an instance: `const social = client.Social()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const social = await client.Social().load()
```


### Stream

Create an instance: `const stream = client.Stream()`

#### Operations

| Method | Description |
| --- | --- |
| `load(match)` | Load a single entity by match criteria. |

#### Example: Load

```ts
const stream = await client.Stream().load({ file_id: 'file_id', filename: 'filename' })
```

## Features

This SDK ships 1 optional features. Each is **inactive until you
switch it on**, so an SDK you have not configured behaves exactly as if none of
them existed — no retries, no cache, no logging, no measurable overhead.

Activate a feature by name in the client options, alongside the options shown
above:

| Feature | What it does |
|---|---|
| [`test`](#test) | Test transport |

### test

Test transport.

| Option | Default |
|---|---|
| `active` | `false` |

Set `feature.test.active` to enable it, then override any of the options above.


## Advanced

> The sections above cover everyday use. The material below explains the
> SDK's internals — useful when extending it with custom features, but not
> needed for normal use.

### The operation pipeline

Every entity operation follows a six-stage pipeline. Each stage fires a
feature hook before executing:

```
PrePoint → PreSpec → PreRequest → PreResponse → PreResult → PreDone
```

- **PrePoint**: Resolves which API endpoint to call based on the
  operation name and entity configuration.
- **PreSpec**: Builds the HTTP spec — URL, method, headers, body —
  from the resolved point and the caller's parameters.
- **PreRequest**: Sends the HTTP request. Features can intercept here
  to replace the transport (as TestFeature does with mocks).
- **PreResponse**: Parses the raw HTTP response.
- **PreResult**: Extracts the business data from the parsed response.
- **PreDone**: Final stage before returning to the caller. Entity
  state (match, data) is updated here.

If any stage errors, the pipeline short-circuits and the error surfaces
to the caller — see [Error handling](#error-handling) for how that looks
in this language.

### Features and hooks

Features are the extension mechanism. A feature is an object with a
`hooks` map. Each hook key is a pipeline stage name, and the value is
a function that receives the context.

The SDK ships with built-in features:

- **TestFeature**: Test transport

Features are initialized in order. Hooks fire in the order features
were added, so later features can override earlier ones.

### Module structure

```
mabe-mouser/
├── src/
│   ├── MabeMouserSDK.ts        # Main SDK class
│   ├── entity/             # Entity implementations
│   ├── feature/            # Built-in features (Base, Test, Log)
│   └── utility/            # Utility functions
├── test/                   # Test suites
└── dist/                   # Compiled output
```

Import the SDK from the package root:

```ts
import { MabeMouserSDK } from '@jwm-dev/mabe-mouser-sdk'
```

### Entity state

Entity instances are stateful. After a successful `load`, the entity
stores the returned data and match criteria internally. Subsequent
calls on the same instance can rely on this state.

```ts
const browser = client.Browser()
await browser.load()

// browser.data() now returns the browser data from the last `load`
// browser.match() returns the last match criteria
```

Call `make()` to create a fresh instance with the same configuration
but no stored state.

### Direct vs entity access

The entity interface handles URL construction, parameter placement,
and response parsing automatically. Use it for standard CRUD operations.

The `direct` method gives full control over the HTTP request. Use it
for non-standard endpoints, bulk operations, or any path not modelled
as an entity. The `prepare` method is useful for debugging — it
shows exactly what `direct` would send.


## Full Reference

See [REFERENCE.md](REFERENCE.md) for complete API reference
documentation including all method signatures, entity field schemas,
and detailed usage examples.
