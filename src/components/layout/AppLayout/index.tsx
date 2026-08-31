import { useMemo, useCallback, useState, useEffect, memo, type FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SwapOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore, useUserStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { getPlatformMenuItems, type MenuItem } from '@/config/routes'
import { filterMenuByPermissions } from '@/services/menu.service'
import { BaseLayout } from '../BaseLayout'
import { MenuSearch, FullScreen, DarkModeToggle, LockScreenButton, NotificationBell, LanguageSwitch, OverflowActions, ActionDivider } from '../HeaderActions'

// 递归转换菜单数据为 ProLayout route 格式
const convertMenuToRoutes = (items: MenuItem[]): any[] =>
  items.map((item) => ({
    path: item.path,
    name: item.name,
    icon: item.icon,
    ...(item.group ? { group: item.group } : {}),
    ...(item.children ? { routes: convertMenuToRoutes(item.children) } : {}),
  }))

export const AppLayout: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { saasName, permissions } = useUserStore(useShallow((state) => ({
    saasName: state.saasName,
    permissions: state.permissions,
  })))

  const {
    showBreadcrumb,
    menuAccordion,
    sideMenuType,
    systemName,
    systemLogo,
    collapsed,
    locale,
  } = useAppStore(useShallow((s) => ({
    showBreadcrumb: s.showBreadcrumb,
    menuAccordion: s.menuAccordion,
    sideMenuType: s.sideMenuType,
    systemName: s.systemName,
    systemLogo: s.systemLogo,
    collapsed: s.collapsed,
    locale: s.locale,
  })))

  // 根据当前路径提取应该展开的父菜单 key
  const filteredMenuItems = useMemo<MenuItem[]>(
    () => filterMenuByPermissions(getPlatformMenuItems(), permissions),
    [permissions, locale]
  )

  const getParentKeys = useCallback((path: string): string[] => {
    const menuItems = filteredMenuItems
    for (const item of menuItems) {
      if (item.children) {
        const hasChild = item.children.some((child) => path.startsWith(child.path))
        if (hasChild) return [item.path]
      }
    }
    return []
  }, [filteredMenuItems])

  const [menuOpenKeys, setMenuOpenKeys] = useState<string[]>(() => getParentKeys(location.pathname))

  const pathname = useMemo(() => location.pathname, [location.pathname])
  const displaySystemName = saasName || systemName

  // 路由切换时同步展开的父菜单
  useEffect(() => {
    const parentKeys = getParentKeys(pathname)
    if (menuAccordion) {
      setMenuOpenKeys(parentKeys)
    } else {
      setMenuOpenKeys((prev) => [...new Set([...prev, ...parentKeys])])
    }
  }, [pathname, menuAccordion, getParentKeys])

  // 动态生成路由配置（语言切换时 menu name 会更新）
  const staticRoute = useMemo(() => ({
    path: '/',
    routes: convertMenuToRoutes(filteredMenuItems),
  }), [filteredMenuItems])

  const handleExtraMenuClick = useCallback((key: string) => {
    if (key === 'switchPlatform') {
      navigate('/login?switch=1')
    }
  }, [navigate])

  const extraMenuItems = useMemo(() => [
    { type: 'divider' as const },
    { key: 'switchPlatform', label: t('common:switchPlatform'), icon: <SwapOutlined /> },
  ], [t])

  const headerActions = useMemo(() => (
    <OverflowActions gap={4}>
      {/* 功能组：搜索和通知 */}
      <MenuSearch menuItems={filteredMenuItems} />
      <NotificationBell />

      <ActionDivider />

      {/* 设置组：语言、主题、全屏、锁屏 */}
      <LanguageSwitch />
      <DarkModeToggle />
      <FullScreen />
      <LockScreenButton />
    </OverflowActions>
  ), [filteredMenuItems])

  const menuProps = useMemo(() => ({
    ...(menuAccordion ? {
      openKeys: collapsed ? undefined : menuOpenKeys,
      onOpenChange: (keys: string[]) => {
        if (keys.length === 0) { setMenuOpenKeys([]); return }
        const newKey = keys.find((k) => !menuOpenKeys.includes(k))
        if (!newKey) { setMenuOpenKeys(keys); return }
        setMenuOpenKeys(keys.filter((k) => newKey.startsWith(k + '/') || k === newKey))
      },
    } : {}),
  }), [menuAccordion, collapsed, menuOpenKeys])

  return (
    <BaseLayout
      title={displaySystemName}
      logo={systemLogo}
      route={staticRoute}
      homePath="/"
      headerActions={headerActions}
      extraMenuItems={extraMenuItems}
      onExtraMenuClick={handleExtraMenuClick}
      footerText={displaySystemName}
      watermarkContent={displaySystemName}
      breadcrumbRender={showBreadcrumb ? undefined : false}
      breadcrumbProps={{
        itemRender: (route: any) => <span>{route.breadcrumbName}</span>,
      }}
      menuProps={menuProps}
      siderMenuType={sideMenuType}
    />
  )
}

export default memo(AppLayout)
