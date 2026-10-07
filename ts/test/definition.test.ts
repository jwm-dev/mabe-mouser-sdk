import { describe, test } from 'node:test'
import { SDK } from '..'
import { runDefinitionPoint } from './definition-runner'
import { isControlSkipped } from './utility'


// Generated from the API definition, not from the model this SDK was built
// from: the route, the declared query parameters, the credential the security
// scheme names, and the definition's own response example.
const PLAN: any[] = [
  {
    "entity": "activity",
    "accessor": "Activity",
    "op": "load",
    "method": "GET",
    "path": "/api/analytics/activity",
    "args": [],
    "select": {
      "bin": 100,
      "target_session": 100
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "target_sessions",
      "bins"
    ],
    "queryArgs": [
      {
        "name": "bin",
        "wire": "bins"
      },
      {
        "name": "target_session",
        "wire": "target_sessions"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "browser",
    "accessor": "Browser",
    "op": "load",
    "method": "GET",
    "path": "/api/analytics/browser",
    "args": [],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "file",
    "accessor": "File",
    "op": "load",
    "method": "GET",
    "path": "/api/files/{lab}/{filename}",
    "args": [
      {
        "name": "filename",
        "wire": "filename",
        "value": "p1"
      },
      {
        "name": "lab",
        "wire": "lab",
        "value": "p2"
      }
    ],
    "select": {
      "max_frame": 1000,
      "start_frame": 0
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "start_frame",
      "max_frames"
    ],
    "queryArgs": [
      {
        "name": "max_frame",
        "wire": "max_frames"
      },
      {
        "name": "start_frame",
        "wire": "start_frame"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "file",
    "accessor": "File",
    "op": "load",
    "method": "GET",
    "path": "/api/files",
    "args": [],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": {},
    "idField": "id"
  },
  {
    "entity": "frame",
    "accessor": "Frame",
    "op": "load",
    "method": "GET",
    "path": "/api/files/{lab}/{filename}/frame/{frame_number}",
    "args": [
      {
        "name": "file_id",
        "wire": "lab",
        "value": "p1"
      },
      {
        "name": "filename",
        "wire": "filename",
        "value": "p2"
      },
      {
        "name": "id",
        "wire": "frame_number",
        "value": "p3"
      }
    ],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "heatmap",
    "accessor": "Heatmap",
    "op": "load",
    "method": "GET",
    "path": "/api/analytics/heatmap",
    "args": [],
    "select": {
      "target_point": 500000
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [
      "target_points"
    ],
    "queryArgs": [
      {
        "name": "target_point",
        "wire": "target_points"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "overview",
    "accessor": "Overview",
    "op": "load",
    "method": "GET",
    "path": "/api/analytics/overview",
    "args": [],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "root_get",
    "accessor": "RootGet",
    "op": "load",
    "method": "GET",
    "path": "/",
    "args": [],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "social",
    "accessor": "Social",
    "op": "load",
    "method": "GET",
    "path": "/api/analytics/social",
    "args": [],
    "select": {},
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "application/json"
    ],
    "query": [],
    "queryArgs": [],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  },
  {
    "entity": "stream",
    "accessor": "Stream",
    "op": "load",
    "method": "GET",
    "path": "/api/files/{lab}/{filename}/stream",
    "args": [
      {
        "name": "file_id",
        "wire": "lab",
        "value": "p1"
      },
      {
        "name": "filename",
        "wire": "filename",
        "value": "p2"
      }
    ],
    "select": {
      "chunk_size": 100,
      "start_frame": 0
    },
    "headers": [],
    "cookies": [],
    "responseMedia": [
      "text/event-stream"
    ],
    "query": [
      "start_frame",
      "chunk_size"
    ],
    "queryArgs": [
      {
        "name": "chunk_size",
        "wire": "chunk_size"
      },
      {
        "name": "start_frame",
        "wire": "start_frame"
      }
    ],
    "auth": null,
    "status": 200,
    "sample": null,
    "idField": "id"
  }
]


describe('definition', () => {
  for (const point of PLAN) {
    test(point.entity + '.' + point.op + ' ' + point.method + ' ' + point.path, async (t) => {
      const control = isControlSkipped('entityOp', point.entity + '.' + point.op, 'definition')
      if (control.skip) {
        t.skip(control.reason || 'skipped via sdk-test-control.json')
        return
      }
      await runDefinitionPoint(SDK, point)
    })
  }
})
