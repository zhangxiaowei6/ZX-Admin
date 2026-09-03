import React from 'react'
import { Switch, Slider, Tooltip, Segmented, Grid, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import type { LayoutMode, ContentWidth, SideMenuType } from '@/stores/useAppStore'

const { useBreakpoint } = Grid


const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <span>{label}</span>
    {children}
  </div>
)

const LayoutPreview: React.FC<{ mode: LayoutMode; active: boolean; onClick: () => void; onDisabledClick?: () => void; label: string; disabled?: boolean; isMobile?: boolean }> = ({
  mode, active, onClick, onDisabledClick, label, disabled, isMobile,
}) => {
  const baseStyle: React.CSSProperties = {
    width: 56,
    height: 44,
    borderRadius: 4,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: active ? '2px solid var(--ant-color-primary, #1677ff)' : '2px solid #e8e8e8',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f2f5',
    opacity: disabled ? 0.4 : 1,
  }

  const sideBar: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#001529',
  }

  const topBar: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 10,
    backgroundColor: '#001529',
  }

  return (
    <Tooltip title={isMobile ? null : label}>
      <div style={baseStyle} onClick={disabled ? onDisabledClick : onClick}>
        {(mode === 'side' || mode === 'mix') && <div style={sideBar} />}
        {(mode === 'top' || mode === 'mix') && <div style={topBar} />}
      </div>
    </Tooltip>
  )
}

export const LayoutSettings: React.FC = () => {
  const {
    layoutMode, setLayoutMode,
    showHeader, setShowHeader,
    fixedHeader, setFixedHeader,
    showSidebar, setShowSidebar,
    fixedSidebar, setFixedSidebar,
    showFooter, setShowFooter,
    showBreadcrumb, setShowBreadcrumb,
    sidebarWidth, setSidebarWidth,
    contentWidth, setContentWidth,
    menuAccordion, setMenuAccordion,
    sideMenuType, setSideMenuType,
    contentPadding, setContentPadding,
    settingsDrawerWidth, setSettingsDrawerWidth,
  } = useAppStore(useShallow((s) => ({
    layoutMode: s.layoutMode, setLayoutMode: s.setLayoutMode,
    showHeader: s.showHeader, setShowHeader: s.setShowHeader,
    fixedHeader: s.fixedHeader, setFixedHeader: s.setFixedHeader,
    showSidebar: s.showSidebar, setShowSidebar: s.setShowSidebar,
    fixedSidebar: s.fixedSidebar, setFixedSidebar: s.setFixedSidebar,
    showFooter: s.showFooter, setShowFooter: s.setShowFooter,
    showBreadcrumb: s.showBreadcrumb, setShowBreadcrumb: s.setShowBreadcrumb,
    sidebarWidth: s.sidebarWidth, setSidebarWidth: s.setSidebarWidth,
    contentWidth: s.contentWidth, setContentWidth: s.setContentWidth,
    menuAccordion: s.menuAccordion, setMenuAccordion: s.setMenuAccordion,
    sideMenuType: s.sideMenuType, setSideMenuType: s.setSideMenuType,
    contentPadding: s.contentPadding, setContentPadding: s.setContentPadding,
    settingsDrawerWidth: s.settingsDrawerWidth, setSettingsDrawerWidth: s.setSettingsDrawerWidth,
  })))
  const { t } = useTranslation('settings')
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const layoutOptions: { mode: LayoutMode; label: string }[] = [
    { mode: 'side', label: t('layout.sideLayout') },
    { mode: 'top', label: t('layout.topLayout') },
    { mode: 'mix', label: t('layout.mixLayout') },
  ]

  return (
    <>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
        {layoutOptions.map(({ mode, label }) => (
          <LayoutPreview
            key={mode}
            mode={mode}
            label={label}
            active={layoutMode === mode}
            onClick={() => setLayoutMode(mode)}
            onDisabledClick={() => message.warning(t('layout.mobileLayoutTip'))}
            disabled={isMobile && mode !== 'mix'}
            isMobile={isMobile}
          />
        ))}
      </div>
      <SettingRow label={t('layout.contentWidth')}>
        <Segmented
          size="small"
          value={contentWidth}
          onChange={(v) => setContentWidth(v as ContentWidth)}
          options={[
            { label: t('layout.fluid'), value: 'fluid' },
            { label: t('layout.fixed'), value: 'fixed' },
          ]}
        />
      </SettingRow>
      <SettingRow label={t('layout.showHeader')}>
        <Switch checked={showHeader} onChange={setShowHeader} />
      </SettingRow>
      <SettingRow label={t('layout.fixedHeader')}>
        <Switch checked={fixedHeader} onChange={setFixedHeader} disabled={!showHeader} />
      </SettingRow>
      <SettingRow label={t('layout.showSidebar')}>
        <Switch checked={showSidebar} onChange={setShowSidebar} disabled={layoutMode === 'top'} />
      </SettingRow>
      <SettingRow label={t('layout.fixedSidebar')}>
        <Switch checked={fixedSidebar} onChange={setFixedSidebar} disabled={!showSidebar || layoutMode === 'top'} />
      </SettingRow>
      <SettingRow label={t('layout.menuAccordion')}>
        <Switch checked={menuAccordion} onChange={setMenuAccordion} disabled={layoutMode === 'top'} />
      </SettingRow>
      <SettingRow label={t('layout.sideMenuType')}>
        <Segmented
          size="small"
          value={sideMenuType}
          onChange={(v) => setSideMenuType(v as SideMenuType)}
          disabled={layoutMode === 'top'}
          options={[
            { label: t('layout.classicMenu'), value: 'sub' },
            { label: t('layout.groupMenu'), value: 'group' },
          ]}
        />
      </SettingRow>
      <SettingRow label={t('layout.showFooter')}>
        <Switch checked={showFooter} onChange={setShowFooter} />
      </SettingRow>
      <SettingRow label={t('layout.showBreadcrumb')}>
        <Switch checked={showBreadcrumb} onChange={setShowBreadcrumb} />
      </SettingRow>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{t('layout.sidebarWidth', { value: sidebarWidth })}</div>
        <Slider
          min={150}
          max={350}
          value={sidebarWidth}
          onChange={setSidebarWidth}
          disabled={layoutMode === 'top'}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{t('layout.contentPadding', { value: contentPadding })}</div>
        <Slider
          min={0}
          max={48}
          value={contentPadding}
          onChange={setContentPadding}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>{t('layout.settingsDrawerWidth', { value: settingsDrawerWidth })}</div>
        <Slider
          min={320}
          max={800}
          value={settingsDrawerWidth}
          onChange={setSettingsDrawerWidth}
        />
      </div>
    </>
  )
}
