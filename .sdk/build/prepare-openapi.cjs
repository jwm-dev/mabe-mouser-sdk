'use strict'

// Preserve the captured upstream specification. Its SSE route is served by a
// StreamingResponse but FastAPI reports JSON when no response class is declared.
const fs = require('node:fs')
const path = require('node:path')
const directory = path.resolve(__dirname, '../def')
const spec = JSON.parse(fs.readFileSync(path.join(directory, 'openapi-source.json'), 'utf8'))
spec.paths['/api/files/{lab}/{filename}/stream'].get.responses['200'].content = {
  'text/event-stream': { schema: { type: 'string' } },
}
fs.writeFileSync(path.join(directory, 'openapi-sdk.json'), JSON.stringify(spec, null, 2) + '\n')
