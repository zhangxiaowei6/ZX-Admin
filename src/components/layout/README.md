# 布局组件 (layout)

项目级布局组件，实现平台级和租户级双布局体系，包含顶栏操作、多标签页、设置面板等核心能力。

## 组件列表

| 组件 | 路径 | 说明 |
| --- | --- | --- |
| `BaseLayout` | `./BaseLayout/index.tsx` | 基础布局组件（AppLayout 和 TenantLayout 的共享基类） |
| `AppLayout` | `./AppLayout/index.tsx` | 平台级布局 |
| `TenantLayout` | `./TenantLayout/index.tsx` | 租户级布局 |
| `ThemeProvider` | `./ThemeProvider/index.tsx` | 全局主题提供者 |
| `PageTransitionWrapper` | `./PageTransitionWrapper/index.tsx` | 页面切换动画 |
| `MultiTabs` | `./MultiTabs/index.tsx` | 多标签页管理 |
| `SettingsDrawer` | `./SettingsDrawer/index.tsx` | 全局设置抽屉 |
| `HeaderActions/*` | `./HeaderActions/` | 顶栏操作区组件集（含 barrel `index.ts`） |

---

## BaseLayout

基础布局组件，封装了 `ProLayout` 的通用逻辑，被 `AppLayout` 和 `TenantLayout` 复用。

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | ✅ | ProLayout 标题 |
| `logo` | `string` | ❌ | ProLayout Logo URL |
| `route` | `{ path: string; routes: any[] }` | ✅ | ProLayout 路由配置 |
| `headerActions` | `ReactNode` | ✅ | 顶栏右侧操作按钮（头像下拉菜单之前） |
| `extraMenuItems` | `ItemType[]` | ❌ | 头像下拉菜单额外项（插入到退出登录之前） |
| `onExtraMenuClick` | `(key: string) => void` | ❌ | 额外菜单项点击处理 |
| `footerText` | `string` | ✅ | 页脚文本 |
| `watermarkContent` | `string` | ✅ | 水印文本 |
| `homePath` | `string` | ✅ | 菜单头部点击跳转路径 |
| `breadcrumbRender` | `any` | ❌ | ProLayout 面包屑渲染函数覆盖 |
| `breadcrumbProps` | `Record<string, any>` | ❌ | ProLayout 面包屑属性覆盖 |
| `menuProps` | `Record<string, any>` | ❌ | ProLayout 菜单属性覆盖 |
| `selectedKeys` | `string[]` | ❌ | ProLayout 选中菜单项覆盖 |
| `siderMenuType` | `'sub' \| 'group'` | ❌ | 侧边栏菜单类型（经典模式/分组模式） |

### 功能

- 递归将菜单配置转换为 ProLayout 路由
- 用户头像下拉菜单：个人信息、额外菜单项、退出登录
- 监听 `BroadcastChannel` 的 `logout` / `switchPlatform` 事件，跨 Tab 同步鉴权状态
- 内嵌 `MultiTabs`、`PageTransitionWrapper`、`SettingsDrawer`、`LockScreenOverlay`
- 支持水印、响应式布局、个人信息编辑

### 设计模式

BaseLayout 采用"模板方法"模式，定义了布局的骨架结构，具体的菜单配置、顶栏操作、面包屑逻辑由子类（AppLayout / TenantLayout）传入。

---

## AppLayout

平台级主布局，用于 `/` 前缀的所有路由。基于 `BaseLayout` 封装。

### 功能

- 使用 `getPlatformMenuItems()` 从 `src/config/routes/platform.config.tsx` 动态生成菜单
- 顶栏操作区：`MenuSearch`、`LanguageSwitch`、`FullScreen`、`DarkModeToggle`、`LockScreenButton`、`NotificationBell`，超出宽度自动折叠到 `OverflowActions`
- 用户头像下拉菜单：个人信息、切换平台、退出登录
- 面包屑正常显示层级结构

### 使用位置

