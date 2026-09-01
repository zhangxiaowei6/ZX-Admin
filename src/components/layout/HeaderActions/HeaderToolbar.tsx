import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dropdown, Tooltip } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import type { MenuItem } from '@/config/routes'
import { MenuSearch } from './MenuSearch'
import { NotificationBell } from './NotificationBell'
import { LanguageSwitch } from './LanguageSwitch'
import { DarkModeToggle } from './DarkModeToggle'
import { FullScreen } from './FullScreen'
import { LockScreenButton } from './LockScreen'
import { ActionIcon } from './ActionIcon'

type ToolbarItem = {
  key: 'menuSearch' | 'notification' | 'language' | 'darkMode' | 'fullscreen' | 'lockScreen'
  group: 'primary' | 'utility'
  label: string
  node: React.ReactNode
}

interface HeaderToolbarProps {
  menuItems: MenuItem[]
  basePath?: string
}

const GROUP_ORDER = ['primary', 'utility'] as const
const ACTION_SIZE = 32
const ACTION_GAP = 4
const GROUP_GAP = 8
const GROUP_SEPARATOR_WIDTH = 9
const MORE_BUTTON_WIDTH = ACTION_SIZE + GROUP_GAP

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({ menuItems, basePath }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    headerActionVisibility,
    headerActionOrder,
    darkMode,
  } = useAppStore(useShallow((state) => ({
    headerActionVisibility: state.headerActionVisibility,
    headerActionOrder: state.headerActionOrder,
    darkMode: state.darkMode,
  })))
  const [visibleCount, setVisibleCount] = useState<number | null>(null)
  const [overflowOpen, setOverflowOpen] = useState(false)

  const items = useMemo<ToolbarItem[]>(() => {
    const nodes: Record<ToolbarItem['key'], React.ReactNode> = {
      menuSearch: <MenuSearch menuItems={menuItems} basePath={basePath} />,
      notification: <NotificationBell />,
      language: <LanguageSwitch />,
      darkMode: <DarkModeToggle />,
      fullscreen: <FullScreen />,
      lockScreen: <LockScreenButton />,
    }
    const labels: Record<ToolbarItem['key'], string> = {
      menuSearch: t('searchMenu'),
      notification: t('notifications'),
      language: t('switchLanguage'),
      darkMode: darkMode ? t('switchToLight') : t('switchToDark'),
      fullscreen: t('fullscreen'),
      lockScreen: t('lockScreen'),
    }
    const order: ToolbarItem['key'][] = [
      ...headerActionOrder.primary,
      ...headerActionOrder.utility,
    ]
    return order
      .filter((key) => headerActionVisibility[key])
      .map((key) => ({
        key,
        group: (headerActionOrder.primary as readonly string[]).includes(key) ? 'primary' : 'utility',
        label: labels[key],
        node: nodes[key],
      }))
  }, [basePath, darkMode, headerActionOrder, headerActionVisibility, menuItems, t])

  const getWidthForCount = useCallback((count: number, includeMore: boolean) => {
    if (count === 0) return includeMore ? ACTION_SIZE : 0
    const visibleItems = items.slice(0, count)
    const groupCount = new Set(visibleItems.map((item) => item.group)).size
    return count * ACTION_SIZE
      + Math.max(0, count - groupCount) * ACTION_GAP
      + Math.max(0, groupCount - 1) * GROUP_GAP
      + Math.max(0, groupCount - 1) * GROUP_SEPARATOR_WIDTH
      + (includeMore ? MORE_BUTTON_WIDTH : 0)
  }, [items])

  const calculateVisibleCount = useCallback(() => {
    const availableWidth = containerRef.current?.clientWidth ?? 0
    if (!availableWidth || items.length === 0) {
      setVisibleCount(items.length)
      return
    }
    if (getWidthForCount(items.length, false) <= availableWidth) {
      setVisibleCount(items.length)
      return
    }
    let count = 0
    while (count < items.length && getWidthForCount(count + 1, true) <= availableWidth) {
      count += 1
    }
    setVisibleCount(count)
  }, [getWidthForCount, items.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    setVisibleCount(null)
    const frame = requestAnimationFrame(calculateVisibleCount)
    const observer = new ResizeObserver(calculateVisibleCount)
    observer.observe(container)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [calculateVisibleCount])

  useEffect(() => {
    setOverflowOpen(false)
  }, [location.pathname])

  const count = visibleCount === null ? items.length : visibleCount
  const visibleItems = items.slice(0, count)
  const overflowItems = items.slice(count)
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: visibleItems.filter((item) => item.group === group),
  })).filter((entry) => entry.items.length > 0)

  const overflowMenuItems = GROUP_ORDER.flatMap((group) => {
    const groupItems = overflowItems.filter((item) => item.group === group)
    if (!groupItems.length) return []
    const entries = groupItems.map((item) => ({
      key: item.key,
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', width: 18 }}>{item.node}</span>
          <span>{item.label}</span>
        </span>
      ),
    }))
    return group === 'primary' && overflowItems.some((item) => item.group === 'utility')
      ? [...entries, { type: 'divider' as const }]
      : entries
  })

  return (
    <div
      ref={containerRef}
      className="header-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: '1 1 auto',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {groups.map(({ group, items: groupItems }, index) => (
        <div
          key={group}
          className="header-toolbar-group"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            ...(index > 0
              ? {
                  borderInlineStart: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                  paddingInlineStart: 8,
                }
              : {}),
          }}
        >
          {groupItems.map((item) => (
            <span key={item.key} aria-label={item.label} style={{ display: 'inline-flex' }}>{item.node}</span>
          ))}
        </div>
      ))}
      {overflowItems.length > 0 && (
        <Dropdown
          menu={{ items: overflowMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          open={overflowOpen}
          onOpenChange={setOverflowOpen}
        >
          <Tooltip title={t('moreActions')}>
            <ActionIcon ariaLabel={t('moreActions')}>
              <EllipsisOutlined />
            </ActionIcon>
          </Tooltip>
        </Dropdown>
      )}
    </div>
  )
}
