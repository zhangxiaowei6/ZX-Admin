# ZX Admin 项目开发规范

本文件是本仓库面向 AI 编码代理与开发者的**唯一项目规范来源**，已合并原 `AGENTS.md` 与 `CLAUDE.md` 的有效内容，并按当前代码校正过时信息。`CLAUDE.md` 仅作为兼容入口链接到本文件。

## 工作原则

- **优先轻方案**：优先选择简单、直接、可维护的实现，避免为未出现的需求提前设计复杂抽象。
- **遵循惯用模式**：顺应 React、TypeScript、Ant Design、React Query 与 Zustand 的既有用法。
- **保持改动聚焦**：只修改当前任务需要的代码，不顺带重构或修复无关问题。
- **复用现有能力**：新增实现前先查找已有组件、Hooks、Services、工具函数和相邻页面模式。
- **以当前代码为准**：文档与实现冲突时先核实代码；改变项目约定时同步更新本文件和仓库技能。

## 技术栈与命令

- Node.js：`>= 18`
- React 18、TypeScript 5、Vite 5、React Router 6
- Ant Design 5、Ant Design Pro Components
- Zustand 4、TanStack React Query 5、Axios
- i18next / react-i18next
- Mock：请求层静态 Mock（空 API 地址时启用）
- 路径别名：`@/` 指向 `src/`

```bash
npm run dev           # 开发服务器 http://localhost:3000；API 地址为空时使用 mock
npm run build         # 生产构建：tsc + vite build
npm run build:demo    # Demo 构建
npm run preview       # 预览生产构建
npm run preview:demo  # 构建并预览 Demo
npm run lint          # ESLint，最大 warning 数为 0
```

当前项目**未配置自动化测试命令**。默认只执行静态检查，例如 `npm run lint`、文件结构检查、类型和引用的静态核对。除非用户明确要求，否则不要运行 `npm run build`、`npm run build:demo` 或其他编译、打包检查。

## 环境变量

模板为 `.env.example`，仓库还包含 `.env.development`、`.env.production`、`.env.demo`、`.env.test`。

```bash
VITE_API_BASE_URL=           # API 基础地址；为空时启用对应环境的 mock
VITE_CRYPTO_ENABLED=false    # 是否启用 AES 请求/响应加密
VITE_APP_KEY=merchant-admin  # 请求签名 App Key
VITE_APP_SECRET=change-me    # 请求签名密钥；禁止提交真实密钥
VITE_BASE_PATH=/             # 部署基础路径
```

本地私有覆盖使用 `.env.local` 或 `.env.*.local`。不得提交真实密钥、Token、生产凭据或本地私有配置。

## 系统架构

### 双层多租户后台

- **平台后台**：路由前缀 `/`，使用 `AppLayout`，管理租户、平台用户、角色、菜单和消息。
- **租户后台**：路由前缀 `/tenant-admin/:tenantId`，使用 `TenantLayout`，处理租户订单、产品、设置及系统管理。

平台与租户共享 `BaseLayout`、通用组件、请求层和基础 Hooks；页面、API、类型按平台域和租户域分层，静态 Mock 统一注册在 `src/api/mock/`。

### 统一路由与菜单

路由和菜单已合并为统一配置，不再维护两套静态常量：

- 平台：`src/config/routes/platform.config.tsx`
- 租户：`src/config/routes/tenant.config.tsx`
- 类型与生成器：`src/config/routes/types.ts`
- Router 适配：`src/routes/modules/platform.tsx`、`src/routes/modules/tenant.tsx`

`generateRoutes()` 生成路由对象和 `handle.permission`，`generateMenuItems()` 从同一配置生成菜单。新增或调整页面时：

1. 在对应配置中维护 `path`、`component`、`name`、`icon`、`permission`、`group`。
2. 不要另建独立菜单配置。
3. 隐藏菜单但保留路由时使用 `hideInMenu`；索引跳转使用 `redirectTo`。
4. 菜单名称来自 i18n，不写死单一语言。
5. 若未来改为后端驱动路由，后端只下发稳定 `componentKey`，前端通过白名单 `componentMap` 映射；禁止执行后端提供的动态导入路径。

