# 儿童绘本与玩具循环租赁共享平台 — 设计文档

**日期**: 2026-05-16 | **版本**: V1.0

## 1. 项目概述

基于 RuoYi (Spring Boot 4.x + MySQL) 后端 + React (TypeScript + Tailwind + Vite) 前台的 P2P 租赁共享平台。用户可发布、浏览、租赁儿童绘本和玩具，支持完整订单流转和社区互动。前台 React 沿用 `front/` 现有 TreasureShare 原型，后台管理使用 RuoYi 自带的 Vue 2 + Element UI（`back/ruoyi-ui/`）。

## 2. 技术选型

| 层 | 技术 | 说明 |
|----|------|------|
| 后台管理前端 | Vue 2 + Element UI + Vue CLI | RuoYi 自带，`back/ruoyi-ui/` |
| 用户端前端 | React 19 + TypeScript + Tailwind CSS 4 + Vite | `front/` 目录 |
| 后端 | Spring Boot 4.0.3, MyBatis, JWT, Druid, Redis | RuoYi 框架，`back/` |
| 数据库 | MySQL 8.0 | 数据库名 `ry-vue` |

## 3. 后端模块架构

在 RuoYi 现有基础上新增 `ruoyi-toyrental` 模块：

```
back/
├── ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/
│   ├── ToyController.java          # 商品（用户端）
│   ├── CartController.java         # 购物车
│   ├── OrderController.java        # 订单
│   ├── CommunityController.java    # 社区
│   ├── EvaluationController.java   # 评价
│   └── UserCenterController.java   # 用户信息/地址
├── ruoyi-toyrental/                # 新增业务模块
│   └── src/main/java/com/ruoyi/toy/
│       ├── domain/                  # 实体类
│       ├── mapper/                  # MyBatis Mapper 接口
│       ├── service/impl/            # 业务逻辑
│       └── resources/mapper/        # Mapper XML
└── ruoyi-ui/src/views/toy/         # 后台管理 Vue 页面
```

Controllors 复用 `BaseController` 提供 `startPage()`、`getDataTable()`、`AjaxResult` 等标准方法。认证使用 RuoYi 的 JWT token 机制，接口加 `@Anonymous` 或需要 token。

## 4. 数据库表设计

### 用户与地址

| 表名 | 字段 | 说明 |
|------|------|------|
| `toy_user` | id, user_id(关联sys_user), avatar, nick_name, credit_score | 扩展用户，含信用分 |
| `toy_address` | id, user_id, receiver_name, phone, province, city, district, detail, is_default | 收货地址 |

### 商品体系

| 表名 | 字段 | 说明 |
|------|------|------|
| `toy_category` | id, parent_id, name, sort, status | 两级分类 |
| `toy_product` | id, user_id, category_id, name, image, price, rent_price_day, rent_price_month, age_range, brand, stock, status, description | status: 0上架 1下架 2待消毒 |
| `toy_product_image` | id, product_id, image_url, sort | 商品图集 |

### 租赁交易

| 表名 | 字段 | 说明 |
|------|------|------|
| `toy_cart` | id, user_id, product_id, duration(租赁月数) | 购物车 |
| `toy_order` | id, order_no, user_id, address_id, total_rent, deposit, status, pay_time, logistics_no, return_logistics_no | status: 0待付款 1待发货 2待收货 3租赁中 4待归还 5待消毒 6已完成 |
| `toy_order_item` | id, order_id, product_id, quantity, rent_price, duration | 订单明细 |
| `toy_payment` | id, order_id, amount, type(租金/押金), method, status, pay_time | 支付记录（演示用） |
| `toy_logistics` | id, order_id, tracking_no, company, type(发货/归还), status | 物流记录 |

### 评价与社区

| 表名 | 字段 | 说明 |
|------|------|------|
| `toy_evaluation` | id, order_id, product_id, user_id, rating, content, images | 1-5星评分 |
| `toy_community_post` | id, user_id, content, images | 社区动态 |
| `toy_community_comment` | id, post_id, user_id, content | 评论 |
| `toy_community_like` | id, post_id, user_id | 点赞 |

所有 `toy_*` 表包含 `create_by`, `create_time`, `update_by`, `update_time`, `remark` 字段（继承 BaseEntity 审计规范）。

