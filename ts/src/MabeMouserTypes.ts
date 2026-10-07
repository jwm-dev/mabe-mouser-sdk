// Typed models for the MabeMouser SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields{} and per-op
// params (op.<name>.points[].g.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.

export interface Activity {
}

export interface ActivityLoadMatch {
  bin?: number
  target_session?: number
}

export interface Browser {
}

export interface BrowserLoadMatch {
}

export interface File {
  id?: string
}

export interface FileLoadMatch {
  filename: string
  lab: string
  max_frame?: number
  start_frame?: number
}

export interface Frame {
  id?: string
}

export interface FrameLoadMatch {
  file_id: string
  filename: string
  id: number
}

export interface Heatmap {
}

export interface HeatmapLoadMatch {
  target_point?: number
}

export interface Overview {
}

export interface OverviewLoadMatch {
}

export interface RootGet {
}

export interface RootGetLoadMatch {
}

export interface Social {
}

export interface SocialLoadMatch {
}

// Buffered JSON payloads from the SSE stream. For incremental delivery,
// use the entity's stream('load', { reqmatch: ... }) async iterator.
export type Stream = Array<Record<string, any>>

export interface StreamLoadMatch {
  file_id: string
  filename: string
  chunk_size?: number
  start_frame?: number
}

