import { Tooltip, Grid } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { ActionIcon } from '../ActionIcon'

export const DarkModeToggle: React.FC = () => {
  const darkMode = useAppStore((s) => s.darkMode)
  const setDarkMode = useAppStore((s) => s.setDarkMode)
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  return (
    <Tooltip title={isMobile ? '' : (darkMode ? t('switchToLight') : t('switchToDark'))}>
      <ActionIcon ariaLabel={darkMode ? t('switchToLight') : t('switchToDark')} onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <SunOutlined /> : <MoonOutlined />}
      </ActionIcon>
    </Tooltip>
  )
}
