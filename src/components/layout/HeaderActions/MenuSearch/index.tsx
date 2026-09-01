import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Tooltip, Grid, theme as antTheme } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { type MenuItem, getPlatformMenuItems } from '@/config/routes'
import { ActionIcon } from '../ActionIcon'

// 将嵌套菜单扁平化为可搜索列表
const flattenMenuItems = (items: MenuItem[], basePath = ''): MenuItem[] =>
  items.flatMap((item) => {
    const fullPath = basePath ? (item.path ? `${basePath}/${item.path}` : basePath) : item.path
    const mapped = { ...item, path: fullPath }
    return item.children ? flattenMenuItems(item.children, basePath) : [mapped]
  })

interface MenuSearchProps {
  menuItems?: MenuItem[]
  basePath?: string
}

export const MenuSearch: React.FC<MenuSearchProps> = ({ menuItems, basePath = '' }) => {
  const navigate = useNavigate()
  const { token: themeToken } = antTheme.useToken()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const flatMenuItems = useMemo(
    () => flattenMenuItems(menuItems || getPlatformMenuItems(), basePath),
    [menuItems, basePath]
  )

  const results = useMemo(() => {
    if (!keyword.trim()) return flatMenuItems
    const k = keyword.toLowerCase()
    return flatMenuItems.filter(
      (item) => item.name.toLowerCase().includes(k) || item.path.toLowerCase().includes(k)
    )
  }, [keyword, flatMenuItems])

  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  // Ctrl+K 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = useCallback((path: string) => {
    navigate(path)
    setOpen(false)
    setKeyword('')
  }, [navigate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      handleSelect(results[activeIndex].path)
    }
  }, [results, activeIndex, handleSelect])

  useEffect(() => {
    const container = listRef.current
    if (!container) return
    const activeEl = container.children[activeIndex] as HTMLElement
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <>
      <Tooltip title={isMobile ? '' : t('searchMenu')}>
        <ActionIcon ariaLabel={t('searchMenu')} onClick={() => setOpen(true)}>
          <SearchOutlined />
        </ActionIcon>
      </Tooltip>

      <Modal
        open={open}
        onCancel={() => { setOpen(false); setKeyword('') }}
        footer={null}
        closable={false}
        width={480}
        styles={{ body: { padding: '12px 0 0' } }}
      >
        <Input
          autoFocus
          size="large"
          placeholder={t('searchMenuPlaceholder')}
          prefix={<SearchOutlined style={{ color: themeToken.colorTextSecondary }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          allowClear
        />
        <div
          ref={listRef}
          style={{ maxHeight: 320, overflowY: 'auto', marginTop: 8 }}
        >
          {results.length > 0 ? (
            results.map((item, index) => (
              <div
                key={item.path}
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderRadius: 6,
                  backgroundColor: index === activeIndex ? themeToken.colorPrimaryBg : 'transparent',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => handleSelect(item.path)}
                onMouseEnter={() => setActiveIndex(index)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(item.path) }}
              >
                <span style={{ fontSize: 18, color: themeToken.colorPrimary }}>{item.icon}</span>
                <span style={{ fontSize: 14 }}>{item.name}</span>
                <span style={{ fontSize: 12, color: themeToken.colorTextSecondary, marginLeft: 'auto' }}>
                  {item.path}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: themeToken.colorTextSecondary }}>
              {t('noMatchMenu')}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
