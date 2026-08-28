# 全局 Hooks

项目级公共 Hook，涵盖权限判断、分页、搜索参数、表单弹窗、轮询、React Query 数据请求等通用能力。

## 目录结构

```
hooks/
├── useCommon.ts       # 通用 Hook（分页、搜索参数）
├── usePermission.ts   # 权限判断
├── useFormModal.ts    # 表单弹窗状态管理
├── usePolling.ts      # 通用轮询（支持页面可见性感知）
├── query/             # React Query 基础设施（queryKey 常量）
│   ├── keys.ts        # queryKey 常量统一管理
│   └── index.ts
└── index.ts           # barrel export
```

## Hook 列表

| Hook | 来源 | 说明 |
| --- | --- | --- |
| `usePagination` | `useCommon.ts` | 分页状态管理 |
| `useSearchParams` | `useCommon.ts` | 搜索参数状态管理 |
| `usePermission` | `usePermission.ts` | 权限码判断 |
| `useFormModal` | `useFormModal.ts` | 表单弹窗状态管理（open / record / isEdit） |
| `usePolling` | `usePolling.ts` | 通用轮询，页面隐藏时自动暂停 |
| `useDictionary` | `useDictionary.ts` | 数据字典查询（支持缓存、label/color 转换） |
| `useVersionCheck` | `useVersionCheck.ts` | 版本更新检测（基于 version.json） |

所有 Hook 均通过 `@/hooks` 统一导出：

```ts
import {
  usePagination,
  useSearchParams,
  usePermission,
  useFormModal,
  usePolling,
  useDictionary,
  useVersionCheck,
} from '@/hooks'
```

> **业务查询 Hook**（如 `useSystemRolesQuery`）属于页面私有逻辑，按功能模块就近放置，例如：
> `src/pages/Platform/System/hooks/useSystemRoles.ts`

---

## usePagination

分页状态管理 Hook，适用于手动控制分页的场景（ProTable 的 `request` 模式无需使用）。

### 参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `initialPageSize` | `number` | `10` | 初始每页条数 |

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `pagination` | `PaginationConfig` | 当前分页状态 `{ current, pageSize, total }` |
| `setCurrent` | `(current: number) => void` | 设置当前页 |
| `setPageSize` | `(pageSize: number) => void` | 设置每页条数（同时重置 `current` 为 1） |
| `setTotal` | `(total: number) => void` | 设置总条数 |

### 用法

```tsx
import { usePagination } from '@/hooks'

const { pagination, setCurrent, setPageSize, setTotal } = usePagination(20)

// 搭配 Ant Design Pagination
<Pagination
  current={pagination.current}
  pageSize={pagination.pageSize}
  total={pagination.total}
  onChange={setCurrent}
  onShowSizeChange={(_, size) => setPageSize(size)}
/>
```

---

## useSearchParams

搜索参数状态管理 Hook，适用于需要手动维护搜索条件的场景。

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `params` | `T` | 当前搜索参数对象 |
| `setParams` | `(newParams: Partial<T>) => void` | 合并更新参数（浅合并） |
| `resetParams` | `() => void` | 重置为空对象 |

### 用法

```tsx
import { useSearchParams } from '@/hooks'

interface UserSearchParams {
  username?: string
  status?: number
}

const { params, setParams, resetParams } = useSearchParams<UserSearchParams>()

// 更新部分参数
setParams({ username: 'admin' })

// 重置所有参数
resetParams()
```

---

## usePermission

权限判断 Hook，读取当前用户的权限码列表，提供 `hasPermission` 判断函数。

### 规则

- `permissions` 为**空数组**时视为拥有全部权限（兼容后端未对接权限管理的场景）
- 传入数组时为 **OR 逻辑**，满足其中任一权限码即通过

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `hasPermission` | `(code: string \| string[]) => boolean` | 判断是否拥有指定权限 |
| `permissions` | `string[]` | 当前用户权限码列表（来自 `useUserStore`） |

### 用法

```tsx
import { usePermission } from '@/hooks'

const { hasPermission } = usePermission()

// 单个权限码
if (hasPermission('system:user:delete')) {
  // 执行删除操作
}

// 多个权限码（OR 逻辑，任一满足即通过）
if (hasPermission(['system:user:edit', 'admin'])) {
  // 显示编辑入口
}
```

