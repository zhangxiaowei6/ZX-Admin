import React, { useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs, Dropdown, theme as antTheme } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import {
  getPlatformMenuItems,
  getPlatformMenuLabelByPath,
  getTenantMenuItems,
  getTenantMenuLabelByPath,
} from '@/config/routes'
import './index.css'

/** 判断当前路径属于哪套后台 */
const isTenantAdminPath = (path: string) => path.startsWith('/tenant-admin/')

/** 获取当前后台的首页路径 */
const getHomePath = (path: string) => {
  if (isTenantAdminPath(path)) {
    const match = path.match(/^\/tenant-admin\/[^/]+/)
    return match ? match[0] : path
  }
  return '/'
}

export const MultiTabs: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { token: themeToken } = antTheme.useToken()
  const { t } = useTranslation('common')
  const {
    tabs,
    activeTabKey,
    showTabs,
    tabStyle,
    showTabIcon,
    locale,
    addTab,
    removeTab,
    removeOtherTabs,
    removeAllTabs,
    setActiveTabKey,
  } = useAppStore(useShallow((s) => ({
    tabs: s.tabs,
    activeTabKey: s.activeTabKey,
    showTabs: s.showTabs,
    tabStyle: s.tabStyle,
    showTabIcon: s.showTabIcon,
    locale: s.locale,
    addTab: s.addTab,
    removeTab: s.removeTab,
    removeOtherTabs: s.removeOtherTabs,
    removeAllTabs: s.removeAllTabs,
    setActiveTabKey: s.setActiveTabKey,
  })))

  const isTenant = isTenantAdminPath(location.pathname)
  const homePath = getHomePath(location.pathname)
  const scope = isTenant ? homePath : '/'

  const getTabLabel = useCallback((tabKey: string) => {
    if (isTenantAdminPath(tabKey)) {
      return getTenantMenuLabelByPath(tabKey)
    }
    return getPlatformMenuLabelByPath(tabKey)
  }, [locale])

  const filteredTabs = useMemo(
    () => isTenant
      ? tabs.filter((t) => t.key.startsWith(homePath))
      : tabs.filter((t) => !isTenantAdminPath(t.key)),
    [tabs, isTenant, homePath]
  )

  useEffect(() => {
    const label = isTenant
      ? getTenantMenuLabelByPath(location.pathname)
      : getPlatformMenuLabelByPath(location.pathname)
    addTab({
      key: location.pathname,
      label,
      closable: location.pathname !== homePath,
    })
    setActiveTabKey(location.pathname)
  }, [location.pathname, addTab, setActiveTabKey, isTenant, homePath])

  const handleTabChange = useCallback(
    (key: string) => {
      navigate(key)
    },
    [navigate]
  )

  const handleTabEdit = useCallback(
    (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
      if (action === 'remove' && typeof targetKey === 'string') {
        removeTab(targetKey)
        const { activeTabKey: newActive } = useAppStore.getState()
        if (targetKey === location.pathname) {
          navigate(newActive)
        }
      }
    },
    [removeTab, navigate, location.pathname]
  )

  const getContextMenuItems = useCallback(
    (tabKey: string): MenuProps['items'] => [
      {
        key: 'refresh',
        label: t('refreshCurrent'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation()
          navigate(tabKey, { replace: true })
        },
      },
      {
        key: 'close',
        label: t('closeCurrent'),
        disabled: tabKey === homePath,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation()
          removeTab(tabKey)
          const { activeTabKey: newActive } = useAppStore.getState()
          if (tabKey === location.pathname) {
            navigate(newActive)
          }
        },
      },
      { type: 'divider' as const },
      {
        key: 'closeOthers',
        label: t('closeOthers'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation()
          removeOtherTabs(tabKey, scope)
          navigate(tabKey)
        },
      },
      {
        key: 'closeAll',
        label: t('closeAll'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation()
          removeAllTabs(scope, homePath)
          navigate(homePath)
        },
      },
    ],
    [removeTab, removeOtherTabs, removeAllTabs, navigate, location.pathname, homePath, scope, t]
  )

  if (!showTabs) return null

  const isClosableStyle = tabStyle === 'card' || tabStyle === 'chrome'

  const tabItems = filteredTabs.map((tab) => ({
    key: tab.key,
    label: (
      <Dropdown
        menu={{ items: getContextMenuItems(tab.key) }}
        trigger={['contextMenu']}
      >
        <span className="multi-tab-label">
          {showTabIcon && (() => {
            const items = isTenant ? getTenantMenuItems() : getPlatformMenuItems()
            const find = (entries: typeof items): React.ReactNode => {
              for (const item of entries) {
                const fullPath = isTenant ? `${homePath}${item.path ? `/${item.path}` : ''}` : item.path
                if (fullPath === tab.key) return item.icon
                if (item.children) {
                  const nested = find(item.children)
                  if (nested) return nested
                }
              }
              return null
            }
            const icon = find(items)
            return icon ? <span style={{ marginRight: 4 }}>{icon}</span> : null
          })()}
          {getTabLabel(tab.key)}
        </span>
      </Dropdown>
    ),
    closable: isClosableStyle ? tab.closable : false,
  }))

  return (
    <div
      className={`multi-tabs-wrapper multi-tabs-${tabStyle}`}
      style={{
        padding: '0 8px',
        background: themeToken.colorBgContainer,
        borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
      }}
    >
      <Tabs
        type={isClosableStyle ? 'editable-card' : 'line'}
        size="small"
        activeKey={activeTabKey}
        onChange={handleTabChange}
        onEdit={isClosableStyle ? handleTabEdit : undefined}
        hideAdd
        items={tabItems}
      />
    </div>
  )
}
