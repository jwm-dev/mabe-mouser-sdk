#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')

if (process.platform !== 'win32') {
  console.log('multisource workaround: skipped (Windows only)')
  process.exit(0)
}

const sdkRequire = createRequire(path.join(__dirname, '..', '.sdk', 'package.json'))
const packageRoot = path.dirname(path.dirname(sdkRequire.resolve('@tabnas/multisource')))
const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'))
const expectedVersion = '0.5.8'

if (metadata.name !== '@tabnas/multisource' || metadata.version !== expectedVersion) {
  throw new Error(`Review workaround before use: expected @tabnas/multisource ${expectedVersion}, got ${metadata.name} ${metadata.version}`)
}

const resolverPath = path.join(packageRoot, 'dist', 'resolver', 'file.js')
const original = 'const P = null != ctx.meta?.fs ? Path.posix : Path;'
const replacement = 'const P = null != ctx.meta?.fs && fs.readFileSync !== SystemFs.readFileSync ? Path.posix : Path;'
const source = fs.readFileSync(resolverPath, 'utf8')
const occurrences = (text) => source.split(text).length - 1

if (occurrences(replacement) === 1 && occurrences(original) === 0) {
  console.log(`multisource workaround: already applied (@tabnas/multisource ${expectedVersion})`)
  process.exit(0)
}

if (occurrences(original) !== 1 || occurrences(replacement) !== 0) {
  throw new Error('Review workaround before use: resolver source does not match the known Windows defect')
}

// The model passes a real-fs copy; only memory filesystems need POSIX paths.
fs.writeFileSync(resolverPath, source.replace(original, replacement), 'utf8')
console.log(`multisource workaround: applied (@tabnas/multisource ${expectedVersion})`)
