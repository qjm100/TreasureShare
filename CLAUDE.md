# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TreasureShare** (玩具租赁共享平台) — a full-stack toy rental sharing platform built on RuoYi (若依) v3.9.2. Users can publish idle toys for others to rent, with order lifecycle management, real-time messaging, community features, and a data dashboard.

- **Backend**: Spring Boot 4.x (JDK 17+) + MyBatis + Druid + JWT + Redis
- **User-facing frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (at `front/`)
- **Admin panel**: Vue 2 + Element UI (at `back/ruoyi-ui`)
- **Author**: Ciami

## Quick Start

```bash
./start.sh start    # Start all services (MySQL → Redis → Backend → Frontend → Admin UI)
./start.sh stop     # Stop all services gracefully
./start.sh restart  # Restart all services
./start.sh status   # Check service status
```

Individual commands:

```bash
# Backend
cd back
mvn clean package -DskipTests         # Build all modules → ruoyi-admin/target/ruoyi-admin.jar
java -jar ruoyi-admin/target/ruoyi-admin.jar   # Runs on port 8080

# User-facing frontend (React)
cd front
npm install
npm run dev          # Dev server on port 3000, proxies /api→localhost:8080

# Admin panel (Vue 2)
cd back/ruoyi-ui
npm install
npm run dev          # Dev server on port 80, proxies /dev-api→localhost:8080
```

**Service URLs:**

| Service | URL |
|---------|-----|
| User frontend | `http://localhost:3000` |
| Admin panel | `http://localhost:80` (or `1024` via `start.sh`) |
| Backend API | `http://localhost:8080` |
| Swagger docs | `http://localhost:8080/swagger-ui.html` |
| Druid monitor | `http://localhost:8080/druid/` (user: `ruoyi` / `123456`) |

## Module Architecture

The `back/` directory is a Maven multi-module project. Modules in dependency order:

| Module | Purpose |
|---|---|
| `ruoyi-admin` | Entry point (`RuoYiApplication`), controllers under `com.ruoyi.web.controller.*` including `ToyController`, `ToyUploadController` |
| `ruoyi-framework` | Security config, JWT filter, aspects (DataScope, Log, RateLimiter), global exception handler |
| `ruoyi-system` | Business services, mappers for system entities (User, Role, Menu, Dept, Config, Dict, Notice, Post) |
| `ruoyi-toyrental` | **Toy rental business module** — services, mappers, domains for products, orders, cart, messages, community, evaluations, addresses, categories |
| `ruoyi-quartz` | Scheduled task management (Quartz-based) |
| `ruoyi-generator` | Code generator — Velocity templates for CRUD scaffolding |
| `ruoyi-common` | Shared layer: `BaseEntity`, `TreeEntity`, annotations, `BaseController`, `AjaxResult`, `RedisCache`, utils |

`ruoyi-toyrental` depends only on `ruoyi-common`. Its controllers live in `ruoyi-admin` under `com.ruoyi.web.controller.toy`.

## Frontend Architecture

### User-facing app (`front/`)

React 19 SPA built with Vite 6 + TypeScript + Tailwind CSS 4 + React Router 7.

| Directory | Contents |
|-----------|----------|
| `src/pages/` | Discovery, ProductDetail, Cart, Checkout, Orders, OrderDetail, RentedOut, Community, PostPublish, Messages, Login, Profile |
| `src/components/` | `ImgWithFallback.tsx` |
| `src/api.ts` | All API calls via `fetch`, base path `/api/toy`, JWT token in `Authorization: Bearer` header |
| `src/types.ts` | TypeScript type definitions |
| `src/constants.ts` | Demo/mock data (ITEMS, CHATS, MESSAGES) |

Key third-party libs: `lucide-react` (icons), `motion` (animations, Framer Motion fork), `@google/genai` (Gemini AI integration).

Vite config proxies `/api`, `/login`, `/register`, `/profile` to `http://localhost:8080`. Uses `@/` path alias.

### Admin panel (`back/ruoyi-ui/`)

