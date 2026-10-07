"""Create deterministic invented records for local MABe API checks.

No research or competition dataset is read. Run with pandas and pyarrow installed.
"""
from pathlib import Path
import argparse
import pandas as pd


def create_fixture(destination: Path) -> None:
    tracking = destination / "train_tracking" / "synthetic_lab"
    annotations = destination / "train_annotation" / "synthetic_lab"
    tracking.mkdir(parents=True, exist_ok=True)
    annotations.mkdir(parents=True, exist_ok=True)
    rows = []
    for frame in range(6):
        for mouse in (1, 2):
            for point, offset in (("nose", 0), ("tail_base", 2)):
                rows.append({"video_frame": frame, "mouse_id": mouse,
                             "bodypart": point,
                             "x": float(20 + mouse * 10 + frame + offset),
                             "y": float(30 + mouse * 5 + frame * 2 + offset)})
    pd.DataFrame(rows).to_parquet(tracking / "synthetic_video.parquet", index=False)
    pd.DataFrame([{"agent_id": 1, "target_id": 2, "action": "synthetic_follow",
                   "start_frame": 1, "stop_frame": 4}]).to_parquet(
                       annotations / "synthetic_video.parquet", index=False)
    metadata = {"video_id": "synthetic_video", "lab_id": "synthetic_lab",
                "frames_per_second": 30.0, "video_duration_sec": 0.2,
                "video_width_pix": 200, "video_height_pix": 150,
                "arena_width_cm": 20.0, "arena_height_cm": 15.0,
                "pix_per_cm_approx": 10.0, "arena_shape": "rectangle",
                "tracking_method": "synthetic", "body_parts_tracked": "['nose', 'tail_base']"}
    for mouse in range(1, 5):
        present = mouse <= 2
        metadata[f"mouse{mouse}_id"] = str(mouse) if present else None
        for field, value in (("strain", "invented"), ("color", "invented"),
                             ("sex", "unknown"), ("age", "unknown")):
            metadata[f"mouse{mouse}_{field}"] = value if present else None
    # The backend checks path separators when choosing metadata; both copies are synthetic.
    for filename in ("train.csv", "test.csv"):
        pd.DataFrame([metadata]).to_csv(destination / filename, index=False)
    print(f"Created 24 invented tracking records in {destination}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("destination", nargs="?", type=Path,
                        default=Path(__file__).parent / "synthetic-data")
    args = parser.parse_args()
    create_fixture(args.destination)
