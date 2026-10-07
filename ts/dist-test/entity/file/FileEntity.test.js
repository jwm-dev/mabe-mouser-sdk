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
(0, node_test_1.describe)('FileEntity', async () => {
    // Per-test live pacing. Delay is read from sdk-test-control.json's
    // `test.live.delayMs`; only sleeps when MABE_MOUSER_TEST_LIVE=TRUE.
    (0, node_test_1.afterEach)((0, utility_1.liveDelay)('MABE_MOUSER_TEST_LIVE'));
    (0, node_test_1.test)('instance', async () => {
        const testsdk = __1.MabeMouserSDK.test();
        const ent = testsdk.File();
        (0, node_assert_1.default)(null != ent);
    });
    (0, node_test_1.test)('validate', async (t) => {
        if (null == __1.config.feature?.validate) {
            t.skip('feature not present in this SDK: validate');
            return;
        }
        const client = __1.MabeMouserSDK.test(undefined, { feature: { validate: { active: true } } });
        await node_assert_1.default.rejects(client.File().load({ "filename": 1, "lab": "x" }), (err) => 'validate_failed' === err.code);
    });
    (0, node_test_1.test)('basic', async (t) => {
        const live = 'TRUE' === process.env.MABE_MOUSER_TEST_LIVE;
        for (const op of ['load']) {
            if (!live && (0, utility_1.maybeSkipControl)(t, 'entityOp', 'file.' + op, live))
                return;
        }
        const setup = basicSetup();
        if (setup.live) {
            return (0, live_entity_1.runLiveEntity)(setup, { "active": true, "alias": { "field": {} }, "fields": { "id": { "a": true, "h": "Id", "n": "id", "r": false, "t": "`$STRING`", "key$": "id", "index$": 0 } }, "id": { "field": "id", "name": "id", "parts": ["lab", "filename"], "sep": "/" }, "name": "file", "op": { "load": { "input": "data", "name": "load", "points": [{ "a": true, "co": { "id": "GET /api/files/{lab}/{filename}", "source": "openapi3", "version": 2 }, "g": { "params": [{ "a": true, "k": "param", "n": "filename", "or": "filename", "r": true, "t": "`$STRING`", "index$": 0 }, { "a": true, "k": "param", "n": "lab", "or": "lab", "r": true, "t": "`$STRING`", "index$": 1 }], "query": [{ "a": true, "ex": 1000, "k": "query", "n": "max_frame", "or": "max_frames", "r": false, "t": "`$INTEGER`", "index$": 0 }, { "a": true, "ex": 0, "k": "query", "n": "start_frame", "or": "start_frame", "r": false, "t": "`$INTEGER`", "index$": 1 }] }, "k": "http", "m": "GET", "o": "/api/files/{lab}/{filename}", "q": { "exist": ["filename", "lab"] }, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "api" }, { "lit": "files" }, { "var": "lab" }, { "var": "filename" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 0 }, { "a": true, "co": { "id": "GET /api/files", "source": "openapi3", "version": 2 }, "g": {}, "k": "http", "m": "GET", "o": "/api/files", "q": {}, "r": {}, "rs": { "kind": "json", "media": "application/json" }, "s": [{ "lit": "api" }, { "lit": "files" }], "t": { "req": "`reqdata`", "res": "`body`" }, "index$": 1 }], "key$": "load" } }, "relations": { "ancestors": [] }, "key$": "file", "name__orig": "file", "Name": "File", "name_": "file", "name-": "file", "NAME": "FILE", "index$": 2 }, { "active": true, "entity": "file", "key$": "BasicFileFlow", "kind": "basic", "name": "BasicFileFlow", "param": {}, "step": [{ "a": true, "d": {}, "i": { "ref": "file_ref01", "srcdatavar": "file_ref01_data", "suffix": "_dt0" }, "m": {}, "o": "load", "s": [], "v": [{ "apply": "TextFieldMark", "def": { "mark": "Mark01-file_ref01" } }] }] }, 'File', { "GET /api/files/{lab}/{filename}": { "protocol": "http", "parameters": [{ "name": "lab", "in": "path", "required": true, "schema": { "type": "string", "title": "Lab" }, "index$": 0 }, { "name": "filename", "in": "path", "required": true, "schema": { "type": "string", "title": "Filename" }, "index$": 1 }, { "name": "start_frame", "in": "query", "required": false, "schema": { "type": "integer", "default": 0, "title": "Start Frame" }, "index$": 2 }, { "name": "max_frames", "in": "query", "required": false, "schema": { "type": "integer", "default": 1000, "title": "Max Frames" }, "index$": 3 }] }, "GET /api/files": { "protocol": "http", "parameters": [] } }, { strict: LIVE_STRICT, t });
        }
        const client = setup.client;
        const struct = setup.struct;
        const isempty = struct.isempty;
        const select = struct.select;
        let file_ref01_data = Object.values(setup.data.existing.file)[0];
        // LOAD
        const file_ref01_ent = client.File();
        const file_ref01_match_dt0 = {};
        file_ref01_match_dt0.id = file_ref01_data.id;
        const file_ref01_data_dt0 = (await file_ref01_ent.load(file_ref01_match_dt0)).data();
        (0, node_assert_1.default)(file_ref01_data_dt0.id === file_ref01_data.id);
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
    const entityDataFile = node_path_1.default.resolve(__dirname, '../../../../.sdk/test/entity/file/FileTestData.json');
    // TODO: file ready util needed?
    const entityDataSource = Fs.readFileSync(entityDataFile).toString('utf8');
    // TODO: need a xlang JSON parse utility in voxgig/struct with better error msgs
    const entityData = JSON.parse(entityDataSource);
    options.entity = entityData.existing;
    let client = __1.MabeMouserSDK.test(options, extra);
    const struct = client.utility().struct;
    const merge = struct.merge;
    const transform = struct.transform;
    let idmap = transform(['file01', 'file02', 'file03'], {
        '`$PACK`': ['', {
                '`$KEY`': '`$COPY`',
                '`$VAL`': ['`$FORMAT`', 'upper', '`$COPY`']
            }]
    });
    const env = (0, utility_1.envOverride)({
        'MABE_MOUSER_TEST_FILE_ENTID': idmap,
        'MABE_MOUSER_TEST_LIVE': 'FALSE',
        'MABE_MOUSER_TEST_EXPLAIN': 'FALSE',
        'MABE_MOUSER_SERVER_BASE': "",
    });
    idmap = env['MABE_MOUSER_TEST_FILE_ENTID'];
    const live = 'TRUE' === env.MABE_MOUSER_TEST_LIVE;
    const transport = (0, live_runner_1.createLiveTransport)();
    if (live) {
        const rawIds = process.env['MABE_MOUSER_TEST_FILE_ENTID'];
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
//# sourceMappingURL=FileEntity.test.js.map