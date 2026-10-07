"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const Fs = __importStar(require("node:fs"));
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const live_runner_1 = require("../../live-runner");
const live_entity_1 = require("../../live-entity");
const __1 = require("../../..");
const utility_1 = require("../../utility");
(0, utility_1.loadEnvLocal)(__dirname + '/../../../.env.local');
(0, node_test_1.describe)('StreamEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when MABE_MOUSER_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('MABE_MOUSER_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.MabeMouserSDK.test();
        const ent = testsdk.Stream();
        (0, node_assert_1.default)(null != ent);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.MabeMouserSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.Stream().load({ "file_id": 1, "filename": "x" }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.MABE_MOUSER_TEST_LIVE;
        for (const op of []) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'stream.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": {}, "name": "stream", "op": { "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /api/files/{lab}/{filename}/stream", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "file_id", "or": "lab", "r": true, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "param", "n": "filename", "or": "filename", "r": true, "t": "`$STRING`", "index$": 1 }], "query": [{ "a": true, "ex": 100, "k": "query", "n": "chunk_size", "or": "chunk_size", "r": false, "t": "`$INTEGER`", "index$": 0 }, { "a": true, "ex": 0, "k": "query", "n": "start_frame", "or": "start_frame", "r": false, "t": "`$INTEGER`", "index$": 1 }] }, "k": "http", "m": "GET", "o": "/api/files/{lab}/{filename}/stream", "q": { "exist": ["file_id", "filename"] }, "r": { "param": { "lab": "file_id" } }, "rs": { "kind": "raw", "media": "text/event-stream" }, "s": [{ "lit": "api" }, { "lit": "files" }, { "var": "file_id" }, { "var": "filename" }, { "lit": "stream" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }], "key$": "load" } }, "relations": { "ancestors": [["$.main.kit.entity.file"]] }, "key$": "stream", "name__orig": "stream", "Name": "Stream", "name_": "stream", "name-": "stream", "NAME": "STREAM", "index$": 8 }, { "active": true, "entity": "stream", "key$": "BasicStreamFlow", "kind": "basic", "name": "BasicStreamFlow", "param": {}, "step": [{ "a": false, "d": {}, "i": { "ref": "stream_ref01", "srcdatavar": "stream_ref01_data", "suffix": "_dt0" }, "m": { "file_id": "file01", "id": "stream01" }, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-stream_ref01" } }], "unreachable": true }] }, 'Stream', { "GET /api/files/{lab}/{filename}/stream": { "protocol": "http", "parameters": [{ "name": "lab", "in": "path", "required": true, "schema": { "type": "string", "title": "Lab" }, "index$": 0 }, { "name": "filename", "in": "path", "required": true, "schema": { "type": "string", "title": "Filename" }, "index$": 1 }, { "name": "start_frame", "in": "query", "required": false, "schema": { "type": "integer", "default": 0, "title": "Start Frame" }, "index$": 2 }, { "name": "chunk_size", "in": "query", "required": false, "schema": { "type": "integer", "default": 100, "title": "Chunk Size" }, "index$": 3 }] } }, { strict: LIVE_STRICT, t });
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        let stream_ref01_data = Object.values(setup.data.existing.stream)[0];
    });
});
// main.kit.test.live.strict is true (the default is true): a live
// request that fails, or a live test missing an input it needs,
// fails the test.
// An account with no record for a test to read skips it either way.
const LIVE_STRICT = true;
function basicSetup(extra) {
    // TODO: fix test def options
    const options = {}; // null
    // TODO: needs test utility to resolve path
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/stream/StreamTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.MabeMouserSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['stream01', 'stream02', 'stream03', 'file01', 'file02', 'file03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    const env = (0, utility_1.envOverride)({
        'MABE_MOUSER_TEST_STREAM_ENTID': idmap,
        'MABE_MOUSER_TEST_LIVE': 'FALSE',
        'MABE_MOUSER_TEST_EXPLAIN': 'FALSE',
        'MABE_MOUSER_SERVER_BASE': "",
    });
    idmap = env['MABE_MOUSER_TEST_STREAM_ENTID'];
    const live = 'TRUE' === env.MABE_MOUSER_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['MABE_MOUSER_TEST_STREAM_ENTID'];
        idmap = rawIds && rawIds.trim() ? JSON.parse(rawIds) : {};
        if (!idmap || Array.isArray(idmap) || typeof idmap !== 'object') {
            throw new Error('Live ENTID must be a JSON object');
        }
        client = new __1.MabeMouserSDK(merge([
            // FIRST, so the generated fields below win: sdk-test-control.json's
            // test.client.options adds to the live client, it does not redirect it.
            (0, utility_1.liveClientOptions)(),
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
        ]));
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
    };
    return setup;
}
//# sourceMappingURL=StreamEntity.test.js.map