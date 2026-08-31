import { useMemo, useCallback, useEffect, useState, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, Dropdown, Modal, Form, Input, message, theme as antTheme, ConfigProvider, Watermark, Grid } from 'antd'
import { ProLayout } from '@ant-design/pro-components'
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore, useUserStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { logout } from '@/api/modules/platform'
import { removeUserInfo, getUserInfo } from '@/utils/storage'
import { broadcastAuthEvent, onAuthEvent } from '@/utils/authChannel'
import { MultiTabs } from '../MultiTabs'
import { PageTransitionWrapper } from '../PageTransitionWrapper'
import { SettingsDrawer } from '../SettingsDrawer'
import { LockScreenOverlay } from '../HeaderActions'
import type { MenuDataItem } from '@ant-design/pro-components'
import type { ItemType } from 'antd/es/menu/interface'
import type { User } from '@/types'

// 独立提取内容区，只订阅主题相关属性，避免布局设置变化时触发内容区重渲染
const LayoutContent = memo(function LayoutContent({ watermarkContent }: { watermarkContent: string }) {
  const { darkMode, primaryColor, compactMode, showWatermark, watermarkText } = useAppStore(
    useShallow((s) => ({
      darkMode: s.darkMode,
      primaryColor: s.primaryColor,
      compactMode: s.compactMode,
      showWatermark: s.showWatermark,
      watermarkText: s.watermarkText,
    })),
  )
  const finalWatermarkContent = watermarkText.trim() || watermarkContent
  return (
    <Watermark content={showWatermark ? finalWatermarkContent : ''}>
      <ConfigProvider
        theme={{
          algorithm: [
            darkMode ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
            ...(compactMode ? [antTheme.compactAlgorithm] : []),
          ],
          token: { colorPrimary: primaryColor, colorLink: primaryColor },
        }}
      >
        <MultiTabs />
        <PageTransitionWrapper />
      </ConfigProvider>
    </Watermark>
  )
})