`src/routes/modules/platform.tsx` 中作为根路由 layout。

### 示例

```tsx
// src/routes/modules/platform.tsx
{
  path: '/',
  element: <AppLayout />,
  children: [
    { path: 'dashboard', element: <Dashboard /> },
    // ...
  ]
}
```

---

## TenantLayout

租户级布局，用于 `/tenant-admin/:tenantId` 前缀的所有路由。基于 `BaseLayout` 封装。

### 与 AppLayout 的区别

| 项目 | AppLayout | TenantLayout |
| --- | --- | --- |
| 路由前缀 | `/` | `/tenant-admin/:tenantId` |
| 顶栏操作 | 全量 | 精简（无 LanguageSwitch、NotificationBell） |
| 菜单来源 | `getPlatformMenuItems()` | `getTenantMenuItems()`（路径自动拼接 tenantId） |
| 面包屑 | 正常层级 | 首级为租户名称 |
| 用户菜单 | 切换平台 / 退出 | 返回平台 / 退出 |

### 租户名称获取

优先读取 URL params 中的 `tenantId` 查询 API，结果缓存在 `sessionStorage`，切换租户时自动更新。

### 使用位置

`src/routes/modules/tenant.tsx` 中作为根路由 layout。

### 示例

```tsx
// src/routes/modules/tenant.tsx
{
  path: '/tenant-admin/:tenantId',
  element: <TenantLayout />,
  children: [
    { path: 'orders', element: <Orders /> },
    // ...
  ]
}
```

---

## ThemeProvider

全局主题提供者，挂载在应用根节点。

### 功能

- 组合 `darkAlgorithm`、`compactAlgorithm`、`defaultAlgorithm` 生成 Ant Design Token
- 读取 `useAppStore` 中的 `primaryColor`、`fontSize`、`borderRadius` 注入 Token
- 色弱模式：为 `body` 添加 CSS filter `invert(80%)`
- 灰色模式：为 `body` 添加 CSS filter `grayscale(100%)`
- 根据暗黑模式动态设置 `body` 背景色

### 使用位置

挂载在应用根节点 `src/App.tsx`，包裹整个应用。

### 示例

```tsx
// src/App.tsx
import { ThemeProvider } from '@/components/layout'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
```

---

## PageTransitionWrapper

页面路由切换动画容器，包裹 `<Outlet />`。

### 功能

- 读取 `useAppStore` 中的 `transitionName`、`enableTransition`
- 根据配置为页面容器动态添加 CSS 动画类名
- 使用 `<Suspense>` 包裹，懒加载页面时展示骨架屏

### 动画类型

在 SettingsDrawer 的「过渡动画」设置中可选：`fade`、`slide-left`、`slide-up`、`zoom`、`none`。

### 使用位置

在 `BaseLayout` 中包裹 `<Outlet />`，自动应用于所有页面路由切换。

### 示例

```tsx
// BaseLayout 内部使用
<PageTransitionWrapper>
  <Outlet />
</PageTransitionWrapper>
```

---

## MultiTabs

多标签页组件，展示当前已打开的页面 Tab。

### 功能

- 按当前 layout 作用域（平台 / 租户）过滤 Tab，互不干扰
- 路由变化时自动追加新 Tab
- 右键上下文菜单：刷新、关闭、关闭其他、关闭全部
- 首页 / 根路径 Tab 不可关闭
- 支持「卡片」和「线条」两种 Tab 样式（由 `useAppStore.tabStyle` 控制）
- Tab 数量上限由 `useAppStore.maxTabs` 控制，超出后自动关闭最旧的 Tab

### 使用位置

在 `BaseLayout` 中根据 `showTabs` 配置条件渲染。

### 示例

```tsx
// BaseLayout 内部使用
{showTabs && <MultiTabs />}
```

---

## SettingsDrawer

全局设置面板，通过右下角悬浮按钮打开。所有设置通过 `useAppStore` 持久化到 `localStorage`。

