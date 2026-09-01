import { useState, useEffect, useCallback } from 'react'
import { Tooltip, Modal, Input, Form, message, theme as antTheme, Avatar, Grid } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore, useUserStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { ActionIcon } from '../ActionIcon'

/** 锁屏按钮 - 放在 Header 中 */
export const LockScreenButton: React.FC = () => {
  const { setIsLocked, setLockPassword } = useAppStore(useShallow((s) => ({ setIsLocked: s.setIsLocked, setLockPassword: s.setLockPassword })))
  const [visible, setVisible] = useState(false)
  const [password, setPassword] = useState('')
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const handleLock = useCallback(() => {
    if (!password.trim()) {
      message.warning(t('enterLockPassword'))
      return
    }
    setLockPassword(password)
    setIsLocked(true)
    setVisible(false)
    setPassword('')
  }, [password, setIsLocked, setLockPassword, t])

  return (
    <>
      <Tooltip title={isMobile ? '' : t('lockScreen')}>
        <ActionIcon ariaLabel={t('lockScreen')} onClick={() => setVisible(true)}>
          <LockOutlined />
        </ActionIcon>
      </Tooltip>

      <Modal
        title={t('lockScreenTitle')}
        open={visible}
        onCancel={() => { setVisible(false); setPassword('') }}
        onOk={handleLock}
        okText={t('lock')}
        cancelText={t('cancel')}
      >
        <Form layout="vertical">
          <Form.Item label={t('setUnlockPassword')}>
            <Input.Password
              autoFocus
              placeholder={t('enterLockPassword')}
              prefix={<LockOutlined />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleLock}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

/** 锁屏遮罩 - 放在 AppLayout 最外层 */
export const LockScreenOverlay: React.FC = () => {
  const { isLocked, lockPassword, setIsLocked, setLockPassword, locale, darkMode } = useAppStore(useShallow((s) => ({ isLocked: s.isLocked, lockPassword: s.lockPassword, setIsLocked: s.setIsLocked, setLockPassword: s.setLockPassword, locale: s.locale, darkMode: s.darkMode })))
  const { userInfo } = useUserStore()
  const { token: themeToken } = antTheme.useToken()
  const [inputPassword, setInputPassword] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const { t } = useTranslation()

  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [isLocked])

  const handleUnlock = useCallback(() => {
    if (inputPassword === lockPassword) {
      setIsLocked(false)
      setLockPassword('')
      setInputPassword('')
    } else {
      message.error(t('passwordError'))
      setInputPassword('')
    }
  }, [inputPassword, lockPassword, setIsLocked, setLockPassword, t])

  if (!isLocked) return null

  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'en-US': 'en-US',
    'ja-JP': 'ja-JP',
  }

  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const dateStr = currentTime.toLocaleDateString(localeMap[locale] || 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const primaryColor = themeToken.colorPrimary
  const background = darkMode
    ? `linear-gradient(135deg, ${themeToken.colorBgLayout} 0%, ${themeToken.colorBgContainer} 100%)`
    : `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor} 100%)`
  const textColor = darkMode ? themeToken.colorText : '#fff'
  const subTextColor = darkMode ? themeToken.colorTextSecondary : 'rgba(255,255,255,0.8)'
  const inputBg = darkMode ? themeToken.colorBgElevated : 'rgba(255,255,255,0.15)'
  const inputBorder = darkMode ? themeToken.colorBorder : 'rgba(255,255,255,0.3)'
  const inputIconColor = darkMode ? themeToken.colorTextTertiary : 'rgba(255,255,255,0.6)'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color: textColor,
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 200, letterSpacing: 4 }}>
        {hours}:{minutes}
      </div>
      <div style={{ fontSize: 16, marginTop: 8, color: subTextColor }}>
        {dateStr}
      </div>

      <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Avatar
          size={64}
          src={userInfo?.avatar}
          style={{ backgroundColor: primaryColor }}
        >
          {userInfo?.nickname?.[0] || userInfo?.username?.[0] || <UserOutlined />}
        </Avatar>
        <span style={{ fontSize: 16 }}>
          {userInfo?.nickname || userInfo?.username || t('admin')}
        </span>

        <Input.Password
          autoFocus
          placeholder={t('enterPasswordToUnlock')}
          prefix={<LockOutlined style={{ color: inputIconColor }} />}
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          onPressEnter={handleUnlock}
          style={{
            width: 280,
            backgroundColor: inputBg,
            borderColor: inputBorder,
            color: textColor,
          }}
        />
      </div>
    </div>
  )
}
