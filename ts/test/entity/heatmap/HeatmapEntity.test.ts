

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


describe('HeatmapEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when MABE_MOUSER_TEST_LIVE=TRUE.
  afterEach(liveDelay('MABE_MOUSER_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = MabeMouserSDK.test()
    const ent = testsdk.Heatmap()
    assert(null != ent)
  })


  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = MabeMouserSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Heatmap().load({"target_point":"x"} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.MABE_MOUSER_TEST_LIVE
    for (const op of ['load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'heatmap.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{},"name":"heatmap","op":{"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /api/analytics/heatmap","source":"openapi3","version":2},"g":{"query":[{"a":true,"ex":500000,"k":"query","n":"target_point","or":"target_points","r":false,"t":"`$INTEGER`","index$":0}]},"k":"http","m":"GET","o":"/api/analytics/heatmap","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"api"},{"lit":"analytics"},{"lit":"heatmap"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"heatmap","name__orig":"heatmap","Name":"Heatmap","name_":"heatmap","name-":"heatmap","NAME":"HEATMAP","index$":4}, {"active":true,"entity":"heatmap","key$":"BasicHeatmapFlow","kind":"basic","name":"BasicHeatmapFlow","param":{},"step":[{"a":true,"d":{},"i":{"ref":"heatmap_ref01","srcdatavar":"heatmap_ref01_data","suffix":"_dt0"},"m":{},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-heatmap_ref01"}}]}]}, 'Heatmap', {"GET /api/analytics/heatmap":{"protocol":"http","parameters":[{"name":"target_points","in":"query","required":false,"schema":{"type":"integer","default":500000,"title":"Target Points"},"index$":0}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let heatmap_ref01_data = Object.values(setup.data.existing.heatmap)[0] as any

    // LOAD
    const heatmap_ref01_ent = client.Heatmap()
    const heatmap_ref01_match_dt0: any = {}
    const heatmap_ref01_data_dt0 = (await heatmap_ref01_ent.load(heatmap_ref01_match_dt0)).data()
    assert(null != heatmap_ref01_data_dt0)


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
      '../../../../.sdk/test/entity/heatmap/HeatmapTestData.json')

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
    ['heatmap01','heatmap02','heatmap03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'MABE_MOUSER_TEST_HEATMAP_ENTID': idmap,
    'MABE_MOUSER_TEST_LIVE': 'FALSE',
    'MABE_MOUSER_TEST_EXPLAIN': 'FALSE',
    'MABE_MOUSER_SERVER_BASE': "",
  })

  idmap = env['MABE_MOUSER_TEST_HEATMAP_ENTID']

  const live = 'TRUE' === env.MABE_MOUSER_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['MABE_MOUSER_TEST_HEATMAP_ENTID']
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
  
