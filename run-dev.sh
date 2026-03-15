#!/usr/bin/env bash
# Starts both the Flask backend and the React frontend.
# Run from the repo root: ./run-dev.sh

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting backend (Flask) in the background..."
(cd "$ROOT" && python app.py) &

echo "Starting frontend (Vite) in the background..."
(cd "$ROOT/frontend" && npm run dev) &

wait