### 两步登录与平台切换

1. `preLogin` 提交凭证并获取可用平台。
2. 多平台时用户选择，单平台时自动继续。
3. `loginPlatform` 完成登录并获取 Token、用户信息和权限。

已登录用户通过 `/login?switch=1` 进入平台切换流程；普通已登录用户访问 `/login` 会被重定向到平台首页。

### 路由守卫与权限

入口守卫为 `src/routes/Guard.tsx`：

- 未认证用户访问非 `/login` 页面时跳转登录页。
- 白名单为 `/login`、`/403`、`/404`。
- 等待 Zustand 水合和权限加载完成后再判断，避免未加载时错误放行。
- 空 `permissions` 数组表示完全访问，这是后端兼容语义，不能擅自改为“无权限”。
- 页面权限来自统一路由配置中的 `permission`，生成到 `handle.permission`。
- 按钮和局部区域使用 `HasPermission` 或 `usePermission()`。
- 权限码使用后端实际下发值，不得通过 URL 前缀推断，不得为统一格式擅自重命名既有权限码。
- 新增页面时保持路由权限与页面内操作权限语义一致。

现有权限码以 `module:resource:action` 风格为主，但也存在 `dashboard`、`message`、`tenant:list` 和租户后台多段权限码。

## 请求、安全与跨标签页同步

所有 API 调用通过 `src/api/request.ts`：

- 从 `localStorage['user-storage']` 即时读取 Token。
- 自动添加 `Authorization`、`X-App-Key`、`X-Timestamp`、`X-Nonce`、`X-Sign`。
- 签名由 `src/utils/sign.ts` 生成。
- `VITE_CRYPTO_ENABLED=true` 时通过 `src/utils/crypto.ts` 加解密。
- `code === 200` 时返回 `data`；响应结构异常、解密失败和业务错误拒绝 Promise。
- 非登录流程的 401 清理登录态、广播登出并使用 `window.location.replace()` 跳转。
- 预登录、平台登录、平台列表和平台切换接口的 401 由调用方处理，不能触发全局重复登出。

业务组件不得绕过封装创建 Axios 实例。API 定义集中在 `src/api/modules/platform/` 或 `src/api/modules/tenant/`。

`src/utils/authChannel.ts` 使用 `BroadcastChannel` 同步 `logout`、`switchPlatform` 和 `storeSettingUpdated`。新增事件时扩展现有封装，不在业务页面重复创建频道。

## 状态管理

| Store | 文件 | 职责与持久化 |
|---|---|---|
| `useUserStore` | `src/stores/useUserStore.ts` | 持久化 `token`、`saasName`、`permissions`；`userInfo` 和加载标记为运行时状态 |
| `useAppStore` | `src/stores/useAppStore.ts` | UI 设置、标签页、锁屏、主题、表单、表格和语言；持久化所有非函数字段到 `app-settings` |
| `useMessageStore` | `src/stores/useMessageStore.ts` | 消息通知和未读计数 |

默认 UI 设置来自 `src/config/defaultSettings.json`。主题相关更新通过 `withViewTransition()` 使用 View Transition API，不支持时自动降级。

多属性订阅必须使用 `useShallow`；单属性使用选择器。禁止直接调用 `useAppStore()` 后解构整个 Store。

```tsx
import { useShallow } from 'zustand/react/shallow'

const { tableSize, tableBordered } = useAppStore(
  useShallow((state) => ({
    tableSize: state.tableSize,
    tableBordered: state.tableBordered,
  })),
)

const systemLogo = useAppStore((state) => state.systemLogo)
```

## 页面、组件与表单

页面通常按以下结构组织，仅在确有私有逻辑时创建对应目录：

```text
pages/ModuleName/
├── index.tsx
├── components/
└── hooks/
```

