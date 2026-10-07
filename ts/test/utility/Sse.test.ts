import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readSseEvents, readJsonSse } from '../../dist/utility/SseUtility'
import { MabeMouserSDK } from '../..'
import { runDefinitionPoint, type DefinitionPoint } from '../definition-runner'

const encode = (text: string) => new TextEncoder().encode(text)
const failure = (code: string, message: string) => Object.assign(new Error(message), { code })
const match = { file_id: 'synthetic_lab', filename: 'synthetic_video.parquet', chunk_size: 2 }
const definition: DefinitionPoint = {
  entity: 'stream', accessor: 'Stream', op: 'load', method: 'GET',
  path: '/api/files/{lab}/{filename}/stream',
  args: [
    { name: 'file_id', wire: 'lab', value: match.file_id },
    { name: 'filename', wire: 'filename', value: match.filename },
  ],
  select: {}, responseMedia: ['text/event-stream'], query: [], auth: null,
  status: 200, idField: 'id',
  sample: [
    { metadata: { total_frames: 2, num_mice: 1 } },
    { frames: [{ frame_number: 0 }, { frame_number: 1 }], complete: true },
  ],
}

function body(chunks: Uint8Array[], onCancel?: () => void) {
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      const next = chunks.shift()
      if (next) controller.enqueue(next)
      else controller.close()
    },
    cancel() { onCancel?.() },
  })
}

async function collect<T>(source: AsyncIterable<T>) {
  const events: T[] = []
  for await (const event of source) events.push(event)
  return events
}

describe('SSE', () => {
  test('frames split UTF-8 bytes, CRLF, multiline data, comments and persistent IDs', async () => {
    const wire = encode('\ufeff: keepalive\r\nid: first\r\nevent: metadata\r\ndata: {"name":"møuse🐭",\r\ndata: "frames":6}\r\n\r\nretry: 1000\rid: invalid\0id\rdata:{"complete":true}\r\r')
    const events = await collect(readSseEvents(body(Array.from(wire, byte => Uint8Array.of(byte)))))
    assert.deepEqual(events, [
      { event: 'metadata', id: 'first', data: '{"name":"møuse🐭",\n"frames":6}' },
      { event: 'message', id: 'first', data: '{"complete":true}' },
    ])
    assert.equal(JSON.parse(events[0].data).name, 'møuse🐭')
  })

  test('requires the terminating blank line and ignores field-only events', async () => {
    assert.deepEqual(await collect(readSseEvents(body([encode('event: ignored\n\ndata: "complete"\n')]))), [])
  })

  test('empty data dispatches and removes exactly one optional space', async () => {
    assert.deepEqual(await collect(readSseEvents(body([encode('data\n\ndata:  spaced\n\n')]))), [
      { data: '', event: 'message', id: '' },
      { data: ' spaced', event: 'message', id: '' },
    ])
  })

  test('JSON decode errors reject with a safe error code', async () => {
    await assert.rejects(collect(readJsonSse(body([encode('data: private-invalid-payload\n\n')]), failure)),
      (error: any) => error.code === 'response_sse_invalid' && !error.message.includes('private-invalid'))
  })

  test('API error events reject instead of reporting successful completion', async () => {
    await assert.rejects(collect(readJsonSse(body([encode('data: {"error":"private server detail"}\n\n')]), failure)),
      (error: any) => error.code === 'response_sse_error' && !error.message.includes('private server'))
  })

  test('early iterator return cancels the readable body and releases its lock', async () => {
    let cancelled = false
    const source = body([encode('data: 1\n\n'), encode('data: 2\n\n')], () => { cancelled = true })
    const iterator = readJsonSse(source, failure)
    assert.equal((await iterator.next()).value, 1)
    await iterator.return(undefined)
    assert.equal(cancelled, true)
    assert.equal(source.locked, false)
  })

  test('generated entity yields metadata before the final network chunk arrives', { timeout: 5000 }, async () => {
    let controller: ReadableStreamDefaultController<Uint8Array>
    const source = new ReadableStream<Uint8Array>({ start(value) { controller = value } })
    const client = new MabeMouserSDK({ server: { base: 'http://sse.test' }, system: { fetch: async (_url: any, options: any) => {
      assert.equal(options.headers.accept, 'text/event-stream')
      return new Response(source, { headers: { 'content-type': 'text/event-stream; charset=utf-8' } })
    } } })
    const iterator = client.Stream().stream('load', { reqmatch: match })
    const metadata = iterator.next()
    controller!.enqueue(encode('data: {"metadata":{"total_frames":6}}\n\n'))
    assert.deepEqual((await metadata).value, { metadata: { total_frames: 6 } })
    controller!.enqueue(encode('data: {"frames":[0,1],"complete":true}\n\n'))
    controller!.close()
    assert.deepEqual((await iterator.next()).value, { frames: [0, 1], complete: true })
    assert.equal((await iterator.next()).done, true)
  })

  test('normal generated load buffers the JSON SSE payloads', async () => {
    const client = new MabeMouserSDK({ server: { base: 'http://sse.test' }, system: { fetch: async () => new Response(
      body([encode('data: {"metadata":{"total_frames":6}}\n\ndata: {"frames":[0,1],"complete":true}\n\n')]),
      { headers: { 'content-type': 'text/event-stream' } },
    ) } })
    const loaded = await client.Stream().load(match)
    assert.deepEqual(loaded.data(), [{ metadata: { total_frames: 6 } }, { frames: [0, 1], complete: true }])
  })

  test('wrong media type on the declared SSE route is rejected', async () => {
    const client = new MabeMouserSDK({ server: { base: 'http://sse.test' }, system: { fetch: async () => new Response('{}',
      { headers: { 'content-type': 'application/json' } }) } })
    await assert.rejects(client.Stream().load(match), (error: any) => error.code === 'response_content_type')
  })

  test('SSE route preserves JSON HTTP errors and their status', async () => {
    const client = new MabeMouserSDK({ server: { base: 'http://sse.test' }, system: { fetch: async () => new Response('{"detail":"Missing file"}',
      { status: 404, headers: { 'content-type': 'application/json' } }) } })
    await assert.rejects(client.Stream().load(match), (error: any) => error.status === 404)
  })

  test('the test transport emits the declared SSE media through the real decoder', async () => {
    const client = MabeMouserSDK.test({ entity: { stream: {
      'synthetic_video.parquet': { file_id: 'synthetic_lab', complete: true },
    } } })
    const loaded = await client.Stream().load(match)
    assert.equal(Array.isArray(loaded.data()), true)
    assert.equal(loaded.data()[0].complete, true)
  })

  test('definition runner verifies complete buffered SSE sample payloads', async () => {
    await runDefinitionPoint(MabeMouserSDK, definition)
  })

  test('definition runner rejects dropped metadata or frames', async () => {
    class IncompleteSDK extends MabeMouserSDK {
      Stream(options?: any): any {
        const entity = super.Stream(options)
        const load = entity.load.bind(entity)
        entity.load = async (...args: any[]) => {
          const loaded = await (load as any)(...args)
          loaded.data(loaded.data().slice(1))
          return loaded
        }
        return entity
      }
    }
    await assert.rejects(runDefinitionPoint(IncompleteSDK, definition),
      (error: any) => error.code === 'ERR_ASSERTION' && /SSE payloads/.test(error.message))
  })
})
