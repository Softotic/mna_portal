#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ADMIN_DIR="$ROOT_DIR/adminPanel"
PUBLIC_DIR="$ROOT_DIR/publicWebsite"

if [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
  BACKEND_PYTHON="$BACKEND_DIR/.venv/bin/python"
elif [[ -x "$BACKEND_DIR/venv/bin/python" ]]; then
  BACKEND_PYTHON="$BACKEND_DIR/venv/bin/python"
else
  BACKEND_PYTHON="python3"
fi

PIDS=()

cleanup() {
  local exit_code=$?
  if [[ ${#PIDS[@]} -gt 0 ]]; then
    echo
    echo "Stopping development servers..."
    kill "${PIDS[@]}" 2>/dev/null || true
    wait "${PIDS[@]}" 2>/dev/null || true
  fi
  exit "$exit_code"
}

trap cleanup INT TERM EXIT

echo "Starting MNA Portal services..."
echo "Backend Python: $BACKEND_PYTHON"

(
  cd "$BACKEND_DIR"
  exec "$BACKEND_PYTHON" manage.py runserver 8000
) &
PIDS+=($!)

(
  cd "$ADMIN_DIR"
  exec npm run dev -- --host 0.0.0.0
) &
PIDS+=($!)

(
  cd "$PUBLIC_DIR"
  exec npm run dev -- --host 0.0.0.0
) &
PIDS+=($!)

echo
echo "Services started:"
echo "- Backend API: http://localhost:8000/api/"
echo "- Admin Panel: http://localhost:5173/admin"
echo "- Public Website: http://localhost:4173"
echo
echo "Press Ctrl+C to stop all services."

wait