Standard RuoYi Vue 2 admin with Element UI. Pages include: Dashboard, Order Management, Product Management, Category Management, Evaluation Management, Community Management. Login: `admin` / `admin123`.

Adds new views under `views/toy/` for toy rental admin operations (Dashboard data, order status management, product seed data).

## Backend API Routes

All toy rental endpoints are under `/api/toy/` and defined in `ruoyi-admin` controllers:

| Path | Controller | Description |
|------|-----------|-------------|
| `/api/toy/products` | `ToyController` | Product CRUD, listing, search |
| `/api/toy/cart` | `ToyCartController` | Cart management |
| `/api/toy/orders` | `ToyOrderController` | Order lifecycle (create, pay, ship, receive, return, confirm-return, disinfect, renew, cancel) |
| `/api/toy/addresses` | `ToyAddressController` | User shipping addresses |
| `/api/toy/user/profile` | `ToyUserController` | User profile |
| `/api/toy/evaluations` | `ToyEvaluationController` | Product evaluations |
| `/api/toy/messages` | `ToyMessageController` | Real-time messaging, conversations |
| `/api/toy/community/*` | `ToyCommunityController` | Posts, comments, likes |
| `/api/toy/categories/tree` | `ToyCategoryController` | Category tree |
| `/api/toy/upload` | `ToyUploadController` | File/image upload |

`@Anonymous` is used on public endpoints (product list, product detail, upload, categories). Write operations require JWT auth.

## Key Architectural Patterns

**Layered architecture**: `controller` → `service` (interface) → `service/impl/` → `mapper` (MyBatis interface + XML in `resources/mapper/`) → `domain` (entity).

**Controller inheritance**: Toy controllers extend `BaseController` which provides `startPage()`, `getDataTable()`, `success()`/`error()`/`toAjax()` response helpers.

**Security**: `SecurityConfig` requires auth except `/login`, `/register`, `/captchaImage`, static resources. JWT auth via `JwtAuthenticationTokenFilter`. `@Anonymous` on methods adds permit-all dynamically. `@PreAuthorize` with `ss.hasPermi()` / `ss.hasRole()` for fine-grained control.

**API response format**: `AjaxResult` wraps `{ code: 200, msg: "...", data: ... }`. Frontend `api.ts` expects `code === 200` and throws on other codes.

**File upload**: Via `ToyUploadController` → `FileUploadUtils.upload()`. Upload directory configured as `/home/Ciami/ruoyi/uploadPath` in `application.yml`.

## Configuration

- `back/ruoyi-admin/src/main/resources/application.yml` — server port 8080, Redis, JWT token (30min), MyBatis, SpringDoc, captcha type (`math`)
- `back/ruoyi-admin/src/main/resources/application-druid.yml` — MySQL datasource (`ry-vue` at localhost:3306), Druid pool, master-slave
- Admin panel env: `back/ruoyi-ui/.env.development` — `VUE_APP_BASE_API = '/dev-api'`
- User app config: `front/vite.config.ts` — proxy rules, `@/` alias, Gemini API key from env

## Database

MySQL database `ry-vue` at localhost:3306. SQL scripts in `back/sql/`:
- `quartz.sql` — Quartz job tables
- `ry_20260417.sql` — main schema (system tables + toy rental tables, seed data)

## Key Nuances

- DataSource auto-config excluded in `RuoYiApplication` (`exclude = DataSourceAutoConfiguration.class`) — Druid configured manually via `application-druid.yml`.
- `@RepeatSubmit` prevents duplicate form submissions via Redis token.
- `RefererFilter` provides hotlink protection; disabled by default.
- XSS filtering enabled with excludes in `xss.excludes`.
- Druid monitoring console at `/druid/`.
- Frontend uses `fetch` directly (no Axios) — error handling checks `json.code !== 200`.
- `start.sh` compiles Redis 7.4.6 from source if binary not found at `/tmp/redis-7.4.6/src/redis-server`.
- Test report at `TEST_REPORT.md` (Playwright, 12 pass / 0 fail / 1 skip, iPhone 14 Pro viewport).
