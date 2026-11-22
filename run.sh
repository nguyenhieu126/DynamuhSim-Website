#!/usr/bin/env bash
# PBL6 project manager. All Docker actions are scoped to this Compose project.
set -uo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$ROOT" || exit 1
trap 'printf "\nInterrupted. Project data and volumes are preserved.\n"; exit 130' INT TERM

error() { printf 'ERROR: %s\n' "$*" >&2; }
need() { command -v "$1" >/dev/null 2>&1 || { error "Missing $1. See README.md for installation."; return 1; }; }
configuration() {
  local file
  for file in compose.yaml frontend/Dockerfile backend/Dockerfile .env.example; do
    [[ -f "$ROOT/$file" ]] || { error "Missing configuration: $file"; return 1; }
  done
  if [[ ! -f .env ]]; then cp -- .env.example .env || return; printf 'Created .env from safe demo defaults.\n'; fi
}
docker_ready() {
  configuration || return
  need docker || return
  docker compose version >/dev/null 2>&1 || { error 'Docker Compose v2 is missing (docker compose).'; return 1; }
  docker info >/dev/null 2>&1 || { error 'Docker daemon unavailable or access denied. Start Docker and verify your user permissions.'; return 1; }
  docker compose config -q || { error 'Invalid Compose or .env configuration.'; return 1; }
}
port_value() {
  # Read only numeric ports. Never source/eval .env as a shell program.
  need python3 || return
  python3 - "$1" "$2" <<'PY'
import os, pathlib, sys
key, default = sys.argv[1:]
value = os.environ.get(key)
path = pathlib.Path('.env')
if value is None and path.exists():
    for line in path.read_text().splitlines():
        k, sep, v = line.strip().partition('=')
        if sep and k == key:
            value = v.strip().strip('"\x27')
value = value or default
if not value.isdecimal() or not 1 <= int(value) <= 65535:
    sys.exit(f'ERROR: Invalid port {key}; expected 1–65535')
print(value)
PY
}
free_port() {
  need python3 || return
  python3 - "$1" <<'PY'
import socket, sys
with socket.socket() as s:
    try: s.bind(('127.0.0.1', int(sys.argv[1])))
    except OSError: sys.exit(f'ERROR: Port {sys.argv[1]} is occupied. Stop its owner or change the port in .env.')
PY
}
stack_ports() {
  local fp bp service port
  fp="$(port_value FRONTEND_PORT 8080)" || return
  bp="$(port_value BACKEND_PORT 8000)" || return
  [[ "$fp" != "$bp" ]] || { error 'Frontend and backend ports must differ.'; return 1; }
  for service in frontend backend; do
    port="$fp"; [[ "$service" == backend ]] && port="$bp"
    if [[ -z "$(docker compose ps --status running -q "$service")" ]]; then free_port "$port" || return; fi
  done
}
start_stack() {
  docker_ready || return
  stack_ports || return
  case "$1" in
    build) docker compose up -d --build --wait --wait-timeout 120 || return ;;
    quick) docker compose up -d --no-build --pull never --wait --wait-timeout 120 || { error 'Quick start failed. Use option 1 if project images have not been built.'; return 1; } ;;
    recreate) docker compose up -d --no-build --pull never --force-recreate --wait --wait-timeout 120 || return ;;
  esac
  printf 'Website: http://localhost:%s\nAPI docs: http://localhost:%s/docs\n' "$(port_value FRONTEND_PORT 8080)" "$(port_value BACKEND_PORT 8000)"
}
frontend_dev() {
  need node || return; need npm || return
  [[ -f frontend/package-lock.json ]] || { error 'Missing frontend/package-lock.json'; return 1; }
  local port; port="$(port_value DEV_FRONTEND_PORT 5173)" || return
  free_port "$port" || return
  (
    cd -- "$ROOT/frontend" || exit 1
    [[ -d node_modules ]] || npm ci --no-audit --no-fund || exit 1
    printf 'Starting local DEMO UI. Ctrl+C stops the dev server.\n'
    VITE_DATA_MODE=demo npm run dev -- --port "$port" --strictPort
  )
}
backend_dev() {
  need python3 || return
  local port; port="$(port_value BACKEND_PORT 8000)" || return
  free_port "$port" || return
  (
    cd -- "$ROOT/backend" || exit 1
    [[ -x .venv/bin/python ]] || python3 -m venv .venv || exit 1
    .venv/bin/python -c 'import fastapi, uvicorn, pydantic_settings' >/dev/null 2>&1 || .venv/bin/python -m pip install -r requirements.txt || exit 1
    printf 'Starting safe backend in DEMO mode. API docs: http://localhost:%s/docs\n' "$port"
    PBL6_DATA_MODE=demo .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port "$port" --reload
  )
}
status() {
  docker_ready || return
  docker compose ps -a || return
  local port; port="$(port_value BACKEND_PORT 8000)" || return
  if command -v curl >/dev/null; then curl -fsS --max-time 3 "http://localhost:$port/api/health" || printf 'API health unavailable.\n'; printf '\n'; fi
}
logs() {
  docker_ready || return
  local choice; read -r -p 'Logs [1] Frontend [2] Backend [3] All (default): ' choice || return
  case "$choice" in 1) docker compose logs --tail 100 -f frontend;; 2) docker compose logs --tail 100 -f backend;; 3|'') docker compose logs --tail 100 -f;; *) error 'Invalid log choice.'; return 1;; esac
}
open_page() {
  local choice port url
  read -r -p 'Open [1] Website (default) [2] API docs: ' choice || return
  case "$choice" in 1|'') port="$(port_value FRONTEND_PORT 8080)" || return; url="http://localhost:$port";; 2) port="$(port_value BACKEND_PORT 8000)" || return; url="http://localhost:$port/docs";; *) error 'Invalid choice'; return 1;; esac
  printf '%s\n' "$url"
  if command -v xdg-open >/dev/null && [[ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]]; then xdg-open "$url" >/dev/null 2>&1 || error 'Unable to open browser. Use the URL above.'; fi
}
checks() {
  need curl || return; need python3 || return
  local fp bp route code; fp="$(port_value FRONTEND_PORT 8080)" || return; bp="$(port_value BACKEND_PORT 8000)" || return
  curl -fsS --max-time 5 "http://localhost:$bp/api/health" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["status"]=="ok" and d["physical_control_enabled"] is False; print("PASS API health / physical control disabled")' || return
  curl -fsS --max-time 5 "http://localhost:$fp/api/robot/telemetry" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["source"] in ("demo","unavailable","live"); assert not d["status"]["controlVerified"]; print("PASS Nginx API proxy / no physical control")' || return
  for route in / /manual-control /mapping-navigation /ai-monitoring /sensors-telemetry /settings; do
    curl -fsS --max-time 5 "http://localhost:$fp$route" | python3 -c 'import sys; assert "id=\"root\"" in sys.stdin.read()' || { error "Route failed: $route"; return 1; }
    printf 'PASS SPA direct route %s\n' "$route"
  done
  code="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' -X POST "http://localhost:$fp/api/robot/move")" || return
  [[ "$code" == 404 ]] || { error 'Unexpected physical movement endpoint exposed'; return 1; }
  printf 'PASS no unverified movement endpoint\n'
}
stop_services() { docker_ready && docker compose stop; }
clean_project() {
  docker_ready || return
  local answer; read -r -p 'Remove only PBL6 project containers and its network? Volumes and images are preserved. Type CLEAN: ' answer || return
  [[ "$answer" == CLEAN ]] || { printf 'Cleanup canceled.\n'; return 0; }
  docker compose down # Deliberately no -v, --rmi, or global prune.
}
help_text() {
  cat <<'HELP'
Usage: ./run.sh [option]
  --build      Build and start full Docker stack
  --quick      Start existing Docker images without rebuilding
  --frontend   Local demo frontend (Node.js 20.19+ or 22+)
  --backend    Local safe demo backend (Python 3.12+)
  --recreate   Reload backend environment / recreate existing images
  --status     Project container and API status
  --check      Targeted API and six-route smoke checks (stack must run)
  --stop       Stop project services, preserve data
  --help       Show this help
Without an option, display the interactive management menu.
HELP
}
dispatch() {
  case "$1" in
    1|--build|'') start_stack build;; 2|--quick) start_stack quick;; 3|--frontend) frontend_dev;; 4|--backend) backend_dev;;
    5|--recreate) start_stack recreate;; 6|--status) status;; 7) logs;; 8) open_page;; 9|--check) checks;; 10|--stop) stop_services;; 11) clean_project;;
    --help|-h) help_text;; *) error 'Unknown option. Use --help.'; return 1;;
  esac
}
if (( $# )); then dispatch "$1"; exit $?; fi
while true; do
  cat <<'MENU'

========================================
 PBL6 - ROBOT CONTROL & MONITORING
========================================
[1] Build and start full stack (default)
[2] Quick start using existing Docker images
[3] Start Frontend (Demo UI)
[4] Start Backend (API)
[5] Recreate containers / reload .env
[6] Show system status
[7] View logs
[8] Open website / API documentation
[9] Run system checks
[10] Stop services (preserve data)
[11] Clean project containers safely
[0] Exit
MENU
  read -r -p 'Select [1]: ' selection || exit 0
  [[ "$selection" == 0 ]] && exit 0
  if ! dispatch "$selection"; then printf 'Action failed. See the error above; no data cleanup was performed.\n' >&2; fi
done
