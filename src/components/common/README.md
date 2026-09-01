# 通用业务组件 (common)

项目级通用业务组件，封装了常用的页面容器、表格、错误边界等能力。

## 组件列表

| 组件 | 路径 | 说明 |
| --- | --- | --- |
| `PageContainer` | `./PageContainer/index.tsx` | 页面容器 |
| `FormContainer` | `./FormContainer/index.tsx` | 表单容器（自动适配抽屉/弹窗、列数） |
| `ProTable` | `./ProTable/ProTable.tsx` | 增强表格（含导出、可拖拽列宽） |
| `EditableProTable` | `./ProTable/EditableProTable.tsx` | 增强可编辑表格（含导出、可拖拽列宽） |
| `PermissionTreePanel` | `./PermissionTreePanel/index.tsx` | 权限树面板（支持搜索、全选、展开/收起、只读模式） |
| `HasPermission` | `./HasPermission/index.tsx` | 按钮级权限控制 |
| `ErrorBoundary` | `./ErrorBoundary/index.tsx` | 错误边界 |
| `PageSkeleton` | `./PageSkeleton/index.tsx` | 页面级骨架屏（dashboard / table / detail 三种类型） |
| `DictTag` | `./DictTag/index.tsx` | 字典值展示组件（自动查询字典并渲染为 Tag） |
| `VersionUpdateBar` | `./VersionUpdateBar/index.tsx` | 版本更新提示条（检测到新版本时显示） |

---

## PageContainer

基于 `@ant-design/pro-components` 的 `ProPageContainer` 封装，为所有页面提供统一的头部和布局。

### Props

透传 `ProPageContainer` 全部属性，常用：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 页面标题 |
| `children` | `ReactNode` | 页面内容 |

### 用法

```tsx
import { PageContainer } from '@/components/common/PageContainer'

const DashboardPage = () => (
  <PageContainer title="仪表盘">
    <div>页面内容</div>
  </PageContainer>
)
```

---

## FormContainer

基于 `@ant-design/pro-components` 的 `ModalForm` / `DrawerForm` 封装，自动读取全局设置：

- **表单展示模式**：根据 `formDisplayMode` 自动切换弹窗 / 抽屉
- **表单列数**：根据 `formColumns` 自动开启 grid 布局
- **表单大小**：根据 `formSizePreset` 自动设置宽度（small/medium/large）
- **抽屉方向**：支持 left/right/top/bottom；左右使用宽度档位，上下使用 40/60/80vh 高度档位
- **destroyOnClose**：默认开启

### Props

透传 `ModalFormProps` & `DrawerFormProps` 全部属性，额外支持：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `formSize` | `'small' \| 'medium' \| 'large'` | `formSizePreset` | 表单尺寸，不传则使用全局设置 |

组件内部自动处理 `drawerProps` / `modalProps` / `grid` / `colProps`，传入的同名属性会与默认值合并。

### 用法

```tsx
import { FormContainer } from '@/components/common/FormContainer'

// 基础用法：跟随全局设置（可编辑表单）
<FormContainer
  title="新增用户"
  open={open}
  onOpenChange={setOpen}
  onFinish={async (values) => {
    await createUser(values)
    return true
  }}
>
  <ProFormText name="username" label="用户名" />
  <ProFormText name="email" label="邮箱" />
  {/* 字段级覆盖列宽 */}
  <ProFormTextArea name="remark" label="备注" colProps={{ span: 24 }} />
</FormContainer>

// 固定尺寸：不跟随全局设置
<FormContainer
  title="配置权限"
  formSize="large"
  open={open}
  onOpenChange={setOpen}
>
  {/* 复杂表单内容 */}
</FormContainer>

// 只读展示场景：隐藏提交按钮
<FormContainer
  title="查看权限"
  open={open}
  onOpenChange={setOpen}
  submitter={false}
  drawerProps={{
    className: 'permission-view-drawer',
    styles: { body: { display: 'flex', flexDirection: 'column', overflow: 'hidden' } }
  }}
  modalProps={{
    className: 'permission-view-modal',
    styles: { body: { display: 'flex', flexDirection: 'column', overflow: 'hidden' } }
  }}
>
  <style>{`
    .permission-view-drawer .ant-drawer-body > form,
    .permission-view-modal .ant-modal-body > form {
      display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden;
    }
  `}</style>
  {/* 只读内容，如权限树、详情展示等 */}
</FormContainer>
```

