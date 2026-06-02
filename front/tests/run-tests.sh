#!/bin/bash
#
#  TreasureShare Playwright Test Runner
#  Usage:
#    ./run-tests.sh              # 运行全部测试
#    ./run-tests.sh order        # 只运行 order 相关测试
#    ./run-tests.sh --headed     # 有头模式（看浏览器操作）
#    ./run-tests.sh --ui         # Playwright UI 模式
#    ./run-tests.sh --debug      # 调试模式（逐步执行）
#

set -euo pipefail
cd "$(dirname "$0")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  TreasureShare Playwright Test Runner${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# -------------------- 依赖检查 --------------------
check_deps() {
  if ! command -v node &>/dev/null; then
    echo -e "${RED}[ERROR] Node.js 未安装${NC}"
    exit 1
  fi

  if [ ! -d "../node_modules/@playwright" ]; then
    echo -e "${YELLOW}[INFO] 安装依赖...${NC}"
    cd .. && npm install && cd tests
  fi

  if ! npx playwright --version &>/dev/null; then
    echo -e "${YELLOW}[INFO] 安装 Playwright 浏览器...${NC}"
    npx playwright install chromium
  fi
}

# -------------------- 服务检查 --------------------
check_services() {
  echo -e "${YELLOW}[CHECK] 检查后端服务 (localhost:8080)...${NC}"
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200\|302\|404"; then
    echo -e "  ${GREEN}✓ 后端服务运行中${NC}"
  else
    echo -e "  ${RED}✗ 后端服务未启动！请先执行: cd .. && npm run dev 或者 ../../start.sh start${NC}"
    echo -e "  ${YELLOW}提示：至少需要后端 API (8080) 才能运行 API 测试${NC}"
  fi

  echo -e "${YELLOW}[CHECK] 检查前端服务 (localhost:3000)...${NC}"
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200\|302"; then
    echo -e "  ${GREEN}✓ 前端服务运行中${NC}"
  else
    echo -e "  ${RED}✗ 前端服务未启动！请先执行: cd .. && npm run dev${NC}"
    echo -e "  ${YELLOW}提示：UI 测试需要前端 SPA (3000)，纯 API 测试只需要后端${NC}"
  fi
  echo ""
}

# -------------------- 主流程 --------------------
check_deps
check_services

# 删除旧报告
rm -f test-results.json

# 解析参数
EXTRA_FLAGS=""
SPEC_FILE=""

for arg in "$@"; do
  case $arg in
    --headed)   EXTRA_FLAGS="$EXTRA_FLAGS --headed" ;;
    --ui)       EXTRA_FLAGS="$EXTRA_FLAGS --ui" ;;
    --debug)    EXTRA_FLAGS="$EXTRA_FLAGS --debug" ;;
    auth)       SPEC_FILE="specs/01-auth.spec.ts" ;;
    product)    SPEC_FILE="specs/02-product.spec.ts" ;;
    cart)       SPEC_FILE="specs/03-cart.spec.ts" ;;
    order)      SPEC_FILE="specs/04-order.spec.ts" ;;
    address)    SPEC_FILE="specs/05-address.spec.ts" ;;
    community)  SPEC_FILE="specs/06-community.spec.ts" ;;
    evaluation) SPEC_FILE="specs/07-evaluation.spec.ts" ;;
    messages)   SPEC_FILE="specs/08-messages.spec.ts" ;;
    api)        SPEC_FILE="specs/01-auth.spec.ts specs/02-product.spec.ts specs/04-order.spec.ts specs/05-address.spec.ts" ;;
    ui)         SPEC_FILE="specs/01-auth.spec.ts specs/03-cart.spec.ts specs/06-community.spec.ts specs/07-evaluation.spec.ts specs/08-messages.spec.ts" ;;
  esac
done

echo -e "${GREEN}[RUN] 开始运行测试...${NC}"
echo ""

if [ -n "$SPEC_FILE" ]; then
  npx playwright test $SPEC_FILE $EXTRA_FLAGS
else
  npx playwright test $EXTRA_FLAGS
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  ✓ 全部测试通过${NC}"
  echo -e "${GREEN}========================================${NC}"
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}  ✗ 存在失败测试 (exit: $EXIT_CODE)${NC}"
  echo -e "${RED}========================================${NC}"
  echo -e "${YELLOW}调试提示:${NC}"
  echo "  ./run-tests.sh order --headed --debug   # 有头调试单个测试"
  echo "  ./run-tests.sh --ui                     # 交互式 UI 模式"
fi

exit $EXIT_CODE
