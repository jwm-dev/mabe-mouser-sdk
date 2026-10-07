"""Check all original API routes against the deterministic synthetic fixture."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen

parser = argparse.ArgumentParser()
parser.add_argument("--base", default="http://127.0.0.1:8765")
parser.add_argument("--output", type=Path, default=Path(__file__).parent / "direct-api-results.json")
args = parser.parse_args()
results = []


def get(path, expected=200, text=False):
    try:
        with urlopen(args.base + path, timeout=10) as response:
            status, raw = response.status, response.read().decode("utf-8")
    except HTTPError as error:
        status, raw = error.code, error.read().decode("utf-8")
    assert status == expected, f"status {status}, expected {expected}"
    return raw if text else json.loads(raw)


def check(name, work):
    try:
        work()
        results.append({"name": name, "result": "passed"})
    except Exception as error:
        results.append({"name": name, "result": "failed", "error": str(error)})


def equal(actual, expected):
    assert actual == expected, f"got {actual!r}, expected {expected!r}"


def health():
    data = get("/")
    equal(data["status"], "running")
    equal(data["data_dir_exists"], True)


def files():
    data = get("/api/files")
    equal(data["total"], 1)
    equal(data["labs"]["synthetic_lab"][0]["name"], "synthetic_video.parquet")


file_route = "/api/files/synthetic_lab/synthetic_video.parquet"


def file_range():
    data = get(file_route + "?start_frame=1&max_frames=2")
    equal([f["frame_number"] for f in data["frames"]], [1, 2])
    equal(data["metadata"]["total_frames"], 6)
    equal(data["metadata"]["num_mice"], 2)


def frame():
    data = get(file_route + "/frame/2")
    equal(data["frame_number"], 2)
    equal(sorted(data["mice"]), ["1", "2"])
    equal(data["mice"]["1"]["points"], [[32.0, 39.0], [34.0, 41.0]])


def stream():
    raw = get(file_route + "/stream?chunk_size=2", text=True)
    events = [json.loads(line[6:]) for line in raw.splitlines() if line.startswith("data: ")]
    equal(events[0]["metadata"]["total_frames"], 6)
    equal(events[0]["metadata"]["has_annotations"], True)
    equal(len(events), 4)
    equal([f["frame_number"] for event in events[1:] for f in event["frames"]], list(range(6)))
    equal(events[-1]["complete"], True)


def overview():
    data = get("/api/analytics/overview")
    equal(data["total_sessions"], 1)
    equal(data["total_frames"], 6)
    equal(data["mice_total"], 2)


def heatmap():
    data = get("/api/analytics/heatmap?target_points=10")
    equal(data["total_points"], 10)
    equal(data["sessions_processed"], 1)
    assert all(0 <= p["x"] <= 1 and 0 <= p["y"] <= 1 for p in data["points"])


def activity():
    data = get("/api/analytics/activity?target_sessions=1&bins=3")
    equal(data["sessions_processed"], 1)
    equal(data["bins"], 3)
    equal(data["total_points"], 3)


def social():
    data = get("/api/analytics/social")
    equal(len(data["nodes"]), 2)
    equal(len(data["edges"]), 1)
    equal(data["edges"][0]["weight"], 1.0)


def browser():
    data = get("/api/analytics/browser")
    equal(data["total_count"], 1)
    equal(data["sessions"][0]["video_id"], "synthetic_video")
    equal(data["sessions"][0]["mice_count"], 2)


for name, work in [("health", health), ("file listing", files), ("file frame range", file_range),
                   ("single frame", frame), ("SSE stream", stream), ("analytics overview", overview),
                   ("analytics heatmap", heatmap), ("analytics activity", activity),
                   ("analytics social", social), ("analytics browser", browser),
                   ("missing file 404", lambda: get("/api/files/synthetic_lab/missing.parquet", 404)),
                   ("missing frame 404", lambda: get(file_route + "/frame/999", 404)),
                   ("invalid frame 422", lambda: get(file_route + "/frame/invalid", 422))]:
    check(name, work)

report = {"checked_at_utc": datetime.now(timezone.utc).isoformat(),
          "base_url": args.base, "fixture": "synthetic only, 24 tracking rows, 6 frames, 2 mice",
          "checks": results}
args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
raise SystemExit(1 if any(r["result"] == "failed" for r in results) else 0)