**注意**：只读展示场景需要额外处理 `<form>` 元素的 flex 布局，否则内容区域高度不正确导致无法滚动。

### 页面级覆盖

如需覆盖全局设置，直接传入 `grid` / `colProps` 即可：

```tsx
{/* 固定双列，忽略全局 formColumns */}
<FormContainer grid={true} colProps={{ span: 12 }} ...>

{/* 固定单列 */}
<FormContainer grid={false} ...>
```

---

## ProTable

基于 `@ant-design/pro-components` 的 `ProTable` 封装，增加了以下能力：

- **全局表格尺寸/边框**：自动读取 `useAppStore` 中的 `tableSize`、`tableBordered` 配置
- **可拖拽列宽**：开启全局 `tableResizable` 后，列头可拖拽调整宽度
- **多设备拖拽**：列宽调整基于 Pointer Events，支持鼠标、触控笔和触摸屏
- **数据导出**：开启 `exportable` 后，工具栏出现导出图标，点击弹出导出弹窗
- **行选择受控**：开启导出后自动接管 `rowSelection`，支持按选中行导出
- **默认分页**：内置 `showSizeChanger`、`showQuickJumper`，页码选项来自 `PAGINATION` 常量
- **默认横向滚动**：`scroll` 默认为 `{ x: 'max-content' }`，防止移动端挤压变形

### Props

继承 `ProTableProps<T, U>` 全部属性，额外新增：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `exportable` | `boolean` | `false` | 是否显示导出按钮 |
| `exportFileName` | `string` | — | 导出文件名（不含扩展名） |
| `onExportAllData` | `() => Promise<T[]>` | — | 获取全量数据的回调（用于"全量数据"导出范围） |

### 用法

```tsx
import { ProTable } from '@/components/common/ProTable'

<ProTable<Tenant>
  columns={columns}
  request={async (params) => {
    const { list, total } = await getTenantList(params)
    return { data: list, total, success: true }
  }}
  rowKey="id"
  exportable
  exportFileName="商户列表"
/>
```

---

## EditableProTable

基于 `@ant-design/pro-components` 的 `EditableProTable` 封装，与 `ProTable` 具备相同的增强能力：

- **全局表格尺寸/边框**：自动读取 `useAppStore` 中的 `tableSize`、`tableBordered` 配置
- **可拖拽列宽**：开启全局 `tableResizable` 后，列头可拖拽调整宽度
- **多设备拖拽**：列宽调整基于 Pointer Events，支持鼠标、触控笔和触摸屏
- **数据导出**：开启 `exportable` 后，工具栏出现导出图标，点击弹出导出弹窗
- **行选择兼容**：拦截 `rowSelection.onChange` 捕获选中行数据供导出使用，不影响页面自身的选中状态管理
- **默认分页**：内置 `showSizeChanger`、`showQuickJumper`，页码选项来自 `PAGINATION` 常量
- **默认横向滚动**：`scroll` 默认为 `{ x: 'max-content' }`

### Props

继承 `EditableProTableProps<T, U>` 全部属性，额外新增：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `exportable` | `boolean` | `false` | 是否显示导出按钮 |
| `exportFileName` | `string` | — | 导出文件名（不含扩展名） |
| `onExportAllData` | `() => Promise<T[]>` | — | 获取全量数据的回调（用于"全量数据"导出范围） |

### 用法

```tsx
import { EditableProTable } from '@/components/common/ProTable'

<EditableProTable<Product>
  rowKey="id"
  columns={columns}
  request={async (params) => {
    const { list, total } = await getProductList(params)
    return { data: list, total, success: true }
  }}
  editable={{
    type: 'multiple',
    editableKeys,
    onChange: setEditableRowKeys,
    onSave: async (_key, row) => {
      await updateProduct(row.id, row)
    },
  }}
  exportable
  exportFileName="商品列表"
  rowSelection={{
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }}
/>
```

> **注意**：`rowSelection.onChange` 会被内部拦截以捕获选中行数据，原始回调仍会正常执行，页面无需做任何适配。