## 5. 订单状态流转

```
待付款 → 待发货 → 待收货 → 租赁中 → 待归还 → 待消毒 → 已完成
    ↑                                                   |
    └──────────────── 取消订单 ←───────────────────────┘
```

- **待付款→待发货**: 支付成功
- **待发货→待收货**: 管理员录入物流单号
- **待收货→租赁中**: 用户点击"确认收货"，租期开始
- **租赁中→待归还**: 用户申请归还
- **租赁中→租赁中**: 续租（延长租期）
- **待归还→待消毒**: 仓库收到归还包裹
- **待消毒→已完成**: 管理员确认消毒入库，库存+1

## 6. API 设计

基础路径 `/`，JWT 认证（RuoYi token）。

### 认证（匿名）
- `POST /register` — 注册
- `POST /login` — 登录

### 商品
- `GET /api/toy/products` — 商品列表（分页+筛选）
- `GET /api/toy/products/{id}` — 商品详情
- `POST /api/toy/products` — 发布商品
- `PUT /api/toy/products/{id}` — 编辑
- `DELETE /api/toy/products/{id}` — 下架

### 购物车
- `GET /api/toy/cart` — 我的购物车
- `POST /api/toy/cart` — 加入购物车
- `PUT /api/toy/cart/{id}` — 修改时长
- `DELETE /api/toy/cart/{id}` — 移除

### 订单
- `POST /api/toy/orders` — 生成订单
- `GET /api/toy/orders` — 我的订单
- `GET /api/toy/orders/{id}` — 订单详情
- `PUT /api/toy/orders/{id}/pay` — 模拟支付
- `PUT /api/toy/orders/{id}/receive` — 确认收货
- `PUT /api/toy/orders/{id}/return` — 申请归还
- `PUT /api/toy/orders/{id}/renew` — 续租

### 评价与社区
- `POST /api/toy/evaluations` — 发布评价
- `GET /api/toy/evaluations/{productId}` — 商品评价
- `GET /api/toy/community/posts` — 动态列表
- `POST /api/toy/community/posts` — 发布动态
- `POST /api/toy/community/comment` — 评论
- `POST /api/toy/community/like/{postId}` — 点赞

### 地址
- `GET /api/toy/addresses` — 地址列表
- `POST /api/toy/addresses` — 新增
- `PUT /api/toy/addresses/{id}` — 修改
- `DELETE /api/toy/addresses/{id}` — 删除

## 7. React 前台路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 发现（首页） | 商品瀑布流 + 分类 + 搜索 |
| `/detail/:id` | 商品详情 | 轮播图、租金、评价 |
| `/cart` | 购物车 | 商品列表、修改时长 |
| `/checkout` | 结算页 | 选地址、确认金额 |
| `/orders` | 我的订单 | 按状态分Tab |
| `/order/:id` | 订单详情 | 状态、物流、操作按钮 |
| `/messages` | 消息 | 聊天（原型已有） |
| `/profile` | 个人主页 | 信息、地址管理 |
| `/post` | 发布宝贝 | 上传商品 |
| `/community` | 社区 | 动态列表+发布 |
| `/login` | 登录/注册 | 用户名+密码 |

底部导航：发现 / 社区 / 发布 / 消息 / 我的

## 8. RuoYi 后台管理页面

| 菜单 | 路径 | 功能 |
|------|------|------|
| 商品管理 | `toy/product` | 列表+搜索+上架/下架 |
| 商品分类 | `toy/category` | 分类树增删改 |
| 订单管理 | `toy/order` | 订单列表+发货+消毒入库 |
| 评价管理 | `toy/evaluation` | 评价列表+违规删除 |
| 社区管理 | `toy/community` | 动态列表+违规删除 |
| 数据看板 | `toy/dashboard` | 订单量+热门排行 |

## 9. 实施顺序

1. **数据库 + 后端基础** — SQL 脚本、ruoyi-toyrental 模块、实体、Mapper
2. **后端 API** — Controller + Service：用户→商品→购物车→订单→评价→社区
3. **后台管理页面** — RuoYi Vue 6个管理页面
4. **前台核心** — 首页→详情→购物车→结算→订单流程
5. **前台周边** — 社区、评价、个人中心、地址
6. **集成验证** — 前后端联调
