

import Path from 'node:path'
import * as Fs from 'node:fs'

import { test, describe, afterEach } from 'node:test'
import assert from 'node:assert'
import { createLiveTransport } from '../../live-runner'
import { runLiveEntity } from '../../live-entity'


import { MabeMouserSDK, BaseFeature, config, stdutil } from '../../..'

import {
  envOverride,
  liveClientOptions,
  liveDelay,
  loadEnvLocal,
  makeCtrl,
  makeMatch,
  makeReqdata,
  makeStepData,
  makeValid,
  maybeSkipControl,
} from '../../utility'


loadEnvLocal(__dirname + '/../../../.env.local')


describe('StreamEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when MABE_MOUSER_TEST_LIVE=TRUE.
  afterEach(liveDelay('MABE_MOUSER_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = MabeMouserSDK.test()
    const ent = testsdk.Stream()
    assert(null != ent)
  })


  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = MabeMouserSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Stream().load({"file_id":1,"filename":"x"} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.MABE_MOUSER_TEST_LIVE
    for (const op of []) {
      if (!live && maybeSkipControl(t, 'entityOp', 'stream.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{},"name":"stream","op":{"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /api/files/{lab}/{filename}/stream","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"file_id","or":"lab","r":true,"t":"`$STRING`","index$":0},{"a":true,"k":"param","n":"filename","or":"filename","r":true,"t":"`$STRING`","index$":1}],"query":[{"a":true,"ex":100,"k":"query","n":"chunk_size","or":"chunk_size","r":false,"t":"`$INTEGER`","index$":0},{"a":true,"ex":0,"k":"query","n":"start_frame","or":"start_frame","r":false,"t":"`$INTEGER`","index$":1}]},"k":"http","m":"GET","o":"/api/files/{lab}/{filename}/stream","q":{"exist":["file_id","filename"]},"r":{"param":{"lab":"file_id"}},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"api"},{"lit":"files"},{"var":"file_id"},{"var":"filename"},{"lit":"stream"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[["$.main.kit.entity.file"]]},"key$":"stream","name__orig":"stream","Name":"Stream","name_":"stream","name-":"stream","NAME":"STREAM","index$":8}, {"active":true,"entity":"stream","key$":"BasicStreamFlow","kind":"basic","name":"BasicStreamFlow","param":{},"step":[{"a":false,"d":{},"i":{"ref":"stream_ref01","srcdatavar":"stream_ref01_data","suffix":"_dt0"},"m":{"file_id":"file01","id":"stream01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-stream_ref01"}}],"unreachable":true}]}, 'Stream', {"GET /api/files/{lab}/{filename}/stream":{"protocol":"http","parameters":[{"name":"lab","in":"path","required":true,"schema":{"type":"string","title":"Lab"},"index$":0},{"name":"filename","in":"path","required":true,"schema":{"type":"string","title":"Filename"},"index$":1},{"name":"start_frame","in":"query","required":false,"schema":{"type":"integer","default":0,"title":"Start Frame"},"index$":2},{"name":"chunk_size","in":"query","required":false,"schema":{"type":"integer","default":100,"title":"Chunk Size"},"index$":3}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let stream_ref01_data = Object.values(setup.data.existing.stream)[0] as any

  })
})



// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true

function basicSetup(extra?: any) {
  // TODO: fix test def options
  const options: any = {} // null

  // TODO: needs test utility to resolve path
  const entityDataFile =
    Path.resolve(__dirname, 
      '../../../../.sdk/test/entity/stream/StreamTestData.json')

  // TODO: file ready util needed?
  const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8')

  // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
  const entityData = JSON.parse(entityDataSource)

  options.entity = entityData.existing

  let client = MabeMouserSDK.test(options, extra)
  const struct = client.utility().struct
  const merge = struct.merge
  const transform = struct.transform

  let idmap = transform(
    ['stream01','stream02','stream03','file01','file02','file03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'MABE_MOUSER_TEST_STREAM_ENTID': idmap,
    'MABE_MOUSER_TEST_LIVE': 'FALSE',
    'MABE_MOUSER_TEST_EXPLAIN': 'FALSE',
    'MABE_MOUSER_SERVER_BASE': "",
  })

  idmap = env['MABE_MOUSER_TEST_STREAM_ENTID']

  const live = 'TRUE' === env.MABE_MOUSER_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['MABE_MOUSER_TEST_STREAM_ENTID']
    idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {}
    if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
      throw new Error('Live ENTID must be a JSON object')
    }
    client = new MabeMouserSDK(merge([
      // FIRST, so the generated fields below win: sdk-test-control.json's
      // test.client.options adds to the live client, it does not redirect it.
      liveClientOptions(),
      {
        server: {
          base: env.MABE_MOUSER_SERVER_BASE,
        },
      },
      // 'extra || {}', not a bare 'extra': struct.merge returns UNDEFINED when the
      // last entry is undefined, and basicSetup is normally called with no
      // argument at all - so a bare 'extra' silently discarded the apikey
      // and server values above and handed the SDK undefined. Harmless
      // while there was nothing in that object; not harmless now.
      extra || {},
      { system: { fetch: transport.fetch } }
    ]))
  }

  const setup = {
    idmap,
    env,
    options,
    client,
    struct,
    data: entityData,
    explain: 'TRUE' === env.MABE_MOUSER_TEST_EXPLAIN,
    live,
    transport,
    now: Date.now(),
  }

  return setup
}
  
