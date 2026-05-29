#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACK_DIR="$PROJECT_DIR/back"
FRONT_DIR="$PROJECT_DIR/front"
BACKEND_JAR="$BACK_DIR/ruoyi-admin/target/ruoyi-admin.jar"

# Auto-detect cache server: prefer Valkey, fall back to Redis
detect_cache_server() {
  if command -v valkey-server >/dev/null 2>&1; then
    CACHE_BIN="$(command -v valkey-server)"
    CACHE_NAME="Valkey"
    CACHE_PROC="valkey-server"
  elif command -v redis-server >/dev/null 2>&1; then
    CACHE_BIN="$(command -v redis-server)"
    CACHE_NAME="Redis"
    CACHE_PROC="redis-server"
  else
    # Fall back to compiling Redis from source
    CACHE_BIN="/tmp/redis-7.4.6/src/redis-server"
    CACHE_NAME="Redis"
    CACHE_PROC="redis-server"
  fi
}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

usage() {
  echo "Usage: $0 [start|stop|restart|status]"
  echo ""
  echo "  start   Start all services (MySQL → Cache → Backend → Frontend)"
  echo "  stop    Stop all services gracefully"
  echo "  restart Stop then start all services"
  echo "  status  Check if all services are running"
  exit 0
}

check_deps() {
  command -v java  >/dev/null 2>&1 || fail "java not found"
  command -v node  >/dev/null 2>&1 || fail "node not found"
  command -v mysql >/dev/null 2>&1 || fail "mysql client not found"
}

# ---- MySQL ----
start_mysql() {
  log "Starting MySQL..."
  if systemctl is-active --quiet mysql 2>/dev/null; then
    ok "MySQL already running"
    return 0
  fi
  if systemctl is-active --quiet mariadb 2>/dev/null; then
    ok "MariaDB already running"
    return 0
  fi
  # Try starting via available init systems
  if systemctl start mysql 2>/dev/null || systemctl start mariadb 2>/dev/null; then
    ok "MySQL started"
  else
    fail "Could not start MySQL/MariaDB - start it manually"
  fi
}

# ---- Cache server (Valkey / Redis) ----
start_cache() {
  detect_cache_server
  log "Starting $CACHE_NAME..."
  if pgrep -x "$CACHE_PROC" >/dev/null 2>&1; then
    ok "$CACHE_NAME already running"
    return 0
  fi
  # Compile Redis from source if using fallback and binary not present
  if [ "$CACHE_NAME" = "Redis" ] && [ "$CACHE_BIN" = "/tmp/redis-7.4.6/src/redis-server" ] && [ ! -f "$CACHE_BIN" ]; then
    warn "Redis binary not found, compiling..."
    local src="/tmp/redis-7.4.6"
    if [ ! -d "$src" ]; then
      curl -sL https://download.redis.io/releases/redis-7.4.6.tar.gz | tar xz -C /tmp
    fi
    make -C "$src" -j"$(nproc)" --no-print-directory >/dev/null 2>&1
  fi
  [ -f "$CACHE_BIN" ] || fail "$CACHE_NAME binary not found at $CACHE_BIN"

  # Handle incompatible RDB file (e.g. Redis RDB v12 vs Valkey)
  local rdb_file="${PROJECT_DIR}/dump.rdb"
  if [ -f "$rdb_file" ]; then
    local rdb_ver
    rdb_ver=$(head -c 9 "$rdb_file" | tail -c 4 2>/dev/null || true)
    if [ "$rdb_ver" != "0012" ] || [ "$CACHE_NAME" = "Redis" ]; then
      # RDB is compatible or we are on Redis, keep it
      :
    else
      warn "Incompatible RDB format (v12 from Redis) detected, backing up to dump.rdb.bak"
      mv "$rdb_file" "${rdb_file}.bak"
    fi
  fi

  "$CACHE_BIN" --daemonize yes --port 6379 --loglevel notice 2>&1
  sleep 1
  if pgrep -x "$CACHE_PROC" >/dev/null 2>&1; then
    ok "$CACHE_NAME started on :6379"
  else
    fail "$CACHE_NAME failed to start"
  fi
}

stop_cache() {
  detect_cache_server
  log "Stopping $CACHE_NAME..."
  pkill -x "$CACHE_PROC" 2>/dev/null && ok "$CACHE_NAME stopped" || warn "$CACHE_NAME was not running"
}

cache_status() {
  detect_cache_server
  if pgrep -x "$CACHE_PROC" >/dev/null 2>&1; then
    echo -e "  ${CACHE_NAME}:   ${GREEN}running${NC} (:6379)"
  else
    echo -e "  ${CACHE_NAME}:   ${RED}stopped${NC}"
  fi
}

