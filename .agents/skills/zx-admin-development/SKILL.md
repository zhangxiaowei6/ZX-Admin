---
name: zx-admin-development
description: 在 zx-admin 仓库中新增、修改、重构或审查 React/TypeScript 前端代码时使用，确保统一路由与权限、FormContainer、Zustand、React Query、i18n、API 和 Mock 等项目约定得到落实；不用于仓库外的通用前端任务。
---

# ZX Admin 开发规范

## 规范来源

开始工作前完整阅读 [AGENTS.md](../../../AGENTS.md)。该文件是本仓库架构、编码约定和验证要求的唯一事实来源；本技能只提供执行检查清单，不复制整份项目手册。若本技能与 `AGENTS.md` 冲突，以 `AGENTS.md` 为准。

## 工作方式

1. 先判断改动属于平台后台、租户后台还是共享基础能力。
2. 搜索相邻模块和现有组件、Hooks、Services、工具函数，沿用已经建立的模式。
3. 选择满足需求的最轻实现，不为假设中的后续需求提前增加抽象。
4. 保持改动聚焦，不顺带修复无关问题，不覆盖用户已有修改。
5. 根据改动范围完成专项检查，再运行相称的验证命令。

## 分层约束

- 页面放在 `src/pages/Platform/` 或 `src/pages/Tenant/`。
- API 定义放在 `src/api/modules/platform/` 或 `src/api/modules/tenant/`，统一通过 `src/api/request.ts` 调用。
- 页面私有查询、Mutation 和交互状态优先放在页面 `hooks/`。
- 跨页面通用 UI 放在 `src/components/common/`；布局能力放在 `src/components/layout/`。
- 复杂且与 UI 无关的转换、过滤和树处理逻辑放在 `src/services/`。
- 平台与租户的类型、API 和 Mock 保持领域分层，不把租户特有逻辑塞入共享层。

## 路由与权限

- 路由和菜单统一维护在 `src/config/routes/platform.config.tsx` 或 `src/config/routes/tenant.config.tsx`，不要另建独立静态菜单配置。
- 新增页面时同时配置组件、路径、i18n 名称、图标和准确的 `permission`；需要隐藏菜单时使用 `hideInMenu`。
- 权限码使用后端实际下发值，不从 URL 推断，不擅自重命名既有权限码。
- 页面路由权限与 `HasPermission` / `usePermission()` 使用的操作权限保持语义一致。
- 保留“空权限数组表示完全访问”的兼容规则。

## 组件、状态与数据

- 所有业务表单弹窗和抽屉使用 `FormContainer`，不要直接使用 `ModalForm` 或 `DrawerForm`。
- 业务表格优先使用项目封装的 `ProTable` / `EditableProTable`。
- `useAppStore` 多属性订阅必须配合 `useShallow`；单属性使用选择器，不直接订阅并解构整个 Store。
- React Query 缓存键从 `src/hooks/query/keys.ts` 获取，不在页面中随意拼接 Query Key。
- 优先复用 `useCommon`、`useDictionary`、`useFormModal`、`usePermission`、`usePolling` 和 `useVersionCheck`。

## 文案与国际化

- 用户可见文本使用 i18n，不写死单一语言。
- 新增或修改 key 时同步维护 `zh-CN`、`en-US`、`ja-JP` 三套同命名空间文件。
- 路由与菜单名称通过现有动态配置函数获取翻译，确保切换语言后更新。

## API、认证与 Mock

- 不绕过统一请求实例；保持签名、可选 AES 加密、Token 即时读取和 401 处理链路。
- 登录流程接口的 401 由调用方处理，普通业务接口的 401 走全局登出流程。
- 新增 Mock 时在 `src/api/mock/` 注册静态路径和固定响应，由 `src/api/request.ts` 根据 `VITE_API_BASE_URL` 统一切换。
- Mock 与真实 API 共用路径、参数和响应结构，不维护状态、不使用随机数据或浏览器存储。

## 安全边界

- 不提交真实密钥、Token、生产凭据或本地私有环境文件。
- 调整请求签名、加密、认证、登出或跨标签页同步时，检查平台登录、平台切换、401 和多标签页行为。
- 后端驱动路由只能使用前端白名单 `componentKey` 映射，禁止执行后端提供的动态导入路径。

## 完成检查

- 检查路由、权限、API、类型、Mock 与三语言资源是否需要同步更新。
- 检查是否复用了已有封装，是否把复杂逻辑放到合适层级。
- 默认只运行 `npm run lint` 等静态检查。
- 除非用户明确要求，否则不运行 `npm run build`、`npm run build:demo` 或其他编译、打包检查。
- 本项目没有自动化测试命令；不要声称运行了不存在的测试。若验证受限，明确说明未执行的命令和原因。
