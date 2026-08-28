# 统一路由配置架构

## 概述

平台后台和租户后台以 `src/config/routes/` 为路由、菜单和页面权限的单一配置源。路由模块只负责把统一配置转换为 React Router 对象，布局则从同一配置动态生成菜单。

## 当前结构

```text
src/config/routes/
├── types.ts                  # AppRouteConfig、MenuItem 和生成函数
├── platform.config.tsx       # 平台路由、菜单与页面权限
├── tenant.config.tsx         # 租户路由、菜单与页面权限
└── index.ts                  # 统一导出
```

平台入口为 `getPlatformRouteConfig()`，租户入口为 `getTenantRouteConfig()`。两个函数每次调用时执行 `i18n.t()`，从而让菜单名称随运行时语言切换更新。

`platformRouteConfig` 和 `tenantRouteConfig` 是供 Router 初始化使用的兼容性常量；菜单不能直接缓存这些常量中的名称，应调用 `getPlatformMenuItems()` 或 `getTenantMenuItems()` 动态生成。

## 配置与生成行为

`AppRouteConfig` 同时描述：

- 路由：`path`、`index`、`component`、`children`、`redirectTo`。
- 菜单：`name`、`icon`、`group`、`hideInMenu`。
- 权限：`permission`。

`generateRoutes()` 将 `permission` 写入 React Router 的 `handle.permission`，`src/routes/Guard.tsx` 从当前匹配路由读取该值。`generateMenuItems()` 从相同配置生成菜单，并过滤 `hideInMenu` 和 `redirectTo` 项。

空 `permissions` 数组表示完全访问。非空时，路由守卫、菜单过滤以及页面内 `HasPermission` / `usePermission()` 都按后端实际权限码判断。

## 平台配置

平台页面使用绝对路径，例如：

```tsx
{
  path: '/tenant',
  component: Tenant,
  name: i18n.t('menu:tenantManagement'),
  icon: <ShopOutlined />,
  permission: 'tenant:list',
  group: i18n.t('menu:business'),
}
```

平台系统模块的索引跳转使用绝对目标：

```tsx
{ index: true, redirectTo: '/system/user' }
```

## 租户配置

租户路由挂载在 `/tenant-admin/:tenantId` 下，因此配置使用相对路径：

```tsx
{
  path: 'order',
  component: TenantOrder,
  name: i18n.t('menu:orderManagement'),
  icon: <ShoppingCartOutlined />,
  permission: 'tenant:list:backend:order:view',
}
```

租户首页使用 `index: true` 和空路径，系统模块索引跳转使用相对目标：

```tsx
{ index: true, redirectTo: 'user' }
```

`generateMenuItems()` 会递归拼接父路径；`TenantLayout` 再把菜单路径挂到当前 tenantId 的基础路径下。

## 新增或调整页面

1. 在 `platform.config.tsx` 或 `tenant.config.tsx` 增加懒加载组件和配置项。
2. 设置真实的 `permission`、i18n 名称、图标和可选分组。
3. 隐藏菜单但保留路由时使用 `hideInMenu`；索引跳转使用 `redirectTo`。
4. 同步页面、API、类型、`src/api/mock/` 固定响应和三语言资源。
5. 页面操作权限与路由权限保持一致。

不要新增独立静态菜单配置。

## 后端驱动边界

如果未来由后端下发路由，只允许后端提供稳定的 `componentKey`；前端通过白名单 `componentMap` 映射到组件。不得执行后端返回的动态导入路径。
