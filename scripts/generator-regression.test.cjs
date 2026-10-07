'use strict'

// Run after `cd .sdk && npm ci && npm run build`.
// Exercise the real component and execute its emitted basic test, rather
// than asserting a copy of the implementation or editing generated files.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const Fs = require('node:fs')
const Os = require('node:os')
const Path = require('node:path')
const Vm = require('node:vm')
const { createRequire } = require('node:module')

const root = Path.resolve(__dirname, '..')
const sdkRequire = createRequire(Path.join(root, '.sdk/package.json'))
const { Jostraca } = sdkRequire('jostraca')
const { cmp, names } = sdkRequire('@voxgig/sdkgen')
const targetRequire = createRequire(Path.join(root, 'ts/package.json'))
const TypeScript = targetRequire('typescript')
const { TestEntity } = require('../.sdk/dist/cmp/ts/TestEntity_ts.js')

async function renderBasic(model) {
  const folder = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'mabe-generator-test-'))
  try {
    model.const = { name: model.name }
    names(model.const, model.name)
    const Root = cmp(function RegressionRoot(props) {
      const ctx = props.ctx$
      ctx.stdrep = {}
      names(ctx.stdrep, model.Name, 'ProjectName')
      TestEntity({ target: model.main.kit.target.ts, entity: model.main.kit.entity.frame })
    })
    await Jostraca().generate({ folder, model }, () => Root({}))
    const source = Fs.readFileSync(Path.join(folder, 'frame/FrameEntity.test.ts'), 'utf8')
    const basic = source.match(/test\('basic', async \(t\) => \{([\s\S]*?)\n  \}\)\n\}\)/)
    assert.ok(basic, 'the component emits a runnable basic test')
    return TypeScript.transpileModule(
      'globalThis.runBasic = async (t) => {' + basic[1] + '\n}',
      { compilerOptions: { target: TypeScript.ScriptTarget.ES2021 } }
    ).outputText
  } finally {
    Fs.rmSync(folder, { recursive: true, force: true })
  }
}

function readModel() {
  return JSON.parse(Fs.readFileSync(Path.join(root, '.sdk/model/sdk.json'), 'utf8'))
}

async function runBasic(source, idmap, record) {
  const matches = []
  const setup = {
    live: false,
    data: { existing: { frame: { [record.id]: record } } },
    idmap,
    struct: {},
    client: {
      Frame: () => ({
        load: async (match) => {
          matches.push({ ...match })
          return { data: () => ({ ...record }) }
        },
      }),
    },
  }
  const sandbox = {
    process: { env: {} },
    assert,
    maybeSkipControl: () => false,
    basicSetup: () => setup,
  }
  Vm.createContext(sandbox)
  Vm.runInContext(source, sandbox)
  await sandbox.runBasic({ skip: () => assert.fail('basic test must run') })
  return matches
}

test('generated nested Frame load includes both parent bindings and the fixture id', async () => {
  const source = await renderBasic(readModel())
  const matches = await runBasic(source, {
    file01: 'lab with spaces',
    filename01: 'different-video.parquet',
    frame01: 'an id that must not replace the fixture id',
  }, { id: 'FRAME_FROM_FIXTURE' })
  assert.deepEqual(matches, [{
    file_id: 'lab with spaces',
    filename: 'different-video.parquet',
    id: 'FRAME_FROM_FIXTURE',
  }])
})

test('generated load follows changed flow reference names and rejects a wrong returned id', async () => {
  const model = readModel()
  model.main.kit.flow.BasicFrameFlow.step[0].m.file_id = 'another_parent'
  model.main.kit.flow.BasicFrameFlow.step[0].m.filename = 'another_filename'
  const source = await renderBasic(model)
  const matches = await runBasic(source, {
    another_parent: 'second-lab',
    another_filename: 'second.parquet',
    file01: 'wrong-lab',
    filename01: 'wrong.parquet',
  }, { id: 'FRAME02' })
  assert.deepEqual(matches, [{ file_id: 'second-lab', filename: 'second.parquet', id: 'FRAME02' }])

  // Keep the existing ID assertion meaningful: it must fail if load returns
  // a different record, even when all request parameters are present.
  const sandbox = {
    process: { env: {} },
    assert,
    maybeSkipControl: () => false,
    basicSetup: () => ({
      live: false,
      idmap: { another_parent: 'second-lab', another_filename: 'second.parquet' },
      struct: {},
      data: { existing: { frame: { FRAME02: { id: 'FRAME02' } } } },
      client: { Frame: () => ({ load: async () => ({ data: () => ({ id: 'WRONG' }) }) }) },
    }),
  }
  Vm.createContext(sandbox)
  Vm.runInContext(source, sandbox)
  await assert.rejects(sandbox.runBasic({}), { code: 'ERR_ASSERTION' })
})
