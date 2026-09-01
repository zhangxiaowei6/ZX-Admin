import { useMemo, useCallback, useState, useEffect, memo } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { RollbackOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore, useUserStore } from '@/stores'
import { getTenantDetail } from '@/api/modules/platform'
import { getTenantMenuItems } from '@/config/routes'
import type { MenuItem } from '@/config/routes'
import { filterMenuByPermissions } from '@/services/menu.service'
import { BaseLayout } from '../BaseLayout'
import { HeaderToolbar } from '../HeaderActions'

// 递归转换菜单数据为 ProLayout route 格式（带 tenantId 前缀）
const convertMenuToRoutes = (items: MenuItem[], basePath: string): any[] =>
  items.map((item) => ({
    path: item.path ? `${basePath}/${item.path}` : basePath,
    name: item.name,
    icon: item.icon,
    ...(item.children ? { routes: convertMenuToRoutes(item.children, basePath) } : {}),
  }))

export const TenantLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tenantId } = useParams<{ tenantId: string }>()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { saasName, permissions } = useUserStore(useShallow((s) => ({
    saasName: s.saasName,
    permissions: s.permissions,
  })))
  const { systemLogo, locale, showBreadcrumb, sideMenuType } = useAppStore(useShallow((s) => ({
    systemLogo: s.systemLogo,
    locale: s.locale,
    showBreadcrumb: s.showBreadcrumb,
    sideMenuType: s.sideMenuType,
  })))

  const [tenantName, setTenantName] = useState(() => {
    const nameFromUrl = searchParams.get('name')
    if (nameFromUrl) {
      sessionStorage.setItem(`tenant_name_${tenantId}`, nameFromUrl)
      return nameFromUrl
    }
    return sessionStorage.getItem(`tenant_name_${tenantId}`) || t('tenant:tenantId', { id: tenantId })
  })

  // 如果没有缓存的名称，从 API 获取
  useEffect(() => {
    if (!sessionStorage.getItem(`tenant_name_${tenantId}`) && tenantId) {
      getTenantDetail(Number(tenantId)).then((res) => {
        if (res?.name) {
          sessionStorage.setItem(`tenant_name_${tenantId}`, res.name)
          setTenantName(res.name)
        }
      }).catch((e) => {
        console.warn('[TenantLayout] Failed to fetch tenant detail:', e)
      })
    }
  }, [tenantId])

  const basePath = `/tenant-admin/${tenantId}`
  const filteredMenuItems = useMemo<MenuItem[]>(
    () => filterMenuByPermissions(getTenantMenuItems(), permissions),
    [permissions, locale]
  )

  const staticRoute = useMemo(() => ({
    path: basePath,
    routes: convertMenuToRoutes(filteredMenuItems, basePath),
  }), [basePath, filteredMenuItems])

  const pathname = useMemo(() => location.pathname, [location.pathname])

  // 精确匹配当前路径对应的菜单项
  const selectedKeys = useMemo(() => {
    const menuItems = filteredMenuItems
    for (const item of menuItems) {
      const fullPath = item.path ? `${basePath}/${item.path}` : basePath
      if (fullPath === pathname) return [fullPath]
    }
    return [pathname]
  }, [pathname, basePath, filteredMenuItems])

  // 面包屑：第一级显示租户名称，后续显示菜单层级
  const breadcrumbItems = useMemo(() => {
    const findMenuPath = (items: MenuItem[], path: string, parents: MenuItem[] = []): MenuItem[] | null => {
      for (const item of items) {
        const fullPath = item.path ? `${basePath}/${item.path}` : basePath
        if (fullPath === path) return [...parents, item]
        if (item.children) {
          const found = findMenuPath(item.children, path, [...parents, item])
          if (found) return found
        }
      }
      return null
    }
    const menuPath = findMenuPath(filteredMenuItems, pathname) || []
    return [
      { title: tenantName },
      ...menuPath.map((item) => ({ title: item.name })),
    ]
  }, [pathname, basePath, tenantName, filteredMenuItems])

  const handleExtraMenuClick = useCallback((key: string) => {
    if (key === 'backToPlatform') {
      navigate('/tenant')
    }
  }, [navigate])

  const extraMenuItems = useMemo(() => [
    { key: 'backToPlatform', label: t('common:backToPlatform'), icon: <RollbackOutlined /> },
  ], [t])

  const headerActions = useMemo(() => <HeaderToolbar menuItems={filteredMenuItems} basePath={basePath} />, [basePath, filteredMenuItems])

  const layoutTitle = saasName ? `${saasName} - ${tenantName}` : tenantName
  const watermarkContent = saasName ? `${saasName} - ${tenantName}` : tenantName

  return (
    <BaseLayout
      title={layoutTitle}
      logo={systemLogo}
      route={staticRoute}
      homePath={basePath}
      headerActions={headerActions}
      extraMenuItems={extraMenuItems}
      onExtraMenuClick={handleExtraMenuClick}
      footerText={tenantName}
      watermarkContent={watermarkContent}
      breadcrumbRender={showBreadcrumb ? undefined : false}
      breadcrumbProps={{
        itemRender: (route: any) => <span>{route.title}</span>,
        items: breadcrumbItems,
      }}
      menuProps={{ selectedKeys }}
      siderMenuType={sideMenuType}
    />
  )
}

export default memo(TenantLayout)
