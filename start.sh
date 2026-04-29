#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ADMIN_DIR="$ROOT_DIR/adminPanel"
PUBLIC_DIR="$ROOT_DIR/publicWebsite"

case "$(uname -s 2>/dev/null || echo unknown)" in
  MINGW*|MSYS*|CYGWIN*)
    IS_WINDOWS=true
    ;;
  *)
    IS_WINDOWS=false
    ;;
esac

backend_venv_python() {
  if [[ "$IS_WINDOWS" == true ]]; then
    if [[ -f "$BACKEND_DIR/.venv/Scripts/python.exe" ]]; then
      echo "$BACKEND_DIR/.venv/Scripts/python.exe"
      return 0
    elif [[ -f "$BACKEND_DIR/venv/Scripts/python.exe" ]]; then
      echo "$BACKEND_DIR/venv/Scripts/python.exe"
      return 0
    fi
  elif [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    echo "$BACKEND_DIR/.venv/bin/python"
    return 0
  elif [[ -x "$BACKEND_DIR/venv/bin/python" ]]; then
    echo "$BACKEND_DIR/venv/bin/python"
    return 0
  fi

  return 1
}

if VENV_PYTHON="$(backend_venv_python)"; then
  BACKEND_PYTHON=("$VENV_PYTHON")
elif [[ "$IS_WINDOWS" == true ]] && command -v py >/dev/null 2>&1; then
  echo "Creating backend virtual environment..."
  py -3 -m venv "$BACKEND_DIR/.venv"
  BACKEND_PYTHON=("$BACKEND_DIR/.venv/Scripts/python.exe")
elif command -v python3 >/dev/null 2>&1; then
  echo "Creating backend virtual environment..."
  python3 -m venv "$BACKEND_DIR/.venv"
  BACKEND_PYTHON=("$BACKEND_DIR/.venv/bin/python")
else
  echo "Creating backend virtual environment..."
  python -m venv "$BACKEND_DIR/.venv"
  if [[ "$IS_WINDOWS" == true ]]; then
    BACKEND_PYTHON=("$BACKEND_DIR/.venv/Scripts/python.exe")
  else
    BACKEND_PYTHON=("$BACKEND_DIR/.venv/bin/python")
  fi
fi

if [[ "$IS_WINDOWS" == true ]] && command -v npm.cmd >/dev/null 2>&1; then
  NPM=(npm.cmd)
else
  NPM=(npm)
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
echo "Backend Python: ${BACKEND_PYTHON[*]}"

REQUIREMENTS_FILE="$BACKEND_DIR/requirements.txt"
REQUIREMENTS_STAMP="$BACKEND_DIR/.venv/.requirements-installed"

(
  cd "$BACKEND_DIR"
  if [[ ! -f "$REQUIREMENTS_STAMP" || "$REQUIREMENTS_FILE" -nt "$REQUIREMENTS_STAMP" ]]; then
    echo "Installing backend requirements..."
    "${BACKEND_PYTHON[@]}" -m pip install -r requirements.txt
    mkdir -p "$(dirname "$REQUIREMENTS_STAMP")"
    touch "$REQUIREMENTS_STAMP"
  fi

  "${BACKEND_PYTHON[@]}" manage.py migrate
  if ! "${BACKEND_PYTHON[@]}" manage.py shell -c "from users.models import CustomUser; raise SystemExit(0 if CustomUser.objects.filter(email='admin@mna.gov.pk').exists() else 1)"; then
    "${BACKEND_PYTHON[@]}" manage.py seed_data
  fi
)

(
  cd "$BACKEND_DIR"
  exec "${BACKEND_PYTHON[@]}" manage.py runserver 8000
) &
PIDS+=($!)

(
  cd "$ADMIN_DIR"
  exec "${NPM[@]}" run dev -- --host 0.0.0.0
) &
PIDS+=($!)

(
  cd "$PUBLIC_DIR"
  exec "${NPM[@]}" run dev -- --host 0.0.0.0
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