# ---- Backend ----
start_backend() {
  log "Starting backend..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/captchaImage 2>/dev/null | grep -q 200; then
    ok "Backend already running on :8080"
    return 0
  fi
  [ -f "$BACKEND_JAR" ] || fail "Backend JAR not found: $BACKEND_JAR (run 'mvn clean package -DskipTests' in back/)"
  cd "$BACK_DIR"
  nohup java -jar "$BACKEND_JAR" > /tmp/backend.log 2>&1 &
  local pid=$!
  log "Backend PID: $pid, waiting for startup..."
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/captchaImage 2>/dev/null | grep -q 200; then
      ok "Backend started on :8080 (PID $pid)"
      return 0
    fi
    sleep 2
  done
  fail "Backend did not start within 120s - check /tmp/backend.log"
}

stop_backend() {
  log "Stopping backend..."
  local pids=$(pgrep -f "ruoyi-admin.jar" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill 2>/dev/null
    sleep 3
    echo "$pids" | xargs kill -9 2>/dev/null || true
    ok "Backend stopped"
  else
    warn "Backend was not running"
  fi
}

# ---- Frontend ----
start_frontend() {
  log "Starting frontend..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q 200; then
    ok "Frontend already running on :3000"
    return 0
  fi
  cd "$FRONT_DIR"
  nohup npm run dev > /tmp/frontend.log 2>&1 &
  local pid=$!
  log "Frontend PID: $pid, waiting for startup..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q 200; then
      ok "Frontend started on :3000 (PID $pid)"
      return 0
    fi
    sleep 1
  done
  fail "Frontend did not start within 30s - check /tmp/frontend.log"
}

stop_frontend() {
  log "Stopping frontend..."
  local pids=$(pgrep -f "vite.*3000" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill 2>/dev/null
    sleep 1
    echo "$pids" | xargs kill -9 2>/dev/null || true
    ok "Frontend stopped"
  else
    warn "Frontend was not running"
  fi
}

# ---- RuoYi Admin UI ----
start_ruoyi_ui() {
  log "Starting RuoYi Admin UI..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null | grep -q 200; then
    ok "RuoYi Admin UI already running on :80"
    return 0
  fi
  cd "$BACK_DIR/ruoyi-ui"
  nohup npm run dev > /tmp/ruoyi-ui.log 2>&1 &
  local pid=$!
  log "RuoYi Admin UI PID: $pid, waiting for startup..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null | grep -q 200; then
      ok "RuoYi Admin UI started on :80 (PID $pid)"
      return 0
    fi
    sleep 1
  done
  warn "RuoYi Admin UI did not start within 30s - check /tmp/ruoyi-ui.log"
}

stop_ruoyi_ui() {
  log "Stopping RuoYi Admin UI..."
  local pids=$(pgrep -f "vue-cli-service" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill 2>/dev/null
    sleep 1
    echo "$pids" | xargs kill -9 2>/dev/null || true
    ok "RuoYi Admin UI stopped"
  else
    warn "RuoYi Admin UI was not running"
  fi
}

# ---- Commands ----
cmd_start() {
  check_deps
  echo ""
  echo "============================================"
  echo "  TreasureShare - Starting All Services"
  echo "============================================"
  echo ""
  start_mysql
  start_cache
  start_backend
  start_frontend
  start_ruoyi_ui
  echo ""
  echo "============================================"
  echo "  All services running!"
  echo "  Frontend:       http://localhost:3000"
  echo "  RuoYi Admin UI: http://localhost:80"
  echo "  Backend:        http://localhost:8080"
  echo "  Swagger:        http://localhost:8080/swagger-ui.html"
  echo "============================================"
}

cmd_stop() {
  echo ""
  echo "============================================"
  echo "  TreasureShare - Stopping All Services"
  echo "============================================"
  echo ""
  stop_frontend
  stop_ruoyi_ui
  stop_backend
  stop_cache
  log "MySQL left running (system service)"
  echo ""
  ok "All services stopped"
}

cmd_status() {
  echo ""
  echo "Service Status:"
  echo "--------------"

  if systemctl is-active --quiet mysql 2>/dev/null || systemctl is-active --quiet mariadb 2>/dev/null; then
    echo -e "  MySQL:    ${GREEN}running${NC}"
  else
    echo -e "  MySQL:    ${RED}stopped${NC}"
  fi

  cache_status

  local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/captchaImage 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo -e "  Backend:  ${GREEN}running${NC} (:8080)"
  else
    echo -e "  Backend:  ${RED}stopped${NC} ($http_code)"
  fi

  http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo -e "  Frontend:       ${GREEN}running${NC} (:3000)"
  else
    echo -e "  Frontend:       ${RED}stopped${NC} ($http_code)"
  fi

  http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo -e "  RuoYi Admin UI: ${GREEN}running${NC} (:80)"
  else
    echo -e "  RuoYi Admin UI: ${RED}stopped${NC} ($http_code)"
  fi
  echo ""
}

# ---- Main ----
case "${1:-start}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; sleep 2; cmd_start ;;
  status)  cmd_status ;;
  -h|--help|help) usage ;;
  *)       echo "Unknown command: $1"; usage ;;
esac
