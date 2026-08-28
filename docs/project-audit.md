# 项目全面体检（ZX-admin）

更新时间：2026-03-11
范围：架构、性能、发布、权限、安全、工程化

## 结论摘要
整体结构清晰、模块划分合理，路由与多租户设计直观；但存在几处安全/权限一致性与发布配置上的可预期问题，建议优先处理。

---

## 高优先级（功能/安全风险）

### 1. 客户端“密钥”不是真正的密钥
- 位置：`src/utils/crypto.ts`、`src/utils/sign.ts`、`src/api/request.ts`
- 问题：`VITE_APP_SECRET` 在前端可见，任何签名/加密都无法防止伪造请求，只能“加扰”。
- 风险：如果后端把它当作安全边界，会产生错误安全感。
- 建议：
  - 只把客户端当作不可信；签名改为服务端生成/校验或使用短期公钥体系。
  - 如需加密，使用服务端下发临时会话密钥（短过期）。

### 2. Token 存储在 localStorage
- 位置：`src/utils/storage.ts`、`src/stores/useUserStore.ts`
- 问题：XSS 一旦发生可直接读出 token。
- 建议：
  - 生产场景优先使用 `httpOnly` Cookie（配合 CSRF 防护）。
  - 或改为内存存储 + 刷新 token（短期）。

### 3. 权限判定模型不一致
- 位置：`src/routes/Guard.tsx`、`src/hooks/usePermission.ts`、`src/config/routes/`
- 问题：项目约定的权限码是 `module:resource:action`，但路由守卫用的是“路径前缀匹配”。
- 风险：后端返回权限码时可能全拒或误放行。
- 建议：
  - 在路由或菜单上绑定 `permission` 字段，路由守卫改为权限码校验。
  - 或明确规范：权限数组就是路径列表，并在服务端对齐。
- 状态：已实现（2026-03-11，路由 `handle.permission` + Guard 权限码校验）

---

## 中优先级（正确性/可用性/发布）

### 1. 版本检测在非根路径会失效
- 位置：`src/hooks/useVersionCheck.ts`
- 问题：`fetch('/version.json')` 未考虑 `VITE_BASE_PATH` / GitHub Pages 子路径。
- 建议：
  - `fetch(new URL('version.json', import.meta.env.BASE_URL))`
  - demo 模式同理。

### 2. Mock 插件在所有模式启用
- 位置：`vite.config.ts`
- 问题：`viteMockServe({ enable: true })` 会在生产构建中引入 mock 逻辑，增大包体积并可能干扰真实 API。
- 建议：
  - `enable: mode === 'development'`
  - demo 模式使用 `setupProdMockServer` 已足够。

### 3. 请求签名对非 JSON Body 不兼容
- 位置：`src/api/request.ts`
- 问题：`JSON.stringify(config.data ?? {})` 对 `FormData/Blob` 等会产生 `{}` 或异常签名。
- 建议：
  - 对 `FormData` 跳过加密/签名或用 `body = ''`。
  - 根据 `Content-Type` 分支处理。

### 4. `Authorization` Header 格式可能不符合后端
- 位置：`src/api/request.ts`
- 问题：目前 `Authorization = token`，但注释写的是 Bearer。
- 建议：
  - 统一为 `Authorization: Bearer ${token}` 或确保 token 本身包含 `Bearer`。

### 5. React Query 默认缓存偏“激进刷新”
- 位置：`src/main.tsx`
- 问题：`staleTime: 0` 会导致频繁请求（表格页切换/聚焦）。
- 建议：
  - 全局 30s-2min；实时接口再单独设置 `staleTime: 0`。

---

## 低优先级（体验/维护性）

### 1. `console.error` 拦截
- 位置：`src/main.tsx`
- 建议：仅在 `import.meta.env.DEV` 下启用，避免生产环境全局劫持。

### 2. 菜单国际化刷新时机（已解决）
- 位置：`src/config/routes/platform.config.tsx`、`src/config/routes/tenant.config.tsx`
- 状态：路由配置通过 `getPlatformRouteConfig()` / `getTenantRouteConfig()` 动态翻译，布局以 `locale` 为依赖重新生成菜单。

---

## 工程化增强建议
- CI：增加 `lint + build` 的 PR 校验（目前只有部署流程）。
- 测试：至少加 1-2 个关键路由/守卫的 e2e 或关键 hook 的单测。
- 包体积：`xlsx` 体积较大，建议改为动态导入或导出按钮触发时加载。
- 状态管理：`useAppStore` 体积很大，建议切为 slices 或导出 selector helpers，强化 `useShallow` 使用规范。

---

## 优先落地建议
1. 权限模型与路由守卫一致性
2. 版本检测路径与 mock 构建修复
3. 安全与 token/签名调整

---

## 代码与文档漂移审计（2026-08-28）

本次对照当前实现、`AGENTS.md`、README、架构文档和页面范式后，结论如下：

### 已落实并作为现行规范

- 路由、菜单和页面权限已统一到 `src/config/routes/`；Router 使用 `handle.permission`，布局通过配置函数动态生成菜单。
- `FormContainer`、项目封装的 `ProTable` / `EditableProTable`、Zustand 选择器和统一请求层已成为新增业务代码的推荐入口。
- Mock 已由 `src/api/request.ts` 在空 API 地址时直接调用 `src/api/mock/index.ts` 静态注册表；不再以独立 mock 目录或旧插件配置作为新增接口模板。
- Query Key 的事实来源是 `src/hooks/query/keys.ts`，按 `system`、`platform`、`tenant` 三个域组织。

### 仍存在但不在本次范围内批量重构的遗留

- 少数页面仍有整体 Store 订阅或手写 Query Key；新增代码不得复制，触及相关文件时局部迁移即可。
- `CHANGELOG.md` 保留历史架构名称和迁移记录，不能据此判断当前入口。
- 前端 `VITE_APP_SECRET` 和 localStorage Token 仍属于客户端可见数据，不构成真正的密钥或 XSS 防护边界；认证架构改造需要后端协同，未在本次文档同步中展开。

### 文档同步范围

已同步 README 双语版本、统一路由文档、React Query 指南、Hooks 文档和布局组件文档；历史变更记录不改写。后续新增页面以 `AGENTS.md` 与 `.agents/skills/zx-admin-development/` 为准。
