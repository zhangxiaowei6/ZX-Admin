import React from 'react'
import { Button, Divider, Space, Switch } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import {
  BellOutlined,
  FullscreenOutlined,
  LockOutlined,
  MoonOutlined,
  SearchOutlined,
  TranslationOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import type { HeaderActionKey } from '@/stores/useAppStore'

const primaryKeys: HeaderActionKey[] = ['menuSearch', 'notification']
const utilityKeys: HeaderActionKey[] = ['language', 'darkMode', 'fullscreen', 'lockScreen']

export const HeaderSettings: React.FC = () => {
  const { t } = useTranslation('settings')
  const {
    headerActionVisibility,
    headerActionOrder,
    showHeaderUserName,
    setHeaderActionVisible,
    moveHeaderAction,
    setShowHeaderUserName,
    resetSettingsGroup,
  } = useAppStore(useShallow((state) => ({
    headerActionVisibility: state.headerActionVisibility,
    headerActionOrder: state.headerActionOrder,
    showHeaderUserName: state.showHeaderUserName,
    setHeaderActionVisible: state.setHeaderActionVisible,
    moveHeaderAction: state.moveHeaderAction,
    setShowHeaderUserName: state.setShowHeaderUserName,
    resetSettingsGroup: state.resetSettingsGroup,
  })))

  const labels: Record<HeaderActionKey, string> = {
    menuSearch: t('header.menuSearch'),
    notification: t('header.notification'),
    language: t('header.language'),
    darkMode: t('header.darkMode'),
    fullscreen: t('header.fullscreen'),
    lockScreen: t('header.lockScreen'),
  }
  const icons: Record<HeaderActionKey, React.ReactNode> = {
    menuSearch: <SearchOutlined />,
    notification: <BellOutlined />,
    language: <TranslationOutlined />,
    darkMode: <MoonOutlined />,
    fullscreen: <FullscreenOutlined />,
    lockScreen: <LockOutlined />,
  }

  const renderGroup = (group: 'primary' | 'utility', keys: HeaderActionKey[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {keys.map((key, index) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1 }}>
            {icons[key]}
            {labels[key]}
          </span>
          <Switch size="small" checked={headerActionVisibility[key]} onChange={(value) => setHeaderActionVisible(key, value)} />
          <Button
            size="small"
            type="text"
            icon={<ArrowUpOutlined />}
            aria-label={t('header.moveUp')}
            disabled={index === 0}
            onClick={() => moveHeaderAction(group, key, -1)}
          />
          <Button
            size="small"
            type="text"
            icon={<ArrowDownOutlined />}
            aria-label={t('header.moveDown')}
            disabled={index === keys.length - 1}
            onClick={() => moveHeaderAction(group, key, 1)}
          />
        </div>
      ))}
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span>{t('header.showUserName')}</span>
        <Switch checked={showHeaderUserName} onChange={setShowHeaderUserName} />
      </div>
      <Divider orientation="left">{t('header.primaryGroup')}</Divider>
      {renderGroup('primary', headerActionOrder.primary.length ? headerActionOrder.primary : primaryKeys)}
      <Divider orientation="left">{t('header.utilityGroup')}</Divider>
      {renderGroup('utility', headerActionOrder.utility.length ? headerActionOrder.utility : utilityKeys)}
      <Space style={{ width: '100%', marginTop: 16 }}>
        <Button size="small" onClick={() => resetSettingsGroup('header')}>{t('header.reset')}</Button>
      </Space>
    </>
  )
}
