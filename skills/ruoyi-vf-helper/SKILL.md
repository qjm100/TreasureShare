---
name: ruoyi-dev-helper
description: RuoYi-Vue3-FastAPI 工程化开发助手。当用户需要在 RuoYi-Vue3-FastAPI 项目中开发新功能、生成完整的业务模块代码时使用此 Skill。触发场景包括：创建新的业务模块（Backend + Frontend + App 三端）、添加增删改查接口、理解代码规范、基于 RuoYi 框架的项目开发任务。
---

# RuoYi-Vue3-FastAPI 工程化开发助手

## 核心概念

### 模块 vs 功能

```
模块 (Module)              # 模块是功能的容器
├── 功能1 (Entity/CRUD)   # 单个增删改查
├── 功能2                  # 单个增删改查
└── 功能3                  # 单个增删改查
```

| 概念 | 定义 | 示例 |
|-----|------|------|
| **模块** | 业务域划分，包含多个相关功能 | 会议管理、接待管理、系统管理 |
| **功能** | 单个 CRUD 单元 | 会议室管理、会议类型管理 |

### 三端对应关系

| 层级 | Backend | Frontend | App |
|-----|---------|----------|-----|
| 模块 | `module/{module}/` | `views/{module}/` | `pages/{module}/` |
| 功能 | `module/{module}/controller/` | `views/{module}/{entity}/` | `pages/{module}/{entity}/` |

## 模块结构规范

### Backend 模块结构

```
ruoyi-fastapi-backend/module/{module_name}/
├── __init__.py
├── controller/
│   ├── __init__.py
│   └── {entity_name}_controller.py     # 每个功能一个Controller
├── service/
│   ├── __init__.py
│   └── {entity_name}_service.py        # 每个功能一个Service
├── dao/
│   ├── __init__.py
│   └── {entity_name}_dao.py            # 每个功能一个DAO
├── entity/
│   ├── __init__.py
│   ├── do/
│   │   ├── __init__.py
│   │   └── {entity_name}_do.py         # 每个功能一个DO
│   └── vo/
│       ├── __init__.py
│       └── {entity_name}_vo.py         # 每个功能一个VO
└── sql/
    ├── __init__.py
    └── sys_{entity_name}.sql           # 每个功能一个SQL脚本
```

### Frontend 模块结构

```
ruoyi-fastapi-frontend/src/views/{module_name}/
├── __init__.vue                       # 模块首页（可空）
└── {entity_name}/
    ├── index.vue                       # 功能列表页
    ├── modules/
    │   └── {EntityName}Form.vue       # 表单弹窗
    └── detail.vue                      # 详情页（可选）

ruoyi-fastapi-frontend/src/api/{module_name}/
└── {entity_name}.ts                   # API接口
```

### App 模块结构

```
ruoyi-fastapi-app/src/pages/{module_name}/
├── index.vue                           # 模块首页
└── {entity_name}/
    ├── index.vue                       # 功能列表
    └── form.vue                        # 表单页

ruoyi-fastapi-app/src/api/{module_name}/
└── {entity_name}.ts                   # API接口
```

## 开发流程

### 流程一：创建模块（推荐）

适合：从零开始构建一个完整的业务域

```markdown
Step 1: 确定模块信息
- 模块中文名：____________
- 模块英文名：____________
- 模块描述：____________

Step 2: 定义功能列表
列出模块包含的所有功能（每个功能是一个CRUD）：

| 功能名 | 英文名 | 表名 | 核心字段 | 备注 |
|-------|--------|------|---------|------|
| 功能1 | xxx1 | sys_xxx1 | 字段1,2,3 | 必填 |
| 功能2 | xxx2 | sys_xxx2 | 字段A,B | 可选 |
| ... | ... | ... | ... | ... |

Step 3: 选择生成范围
[ ] Backend 所有功能
[ ] Frontend 所有功能
[ ] App 所有功能
[ ] SQL 脚本（建表+菜单）

Step 4: 生成完整模块
```

### 流程二：创建单个功能

适合：已有模块，添加新功能

