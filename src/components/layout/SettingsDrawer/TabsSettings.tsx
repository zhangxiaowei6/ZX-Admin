import React from 'react'
import { Switch, Select, Segmented } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import type { TabStyle } from '@/stores/useAppStore'

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <span>{label}</span>
    {children}
  </div>
)

export const TabsSettings: React.FC = () => {
  const {
    showTabs, setShowTabs,
    tabStyle, setTabStyle,
    maxTabs, setMaxTabs,
    restoreTabs, setRestoreTabs,
    showTabIcon, setShowTabIcon,
  } = useAppStore(useShallow((s) => ({
    showTabs: s.showTabs, setShowTabs: s.setShowTabs,
    tabStyle: s.tabStyle, setTabStyle: s.setTabStyle,
    maxTabs: s.maxTabs, setMaxTabs: s.setMaxTabs,
    restoreTabs: s.restoreTabs, setRestoreTabs: s.setRestoreTabs,
    showTabIcon: s.showTabIcon, setShowTabIcon: s.setShowTabIcon,
  })))
  const { t } = useTranslation('settings')

  return (
    <>
      <SettingRow label={t('tabs.showTabs')}>
        <Switch checked={showTabs} onChange={setShowTabs} />
      </SettingRow>
      <SettingRow label={t('tabs.tabStyle')}>
        <Segmented
          size="small"
          value={tabStyle}
          onChange={(v) => setTabStyle(v as TabStyle)}
          options={[
            { label: t('tabs.card'), value: 'card' },
            { label: t('tabs.line'), value: 'line' },
            { label: t('tabs.chrome'), value: 'chrome' },
            { label: t('tabs.rounded'), value: 'rounded' },
          ]}
          disabled={!showTabs}
        />
      </SettingRow>
      <SettingRow label={t('tabs.tabLimit')}>
        <Select
          value={maxTabs}
          onChange={setMaxTabs}
          options={[
            { value: 0, label: t('tabs.unlimited') },
            { value: 10, label: t('tabs.count', { count: 10 }) },
            { value: 20, label: t('tabs.count', { count: 20 }) },
            { value: 30, label: t('tabs.count', { count: 30 }) },
          ]}
          disabled={!showTabs}
          style={{ width: 100 }}
          size="small"
        />
      </SettingRow>
      <SettingRow label={t('tabs.restoreTabs')}>
        <Switch checked={restoreTabs} onChange={setRestoreTabs} disabled={!showTabs} />
      </SettingRow>
      <SettingRow label={t('tabs.showTabIcon')}>
        <Switch checked={showTabIcon} onChange={setShowTabIcon} disabled={!showTabs} />
      </SettingRow>
    </>
  )
}
