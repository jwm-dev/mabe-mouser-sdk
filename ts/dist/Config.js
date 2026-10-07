"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEATURE_PLUGINS = exports.config = void 0;
const TestFeature_1 = require("./feature/test/TestFeature");
const FEATURE_CLASS = {
    test: TestFeature_1.TestFeature,
};
const FEATURE_PLUGINS = {};
exports.FEATURE_PLUGINS = FEATURE_PLUGINS;
class Config {
    makeFeature(fn) {
        const fc = FEATURE_CLASS[fn];
        const fi = new fc();
        return fi;
    }
    // False for a feature added at runtime via options.extend (station's
    // adopt path) - the constructor uses this to skip makeFeature for names
    // no generated class backs.
    hasFeature(fn) {
        return null != FEATURE_CLASS[fn];
    }
    main = {
        name: 'MabeMouser',
        slug: "mabe-mouser",
        version: "0.0.1",
        target: "ts",
    };
    feature = {
        test: {
            "options": {
                "active": false
            },
            "optspec": {
                "entity": "`$MAP`",
                "net": "`$MAP`"
            },
            "strict": false,
            "transport": "base"
        },
    };
    options = {
        base: "{base}",
        server: {
            "base": "",
        },
        headers: {
            "content-type": "application/json"
        },
        entity: {
            activity: {},
            browser: {},
            file: {},
            frame: {},
            heatmap: {},
            overview: {},
            root_get: {},
            social: {},
            stream: {},
        }
    };
    entity = {
        "activity": {
            "fields": [],
            "name": "activity",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/analytics/activity",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "analytics"
                                },
                                {
                                    "lit": "activity"
                                }
                            ],
                            "parts": [
                                "api",
                                "analytics",
                                "activity"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "query": [
                                    {
                                        "name": "bin",
                                        "orig": "bins",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 100
                                    },
                                    {
                                        "name": "target_session",
                                        "orig": "target_sessions",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 100
                                    }
                                ]
                            },
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "browser": {
            "fields": [],
            "name": "browser",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/analytics/browser",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "analytics"
                                },
                                {
                                    "lit": "browser"
                                }
                            ],
                            "parts": [
                                "api",
                                "analytics",
                                "browser"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "file": {
            "fields": [
                {
                    "name": "id",
                    "title": "Id",
                    "type": "`$STRING`"
                }
            ],
            "id": {
                "field": "id",
                "name": "id",
                "parts": [
                    "lab",
                    "filename"
                ],
                "sep": "/"
            },
            "name": "file",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/files/{lab}/{filename}",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "files"
                                },
                                {
                                    "var": "lab"
                                },
                                {
                                    "var": "filename"
                                }
                            ],
                            "parts": [
                                "api",
                                "files",
                                "{lab}",
                                "{filename}"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "filename",
                                        "orig": "filename",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "lab",
                                        "orig": "lab",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ],
                                "query": [
                                    {
                                        "name": "max_frame",
                                        "orig": "max_frames",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 1000
                                    },
                                    {
                                        "name": "start_frame",
                                        "orig": "start_frame",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 0
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "filename",
                                    "lab"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        },
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/files",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "files"
                                }
                            ],
                            "parts": [
                                "api",
                                "files"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "frame": {
            "fields": [
                {
                    "name": "id",
                    "title": "Id",
                    "type": "`$STRING`"
                }
            ],
            "id": {
                "field": "id",
                "name": "id"
            },
            "name": "frame",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/files/{lab}/{filename}/frame/{frame_number}",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "files"
                                },
                                {
                                    "var": "file_id"
                                },
                                {
                                    "var": "filename"
                                },
                                {
                                    "lit": "frame"
                                },
                                {
                                    "var": "id"
                                }
                            ],
                            "parts": [
                                "api",
                                "files",
                                "{file_id}",
                                "{filename}",
                                "frame",
                                "{id}"
                            ],
                            "rename": {
                                "param": {
                                    "frame_number": "id",
                                    "lab": "file_id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "file_id",
                                        "orig": "lab",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "filename",
                                        "orig": "filename",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "id",
                                        "orig": "frame_number",
                                        "type": "`$INTEGER`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "file_id",
                                    "filename",
                                    "id"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": [
                    [
                        "$.main.kit.entity.file"
                    ]
                ]
            }
        },
        "heatmap": {
            "fields": [],
            "name": "heatmap",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/analytics/heatmap",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "analytics"
                                },
                                {
                                    "lit": "heatmap"
                                }
                            ],
                            "parts": [
                                "api",
                                "analytics",
                                "heatmap"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "query": [
                                    {
                                        "name": "target_point",
                                        "orig": "target_points",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 500000
                                    }
                                ]
                            },
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "overview": {
            "fields": [],
            "name": "overview",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/analytics/overview",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "analytics"
                                },
                                {
                                    "lit": "overview"
                                }
                            ],
                            "parts": [
                                "api",
                                "analytics",
                                "overview"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "root_get": {
            "fields": [],
            "name": "root_get",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/",
                            "segments": [],
                            "parts": [],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "social": {
            "fields": [],
            "name": "social",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/analytics/social",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "analytics"
                                },
                                {
                                    "lit": "social"
                                }
                            ],
                            "parts": [
                                "api",
                                "analytics",
                                "social"
                            ],
                            "rename": {},
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {},
                            "select": {},
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": []
            }
        },
        "stream": {
            "fields": [],
            "name": "stream",
            "op": {
                "load": {
                    "input": "data",
                    "name": "load",
                    "points": [
                        {
                            "kind": "http",
                            "method": "GET",
                            "orig": "/api/files/{lab}/{filename}/stream",
                            "segments": [
                                {
                                    "lit": "api"
                                },
                                {
                                    "lit": "files"
                                },
                                {
                                    "var": "file_id"
                                },
                                {
                                    "var": "filename"
                                },
                                {
                                    "lit": "stream"
                                }
                            ],
                            "parts": [
                                "api",
                                "files",
                                "{file_id}",
                                "{filename}",
                                "stream"
                            ],
                            "rename": {
                                "param": {
                                    "lab": "file_id"
                                }
                            },
                            "transform": {
                                "req": "`reqdata`",
                                "res": "`body`"
                            },
                            "args": {
                                "params": [
                                    {
                                        "name": "file_id",
                                        "orig": "lab",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    },
                                    {
                                        "name": "filename",
                                        "orig": "filename",
                                        "type": "`$STRING`",
                                        "kind": "param",
                                        "reqd": true
                                    }
                                ],
                                "query": [
                                    {
                                        "name": "chunk_size",
                                        "orig": "chunk_size",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 100
                                    },
                                    {
                                        "name": "start_frame",
                                        "orig": "start_frame",
                                        "type": "`$INTEGER`",
                                        "kind": "query",
                                        "example": 0
                                    }
                                ]
                            },
                            "select": {
                                "exist": [
                                    "file_id",
                                    "filename"
                                ]
                            },
                            "response": {
                                "kind": "json",
                                "media": "application/json"
                            }
                        }
                    ]
                }
            },
            "relations": {
                "ancestors": [
                    [
                        "$.main.kit.entity.file"
                    ]
                ]
            }
        }
    };
}
const config = new Config();
exports.config = config;
//# sourceMappingURL=Config.js.map