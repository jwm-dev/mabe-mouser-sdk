

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


describe('ActivityEntity', async () => {

  // Per-test live pacing. Delay is read from sdk-test-control.json's
  // `test.live.delayMs`; only sleeps when MABE_MOUSER_TEST_LIVE=TRUE.
  afterEach(liveDelay('MABE_MOUSER_TEST_LIVE'))

  test('instance', async () => {
    const testsdk = MabeMouserSDK.test()
    const ent = testsdk.Activity()
    assert(null != ent)
  })


  test('validate', async (t) => {
    if (null == (config as any).feature?.validate) {
      t.skip('feature not present in this SDK: validate')
      return
    }
    const client = MabeMouserSDK.test(undefined, { feature: { validate: { active: true } } })
    await assert.rejects(client.Activity().load({"bin":"x"} as any),
      (err: any) => 'validate_failed' === err.code)
  })



  test('basic', async (t) => {

    const live = 'TRUE' === process.env.MABE_MOUSER_TEST_LIVE
    for (const op of ['load']) {
      if (!live && maybeSkipControl(t, 'entityOp', 'activity.' + op, live)) return
    }

    
    const setup = basicSetup()
    if (setup.live) {
      return runLiveEntity(setup, {"active":true,"alias":{"field":{}},"fields":{},"name":"activity","op":{"load":{"input":"data","name":"load","points":[{"a":true,"co":{"id":"GET /api/analytics/activity","source":"openapi3","version":2},"g":{"query":[{"a":true,"ex":100,"k":"query","n":"bin","or":"bins","r":false,"t":"`$INTEGER`","index$":0},{"a":true,"ex":100,"k":"query","n":"target_session","or":"target_sessions","r":false,"t":"`$INTEGER`","index$":1}]},"k":"http","m":"GET","o":"/api/analytics/activity","q":{},"r":{},"rs":{"kind":"json","media":"application/json"},"s":[{"lit":"api"},{"lit":"analytics"},{"lit":"activity"}],"t":{"req":"`reqdata`","res":"`body`"},"index$":0}],"key$":"load"}},"relations":{"ancestors":[]},"key$":"activity","name__orig":"activity","Name":"Activity","name_":"activity","name-":"activity","NAME":"ACTIVITY","index$":0}, {"active":true,"entity":"activity","key$":"BasicActivityFlow","kind":"basic","name":"BasicActivityFlow","param":{},"step":[{"a":true,"d":{},"i":{"ref":"activity_ref01","srcdatavar":"activity_ref01_data","suffix":"_dt0"},"m":{},"o":"load","s":[],"v":[{"apply":"TextFieldMark","def":{"mark":"Mark01-activity_ref01"}}]}]}, 'Activity', {"GET /api/analytics/activity":{"protocol":"http","parameters":[{"name":"target_sessions","in":"query","required":false,"schema":{"type":"integer","default":100,"title":"Target Sessions"},"index$":0},{"name":"bins","in":"query","required":false,"schema":{"type":"integer","default":100,"title":"Bins"},"index$":1}]}}, { strict: LIVE_STRICT, t })
    }
    const client = setup.client
    const struct = setup.struct

    const isempty = struct.isempty
    const select = struct.select

    let activity_ref01_data = Object.values(setup.data.existing.activity)[0] as any

    // LOAD
    const activity_ref01_ent = client.Activity()
    const activity_ref01_match_dt0: any = {}
    const activity_ref01_data_dt0 = (await activity_ref01_ent.load(activity_ref01_match_dt0)).data()
    assert(null != activity_ref01_data_dt0)


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
      '../../../../.sdk/test/entity/activity/ActivityTestData.json')

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
    ['activity01','activity02','activity03'],
    {
      '`$PACK`': ['', {
        '`$KEY`': '`$COPY`',
        '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
      }]
    })

  const env = envOverride({
    'MABE_MOUSER_TEST_ACTIVITY_ENTID': idmap,
    'MABE_MOUSER_TEST_LIVE': 'FALSE',
    'MABE_MOUSER_TEST_EXPLAIN': 'FALSE',
    'MABE_MOUSER_SERVER_BASE': "",
  })

  idmap = env['MABE_MOUSER_TEST_ACTIVITY_ENTID']

  const live = 'TRUE' === env.MABE_MOUSER_TEST_LIVE

  const transport = createLiveTransport()
  if (live) {
    const rawIds = process.env['MABE_MOUSER_TEST_ACTIVITY_ENTID']
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
  