```markdown
Step 1: 确定所属模块
- 选择已有模块：____________ 或 新建模块：____________

Step 2: 定义功能信息
- 功能中文名：____________
- 功能英文名：____________
- 数据表名：____________

Step 3: 定义字段
| 字段名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| xxx_id | BigInteger | PK | ID |
| xxx_name | String(50) | 是 | 名称 |
| ... | ... | ... | ... |

Step 4: 选择生成范围
[ ] Backend [ ] Frontend [ ] App
```

## 代码模板参考

| 文件 | 内容 |
|-----|------|
| `references/backend_module.md` | Backend 模块结构 + CRUD 模板 |
| `references/frontend_module.md` | Frontend 页面 + API 模板 |
| `references/app_module.md` | App 页面 + API 模板 |
| `references/registration.md` | 模块注册指南（路由、菜单、依赖） |

## 命名规范

### 命名规则

| 元素 | 规范 | 示例 |
|-----|------|------|
| 模块名 | 英文/小写 | meeting, reception, system |
| 实体名 | 驼峰/英文 | meetingRoom, meetingType |
| 表名 | sys_{entity} | sys_meeting_room |
| 权限标识 | {module}:{entity}:{action} | meeting:room:list |
| 菜单标识 | 数字ID（自增） | 1000, 1001, 1002 |

### 菜单权限标识规范

```
{moudle}:{entity}:list     # 查看列表
{moudle}:entity:add         # 新增
{moudle}:{entity}:edit      # 修改
{moudle}:{entity}:remove    # 删除
{moudle}:{entity}:export    # 导出
{moudle}:{entity}:import   # 导入
```

## 项目路径

| 项目 | 路径 |
|-----|------|
| Backend | `D:\Code\Sailfree\2026\RuoYi-Vue3-FastAPI\ruoyi-fastapi-backend` |
| Frontend | `D:\Code\Sailfree\2026\RuoYi-Vue3-FastAPI\ruoyi-fastapi-frontend` |
| App | `D:\Code\Sailfree\2026\RuoYi-Vue3-FastAPI\ruoyi-fastapi-app` |

## 使用示例

### 示例：创建「会议管理」模块

**输入：**
```
模块名：会议管理
英文名：meeting
包含功能：
1. 会议室管理 (meeting_room) - sys_meeting_room
2. 会议类型管理 (meeting_type) - sys_meeting_type
3. 会议记录管理 (meeting_log) - sys_meeting_log
```

**输出：**
```
meeting 模块
├── backend/
│   ├── controller/
│   │   ├── meeting_room_controller.py
│   │   ├── meeting_type_controller.py
│   │   └── meeting_log_controller.py
│   ├── service/ (×3)
│   ├── dao/ (×3)
│   ├── entity/do/ (×3)
│   ├── entity/vo/ (×3)
│   └── sql/ (×3)
├── frontend/
│   ├── api/meeting/
│   │   ├── room.ts
│   │   ├── type.ts
│   │   └── log.ts
│   └── views/meeting/
│       ├── room/index.vue
│       ├── room/modules/RoomForm.vue
│       ├── type/index.vue
│       ├── type/modules/TypeForm.vue
│       ├── log/index.vue
│       └── log/modules/LogForm.vue
├── app/
│   ├── api/meeting/
│   └── pages/meeting/
│       ├── index.vue
│       ├── room/index.vue
│       ├── room/form.vue
│       ├── type/index.vue
│       ├── type/form.vue
│       ├── log/index.vue
│       └── log/form.vue
└── sql/
    └── menu_meeting.sql  # 菜单SQL
```

### 示例：向已有模块添加功能

**输入：**
```
模块：会议管理 (meeting)
功能：会议预约管理 (meeting_reserve)
```

**输出：**
```
backend/module/meeting/controller/meeting_reserve_controller.py
backend/module/meeting/service/meeting_reserve_service.py
backend/module/meeting/dao/meeting_reserve_dao.py
backend/module/meeting/entity/do/meeting_reserve_do.py
backend/module/meeting/entity/vo/meeting_reserve_vo.py
backend/module/meeting/sql/sys_meeting_reserve.sql

frontend/src/api/meeting/reserve.ts
frontend/src/views/meeting/reserve/index.vue
frontend/src/views/meeting/reserve/modules/ReserveForm.vue

app/src/api/meeting/reserve.ts
app/src/pages/meeting/reserve/index.vue
app/src/pages/meeting/reserve/form.vue
```