export interface BaseLayoutProps {
  /** ProLayout title */
  title: string
  /** ProLayout logo (optional) */
  logo?: string
  /** ProLayout route config */
  route: { path: string; routes: any[] }
  /** Header right-side action buttons (before avatar dropdown) */
  headerActions: React.ReactNode
  /** Avatar dropdown menu items (inserted before logout) */
  extraMenuItems?: ItemType[]
  /** Extra menu click handler */
  onExtraMenuClick?: (key: string) => void
  /** Footer text */
  footerText: string
  /** Watermark text */
  watermarkContent: string
  /** Menu header click path */
  homePath: string
  /** ProLayout breadcrumbRender / breadcrumbProps overrides */
  breadcrumbRender?: any
  breadcrumbProps?: Record<string, any>
  /** ProLayout menuProps overrides */
  menuProps?: Record<string, any>
  /** ProLayout selectedKeys override */
  selectedKeys?: string[]
  /** ProLayout siderMenuType */
  siderMenuType?: 'sub' | 'group'
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  logo,
  route,
  headerActions,
  extraMenuItems = [],
  onExtraMenuClick,
  footerText,
  watermarkContent,
  homePath,
  breadcrumbRender,
  breadcrumbProps,
  menuProps: extraMenuProps,
  siderMenuType,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token: themeToken } = antTheme.useToken()
  const { t } = useTranslation()

  const {
    collapsed, setCollapsed,
    layoutMode, setLayoutMode,
    showHeader,
    fixedHeader,
    showSidebar,
    fixedSidebar,
    showFooter,
    sidebarWidth,
    darkMode,
    primaryColor,
    contentWidth,
    contentPadding,
    sidebarDark,
  } = useAppStore(useShallow((s) => ({
    collapsed: s.collapsed, setCollapsed: s.setCollapsed,
    layoutMode: s.layoutMode, setLayoutMode: s.setLayoutMode,
    showHeader: s.showHeader,
    fixedHeader: s.fixedHeader,
    showSidebar: s.showSidebar,
    fixedSidebar: s.fixedSidebar,
    showFooter: s.showFooter,
    sidebarWidth: s.sidebarWidth,
    darkMode: s.darkMode,
    primaryColor: s.primaryColor,
    contentWidth: s.contentWidth,
    contentPadding: s.contentPadding,
    sidebarDark: s.sidebarDark,
  })))

  const { userInfo, setUserInfo: setStoreUserInfo, logout: storeLogout } = useUserStore()
  const [profileVisible, setProfileVisible] = useState(false)
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md !== undefined && !screens.md

  // 移动端自动回退为 mix 布局
  useEffect(() => {
    if (isMobile && layoutMode !== 'mix') {
      setLayoutMode('mix')
    }
  }, [isMobile, layoutMode, setLayoutMode])

  // 从 localStorage 回填用户信息到 store（页面刷新后 userInfo 不持久化，需手动恢复）
  useEffect(() => {
    if (!userInfo) {
      const info = getUserInfo<User>()
      if (info) setStoreUserInfo(info)
    }
  }, [userInfo, setStoreUserInfo])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (e) {
      console.warn('[BaseLayout] logout API failed:', e)
    }
    broadcastAuthEvent('logout')
    storeLogout()
    removeUserInfo()
    message.success(t('common:loggedOut'))
  }, [storeLogout, t])

  // 监听其他标签页的登出/切换平台事件
  useEffect(() => {
    return onAuthEvent((event) => {
      if (event === 'logout' || event === 'switchPlatform') {
        storeLogout()
        removeUserInfo()
      }
    })
  }, [storeLogout])

  const handleProfileSubmit = useCallback(() => {
    message.success(t('common:saveSuccess'))
    setProfileVisible(false)
  }, [t])

  const menuItemRender = useCallback((item: MenuDataItem, defaultDom: React.ReactNode) => {
    if (!item.path) return defaultDom
    return (
      <span
        role="button"
        tabIndex={0}
        style={{ display: 'block', width: '100%', cursor: 'pointer' }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          navigate(item.path!)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(item.path!)
          }
        }}
      >
        {defaultDom}
      </span>
    )
  }, [navigate])

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    if (key === 'profile') {
      setProfileVisible(true)
    } else if (key === 'logout') {
      handleLogout()
    } else {
      onExtraMenuClick?.(key)
    }
  }, [handleLogout, onExtraMenuClick])

  const pathname = useMemo(() => location.pathname, [location.pathname])

  const dropdownItems: ItemType[] = useMemo(() => [
    ...(userInfo?.roles?.length ? [
      { key: 'role', label: <span style={{ color: 'inherit', opacity: 0.65, fontSize: 12 }}>{userInfo.roles.join(' / ')}</span>, icon: <UserOutlined style={{ opacity: 0.65 }} />, disabled: true },
      { type: 'divider' as const },
    ] : []),
    { key: 'profile', label: t('common:profileCenter'), icon: <UserOutlined /> },
    ...extraMenuItems,
    { type: 'divider' as const },
    { key: 'logout', label: t('common:logoutBtn'), icon: <LogoutOutlined />, danger: true },
  ], [t, extraMenuItems, userInfo?.roles])

  const isNavDark = sidebarDark && !darkMode && layoutMode !== 'mix'

  const rightContentRender = useCallback(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', color: isNavDark ? 'rgba(255,255,255,0.65)' : undefined }}>
      {headerActions}
      <span style={{ width: 1, height: 20, flexShrink: 0, background: isNavDark ? 'rgba(255,255,255,0.2)' : themeToken.colorBorderSecondary, margin: isMobile ? '0 2px' : '0 4px' }} />
      <Dropdown
        menu={{ items: dropdownItems, onClick: handleMenuClick }}
        trigger={['click']}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '0 8px',
            borderRadius: 6,
            height: 32,
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isNavDark ? 'rgba(255,255,255,0.08)' : themeToken.colorFillTertiary }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <Avatar
            style={{ backgroundColor: themeToken.colorPrimary, flexShrink: 0 }}
            size="small"
            src={userInfo?.avatar}
          >
            {userInfo?.nickname?.[0] || userInfo?.username?.[0] || 'A'}
          </Avatar>
          {!isMobile && layoutMode === 'top' && (
            <span style={{ color: isNavDark ? '#ffffff' : themeToken.colorText, fontSize: 14, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userInfo?.nickname || userInfo?.username || t('common:admin')}
            </span>
          )}
        </div>
      </Dropdown>
    </div>
  ), [userInfo, dropdownItems, handleMenuClick, headerActions, themeToken, isMobile, t, isNavDark])

  return (
    <>
      <ProLayout
        key={`${layoutMode}-${isMobile}`}
        title={title}
        logo={logo}
        route={route}
        location={{ pathname }}
        layout={layoutMode}
        contentWidth={contentWidth === 'fixed' ? 'Fixed' : 'Fluid'}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onMenuHeaderClick={() => navigate(homePath)}
        menuItemRender={menuItemRender}
        menuFooterRender={undefined}
        rightContentRender={showHeader ? rightContentRender : false}
        fixSiderbar={fixedSidebar}
        fixedHeader={fixedHeader}
        headerRender={showHeader ? undefined : false}
        menuRender={layoutMode === 'top' ? undefined : (showSidebar ? undefined : false)}
        siderWidth={sidebarWidth}
        breadcrumbRender={breadcrumbRender}
        breadcrumbProps={breadcrumbProps}
        menuProps={isNavDark ? { ...extraMenuProps, popupClassName: ['sidebar-dark-popup', extraMenuProps?.popupClassName].filter(Boolean).join(' ') } : extraMenuProps}
        siderMenuType={siderMenuType}
        footerRender={showFooter ? () => (
          <div style={{ textAlign: 'center', padding: '16px 0', color: themeToken.colorTextSecondary }}>
            {footerText} ©{new Date().getFullYear()}
          </div>
        ) : false}
        navTheme={darkMode ? 'realDark' : 'light'}
        token={{
          header: sidebarDark && !darkMode && layoutMode === 'top' ? {
            colorBgHeader: '#001529',
            colorBgScrollHeader: '#001529',
            colorHeaderTitle: '#ffffff',
            colorTextMenu: 'rgba(255, 255, 255, 0.65)',
            colorTextMenuSelected: '#ffffff',
            colorTextMenuActive: '#ffffff',
            colorBgMenuItemSelected: 'rgba(255, 255, 255, 0.15)',
            colorBgMenuItemHover: 'rgba(255, 255, 255, 0.08)',
            colorTextRightActionsItem: 'rgba(255, 255, 255, 0.65)',
          } : {
            colorBgHeader: darkMode ? '#141414' : '#ffffff',
            colorBgScrollHeader: darkMode ? '#141414' : '#ffffff',
          },
          sider: sidebarDark && !darkMode ? {
            colorMenuBackground: '#001529',
            colorBgMenuItemHover: 'rgba(255, 255, 255, 0.08)',
            colorBgMenuItemSelected: primaryColor,
            colorTextMenu: 'rgba(255, 255, 255, 0.65)',
            colorTextMenuSelected: '#ffffff',
            colorTextMenuActive: '#ffffff',
            colorTextMenuItemHover: '#ffffff',
            colorMenuItemDivider: 'rgba(255, 255, 255, 0.15)',
            colorBgCollapsedButton: '#001529',
            colorTextCollapsedButton: 'rgba(255, 255, 255, 0.65)',
            colorTextCollapsedButtonHover: '#ffffff',
            colorTextMenuTitle: '#ffffff',
          } : {},
          pageContainer: {
            paddingBlockPageContainerContent: contentPadding,
            paddingInlinePageContainerContent: contentPadding,
          },
        }}
        bgLayoutImgList={darkMode ? [] : undefined}
      >
        <LayoutContent watermarkContent={watermarkContent} />

        <Modal
          title={t('common:profileCenter')}
          open={profileVisible}
          onCancel={() => setProfileVisible(false)}
          onOk={handleProfileSubmit}
          okText={t('common:save')}
        >
          <Form layout="vertical" initialValues={userInfo ?? undefined}>
            <Form.Item label={t('common:username')} name="username">
              <Input disabled />
            </Form.Item>
            <Form.Item label={t('common:nickname')} name="nickname">
              <Input prefix={<EditOutlined />} placeholder={t('common:enterNickname')} />
            </Form.Item>
            <Form.Item label={t('common:avatar')} name="avatar">
              <Input prefix={<UserOutlined />} placeholder={t('common:avatarUrl')} />
            </Form.Item>
          </Form>
        </Modal>
      </ProLayout>

      <SettingsDrawer />
      <LockScreenOverlay />
    </>
  )
}

export default memo(BaseLayout)