- 页面私有查询、Mutation 和交互逻辑优先放在页面 `hooks/`。
- 跨页面 UI 放在 `src/components/common/`。
- 布局能力放在 `src/components/layout/`。
- 复杂且与 UI 无关的转换、过滤和树处理放在 `src/services/`。
- 组件保持小而专注，避免一个文件同时承担查询、转换、表单和全部渲染。

### 表单必须使用 FormContainer

业务表单弹窗或抽屉必须使用 `src/components/common/FormContainer`，不得直接使用 `ModalForm` 或 `DrawerForm`。`FormContainer` 自动适配：

- `formDisplayMode`：`modal` / `drawer`
- `formColumns`：`1` / `2`
- `formSizePreset`：`small` / `medium` / `large`
- 标签对齐、组件尺寸、冒号和布局等全局设置

列布局优先级：字段级 `colProps` > 页面级 `formSize` > 全局 `formSizePreset`。

尺寸映射位于 `src/constants/ui/formSize.ts`：

- Small：Modal 520px / Drawer 480px
- Medium：Modal 720px / Drawer 700px
- Large：Modal 960px / Drawer 1000px

### 通用组件

- `PageContainer`：页面容器与面包屑。
- `FormContainer`：遵循全局偏好的 Modal / Drawer 表单。
- `ProTable` / `EditableProTable`：分页、字典、导出、列宽拖拽和全局表格偏好。
- `DictTag`：字典代码映射为标签文本和颜色。
- `HasPermission`：按钮和局部区域权限渲染。
- `PermissionTreePanel`：权限树搜索、选择和只读展示。
- `VersionUpdateBar`、`ErrorBoundary`、`PageSkeleton`：版本提示、错误边界和骨架屏。

表格优先从 `@/components/common/ProTable` 导入，不要绕过项目封装，除非封装明确不支持当前需求。

## React Query、Hooks 与 Services

Query Key 统一由 `src/hooks/query/keys.ts` 的工厂生成，不在页面中随意拼接数组。

```tsx
useQuery({
  queryKey: queryKeys.system.users(params),
  queryFn: fetchUsers,
})

queryClient.invalidateQueries({ queryKey: queryKeys.system.users(params) })
```

常用键：

- `queryKeys.system.allRoles`
- `queryKeys.system.users(params)`
- `queryKeys.platform.tenants(params)`
- `queryKeys.tenant.products(params)`
- `queryKeys.system.dictItems(dictType)`

常用 Hooks：

- `usePagination()` / `useSearchParams()`：手动分页与搜索参数；`ProTable request` 模式无需重复使用。
- `useDictionary(dictType)`：字典数据，默认缓存 30 分钟。
- `useFormModal()`：表单弹层和编辑 ID。
- `usePermission()`：权限判断。
- `usePolling(fn, interval)`：页面可见性感知轮询。
- `useVersionCheck()`：版本检测。

Services：

- `src/services/role.service.ts`：角色树转换、过滤和 ID 收集。
- `src/services/menu.service.ts`：菜单树转换、过滤和排序。

## 国际化

支持 `zh-CN`、`en-US`、`ja-JP`：

- 目录：`src/locales/{locale}/{namespace}.json`
- 命名空间：`common`、`menu`、`login`、`system`、`tenant`、`order`、`product`、`settings`、`message`
- 使用：`i18n.t('namespace:key')` 或 `t('namespace:key')`
- 存储：`localStorage['app-locale']`

新增或修改用户可见文本时，同步维护三种语言的同名 key。路由、菜单、表单提示、错误提示和按钮不得写死单一语言；路由菜单名称通过现有函数动态生成，以支持运行时切换语言。

## Mock 与真实 API

- `VITE_API_BASE_URL` 为空或未设置时，`src/api/request.ts` 直接调用 `src/api/mock/` 中的静态注册表，不发起网络请求。
- `VITE_API_BASE_URL` 配置为非空地址时，所有请求直接走 Axios 真实后端链路。
- Mock 与真实 API 共用请求方法、路径、参数、响应结构、类型和错误解包；Mock 不维护状态、不使用随机数据或浏览器存储。
- 新增接口时在 `src/api/mock/` 添加对应静态路径和固定响应，保持平台与租户域的路径分层语义。

