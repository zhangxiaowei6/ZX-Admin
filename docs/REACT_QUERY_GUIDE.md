# React Query 使用指南

本项目使用 `@tanstack/react-query` 管理独立的服务端状态和缓存。列表页通常由项目封装的 `ProTable request` 处理；React Query 主要用于字典、下拉选项、仪表盘统计、消息未读数和其他独立于表格的数据。

## 全局配置

真实配置位于 `src/main.tsx`：

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0,
    },
  },
})
```

`staleTime: 0` 只是全局默认值；需要缓存的数据必须在具体查询中显式覆盖。当前没有全局 `gcTime` 配置。

## 选择请求模式

### ProTable 列表

分页、筛选和表格刷新优先使用 `ProTable` 的 `request`：

```tsx
<ProTable<Tenant>
  request={async (params) => {
    const result = await getTenantList({
      pageNum: params.current,
      pageSize: params.pageSize,
    })
    return { data: result.list, total: result.total, success: true }
  }}
/>
```

不要为同一列表再包一层 `useQuery`。CUD 成功后通常调用 `actionRef.current?.reload()`；如果另有独立缓存，再失效对应 Query Key。

### 独立查询

字典、角色选项、仪表盘和未读数等使用 `useQuery`，查询 Hook 按业务放在页面自己的 `hooks/` 目录：

```tsx
export const useDashboardStatsQuery = () => useQuery({
  queryKey: queryKeys.tenant.dashboardStats,
  queryFn: getDashboardStats,
  staleTime: 60 * 1000,
})
```

一次性且不需要缓存的请求可以使用普通事件处理或 `useEffect`；实时推送优先使用 WebSocket 或项目的 `usePolling`。

## Mutation 与缓存失效

创建、更新、删除等 CUD 操作使用 `useMutation`。简单操作可以直接在页面声明；同一模块有多项操作或需要复用时，放入页面私有 Hook。成功后使用统一 Query Key 工厂：

```tsx
const createMutation = useMutation({
  mutationFn: createTenant,
  onSuccess: () => {
    message.success(t('common:createSuccess'))
    queryClient.invalidateQueries({ queryKey: queryKeys.platform.tenants(currentParams) })
    actionRef.current?.reload()
  },
})
```

不要使用手写字符串数组作为 Query Key。参数化列表失效时传入当前参数，例如 `queryKeys.platform.tenants(currentParams)`。如果将来需要批量失效全部参数组合，应先在 `keys.ts` 增加稳定的 `all` 前缀，不能依赖省略参数。

## Query Key

所有 Key 定义在 `src/hooks/query/keys.ts`，按 `system`、`platform`、`tenant` 三个域组织：

```tsx
queryKeys.system.allRoles
queryKeys.system.users(params)
queryKeys.system.dictItems(dictType)
queryKeys.platform.tenants(params)
queryKeys.platform.unreadCount
queryKeys.tenant.products(params)
queryKeys.tenant.dashboardStats
```

参数必须进入 Key，避免不同筛选条件共享缓存。完整清单和页面范式见 `.agents/skills/zx-admin-development/references/current-patterns.md`。

## 局部缓存建议

| 数据类型 | 建议 `staleTime` | 说明 |
| --- | ---: | --- |
| 数据字典 | 30 分钟 | 变化频率低，查询处显式设置 |
| 角色、菜单和部门树 | 5 分钟 | 低频引用数据 |
| 仪表盘统计 | 1 分钟 | 需要相对实时 |
| 消息未读数 | 0 | 配合轮询或手动刷新 |

这些是查询级建议，不是全局默认。窗口焦点刷新默认关闭，实时数据应明确调用轮询、失效或手动刷新。

## 项目约定

- Query Hook、Mutation 和交互逻辑优先就近放在页面 `hooks/`。
- ProTable 列表不重复使用 `usePagination` / `useSearchParams`；这两个 Hook 仅适用于手动分页或搜索。
- 成功提示和错误提示使用 i18n，不在新代码中写死单语言文案。
- API 必须通过 `src/api/request.ts`，不能创建旁路 Axios 实例。
