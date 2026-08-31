---
name: zx-admin-development
description: 在 zx-admin 仓库中新增、修改、重构或审查 React/TypeScript 前端代码时使用，确保统一路由与权限、FormContainer、Zustand、React Query、i18n、API 和静态 Mock 等项目约定得到落实；不用于仓库外的通用前端任务。
---

# ZX Admin 开发规范

## 规范来源

开始工作前完整阅读 [AGENTS.md](../../../AGENTS.md)。它是本仓库架构、编码约定和验证要求的唯一事实来源；本技能负责把规范落实到具体改动，不复制整份项目手册。文档、历史代码或本技能与 `AGENTS.md` 冲突时，以 `AGENTS.md` 和当前实现共同确认的行为为准。

需要核对 Query Key、页面范式、请求链路或已知遗留模式时，再读取 [references/current-patterns.md](references/current-patterns.md)。普通小改动不必加载该参考。

## 工作流程

1. 判断改动属于平台后台、租户后台还是共享基础能力。
2. 搜索相邻页面、组件、Hooks、Services、API 和类型，沿用当前领域已经建立的模式。
3. 选择满足需求的最轻实现，不为未出现的需求提前增加抽象。
4. 同步核对路由、权限、类型、API、Mock 和三语言资源，按实际影响修改。
5. 保持改动聚焦，不覆盖用户已有修改，不顺带清理无关遗留问题。

## 路由、菜单与权限

- 路由和菜单统一来自 `src/config/routes/`。平台使用 `getPlatformRouteConfig()`，租户使用 `getTenantRouteConfig()`；不要恢复独立菜单常量。
- `generateRoutes()` 生成 React Router 路由和 `handle.permission`；`generateMenuItems()` 生成菜单。隐藏菜单使用 `hideInMenu`，索引跳转使用 `redirectTo`。
- 菜单名称由配置函数在运行时通过 i18n 生成；布局应在语言变化后重新生成菜单，不能缓存启动时的单语言文本。
- 路由守卫读取匹配路由的 `handle.permission`。空 `permissions` 数组表示完全访问，不能改成无权限。
- 菜单过滤、路由权限和页面操作权限使用同一语义。按钮和局部区域使用 `HasPermission` 或 `usePermission()`；权限数组采用 OR 语义。
- 权限码使用后端实际下发值，不根据 URL 推断，不为统一格式擅自改名。

## 页面、组件与状态

- 页面放在对应的 `src/pages/Platform/` 或 `src/pages/Tenant/`；页面私有查询、Mutation 和交互逻辑优先放在页面 `hooks/`。
- 业务表单弹窗或抽屉必须使用 `FormContainer`。尺寸、展示模式、列数和布局默认继承全局设置；字段级 `colProps` 可覆盖列宽。
- 业务表格优先使用项目封装的 `ProTable` / `EditableProTable`，不要直接绕过导出、列宽和全局表格设置能力。
- Zustand 单属性订阅使用选择器；多属性订阅使用 `useShallow`。新增代码不得直接调用整个 Store 后解构。
- 跨页面 UI 放入 `src/components/common/`，布局能力放入 `src/components/layout/`；复杂且与 UI 无关的树转换、过滤和排序放入 `src/services/`。

## React Query

- Query Key 统一从 `src/hooks/query/keys.ts` 获取，不手写数组。
- `ProTable request` 已负责列表请求、分页和刷新，不再为同一列表额外包装 `useQuery`。
- 独立引用数据、字典、仪表盘统计等适合 `useQuery`；CUD 使用 `useMutation`。简单 Mutation 可留在组件，成组或复用逻辑放在页面私有 Hook，沿用相邻模块模式。
- 当前全局默认是 `refetchOnWindowFocus: false`、`retry: 1`、`staleTime: 0`。字典、角色、仪表盘等需要缓存的数据必须在查询处显式设置局部 `staleTime`。

## API、Mock 与认证

- API 定义放在 `src/api/modules/platform/` 或 `src/api/modules/tenant/`，统一调用 `src/api/request.ts`；业务代码不得创建旁路 Axios 实例。
- `VITE_API_BASE_URL` 为空时，请求层调用 `src/api/mock/` 的静态注册表；配置非空地址时走真实 Axios 链路。Mock 与真实接口共用方法、路径、参数、类型和响应结构。
- Mock 使用固定种子数据和 `src/api/mock/` 内部带版本的 `sessionStorage` 会话状态；刷新页面保留，关闭标签页或清缓存后恢复，不使用随机数据。
- Mock 状态必须懒加载且只存在于 `VITE_API_BASE_URL` 为空的请求分支；真实 Axios 分支不得读取、修改或依赖 Mock 状态。
- 普通业务请求的 401 由请求层清理状态、广播登出并跳转；预登录、平台登录、平台列表和平台切换的 401 由调用方处理。
- 前端可见的 `VITE_APP_SECRET`、Token 和 localStorage 不是可信安全边界。不要提交真实密钥，也不要在业务代码中绕过现有签名、加密或认证链路。

## 国际化

- 用户可见文本通过 i18n 提供，不新增单语言硬编码。
- 新增或修改 key 时同步维护 `zh-CN`、`en-US`、`ja-JP` 对应命名空间文件。
- 路由、菜单、表单提示、错误提示和按钮均遵守三语言同步要求。

## 遗留模式

当前少数文件仍有整 Store 订阅或手写 Query Key。这些是待渐进收敛的历史写法，不是示例：

- 新代码不得复制。
- 任务触及相关文件且能够局部修正时，改用选择器、`useShallow` 或统一 Query Key。
- 不为完成当前任务而跨模块批量重构全部遗留代码。

## 完成检查

- 按改动范围核对路由、权限、API、类型、Mock、三语言资源和跨标签页行为。
- 检查是否复用了已有封装，以及逻辑是否位于正确层级。
- 默认运行 `npm run lint` 和必要的静态搜索。
- 除非用户明确要求，否则不运行 `npm run build`、`npm run build:demo` 或其他编译、打包检查。
- 项目没有自动化测试命令；不要虚构测试结果。未执行的验证及原因应明确说明。