### 目录结构

```
ProTable/
├── index.ts                ← barrel export（对外公共 API）
├── ProTable.tsx            ← ProTable 实现
├── EditableProTable.tsx    ← EditableProTable 实现
├── ExportModal.tsx         ← 内部组件，不对外暴露
└── ResizableHeaderCell.tsx ← 内部组件，不对外暴露
```

### 导出弹窗 (ExportModal)

`ExportModal` 是两个表格组件共用的内部子组件，不对外暴露。支持：

- **文件格式**：Excel (.xlsx) / CSV / TXT / HTML / XML
- **数据范围**：当前页 / 选中行 / 全量数据
- **字段选择**：勾选需要导出的列
- **参数设置**：
  - 表头：是否包含表头行
  - 表尾：是否包含汇总行
  - 分组表头：是否保留多级表头结构（暂未实现）
  - 合并：是否合并相同值的单元格（暂未实现）
  - 样式：是否应用样式（暂未实现）
  - 展开层级：树形数据展开层级（暂未实现）

### 表尾汇总功能

导出时可以在数据底部添加汇总行，支持多种自定义方式：

#### 方式1：自动求和（数值列默认行为）

`valueType` 为 `'digit'`、`'money'`、`'percent'` 的列会自动求和：

```tsx
{
  title: '金额',
  dataIndex: 'amount',
  valueType: 'money'  // 自动求和并保留2位小数
}
```

#### 方式2：显式指定汇总方式

通过 `exportFooter` 属性指定内置聚合方式：

```tsx
{
  title: '数量',
  dataIndex: 'qty',
  exportFooter: 'sum'  // 求和
}
{
  title: '均价',
  dataIndex: 'price',
  exportFooter: 'avg'  // 平均值
}
{
  title: '最高分',
  dataIndex: 'score',
  exportFooter: 'max'  // 最大值
}
{
  title: '最低分',
  dataIndex: 'score',
  exportFooter: 'min'  // 最小值
}
{
  title: '记录数',
  dataIndex: 'count',
  exportFooter: 'count'  // 行数统计
}
```

**内置聚合方式：**
- `sum`：求和（默认用于数值列）
- `avg`：平均值
- `max`：最大值
- `min`：最小值
- `count`：行数统计

#### 方式3：固定文本

```tsx
{
  title: '状态',
  dataIndex: 'status',
  exportFooter: '—'  // 显示固定文本
}
```

#### 方式4：自定义函数

```tsx
{
  title: '利润率',
  dataIndex: 'profit',
  exportFooter: (data) => {
    const total = data.reduce((sum, row) => sum + row.profit, 0);
    return (total / data.length).toFixed(2) + '%';
  }
}
```

#### 方式5：明确禁用

即使是数值列也不汇总：

```tsx
{
  title: 'ID',
  dataIndex: 'id',
  valueType: 'digit',
  exportFooter: false  // 不显示汇总
}
```

**优先级：** `exportFooter` 配置 > `valueType` 自动识别

**格式化：**
- `money` 类型：保留2位小数
- `percent` 类型：保留2位小数并添加 % 符号
- 自定义函数：完全控制格式化逻辑

---

## HasPermission

按钮级权限控制组件，基于 `usePermission` Hook 封装。权限码列表存储在 `useUserStore.permissions`，**空数组视为拥有全部权限**（兼容无权限管理的后端）。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `code` | `string \| string[]` | — | 所需权限码，传数组时满足其一即可（OR 逻辑） |
| `children` | `ReactNode` | — | 有权限时渲染的内容 |
| `fallback` | `ReactNode` | `null` | 无权限时渲染的内容 |

### 用法

```tsx
import { HasPermission } from '@/components/common/HasPermission'

{/* 无权限时自动隐藏 */}
<HasPermission code="system:user:create">
  <Button type="primary">新增用户</Button>
</HasPermission>

{/* 多权限 OR 判断 */}
<HasPermission code={['system:user:edit', 'system:user:delete']}>
  <Space>...</Space>
</HasPermission>

{/* 无权限时渲染替代内容 */}
<HasPermission code="system:user:delete" fallback={<span>-</span>}>
  <a style={{ color: '#ff4d4f' }}>删除</a>
</HasPermission>
```

