#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACK_DIR="$PROJECT_DIR/back"
FRONT_DIR="$PROJECT_DIR/front"
REDIS_BIN="/tmp/redis-7.4.6/src/redis-server"
BACKEND_JAR="$BACK_DIR/ruoyi-admin/target/ruoyi-admin.jar"

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
  echo "  start   Start all services (MySQL → Redis → Backend → Frontend)"
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

# ---- Redis ----
start_redis() {
  log "Starting Redis..."
  if pgrep -x redis-server >/dev/null 2>&1; then
    ok "Redis already running"
    return 0
  fi
  if [ ! -f "$REDIS_BIN" ]; then
    warn "Redis binary not found at $REDIS_BIN, compiling..."
    local src="/tmp/redis-7.4.6"
    if [ ! -d "$src" ]; then
      curl -sL https://download.redis.io/releases/redis-7.4.6.tar.gz | tar xz -C /tmp
    fi
    make -C "$src" -j"$(nproc)" --no-print-directory >/dev/null 2>&1
  fi
  "$REDIS_BIN" --daemonize yes --port 6379 --loglevel notice 2>&1
  sleep 1
  if pgrep -x redis-server >/dev/null 2>&1; then
    ok "Redis started on :6379"
  else
    fail "Redis failed to start"
  fi
}

stop_redis() {
  log "Stopping Redis..."
  pkill -x redis-server 2>/dev/null && ok "Redis stopped" || warn "Redis was not running"
}

# ---- Backend ----
start_backend() {
  log "Starting backend..."
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:102480/captchaImage 2>/dev/null | grep -q 200; then
    ok "Backend already running on :102480"
    return 0
  fi
  [ -f "$BACKEND_JAR" ] || fail "Backend JAR not found: $BACKEND_JAR (run 'mvn clean package -DskipTests' in back/)"
  cd "$BACK_DIR"
  nohup java -jar "$BACKEND_JAR" > /tmp/backend.log 2>&1 &
  local pid=$!
  log "Backend PID: $pid, waiting for startup..."
  for i in $(seq 1 60); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:102480/captchaImage 2>/dev/null | grep -q 200; then
      ok "Backend started on :102480 (PID $pid)"
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
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q 200; then
    ok "Frontend already running on :5173"
    return 0
  fi
  cd "$FRONT_DIR"
  nohup npx vite --host --port 5173 > /tmp/frontend.log 2>&1 &
  local pid=$!
  log "Frontend PID: $pid, waiting for startup..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q 200; then
      ok "Frontend started on :5173 (PID $pid)"
      return 0
    fi
    sleep 1
  done
  fail "Frontend did not start within 30s - check /tmp/frontend.log"
}

stop_frontend() {
  log "Stopping frontend..."
  local pids=$(pgrep -f "vite.*5173" 2>/dev/null || true)
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
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:1024 2>/dev/null | grep -q 200; then
    ok "RuoYi Admin UI already running on :1024"
    return 0
  fi
  cd "$BACK_DIR/ruoyi-ui"
  nohup npm run dev > /tmp/ruoyi-ui.log 2>&1 &
  local pid=$!
  log "RuoYi Admin UI PID: $pid, waiting for startup..."
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:1024 2>/dev/null | grep -q 200; then
      ok "RuoYi Admin UI started on :1024 (PID $pid)"
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
  start_redis
  start_backend
  start_frontend
  start_ruoyi_ui
  echo ""
  echo "============================================"
  echo "  All services running!"
  echo "  Frontend:       http://localhost:5173"
  echo "  RuoYi Admin UI: http://localhost:1024"
  echo "  Backend:        http://localhost:102480"
  echo "  Swagger:        http://localhost:102480/swagger-ui.html"
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
  stop_redis
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

  if pgrep -x redis-server >/dev/null 2>&1; then
    echo -e "  Redis:    ${GREEN}running${NC} (:6379)"
  else
    echo -e "  Redis:    ${RED}stopped${NC}"
  fi

  local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:102480/captchaImage 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo -e "  Backend:  ${GREEN}running${NC} (:102480)"
  else
    echo -e "  Backend:  ${RED}stopped${NC} ($http_code)"
  fi

  http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo -e "  Frontend:       ${GREEN}running${NC} (:5173)"
  else
    echo -e "  Frontend:       ${RED}stopped${NC} ($http_code)"
  fi

  http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1024 2>/dev/null || echo "000")
  if [ "$http_code" = "200" ]; then
    echo -e "  RuoYi Admin UI: ${GREEN}running${NC} (:1024)"
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
