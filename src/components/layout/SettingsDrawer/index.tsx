import React, { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { Drawer, Button, Tabs, Space, message, theme, Modal, Input } from 'antd'
import { SettingOutlined, CopyOutlined, UndoOutlined, ClearOutlined, ImportOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getPersistedAppSettings, sanitizeAppSettings, useAppStore } from '@/stores'
import type { SettingsPreset } from '@/stores/useAppStore'
import { ThemeSettings } from './ThemeSettings'
import { LayoutSettings } from './LayoutSettings'
import { TabsSettings } from './TabsSettings'
import { TransitionSettings } from './TransitionSettings'
import { FormSettings } from './FormSettings'
import { SystemSettings } from './SystemSettings'
import { TableSettings } from './TableSettings'
import { HeaderSettings } from './HeaderSettings'

const STORAGE_KEY = 'settings-float-ball-position'

// 贴边吸附辅助函数（提取到组件外部）
const getSnapPosition = (x: number, y: number) => {
  const buttonSize = 40
  const padding = 16
  const maxX = window.innerWidth - buttonSize - padding
  const maxY = window.innerHeight - buttonSize - padding

  // 限制在视口内
  let newX = Math.max(padding, Math.min(maxX, x))
  let newY = Math.max(padding, Math.min(maxY, y))

  // 判断靠左还是靠右
  const centerX = window.innerWidth / 2
  if (newX < centerX) {
    newX = padding // 吸附到左边
  } else {
    newX = maxX // 吸附到右边
  }

  return { x: newX, y: newY }
}

export const SettingsDrawer: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importValue, setImportValue] = useState('')
  const [activePreset, setActivePreset] = useState<SettingsPreset | null>('default')

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { x: number; y: number }
        // 对保存的位置也应用贴边逻辑，确保始终贴边
        return getSnapPosition(parsed.x, parsed.y)
      } catch {
        // ignore corrupted data
      }
    }
    // 初始位置也应用贴边逻辑
    const defaultX = window.innerWidth - 80
    const defaultY = window.innerHeight - 120
    return getSnapPosition(defaultX, defaultY)
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isLongPress, setIsLongPress] = useState(false)
  const hasMovedRef = useRef(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  // 组件卸载时清理长按计时器和拖拽状态
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [])

  const buttonRef = useRef<HTMLDivElement>(null)
  const resetSettings = useAppStore((s) => s.resetSettings)
  const applySettings = useAppStore((s) => s.applySettings)
  const applyPreset = useAppStore((s) => s.applyPreset)
  const { token } = theme.useToken()
  const { t } = useTranslation('settings')

  // 贴边吸附（复用初始化时的逻辑）
  const snapToEdge = (x: number, y: number) => {
    return getSnapPosition(x, y)
  }

  // 关闭抽屉时清理可能残留的 View Transition 类名
  const handleDrawerClose = () => {
    setOpen(false)
    // 清理可能残留的 View Transition 类名
    document.documentElement.classList.remove('dark-transition')
  }

  const handleEnd = () => {
    // 清除长按计时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    // flushSync 强制同步渲染，让 transition 先生效，再更新吸附位置
    flushSync(() => {
      setIsDragging(false)
      setIsLongPress(false)
    })

    if (hasMovedRef.current) {
      setPosition((prev) => {
        const snapped = snapToEdge(prev.x, prev.y)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped))
        return snapped
      })
    }
  }

  const handleMouseMoveDoc = (e: MouseEvent) => {
    if (!isDraggingRef.current) return
    hasMovedRef.current = true
    setPosition({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y })
  }

  const handleTouchMoveDoc = (e: TouchEvent) => {
    if (!isDraggingRef.current) return
    hasMovedRef.current = true
    const touch = e.touches[0]
    setPosition({ x: touch.clientX - dragStartRef.current.x, y: touch.clientY - dragStartRef.current.y })
  }

  // 全局事件监听器始终挂载，通过 ref 判断是否处于拖拽状态
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMoveDoc)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMoveDoc, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveDoc)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMoveDoc)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [])

  // 窗口大小变化时重新计算吸附位置，防止悬浮球超出视口
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const snapped = getSnapPosition(prev.x, prev.y)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped))
        return snapped
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const startDrag = () => {
    isDraggingRef.current = true
    setIsLongPress(true)
    setIsDragging(true)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    hasMovedRef.current = false

    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }

    // 启动长按计时器
    longPressTimerRef.current = setTimeout(() => {
      startDrag()
    }, 100) // 100ms 后进入拖拽模式
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    hasMovedRef.current = false

    dragStartRef.current = { x: touch.clientX - position.x, y: touch.clientY - position.y }

    // 启动长按计时器
    longPressTimerRef.current = setTimeout(() => {
      startDrag()
    }, 100)

    e.preventDefault()
  }

  const handleClick = (e: React.MouseEvent) => {
    // 清除长按计时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // 如果刚拖拽过，阻止点击
    if (hasMovedRef.current) {
      e.stopPropagation()
      e.preventDefault()
      return
    }
    setOpen(true)
  }

  const handleCopySettings = () => {
    const { tabs: _tabs, activeTabKey: _activeTabKey, ...exportedSettings } = getPersistedAppSettings()
    const settingsJson = { schemaVersion: 2, settings: exportedSettings }
    navigator.clipboard.writeText(JSON.stringify(settingsJson, null, 2)).then(() => {
      message.success(t('copiedSuccess'))
    })
  }

  const handleImportSettings = () => {
    try {
      const parsed = JSON.parse(importValue) as unknown
      const source = parsed && typeof parsed === 'object' && 'settings' in parsed
        ? (parsed as { settings: unknown }).settings
        : parsed
      const sanitized = sanitizeAppSettings(source)
      if (Object.keys(sanitized).length === 0) throw new Error('empty settings')
      applySettings(sanitized)
      setActivePreset(null)
      setImportOpen(false)
      setImportValue('')
      message.success(t('importSuccess'))
    } catch {
      message.error(t('importInvalid'))
    }
  }

  const handleApplyPreset = (preset: SettingsPreset) => {
    applyPreset(preset)
    setActivePreset(preset)
  }

  const handleResetSettings = () => {
    resetSettings()
    setActivePreset('default')
  }

  const handleClearCache = () => {
    Modal.confirm({
      title: t('clearCache'),
      content: t('clearCacheConfirm'),
      okText: t('confirm'),
      cancelText: t('cancel'),
      okButtonProps: { danger: true },
      onOk: () => {
        // 保存用户设置和语言配置
        const appSettings = localStorage.getItem('app-settings')
        const appLocale = localStorage.getItem('app-locale')

        // 清除所有缓存
        localStorage.clear()
        sessionStorage.clear()

        // 恢复用户设置和语言配置
        if (appSettings) {
          localStorage.setItem('app-settings', appSettings)
        }
        if (appLocale) {
          localStorage.setItem('app-locale', appLocale)
        }

        message.success(t('clearCacheSuccess'))
        setTimeout(() => {
          window.location.reload()
        }, 500)
      },
    })
  }

  const tabItems = [
    { key: 'theme', label: t('tabTheme'), children: <ThemeSettings /> },
    { key: 'layout', label: t('tabLayout'), children: <LayoutSettings /> },
    { key: 'header', label: t('tabHeader'), children: <HeaderSettings /> },
    { key: 'tabs', label: t('tabTabs'), children: <TabsSettings /> },
    { key: 'transition', label: t('tabTransition'), children: <TransitionSettings /> },
    { key: 'table', label: t('tabTable'), children: <TableSettings /> },
    { key: 'form', label: t('tabForm'), children: <FormSettings /> },
    { key: 'system', label: t('tabSystem'), children: <SystemSettings /> },
  ]

  return (
    <>
      <div
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isLongPress ? 'grabbing' : 'pointer',
          boxShadow: isLongPress
            ? '0 6px 20px rgba(0,0,0,0.25)'
            : '0 2px 12px rgba(0,0,0,0.15)',
          transition: isDragging ? 'box-shadow 0.2s, transform 0.2s' : 'left 0.3s ease-out, top 0.3s ease-out, box-shadow 0.2s, transform 0.2s',
          transform: isLongPress ? 'scale(1.08)' : 'scale(1)',
          zIndex: 1000,
          userSelect: 'none',
          touchAction: 'none',
          outline: 'none',
        }}
        title={t('drawerTitle')}
      >
        <SettingOutlined style={{ fontSize: 18 }} />
      </div>
      <Drawer
        className="settings-drawer"
        title={t('drawerTitle')}
        placement="right"
        width={500}
        open={open}
        onClose={handleDrawerClose}
        footer={
          <Space style={{ width: '100%' }} direction="vertical" size={12}>
            <Space.Compact block>
              <Button type={activePreset === 'default' ? 'primary' : 'default'} aria-pressed={activePreset === 'default'} style={{ width: '25%' }} onClick={() => handleApplyPreset('default')}>{t('presetDefault')}</Button>
              <Button type={activePreset === 'compact' ? 'primary' : 'default'} aria-pressed={activePreset === 'compact'} style={{ width: '25%' }} onClick={() => handleApplyPreset('compact')}>{t('presetCompact')}</Button>
              <Button type={activePreset === 'comfortable' ? 'primary' : 'default'} aria-pressed={activePreset === 'comfortable'} style={{ width: '25%' }} onClick={() => handleApplyPreset('comfortable')}>{t('presetComfortable')}</Button>
              <Button type={activePreset === 'reducedMotion' ? 'primary' : 'default'} aria-pressed={activePreset === 'reducedMotion'} style={{ width: '25%' }} onClick={() => handleApplyPreset('reducedMotion')}>{t('presetReducedMotion')}</Button>
            </Space.Compact>
            <Button block icon={<CopyOutlined />} onClick={handleCopySettings}>
              {t('copySettings')}
            </Button>
            <Button block icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>
              {t('importSettings')}
            </Button>
            <Space.Compact block>
              <Button
                danger
                icon={<UndoOutlined />}
                onClick={handleResetSettings}
                style={{ width: '50%' }}
              >
                {t('resetSettings')}
              </Button>
              <Button
                danger
                icon={<ClearOutlined />}
                onClick={handleClearCache}
                style={{ width: '50%' }}
              >
                {t('clearCache')}
              </Button>
            </Space.Compact>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="theme"
          items={tabItems}
          size="small"
          tabPosition="top"
        />
      </Drawer>
      <Modal
        title={t('importSettings')}
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={handleImportSettings}
        okText={t('confirm')}
        cancelText={t('cancel')}
      >
        <Input.TextArea
          value={importValue}
          onChange={(event) => setImportValue(event.target.value)}
          placeholder={t('importPlaceholder')}
          autoSize={{ minRows: 10, maxRows: 18 }}
        />
      </Modal>
    </>
  )
}
