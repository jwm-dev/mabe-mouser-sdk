

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


describe('FrameEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when MABE_MOUSER_TEST_LIVE=TRUE.
  afterEach(liveDelay('MABE_MOUSER_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = MabeMouserSDK.test()
    const ent = testsdk.Frame()
    assert(null != ent)
  })


  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = MabeMouserSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Frame().load({"file_id":1,"filename":"x","id":1} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.MABE_MOUSER_TEST_LIVE
    for (const op of ['load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'frame.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{"id":{"a":true,"h":"Id","n":"id","r":false,"t":"`$STRING`","key$":"id","index$":0}},"id":{"field":"id","name":"id"},"name":"frame","op":{"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /api/files/{lab}/{filename}/frame/{frame_number}","source":"openapi3","version":2},"g":{"params":[{"a":true,"k":"param","n":"file_id","or":"lab","r":true,"t":"`$STRING`","index$":0},{"a":true,"k":"param","n":"filename","or":"filename","r":true,"t":"`$STRING`","index$":1},{"a":true,"k":"param","n":"id","or":"frame_number","r":true,"t":"`$INTEGER`","index$":2}]},"k":"http","m":"GET","o":"/api/files/{lab}/{filename}/frame/{frame_number}","q":{"exist":["file_id","filename","id"]},"r":{"param":{"frame_number":"id","lab":"file_id"}},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"api"},{"lit":"files"},{"var":"file_id"},{"var":"filename"},{"lit":"frame"},{"var":"id"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[["$.main.kit.entity.file"]]},"key$":"frame","name__orig":"frame","Name":"Frame","name_":"frame","name-":"frame","NAME":"FRAME","index$":3}, {"active":true,"entity":"frame","key$":"BasicFrameFlow","kind":"basic","name":"BasicFrameFlow","param":{},"step":[{"a":true,"d":{},"i":{"ref":"frame_ref01","srcdatavar":"frame_ref01_data","suffix":"_dt0"},"m":{"file_id":"file01","filename":"filename01","id":"frame01"},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-frame_ref01"}}]}]}, 'Frame', {"GET /api/files/{lab}/{filename}/frame/{frame_number}":{"protocol":"http","parameters":[{"name":"lab","in":"path","required":true,"schema":{"type":"string","title":"Lab"},"index$":0},{"name":"filename","in":"path","required":true,"schema":{"type":"string","title":"Filename"},"index$":1},{"name":"frame_number","in":"path","required":true,"schema":{"type":"integer","title":"Frame Number"},"index$":2}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let frame_ref01_data = Object.values(setup.data.existing.frame)[0] as any

    // LOAD
    const frame_ref01_ent = client.Frame()
    const frame_ref01_match_dt0: any = {}
    frame_ref01_match_dt0["file_id"] = setup.idmap["file01"]
    frame_ref01_match_dt0["filename"] = setup.idmap["filename01"]
    frame_ref01_match_dt0["id"] = setup.idmap["frame01"]
    frame_ref01_match_dt0.id = frame_ref01_data.id
    const frame_ref01_data_dt0 = (await frame_ref01_ent.load(frame_ref01_match_dt0)).data()
    assert(frame_ref01_data_dt0.id === frame_ref01_data.id)


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
      '../../../../.sdk/test/entity/frame/FrameTestData.json')

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
    ['frame01','frame02','frame03','file01','file02','file03','filename01'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'MABE_MOUSER_TEST_FRAME_ENTID': idmap,
    'MABE_MOUSER_TEST_LIVE': 'FALSE',
    'MABE_MOUSER_TEST_EXPLAIN': 'FALSE',
    'MABE_MOUSER_SERVER_BASE': "",
  })

  idmap = env['MABE_MOUSER_TEST_FRAME_ENTID']

  const live = 'TRUE' === env.MABE_MOUSER_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['MABE_MOUSER_TEST_FRAME_ENTID']
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
  