## 本地存储与设置

- 用户状态：`localStorage['user-storage']`
- 用户信息：`localStorage['admin_user_info']`
- 应用设置：`localStorage['app-settings']`
- 语言：`localStorage['app-locale']`

设置抽屉的清缓存行为保留 `app-settings` 与 `app-locale`，再刷新页面。新增持久化数据时明确其清理、登出和跨标签页同步语义。

`useAppStore` 的标签页操作：

- `addTab()` 遵守 `maxTabs`。
- `removeOtherTabs()` 可按路由前缀限定后台范围。
- `removeAllTabs()` 可保留另一套后台的标签页。

## 工具函数

- `src/utils/export.ts`：`exportToExcel()`，支持 Excel / CSV / TXT / HTML / XML 和表尾汇总。
- `src/utils/format.ts`：日期、货币、数字和文件大小格式化。
- `src/utils/storage.ts`：用户信息与 Token 读取。
- `src/utils/sign.ts`：请求签名。
- `src/utils/crypto.ts`：AES 加解密。
- `src/utils/authChannel.ts`：跨标签页事件。

导出列的 `valueType` 为 `digit`、`money`、`percent` 时默认可自动汇总；显式 `exportFooter` 优先。

## 目录职责

```text
.
├── .agents/skills/              # 本仓库 Codex 技能
├── public/                      # 静态资源
├── src/
│   ├── api/modules/             # 平台与租户 API
│   ├── api/mock/                # 请求层静态 Mock 注册表
│   ├── components/common/       # 跨页面通用组件
│   ├── components/layout/       # 布局组件
│   ├── config/routes/           # 统一路由与菜单配置
│   ├── hooks/                   # 通用 Hooks 与 Query Key
│   ├── locales/                 # 三语言资源
│   ├── pages/                   # Login、Platform、Tenant、Exception
│   ├── routes/                  # Router 装配与 Guard
│   ├── services/                # UI 无关业务逻辑
│   ├── stores/                  # Zustand Stores
│   ├── types/                   # 平台与租户类型
│   └── utils/                   # 通用工具
├── AGENTS.md                    # 唯一项目规范来源
├── CLAUDE.md                    # 指向 AGENTS.md 的兼容入口
├── package.json
└── vite.config.ts
```

关键入口：

- `src/main.tsx`：应用启动、React Query 和 Router 模式。
- `src/App.tsx`：根组件。
- `src/routes/Guard.tsx`：认证与权限守卫。
- `src/config/routes/`：统一路由/菜单事实来源。
- `src/api/request.ts`：统一请求安全链路。
- `src/config/defaultSettings.json`：默认 UI 偏好。

## 修改检查清单

### 路由或页面

- 在 `src/config/routes/` 对应统一配置中维护路由和菜单。
- 设置准确的 `permission`、i18n 名称、图标及可选分组。
- 确认平台和租户路径拼接正确。
- 页面操作权限与路由权限语义一致。
- 同步 API、类型、Mock 和三语言资源。

### 表单或表格

- 表单弹层使用 `FormContainer`。
- 表格优先使用项目 `ProTable`。
- 多属性 Store 订阅使用 `useShallow`。
- 数据查询使用模块 Hook 与统一 Query Key。

### API 或 Mock

- API 放入正确的平台/租户模块并通过 `request.ts`。
- 保持标准响应、401、签名和可选加密语义。
- Mock 通过 `src/api/request.ts` 统一切换，保持固定响应结构和真实 API 契约一致。

### 完成前

- 检查是否复用现有组件、Hooks、Services 和工具。
- 检查用户可见文本是否完成三语言翻译。
- 检查是否误提交密钥、构建产物或本地配置。
- 默认只运行 `npm run lint` 等静态检查。
- 除非用户明确要求，否则不运行 `npm run build`、`npm run build:demo` 或其他编译、打包检查。
- 没有测试命令时说明替代验证，不虚构测试结果。
