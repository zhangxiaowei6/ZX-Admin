import { useState, useEffect, useCallback } from 'react'
import { Tooltip, Grid } from 'antd'
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { ActionIcon } from '../ActionIcon'

export const FullScreen: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  return (
    <Tooltip title={isMobile ? '' : (isFullscreen ? t('exitFullscreen') : t('fullscreen'))}>
      <ActionIcon ariaLabel={isFullscreen ? t('exitFullscreen') : t('fullscreen')} onClick={toggle}>
        {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
      </ActionIcon>
    </Tooltip>
  )
}