### Hook 形式

如需在逻辑中判断权限，使用 `usePermission`：

```tsx
import { usePermission } from '@/hooks'

const { hasPermission } = usePermission()

// 单个权限
if (hasPermission('system:user:delete')) { ... }

// 多权限 OR
if (hasPermission(['system:user:edit', 'system:user:delete'])) { ... }
```

---

## ErrorBoundary

React 错误边界组件（Class Component），捕获子组件渲染异常，显示兜底 UI。

### Props

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode` | 子组件 |

### 行为

- 捕获子树中的渲染错误
- 在控制台输出错误信息
- 展示 Ant Design `Result` 错误页，提供「重试」按钮

### 用法

```tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## PageSkeleton

页面级骨架屏组件，在数据加载完成前代替真实内容渲染，避免布局跳变（CLS），提升用户感知加载体验。

内部包含三种预设布局，贴合项目中最常见的三类页面形态，开箱即用。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'dashboard' \| 'table' \| 'detail'` | — | 骨架屏类型 |
| `cards` | `number` | `4` | `dashboard` 类型的统计卡片数量 |
| `rows` | `number` | `8` | `table` 类型的骨架行数 |

### 类型说明

| type | 适用场景 | 效果 |
| --- | --- | --- |
| `dashboard` | 仪表盘页面 | 统计卡片 + 内容面板双列布局 |
| `table` | 列表页面 | 工具栏 + 多行表格行 + 分页区 |
| `detail` | 详情页 / 抽屉 | 头像 + 多行文字段落 |

### 用法

```tsx
import { PageSkeleton } from '@/components/common/PageSkeleton'

// 仪表盘骨架屏
if (loading) return <PageSkeleton type="dashboard" />

// 表格骨架屏（自定义行数）
if (loading) return <PageSkeleton type="table" rows={10} />

// 详情页骨架屏
if (loading) return <PageSkeleton type="detail" />
```

**推荐用法**：用条件渲染替换 `Spin` 包裹，避免内容区布局跳变：

```tsx
// ❌ 旧方式：Spin 包裹，内容区先渲染再遮罩，高度抖动
<Spin spinning={loading}>
  <DashboardContent />
</Spin>

// ✅ 新方式：loading 时完全替换为骨架屏，结构稳定
{loading ? (
  <PageSkeleton type="dashboard" />
) : (
  <DashboardContent />
)}
```

---

## DictTag

字典值展示组件，根据字典类型和值自动查询字典数据，渲染为带颜色的 Tag。

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `dictType` | `string` | ✅ | 字典类型编码 |
| `value` | `string \| number` | ✅ | 字典项值 |

### 用法

```tsx
import { DictTag } from '@/components/common/DictTag'

// 在表格列中使用
{
  title: '订单状态',
  dataIndex: 'status',
  render: (status) => <DictTag dictType="order_status" value={status} />
}

// 在详情页中使用
<DictTag dictType="user_type" value={userInfo.type} />
```

### 工作原理

1. 通过 `useDictionary(dictType)` hook 获取字典数据
2. 调用 `getLabel(value)` 获取显示文本
3. 调用 `getColor(value)` 获取标签颜色
4. 渲染为 `<Tag color={color}>{label}</Tag>`

---

## PermissionTreePanel

权限树面板组件，用于展示和编辑菜单权限、数据权限等树形结构。支持搜索、全选、展开/收起、只读模式等功能。

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `treeData` | `DataNode[]` | ✅ | 树形数据 |
| `checkedKeys` | `number[]` | ✅ | 已选中的节点 key |
| `expandedKeys` | `number[]` | ✅ | 已展开的节点 key |
| `allExpanded` | `boolean` | ✅ | 是否全部展开 |
| `searchValue` | `string` | ✅ | 搜索关键词 |
| `searchPlaceholder` | `string` | ✅ | 搜索框占位符 |
| `onSearchChange` | `(value: string) => void` | ✅ | 搜索变化回调 |
| `onCheckedChange` | `(keys: number[]) => void` | ✅ | 选中变化回调 |
| `onExpandedChange` | `(keys: number[]) => void` | ✅ | 展开变化回调 |
| `onSelectAll` | `(checked: boolean) => void` | ✅ | 全选/取消全选回调 |
| `onClear` | `() => void` | ✅ | 清空选择回调 |
| `onToggleExpand` | `() => void` | ✅ | 展开/收起全部回调 |
| `emptyText` | `string` | ✅ | 空数据提示文本 |
| `readonly` | `boolean` | ❌ | 是否只读模式（默认 `false`） |
| `onHalfCheckedChange` | `(keys: number[]) => void` | ❌ | 半选父级 key 变化回调（联动模式） |

### 用法

```tsx
import { PermissionTreePanel } from '@/components/common/PermissionTreePanel'

