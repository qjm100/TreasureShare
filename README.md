# TreasureShare — 玩具租赁共享平台

基于 RuoYi v3.9.2 构建的全栈玩具租赁共享平台。用户可发布闲置玩具供他人租赁，支持订单全生命周期管理、实时消息、社区互动和数据看板。

**作者:** Ciami

---

## 目录

- [项目截图](#项目截图)
- [技术栈](#技术栈)
- [功能模块](#功能模块)
- [架构设计](#架构设计)
- [快速开始](#快速开始)
- [API 接口文档](#api-接口文档)
- [核心代码展示](#核心代码展示)
- [数据库设计](#数据库设计)
- [测试数据](#测试数据)
- [项目结构](#项目结构)
- [订单状态流转](#订单状态流转)

---

## 项目截图

### 用户端 (React + Vite)

| 页面 | 说明 |
|------|------|
| 发现页 | 商品浏览、分类筛选、搜索 |
| 商品详情 | 商品信息、租期选择、加入购物车 |
| 购物车 | 管理待租商品，调整租期 |
| 订单列表 | 查看所有订单，按状态筛选 |
| 订单详情 | 订单状态、物流信息、支付/归还操作 |
| 我的出租 | 卖家发货、确认归还、消毒完成 |
| 社区 | 发布/浏览帖子、点赞、评论 |
| 消息 | 实时聊天、会话列表、用户搜索 |
| 个人中心 | 资料编辑、地址管理、商品管理 |

> **获取截图:** 启动项目后访问 `http://localhost:5173` 浏览各页面截图。

### 管理后台 (Vue 2 + Element UI)

| 页面 | 说明 |
|------|------|
| 数据看板 | 用户/商品/订单统计、状态分布饼图 |
| 订单管理 | 订单列表、搜索筛选、发货/归还/消毒操作 |
| 商品管理 | 商品 CRUD、上下架管理 |
| 分类管理 | 商品分类树维护 |
| 评价管理 | 订单评价审核 |
| 社区管理 | 帖子/评论管理 |

> **获取截图:** 启动后访问 `http://localhost:1024`，使用 `admin` / `admin123` 登录。

### 数据看板示例

当前运行数据 (2026-05-17):

```
┌─────────────────────────────────────────────────────┐
│  今日订单: 9    商品总数: 3   进行中订单: 3   平台用户: 6  │
├─────────────────────────────────────────────────────┤
│  订单状态分布:                                        │
│  待付款: 3   待发货: 2   待归还: 0                     │
│  待消毒: 1   已完成: 2   已取消: 2                     │
└─────────────────────────────────────────────────────┘
```

---

## 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17+ | 运行环境 |
| Spring Boot | 4.x | 应用框架 |
| MyBatis | 3.x | ORM 持久层 |
| MySQL | 5.7+ | 关系型数据库 |
| Redis | 7.4 | 缓存与 Token 管理 |
| Druid | 1.2 | 数据库连接池 |
| JWT | 0.9 | 无状态认证 |
| Maven | 3.8+ | 项目构建 |

### 前端 (用户端)

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 3.x | 原子化 CSS |
| Motion (Framer) | 11.x | 动画库 |
| Lucide React | | 图标库 |
| React Router | 7.x | 客户端路由 |

### 前端 (管理后台)

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 2.x | UI 框架 |
| Element UI | 2.x | 组件库 |
| Axios | | HTTP 客户端 |
| ECharts | 5.x | 数据可视化 |
| Vuex | 3.x | 状态管理 |

---

## 功能模块

### 用户端功能

- **商品发现** — 分类浏览、多条件筛选、商品搜索
- **购物车** — 添加商品、调整租期、批量下单
- **订单系统** — 创建订单、模拟支付、确认收货、申请归还
- **物流管理** — 卖家填写发货单号、买家填写归还单号
- **我的出租** — 卖家视角的订单管理，发货/确认归还/消毒完成
- **社区互动** — 发布帖子、评论、点赞
- **实时消息** — 用户搜索、会话列表、消息轮询
- **个人中心** — 资料编辑、收货地址管理、商品管理

### 管理后台功能

- **数据看板** — 实时统计：用户数、商品数、今日订单、进行中订单、状态分布饼图
- **订单管理** — 全量订单查询、状态筛选、物流管理、归还确认
- **商品管理** — 商品增删改查、分类管理
- **评价管理** — 订单评价查看与管理
- **社区管理** — 帖子管理、评论管理

---

## 架构设计

```
┌──────────────────────────────────────────────────────────┐
│                      客户端层                             │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │  React 用户端 (:5173)│  │  Vue 管理后台 (:1024)       │ │
│  │  Vite + Tailwind    │  │  Element UI + Axios        │ │
│  └─────────┬───────────┘  └─────────────┬──────────────┘ │
└────────────┼──────────────────────────────┼────────────────┘
             │  /api/*  (JWT Bearer Token)  │  /api/* + /dev-api/*
             ▼                              ▼
┌──────────────────────────────────────────────────────────┐
│                    Spring Boot (:8080)                    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  ruoyi-admin (Controller 层)                      │    │
│  │  OrderController  CartController  ToyController   │    │
│  │  MessageController  CommunityController  ...      │    │
│  └──────────────────────┬───────────────────────────┘    │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │  ruoyi-toyrental (Service + Mapper 层)            │    │
│  │  ToyOrderService  ToyProductService  ...          │    │
│  │  ToyOrderMapper   ToyProductMapper   ...          │    │
│  └──────────────────────┬───────────────────────────┘    │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │  ruoyi-framework (安全 + 中间件)                   │    │
│  │  JWT Filter  SecurityConfig  DataScope           │    │
│  └──────────────────────┬───────────────────────────┘    │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │  ruoyi-common (基础组件)                           │    │
│  │  BaseController  AjaxResult  RedisCache           │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌──────────┐           ┌──────────────┐
        │  MySQL    │           │    Redis      │
        │  ry-vue   │           │  cache/token  │
        └──────────┘           └──────────────┘
```

### 分层说明

| 模块 | 职责 |
|------|------|
| `ruoyi-admin` | HTTP 入口，Controller 层 (`com.ruoyi.web.controller.toy`) |
| `ruoyi-toyrental` | 业务逻辑层，含 Service / Mapper / Domain |
| `ruoyi-framework` | JWT 认证、安全配置、全局异常处理 |
| `ruoyi-common` | 通用工具类、基础实体、返回格式封装 |

---

## 快速开始

### 环境要求

- JDK 17+
- Node.js 20+
- MySQL 5.7+ (root 密码: `123456`)
- Maven 3.8+

### 一键启动

```bash
cd /home/Ciami/Software-engineer-final
./start.sh start       # 启动所有服务 (MySQL → Redis → Backend → Frontend)
./start.sh status      # 查看服务状态
./start.sh restart     # 重启所有服务
./start.sh stop        # 停止所有服务
```

### 手动启动

**1. 确保 MySQL 运行并导入数据:**

```bash
# 数据库已在 ry-vue 中初始化完毕
mysql -u root -p'123456' -e "USE \`ry-vue\`; SHOW TABLES LIKE 'toy_%';"
```

**2. 启动 Redis:**

```bash
redis-server --daemonize yes --port 6379
```

**3. 启动后端:**

```bash
cd back
mvn install -DskipTests
mvn spring-boot:run -pl ruoyi-admin -DskipTests
# 后端运行在 :8080
```

**4. 启动用户端前端:**

```bash
cd front
npm install
npx vite --host --port 5173
# 用户端运行在 :5173
```

**5. 启动管理后台:**

```bash
cd back/ruoyi-ui
npm install
npm run dev
# 管理后台运行在 :1024
```

### 服务端口

| 服务 | 地址 |
|------|------|
| 用户端 | http://localhost:5173 |
| 管理后台 | http://localhost:1024 |
| 后端 API | http://localhost:8080 |
| Swagger 文档 | http://localhost:8080/swagger-ui.html |
| Druid 监控 | http://localhost:8080/druid/ |

### 管理员账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| `admin` | `admin123` | 超级管理员，拥有全部权限 |

---

## API 接口文档

### 商品接口 `/api/toy/products`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/toy/products` | 商品列表（含分类名、发布者昵称） |
| GET | `/api/toy/products/{id}` | 商品详情（含图片列表） |
| GET | `/api/toy/products/my` | 我的发布 |
| POST | `/api/toy/products` | 发布商品 |
| PUT | `/api/toy/products/{id}` | 更新商品 |
| DELETE | `/api/toy/products/{id}` | 删除商品（软删除） |

### 订单接口 `/api/toy/orders`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/toy/orders` | 我的订单列表（支持分页） |
| GET | `/api/toy/orders/seller` | 卖家订单（我租出去的） |
| GET | `/api/toy/orders/{id}` | 订单详情 |
| POST | `/api/toy/orders` | 创建订单 `{addressId}` |
| PUT | `/api/toy/orders/{id}/pay` | 支付订单 |
| PUT | `/api/toy/orders/{id}/ship` | 发货 `{logisticsNo}` |
| PUT | `/api/toy/orders/{id}/receive` | 确认收货 |
| PUT | `/api/toy/orders/{id}/return` | 申请归还 `{returnLogisticsNo}` |
| PUT | `/api/toy/orders/{id}/confirm-return` | 确认归还 |
| PUT | `/api/toy/orders/{id}/disinfect` | 消毒完成 |
| PUT | `/api/toy/orders/{id}/renew` | 续租 |
| PUT | `/api/toy/orders/{id}/cancel` | 取消订单 |

### 消息接口 `/api/toy/messages`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/toy/messages/conversations` | 会话列表 |
| GET | `/api/toy/messages/{peerId}` | 消息历史 |
| POST | `/api/toy/messages` | 发送消息 `{receiverId, content}` |

### 社区接口 `/api/toy/community`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/toy/community/posts` | 帖子列表（支持昵称搜索） |
| GET | `/api/toy/community/posts/{id}` | 帖子详情 |
| POST | `/api/toy/community/posts` | 发布帖子 |
| DELETE | `/api/toy/community/posts/{id}` | 删除帖子 |
| GET | `/api/toy/community/comments/{postId}` | 评论列表 |
| POST | `/api/toy/community/comment` | 添加评论 |
| POST | `/api/toy/community/like/{postId}` | 点赞/取消点赞 |

### 其他接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/toy/dashboard/stats` | 数据看板统计 |
| GET | `/api/toy/categories/tree` | 分类树 |
| GET/POST/PUT/DELETE | `/api/toy/addresses` | 地址 CRUD |
| GET/POST/PUT/DELETE | `/api/toy/cart` | 购物车 CRUD |
| POST | `/api/toy/upload` | 文件上传 |
| GET/PUT | `/api/toy/user/profile` | 用户资料 |
| GET | `/api/toy/user/search` | 用户搜索 |

---

## 核心代码展示

### 订单创建与防自购 (ToyOrderServiceImpl.java)

```java
@Override
@Transactional
public Long createOrder(Long addressId) {
    Long userId = SecurityUtils.getUserId();

    // 获取购物车列表
    List<ToyCart> cartList = cartMapper.selectCartList(userId);
    if (cartList == null || cartList.isEmpty()) {
        throw new ServiceException("购物车为空");
    }

    // 验证不能购买自己的商品
    for (ToyCart item : cartList) {
        ToyProduct product = productMapper.selectProductById(item.getProductId());
        if (product != null && userId.equals(product.getUserId())) {
            throw new ServiceException("不能购买自己发布的商品");
        }
    }

    // 计算租金和押金
    BigDecimal totalRent = BigDecimal.ZERO;
    for (ToyCart item : cartList) {
        BigDecimal rent = item.getRentPriceMonth()
            .multiply(BigDecimal.valueOf(item.getDuration()));
        totalRent = totalRent.add(rent);
    }
    // ...

    // 创建订单 → 创建订单项 → 清空购物车
    orderMapper.insertOrder(order);
    // ...
    return order.getId();
}
```

### 会话列表 SQL 归一化 (ToyMessageMapper.xml)

```xml
<select id="selectConversations" resultMap="ToyMessageResult">
    select m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.create_time,
           case when m.sender_id = #{userId}
                then u2.nick_name else u1.nick_name end as sender_name,
           case when m.sender_id = #{userId}
                then u2.avatar else u1.avatar end as sender_avatar
    from toy_message m
    left join toy_user u1 on m.sender_id = u1.user_id
    left join toy_user u2 on m.receiver_id = u2.user_id
    where m.id in (
        select max(id) from toy_message
        where sender_id = #{userId} or receiver_id = #{userId}
        group by case when sender_id = #{userId}
                   then receiver_id else sender_id end
    )
    order by m.create_time desc
</select>
```

### 前端路由与布局 (App.tsx)

```tsx
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Discovery />} />
        <Route path="/detail/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/rented-out" element={<RentedOut />} />
        <Route path="/community" element={<Community />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
```

### 前端 API 层 (api.ts)

```typescript
const BASE = '/api/toy';

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? {'Authorization': `Bearer ${token}`} : {}),
  };
  const res = await fetch(url, {...options, headers});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.msg || 'Error');
  return json;
}

export const api = {
  getProducts: (params) => request(`${BASE}/products?${new URLSearchParams(params)}`),
  getOrders: () => request(`${BASE}/orders`),
  getSellerOrders: () => request(`${BASE}/orders/seller`),
  createOrder: (addressId) =>
    request(`${BASE}/orders`, {method: 'POST', body: JSON.stringify({addressId})}),
  returnOrder: (id, returnLogisticsNo) =>
    request(`${BASE}/orders/${id}/return`,
      {method: 'PUT', body: JSON.stringify({returnLogisticsNo})}),
  // ...
};
```

### 卖家订单查询 SQL (ToyOrderMapper.xml)

```xml
<select id="selectSellerOrders" parameterType="Long" resultMap="ToyOrderResult">
    <include refid="selectOrderVo"/>
    where o.id in (
        select distinct oi.order_id from toy_order_item oi
        inner join toy_product p on oi.product_id = p.id
        where p.user_id = #{userId}
    )
    order by o.create_time desc
</select>
```

### 数据看板统计 (DashboardController.java)

```java
@RestController
@RequestMapping("/api/toy/dashboard")
public class DashboardController extends BaseController {
    @Autowired
    private DataSource dataSource;

    @GetMapping("/stats")
    public AjaxResult stats() {
        Map<String, Object> result = new HashMap<>();
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(
                "SELECT COUNT(*) FROM sys_user WHERE del_flag = '0'");
            if (rs.next()) result.put("totalUsers", rs.getLong(1));

            rs = stmt.executeQuery(
                "SELECT COUNT(*) FROM toy_product WHERE status = '0'");
            if (rs.next()) result.put("totalProducts", rs.getLong(1));

            rs = stmt.executeQuery(
                "SELECT COUNT(*) FROM toy_order WHERE DATE(create_time) = CURDATE()");
            if (rs.next()) result.put("todayOrders", rs.getLong(1));

            // ... status distribution query
        }
        return success(result);
    }
}
```

---

## 数据库设计

### ER 图 (核心表)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   toy_user    │       │  toy_product  │       │  toy_order    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │──┐    │ id           │──┐    │ id           │
│ user_id      │  │    │ user_id ─────┼─┼────│ user_id       │
│ nick_name    │  │    │ category_id  │  │    │ address_id    │
│ avatar       │  │    │ name         │  │    │ order_no      │
│ credit_score │  │    │ price        │  │    │ total_rent    │
└──────────────┘  │    │ rent_price_month│  │    │ deposit       │
                  │    │ stock        │  │    │ status        │
                  │    │ status       │  │    │ logistics_no  │
                  │    │ description  │  │    │ return_logistics_no│
                  │    └──────────────┘  │    │ pay_time      │
                  │                     │    │ create_time   │
                  │    ┌──────────────┐  │    └──────────────┘
                  │    │toy_order_item │  │           │
                  │    ├──────────────┤  │           │
                  │    │ id           │  │     ┌─────┘
                  │    │ order_id ────┼──┘     │
                  │    │ product_id ──┼────────┘
                  │    │ quantity     │
                  │    │ rent_price   │
                  │    │ duration     │
                  │    └──────────────┘
                  │
                  │    ┌──────────────┐       ┌──────────────┐
                  └────│  toy_cart    │       │ toy_message   │
                       ├──────────────┤       ├──────────────┤
                       │ id           │       │ id           │
                       │ user_id      │       │ sender_id    │
                       │ product_id   │       │ receiver_id  │
                       │ duration     │       │ content      │
                       └──────────────┘       │ is_read      │
                                              └──────────────┘
```

### 核心表说明

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `toy_product` | 商品表 | `user_id`(发布者), `status`('0'上架/'1'删除), `stock`(库存) |
| `toy_order` | 订单表 | `status`('0'-'7'), `logistics_no`, `return_logistics_no` |
| `toy_order_item` | 订单项表 | `order_id`, `product_id`, `rent_price`, `duration` |
| `toy_cart` | 购物车表 | `user_id`, `product_id`, `duration`(租期月数) |
| `toy_message` | 消息表 | `sender_id`, `receiver_id`, `is_read` |
| `toy_user` | 用户扩展表 | `nick_name`, `avatar`, `credit_score` |
| `toy_address` | 收货地址表 | `receiver_name`, `phone`, `province`, `city`, `district` |
| `toy_category` | 商品分类表 | `parent_id`(树形结构), `name` |
| `toy_evaluation` | 评价表 | `order_id`, `product_id`, `rating`, `content` |
| `toy_community_post` | 社区帖子表 | `user_id`, `content`, `images` |
| `toy_community_comment` | 社区评论表 | `post_id`, `user_id`, `content` |
| `toy_community_like` | 点赞表 | `post_id`, `user_id` |

---

## 测试数据

### 数据库统计 (2026-05-17)

| 表 | 记录数 |
|----|--------|
| toy_product | 13 |
| toy_order | 10 |
| toy_user | 5 |
| toy_order_item | 11 |
| toy_cart | 1 |
| toy_message | 2 |
| toy_community_post | 2 |
| toy_category | 11 |
| toy_address | 5 |
| toy_evaluation | 1 |

### 测试用例

**1. 发布商品** — POST `/api/toy/products`
```json
{
  "name": "儿童绘本-好饿的毛毛虫",
  "categoryId": 1,
  "rentPriceDay": 5,
  "rentPriceMonth": 15,
  "price": 39.9,
  "stock": 3,
  "ageRange": "3-6岁",
  "description": "经典儿童绘本，适合亲子阅读"
}
```

**2. 创建订单** — POST `/api/toy/orders`
```json
{ "addressId": 1 }
```

**3. 支付订单** — PUT `/api/toy/orders/{id}/pay`

**4. 发货** — PUT `/api/toy/orders/{id}/ship`
```json
{ "logisticsNo": "SF1234567890" }
```

**5. 申请归还** — PUT `/api/toy/orders/{id}/return`
```json
{ "returnLogisticsNo": "YT0987654321" }
```

**6. 确认归还** — PUT `/api/toy/orders/{id}/confirm-return`

**7. 消毒完成** — PUT `/api/toy/orders/{id}/disinfect`

### 登录测试

```bash
# 获取 Token
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 查询商品
curl http://localhost:8080/api/toy/products

# 查询消息会话（需要 Token）
TOKEN="eyJ..."  # 从上一步获取
curl http://localhost:8080/api/toy/messages/conversations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 订单状态流转

```
  创建订单
     │
     ▼
  ┌──────┐   支付    ┌──────┐   发货    ┌──────┐   收货    ┌──────┐
  │ 0-待 │ ──────→ │ 1-待 │ ──────→ │ 2-待 │ ──────→ │ 3-租 │
  │ 付款 │         │ 发货 │         │ 收货 │         │ 赁中 │
  └──┬───┘         └──────┘         └──────┘         └──┬───┘
     │ 取消                                         归还 │
     ▼                                             ┌──┴───┐
  ┌──────┐   取消    ┌──────┐   取消    ┌──────┐    │ 4-待 │
  │ 7-已 │ ←────── │ 1-待 │ ←────── │ 0-待 │    │ 归还 │
  │ 取消 │         │ 发货 │         │ 付款 │    └──┬───┘
  └──────┘         └──────┘         └──────┘       │ 卖家确认归还
                                                    ▼
  ┌──────┐   消毒    ┌──────┐                  ┌──────┐
  │ 6-已 │ ←────── │ 5-待 │                  │      │
  │ 完成 │         │ 消毒 │ ←──────────────── │      │
  └──────┘         └──────┘                  └──────┘
```

| 状态码 | 名称 | 操作人 | 说明 |
|--------|------|--------|------|
| 0 | 待付款 | 买家 | 订单已创建，等待支付 |
| 1 | 待发货 | 卖家 | 已支付，卖家填写物流发货 |
| 2 | 待收货 | 买家 | 已发货，买家确认收货 |
| 3 | 租赁中 | — | 租赁进行中，可续租或归还 |
| 4 | 待归还 | 卖家 | 买家已填写归还物流，卖家确认收到 |
| 5 | 待消毒 | 卖家 | 卖家确认消毒完成，恢复库存 |
| 6 | 已完成 | — | 交易完成 |
| 7 | 已取消 | 买家 | 订单取消（仅 0/1 状态可取消） |

---

## 项目结构

```
Software-engineer-final/
├── start.sh                          # 一键启动/停止脚本
├── CLAUDE.md                         # 项目开发指南
├── TEST_REPORT.md                    # 测试报告
├── README.md                         # 本文件
├── back/                             # 后端 Maven 多模块项目
│   ├── ruoyi-admin/                  # 入口模块 (Controller + 启动类)
│   │   └── src/main/java/com/ruoyi/web/controller/toy/
│   │       ├── CartController.java       # 购物车接口
│   │       ├── CategoryController.java   # 分类接口
│   │       ├── CommunityController.java  # 社区接口
│   │       ├── DashboardController.java  # 数据看板接口
│   │       ├── EvaluationController.java # 评价接口
│   │       ├── MessageController.java    # 消息接口
│   │       ├── OrderController.java      # 订单接口
│   │       ├── ToyController.java        # 商品接口
│   │       ├── ToyUploadController.java  # 文件上传接口
│   │       └── UserCenterController.java # 用户中心接口
│   ├── ruoyi-toyrental/              # 业务模块
│   │   └── src/main/java/com/ruoyi/toy/
│   │       ├── domain/               # 15个实体类
│   │       ├── mapper/               # 13个MyBatis映射接口
│   │       └── service/              # 9个Service接口 + 9个实现
│   ├── ruoyi-framework/              # 安全框架 (JWT, Spring Security)
│   ├── ruoyi-common/                 # 通用工具 (BaseController, AjaxResult)
│   ├── ruoyi-system/                 # 系统管理 (用户/角色/菜单)
│   ├── ruoyi-quartz/                 # 定时任务
│   ├── ruoyi-generator/              # 代码生成器
│   └── ruoyi-ui/                     # Vue 2 管理后台
│       └── src/views/toy/
│           ├── dashboard/index.vue   # 数据看板
│           ├── order/index.vue       # 订单管理
│           ├── product/index.vue     # 商品管理
│           ├── category/index.vue    # 分类管理
│           ├── evaluation/index.vue  # 评价管理
│           └── community/index.vue   # 社区管理
└── front/                            # React 用户端
    └── src/
        ├── App.tsx                   # 路由 + 布局
        ├── api.ts                    # API 封装层
        ├── types.ts                  # TypeScript 类型定义
        ├── main.tsx                  # 入口
        ├── components/
        │   └── ImgWithFallback.tsx   # 图片容错组件
        └── pages/
            ├── Discovery.tsx         # 发现页 (首页)
            ├── ProductDetail.tsx     # 商品详情
            ├── Cart.tsx              # 购物车
            ├── Checkout.tsx          # 结算页
            ├── Orders.tsx            # 订单列表
            ├── OrderDetail.tsx       # 订单详情
            ├── RentedOut.tsx         # 我的出租
            ├── Community.tsx         # 社区
            ├── PostPublish.tsx       # 发布帖子
            ├── Messages.tsx          # 消息中心
            ├── Profile.tsx           # 个人中心
            └── Login.tsx             # 登录页
```

---

## 已修复的关键 Bug

| 问题 | 根因 | 修复 |
|------|------|------|
| 消息会话显示自己名字 | Service 层二次覆盖 SQL 已归一化的字段 | 移除冗余的名称交换逻辑 |
| 管理员无法处理归还 | 缺少状态 4→5 的操作按钮及 API | 添加 confirmReturn API + "确认归还"按钮 |
| 数据看板状态数据不准 | 归还流程卡住导致状态分布错误 | 完善归还流程后数据自动恢复 |
| 用户搜索消息显示自己 | LEFT JOIN 后未排除当前用户 | 搜索结果中过滤当前用户 |
| 删除商品报错 | 未验证商品所有权 | 添加发布者身份校验 |
| 购买自己的商品 | createOrder 无自购校验 | 购物车结算时检查商品发布者 |
| 首页 Tab 切换需刷新 | AnimatePresence 导致双实例挂载 | 移除 Outlet 级别的 AnimatePresence |

---

## License

Apache-2.0 — 基于 RuoYi v3.9.2 二次开发

**作者:** Ciami
