#!/usr/bin/env node
'use strict'

// Test the generated SDK against the invented fixture made by create_fixture.py.
// Retain only safe check summaries: never serialize raw responses or errors.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { MabeMouserSDK } = require('../ts/dist/MabeMouserSDK.js')

const argv = process.argv.slice(2)
function option(name, fallback) {
  const index = argv.indexOf(name)
  if (index < 0) return fallback
  if (!argv[index + 1]) throw new Error(`Missing value for ${name}`)
  return argv[index + 1]
}
const base = option('--base', 'http://127.0.0.1:8765')
const output = option('--output', undefined)
const sdk = new MabeMouserSDK({ server: { base } })
const checks = []
const file = { lab: 'synthetic_lab', filename: 'synthetic_video.parquet' }
const nested = { file_id: file.lab, filename: file.filename }
const fileRoute = '/api/files/synthetic_lab/synthetic_video.parquet'

async function data(entity, match) {
  const loaded = await sdk[entity]().load(match)
  assert.equal(typeof loaded?.data, 'function')
  return loaded.data()
}

async function check(name, route, work) {
  try {
    const evidence = await work()
    checks.push({ name, route, result: 'passed', ...(evidence ? { evidence } : {}) })
  } catch (error) {
    // Assertion and SDK messages can contain data or local paths. Only retain
    // known structural fields; unknown strings get a generic failure code.
    const code = typeof error?.code === 'string' && /^[a-z0-9_]+$/i.test(error.code)
      ? error.code : 'check_failed'
    const status = Number.isInteger(error?.status) ? error.status : undefined
    checks.push({ name, route, result: 'failed', error_code: code,
      ...(status === undefined ? {} : { http_status: status }) })
  }
}

async function expectEntityError(entity, match, status) {
  let observed
  try {
    await sdk[entity]().load(match)
  } catch (error) {
    observed = error
  }
  assert.ok(observed)
  assert.equal(observed.status, status)
  return { http_status: status }
}

async function main() {
  await check('health', '/', async () => {
    const value = await data('RootGet')
    assert.equal(value.status, 'running')
    assert.equal(value.data_dir_exists, true)
    return { running: true, synthetic_data_exists: true }
  })
  await check('file listing', '/api/files', async () => {
    const value = await data('File')
    assert.equal(value.total, 1)
    assert.equal(value.labs.synthetic_lab[0].name, file.filename)
    return { files: 1 }
  })
  await check('file frame range', '/api/files/{lab}/{filename}', async () => {
    const value = await data('File', { ...file, start_frame: 1, max_frame: 2 })
    assert.deepEqual(value.frames.map(frame => frame.frame_number), [1, 2])
    assert.equal(value.metadata.total_frames, 6)
    assert.equal(value.metadata.num_mice, 2)
    return { requested_frames: [1, 2], total_frames: 6, mice: 2 }
  })
  await check('single frame', '/api/files/{lab}/{filename}/frame/{frame_number}', async () => {
    const value = await data('Frame', { ...nested, id: 2 })
    assert.equal(value.frame_number, 2)
    assert.deepEqual(Object.keys(value.mice).sort(), ['1', '2'])
    assert.deepEqual(value.mice['1'].points, [[32, 39], [34, 41]])
    return { frame: 2, mice: 2, synthetic_coordinates_verified: true }
  })
  await check('SSE stream through generated load', '/api/files/{lab}/{filename}/stream', async () => {
    // This invokes the generated Stream entity unchanged. If it rejects the
    // actual event-stream content type, that is a failure recorded below.
    const value = await data('Stream', { ...nested, chunk_size: 2 })
    assert.ok(Array.isArray(value.events), 'Expected parsed SSE events')
    assert.equal(value.events[0].metadata.total_frames, 6)
    assert.deepEqual(value.events.slice(1).flatMap(event => event.frames.map(frame => frame.frame_number)),
      [0, 1, 2, 3, 4, 5])
    assert.equal(value.events.at(-1).complete, true)
    return { frames: 6, complete: true }
  })
  await check('analytics overview', '/api/analytics/overview', async () => {
    const value = await data('Overview')
    assert.equal(value.total_sessions, 1)
    assert.equal(value.total_frames, 6)
    assert.equal(value.mice_total, 2)
    return { sessions: 1, frames: 6, mice: 2 }
  })
  await check('analytics heatmap', '/api/analytics/heatmap', async () => {
    const value = await data('Heatmap', { target_point: 10 })
    assert.equal(value.total_points, 10)
    assert.equal(value.sessions_processed, 1)
    assert.ok(value.points.every(point => point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1))
    return { points: 10, normalized_coordinates: true }
  })
  await check('analytics activity', '/api/analytics/activity', async () => {
    const value = await data('Activity', { bin: 3, target_session: 1 })
    assert.equal(value.sessions_processed, 1)
    assert.equal(value.bins, 3)
    assert.equal(value.total_points, 3)
    return { sessions: 1, bins: 3, points: 3 }
  })
  await check('analytics social', '/api/analytics/social', async () => {
    const value = await data('Social')
    assert.equal(value.nodes.length, 2)
    assert.equal(value.edges.length, 1)
    assert.equal(value.edges[0].weight, 1)
    return { nodes: 2, edges: 1, edge_weight: 1 }
  })
  await check('analytics browser', '/api/analytics/browser', async () => {
    const value = await data('Browser')
    assert.equal(value.total_count, 1)
    assert.equal(value.sessions[0].video_id, 'synthetic_video')
    assert.equal(value.sessions[0].mice_count, 2)
    return { sessions: 1, mice: 2 }
  })
  await check('missing file 404', '/api/files/{lab}/{filename}', () =>
    expectEntityError('File', { ...file, filename: 'missing.parquet' }, 404))
  await check('missing frame 404', '/api/files/{lab}/{filename}/frame/{frame_number}', () =>
    expectEntityError('Frame', { ...nested, id: 999 }, 404))
  await check('invalid frame 422 through SDK direct', '/api/files/{lab}/{filename}/frame/{frame_number}', async () => {
    const value = await sdk.direct({ path: fileRoute + '/frame/invalid' })
    assert.equal(value.ok, false)
    assert.equal(value.status, 422)
    return { http_status: 422 }
  })

  const counts = {
    passed: checks.filter(check => check.result === 'passed').length,
    failed: checks.filter(check => check.result === 'failed').length,
    unrun: 0,
  }
  const report = {
    checked_at_utc: new Date().toISOString(),
    node_version: process.version,
    fixture: 'synthetic only: 24 tracking rows, 6 frames, 2 mice',
    checks,
    counts,
  }
  const serialized = JSON.stringify(report, null, 2) + '\n'
  if (output) {
    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true })
    fs.writeFileSync(output, serialized, 'utf8')
  }
  process.stdout.write(serialized)
  process.exitCode = counts.failed ? 1 : 0
}

main().catch(() => {
  // Fatal setup failures also omit potentially sensitive exception strings.
  process.stderr.write('SDK validation could not start. Build ts/ and run the synthetic API first.\n')
  process.exitCode = 2
})
