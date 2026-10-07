"""Run an unchanged backend checkout with synthetic data on loopback only."""
import argparse
import os
from pathlib import Path
import sys
import uvicorn

parser = argparse.ArgumentParser()
parser.add_argument("--backend", type=Path, required=True)
parser.add_argument("--data", type=Path, required=True)
parser.add_argument("--port", type=int, default=8765)
args = parser.parse_args()
os.environ["DATA_DIR"] = str(args.data.resolve() / "train_tracking")
sys.dont_write_bytecode = True
sys.path.insert(0, str(args.backend.resolve()))
uvicorn.run("backend.main:app", host="127.0.0.1", port=args.port, log_level="info")
