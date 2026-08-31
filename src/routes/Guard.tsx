import { memo } from 'react'
import { Navigate, matchRoutes, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/useUserStore'
import { useShallow } from 'zustand/react/shallow'
import { routes } from './routes'

const WHITE_LIST = ['/login', '/403', '/404']

type RouteHandle = { permission?: string }

const getRequiredPermission = (pathname: string): string | undefined => {
  const matches = matchRoutes(routes, pathname)
  if (!matches) return undefined

  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i].route.handle as RouteHandle | undefined
    if (handle?.permission) return handle.permission
  }

  return undefined
}

export const Guard = memo(function Guard({ children }: { children: React.ReactNode }) {
  const { token, permissions, _hasHydrated, permissionsLoaded } = useUserStore(
    useShallow((state) => ({
      token: state.token,
      permissions: state.permissions,
      _hasHydrated: state._hasHydrated,
      permissionsLoaded: state.permissionsLoaded,
    })),
  )
  const location = useLocation()
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/'

  // 等待 Zustand persist 从 localStorage 恢复完成
  if (!_hasHydrated) {
    return null
  }

  if (!token && normalizedPath !== '/login') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // token 存在但权限尚未从后端加载，等待中（避免放行未授权访问）
  if (token && !permissionsLoaded && !WHITE_LIST.includes(normalizedPath)) {
    return null
  }

  // permissions 为空数组表示完全访问（后端未配置权限或全局管理员）
  if (token && permissions.length > 0 && !WHITE_LIST.includes(normalizedPath)) {
    const requiredPermission = getRequiredPermission(normalizedPath)
    if (requiredPermission && !permissions.includes(requiredPermission)) {
      return <Navigate to="/403" replace />
    }
  }

  return <>{children}</>
})