### 设置分类

| 分类 | 组件 | 主要配置项 |
| --- | --- | --- |
| 主题 | `ThemeSettings` | 暗黑模式、主色、字号、圆角、色弱、灰色、紧凑 |
| 布局 | `LayoutSettings` | 布局模式、内容宽度、侧边栏宽度、菜单手风琴、侧边菜单类型、头部/页脚显示、面包屑 |
| 标签页 | `TabsSettings` | 显示开关、Tab 样式、最大数量 |
| 过渡动画 | `TransitionSettings` | 启用开关、动画类型 |
| 表格 | `TableSettings` | 表格尺寸、边框、列宽可拖拽 |
| 表单 | `FormSettings` | 展示模式（弹窗/抽屉）、列数、表单尺寸 |
| 系统 | `SystemSettings` | 语言、系统名称、Logo、水印 |

### 其他操作

- **复制配置**：将当前所有设置序列化为 JSON 复制到剪贴板
- **重置设置**：恢复 `defaultSettings.json` 中的默认值
- **清除缓存**：清除所有 localStorage 和 sessionStorage，保留用户设置和语言配置，刷新页面

### 悬浮按钮交互

- **长按拖拽**：按住 100ms 后进入拖拽模式，可自由移动按钮位置
- **点击打开**：快速点击打开设置抽屉
- **自动吸附**：拖拽结束后自动吸附到屏幕边缘
- **位置持久化**：按钮位置保存到 localStorage，刷新后保持

### 使用位置

在 `BaseLayout` 中自动渲染，通过右下角悬浮按钮打开。

### 示例

```tsx
// BaseLayout 内部使用
<SettingsDrawer />
```

---

## HeaderActions

顶栏操作区组件集，均基于 `ActionIcon` 基础组件封装。

### ActionIcon

顶栏图标按钮的基础容器，32×32 px，支持 hover 主题色、键盘 Enter 触发。

### 组件清单

| 组件 | 说明 |
| --- | --- |
| `DarkModeToggle` | 明暗模式切换，移动端隐藏 tooltip |
| `FullScreen` | 全屏切换，监听 `fullscreenchange` 事件同步状态 |
| `LanguageSwitch` | 语言切换下拉，选项来自 `LANGUAGE_OPTIONS` 常量 |
| `LockScreenButton` | 锁屏按钮，弹窗设置密码后启用锁屏蒙层 |
| `LockScreenOverlay` | 锁屏蒙层，展示时钟、日期、用户头像，输入密码解锁 |
| `MenuSearch` | 菜单搜索，支持 `Ctrl+K` 唤起，键盘上下导航 |
| `NotificationBell` | 消息通知铃，每 30 秒轮询未读数，气泡展示最近消息 |
| `OverflowActions` | 响应式容器，动态测量子项宽度，溢出项折叠到 `···` 下拉菜单 |

### MenuSearch

- 展平嵌套菜单项用于全文搜索
- 支持 `basePath` 参数，兼容平台菜单和租户菜单
- 键盘 `↑` `↓` 导航，`Enter` 跳转，自动滚动选中项到可视区

### NotificationBell

- 角标展示未读消息数
- Popover 内按类型分 Tab：全部 / 公告 / 通知 / 消息
- 点击消息条目跳转详情并标记已读
- 「全部已读」「查看全部」快捷操作

### 用法

```tsx
import {
  DarkModeToggle,
  FullScreen,
  LanguageSwitch,
  LockScreenButton,
  LockScreenOverlay,
  MenuSearch,
  NotificationBell,
  OverflowActions,
} from '@/components/layout/HeaderActions'

// 在 AppLayout 顶栏中使用
<OverflowActions>
  <MenuSearch basePath="/" />
  <LanguageSwitch />
  <FullScreen />
  <DarkModeToggle />
  <LockScreenButton />
  <NotificationBell />
</OverflowActions>
<LockScreenOverlay />
```