> 若仅需在 JSX 中控制按钮/链接的显示隐藏，推荐使用 [`HasPermission`](../components/common/README.md#haspermission) 组件，更简洁。

---

## useFormModal

表单弹窗状态管理 Hook，统一管理 `open / currentRecord / isEdit` 三个关联状态，避免每个 CRUD 页面重复定义相同的 `useState` 组合。

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 弹窗是否打开 |
| `setOpen` | `(open: boolean) => void` | 直接控制 open（用于 FormContainer 的 `onOpenChange`） |
| `currentRecord` | `T \| undefined` | 当前编辑的记录，新增时为 `undefined` |
| `isEdit` | `boolean` | 是否为编辑模式（`!!currentRecord`） |
| `openModal` | `(record?: T) => void` | 打开弹窗，传记录为编辑，不传为新增 |
| `closeModal` | `() => void` | 关闭弹窗并清空记录 |

### 用法

```tsx
import { useFormModal } from '@/hooks'

// 页面组件
const { open, setOpen, currentRecord, isEdit, openModal } = useFormModal<SystemUser>()

// 新增按钮
<Button onClick={() => openModal()}>新增</Button>

// 编辑按钮
<a onClick={() => openModal(record)}>编辑</a>

// 绑定 FormContainer
<FormContainer
  title={isEdit ? '编辑用户' : '新增用户'}
  open={open}
  onOpenChange={setOpen}
  initialValues={currentRecord}
  onFinish={async (values) => {
    await submitMutation.mutateAsync({ record: currentRecord, values })
    return true
  }}
>
  ...
</FormContainer>
```

---

## usePolling

通用轮询 Hook，支持页面可见性感知。

- 页面隐藏（切换标签页 / 最小化）时自动**暂停**，重新可见时**立即补偿一次执行**并恢复轮询
- 组件卸载时自动清理定时器与事件监听
- `fn` 引用变化不会重启轮询（内部用 ref 持有最新版本）

### 参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fn` | `() => void \| Promise<void>` | — | 每次轮询执行的函数 |
| `options.interval` | `number` | `30000` | 轮询间隔（毫秒） |
| `options.immediate` | `boolean` | `true` | mount 时是否立即执行一次 |
| `options.visibilityAware` | `boolean` | `true` | 是否感知页面可见性 |

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `start` | `() => void` | 手动启动轮询 |
| `stop` | `() => void` | 手动停止轮询 |

### 用法

```tsx
import { usePolling } from '@/hooks'

// 基本用法：30 秒轮询，页面隐藏自动暂停
usePolling(fetchUnreadCount, { interval: 30000 })

// 自定义间隔，关闭可见性感知
usePolling(syncData, { interval: 5000, visibilityAware: false })

// 手动控制
const { start, stop } = usePolling(fetchData, { immediate: false })
<Button onClick={start}>开始</Button>
<Button onClick={stop}>停止</Button>
```

---

## query/

基于 `@tanstack/react-query` 的数据请求 Hook 集合。遵循以下约定：

- **ProTable `request` 模式不使用 `useQuery`**，其内部已处理分页/筛选/缓存
- `useQuery` 用于**下拉选项、级联数据**等独立于表格的引用数据
- **CUD 操作**统一使用 `useMutation`；简单操作可在页面内声明，成组或复用逻辑放入页面私有 Hook，成功后调用 `actionRef.current?.reload()` 或失效对应统一 Query Key

### queryKeys

`query/keys.ts` 统一管理所有 queryKey 常量，避免字符串硬编码，便于缓存失效追踪。

```ts
import { queryKeys } from '@/hooks/query'

// 静态 key（无参数）
queryKeys.system.allRoles        // ['system', 'roles', 'all']
queryKeys.system.menus           // ['system', 'menus']
queryKeys.platform.unreadCount   // ['platform', 'messages', 'unread']
queryKeys.tenant.dashboardStats  // ['tenant', 'dashboard', 'stats']

// 动态 key（带查询参数，参数变化自动触发重新请求）
queryKeys.system.users({ pageNum: 1, status: 1 })
queryKeys.platform.tenants({ name: 'test' })
queryKeys.tenant.products({ pageNum: 1 })
```

### 业务查询 Hook 规范

业务查询 Hook（如 `useSystemRolesQuery`）属于**功能模块私有逻辑**，就近放置在各页面的 `hooks/` 目录下，而非全局 `hooks/query/`：

```
pages/Platform/System/hooks/
├── useSystemRoles.ts   # 角色下拉查询（仅 System 模块使用）
└── index.ts
```

```ts
// pages/Platform/System/hooks/useSystemRoles.ts
import { useQuery } from '@tanstack/react-query'
import { getAllRoles } from '@/api/modules/platform/system'
import { queryKeys } from '@/hooks/query'

export const useSystemRolesQuery = () => {
  return useQuery({
    queryKey: queryKeys.system.allRoles,
    queryFn: getAllRoles,
    staleTime: 5 * 60 * 1000,
  })
}
```

```ts
// 在页面中引用（相对路径，不走全局 @/hooks）
import { useSystemRolesQuery } from '../hooks'
```

**原则**：`@/hooks/query` 只存放跨业务域共享的 key 常量；queryKey 关联的请求 Hook 跟随业务模块走。

### useMutation 用法约定

简单 CUD 操作可以直接在页面组件内声明；成组或复用逻辑放入页面私有 Hook。两种方式都由 `onSuccess` 负责刷新表格、失效对应缓存和提示：

```tsx
import { useMutation } from '@tanstack/react-query'

const deleteMutation = useMutation({
  mutationFn: (id: number) => deleteUser(id),
  onSuccess: () => {
    message.success(t('common:deleteSuccess'))
    actionRef.current?.reload()
  },
})

// 调用
deleteMutation.mutate(record.id)

// 需要等待结果（如表单提交关闭弹窗）
await submitMutation.mutateAsync({ record: currentRecord, values })
```

---

## useDictionary

数据字典查询 Hook，根据字典类型编码获取字典项列表，使用 React Query 缓存（30 分钟 staleTime）。

### 参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `dictType` | `string` | 字典类型编码 |

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `DictItem[]` | 字典项列表 |
| `isLoading` | `boolean` | 加载状态 |
| `getLabel` | `(value: string \| number) => string` | 根据 value 获取 label |
| `getColor` | `(value: string \| number) => string \| undefined` | 根据 value 获取 color |
| `options` | `{ label: string; value: any }[]` | 转换为 Select/Radio 等组件的 options 格式 |

### 用法

```tsx
import { useDictionary } from '@/hooks'

const { items, getLabel, getColor, options } = useDictionary('order_status')

// 在表格列中展示
{
  title: '状态',
  dataIndex: 'status',
  render: (status) => <Tag color={getColor(status)}>{getLabel(status)}</Tag>
}

// 或使用 DictTag 组件
{
  title: '状态',
  dataIndex: 'status',
  render: (status) => <DictTag dictType="order_status" value={status} />
}

// 在下拉框中使用
<Select options={options} />
```

### 特性

- **自动缓存**：字典数据缓存 30 分钟，减少重复请求
- **懒加载**：只有 `dictType` 非空时才发起请求
- **类型安全**：value 支持 string 和 number 类型自动转换

---

## useVersionCheck

版本更新检测 Hook，定期轮询 `/version.json` 检测新版本，配合 `VersionUpdateBar` 组件使用。

### 参数

无参数。

### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `hasNewVersion` | `boolean` | 是否检测到新版本 |
| `refresh` | `() => void` | 刷新页面（重新加载） |

### 用法

```tsx
import { useVersionCheck } from '@/hooks'

const { hasNewVersion, refresh } = useVersionCheck()

if (hasNewVersion) {
  return (
    <Alert
      message="发现新版本"
      type="info"
      action={<Button onClick={refresh}>立即刷新</Button>}
    />
  )
}
```

### 工作原理

1. 每 5 分钟轮询一次 `/version.json?t=${timestamp}`
2. 对比返回的 `version` 与当前构建版本 `__APP_VERSION__`
3. 版本不一致时设置 `hasNewVersion = true`
4. 页面隐藏时自动暂停轮询（基于 `usePolling` 的 `visibilityAware`）

### 配置

需要在构建时生成 `public/version.json`：

```json
{
  "version": "1.0.0",
  "buildTime": "2024-03-10T10:00:00Z"
}
```
