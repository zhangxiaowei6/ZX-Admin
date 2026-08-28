# 当前实现模式

本参考记录 2026-08-28 代码审计确认的实现事实。只在需要新增模块、调整路由权限、编写查询/API 或处理遗留模式时读取；正式规范仍以仓库根目录 `AGENTS.md` 为准。

## 领域与目录边界

| 领域 | 页面 | API | 类型 | 路由配置 |
| --- | --- | --- | --- | --- |
| 平台后台 | `src/pages/Platform/` | `src/api/modules/platform/` | `src/types/platform/` | `src/config/routes/platform.config.tsx` |
| 租户后台 | `src/pages/Tenant/` | `src/api/modules/tenant/` | `src/types/tenant/` | `src/config/routes/tenant.config.tsx` |
| 共享能力 | `src/components/common/`、`src/hooks/`、`src/services/`、`src/utils/` | `src/api/request.ts` | `src/types/api.ts` | `src/config/routes/types.ts` |

页面专用 Hooks 放在对应页面的 `hooks/`；跨页面且与 UI 无关的树转换、过滤或排序放在 `src/services/`。

## Query Key 事实表

`src/hooks/query/keys.ts` 当前按三个域组织：

- `queryKeys.system`：`allRoles`、`users(params)`、`roles(params)`、`menus`、`depts`、`dictItems(dictType)`。
- `queryKeys.platform`：`tenants(params)`、`messages(params)`、`unreadCount`。
- `queryKeys.tenant`：`orders(params)`、`products(params)`、`dashboardStats`、`recentOrders`、`allRoles`、后台/小程序菜单树和部门树。

列表由 `ProTable request` 驱动时不要为同一列表添加 `useQuery`。需要失效独立缓存时使用工厂，例如：

```tsx
queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants(params) })
queryClient.invalidateQueries({ queryKey: queryKeys.tenant.products(params) })
```

## UI 最小范式

```tsx
<ProTable<Tenant>
  actionRef={actionRef}
  columns={columns}
  request={async (params) => {
    const result = await getTenantList({
      pageNum: params.current,
      pageSize: params.pageSize,
    })
    return { data: result.list, total: result.total, success: true }
  }}
  rowKey="id"
/>

<FormContainer
  title={record ? t('tenant:editTenant') : t('tenant:addTenant')}
  open={open}
  onOpenChange={setOpen}
  initialValues={record}
  onFinish={async (values) => {
    await submitMutation.mutateAsync({ record, values })
    return true
  }}
>
  <ProFormText name="name" label={t('tenant:tenantName')} />
</FormContainer>
```

简单 Mutation 可以在页面组件中声明；同一模块有多项提交、删除、批量状态操作时，可参考 `src/pages/Tenant/Product/hooks/useProduct.ts` 放入页面私有 Hook。

## Store 订阅

```tsx
const systemLogo = useAppStore((state) => state.systemLogo)

const { tableSize, tableBordered } = useAppStore(
  useShallow((state) => ({
    tableSize: state.tableSize,
    tableBordered: state.tableBordered,
  })),
)
```

事件处理器需要读取最新状态且不需要订阅渲染时，可使用 `useAppStore.getState()`。

## 请求与 Mock 数据流

```text
业务页面 / Hook
  -> src/api/modules/{platform|tenant}
  -> src/api/request.ts
     -> VITE_API_BASE_URL 为空：src/api/mock/index.ts
     -> VITE_API_BASE_URL 非空：Axios + Token + 签名 + 可选 AES
  -> unwrapResponse(code === 200 时返回 data)
```

HTTP 401 和业务 `code === 401` 使用同一职责边界：

- `/auth/pre-login`、`/auth/login-platform`、`/auth/platforms`、`/auth/switch-platform` 由调用方处理。
- 其他接口由请求层执行全局登出、BroadcastChannel 广播和 `window.location.replace()`。

## 已知遗留与文档迁移

下列模式在审计时仍能在少量代码或历史文档中看到，但不得作为新代码模板：

- `src/constants/menu/platformMenu.tsx`、`tenantMenu.tsx`：目录已删除，现由统一路由配置生成菜单。
- `queryKey: ['tenantList']`、`['productSpecs', productId]`：手写 Key，应在触及相关功能时补充统一工厂并迁移。
- `useUserStore()`、`useMessageStore()` 后整体解构：应改为单属性选择器或 `useShallow`，但不要为无关任务全仓重构。
- 文档中的全局 `staleTime: 5 * 60 * 1000`：当前实现已经改为 `0`；缓存时间由具体查询显式决定。
- `mock/platform/*.ts` 或 vite-plugin-mock/MSW 示例：当前实现是 `src/api/mock/index.ts` 静态注册表，由请求层直接调用。