// 可编辑模式
<PermissionTreePanel
  treeData={menuTreeData}
  checkedKeys={checkedMenuKeys}
  expandedKeys={expandedMenuKeys}
  allExpanded={menuAllExpanded}
  searchValue={menuSearch}
  searchPlaceholder={t('system:role.searchMenu')}
  onSearchChange={setMenuSearch}
  onCheckedChange={setCheckedMenuKeys}
  onExpandedChange={setExpandedMenuKeys}
  onSelectAll={(checked) => {
    setCheckedMenuKeys(checked ? getAllLeafKeys(menuTreeData) : [])
  }}
  onClear={() => setCheckedMenuKeys([])}
  onToggleExpand={() => {
    const allKeys = getAllTreeKeys(menuTreeData)
    setExpandedMenuKeys(menuAllExpanded ? [] : allKeys)
    setMenuAllExpanded(!menuAllExpanded)
  }}
  onHalfCheckedChange={setHalfCheckedMenuKeys}
  emptyText={t('system:role.noMenuData')}
/>

// 只读模式（查看权限）
<PermissionTreePanel
  readonly
  treeData={menuTreeData}
  checkedKeys={permissionMenuKeys}
  expandedKeys={expandedMenuKeys}
  allExpanded={menuAllExpanded}
  searchValue={menuSearch}
  searchPlaceholder={t('system:role.searchMenu')}
  onSearchChange={setMenuSearch}
  onCheckedChange={() => {}}
  onExpandedChange={setExpandedMenuKeys}
  onSelectAll={() => {}}
  onClear={() => {}}
  onToggleExpand={() => {
    const allKeys = getAllTreeKeys(menuTreeData)
    setExpandedMenuKeys(menuAllExpanded ? [] : allKeys)
    setMenuAllExpanded(!menuAllExpanded)
  }}
  emptyText={t('system:role.noMenuData')}
/>
```

### 特性

- **搜索过滤**：支持按节点名称搜索，自动高亮匹配项
- **全选/清空**：快速选中或清空所有权限
- **展开/收起**：一键展开或收起所有节点
- **只读模式**：查看权限时使用，已选项显示绿色圆点，未选项灰色显示
- **联动模式**：支持父子节点联动选择（通过 `onHalfCheckedChange` 获取半选状态）
- **响应式布局**：自动适配容器高度，内容区域可滚动

### 只读模式说明

只读模式下：
- 树节点不可勾选
- 叶子节点前显示状态圆点（绿色=已选，灰色=未选）
- 已选节点文字正常显示，未选节点文字灰色
- 仍可搜索、展开/收起，但不能修改选中状态

---

## VersionUpdateBar

版本更新提示条，检测到新版本时在页面顶部显示提示横幅。

### Props

无需传入任何 props，组件内部自动检测版本更新。

### 用法

```tsx
import { VersionUpdateBar } from '@/components/common/VersionUpdateBar'

// 在布局组件中使用
const AppLayout = () => (
  <Layout>
    <VersionUpdateBar />
    <Header />
    <Content />
  </Layout>
)
```

### 工作原理

1. 通过 `useVersionCheck()` hook 检测版本更新
2. 当 `hasNewVersion` 为 `true` 时显示 Alert 横幅
3. 用户点击"立即刷新"按钮调用 `refresh()` 刷新页面
4. 横幅可关闭，关闭后不再显示（直到下次检测到新版本）

### 特性

- **自动检测**：基于构建时间戳或版本号对比
- **国际化支持**：提示文本支持多语言
- **可关闭**：用户可手动关闭提示
- **非侵入式**：以横幅形式显示，不阻塞用户操作

