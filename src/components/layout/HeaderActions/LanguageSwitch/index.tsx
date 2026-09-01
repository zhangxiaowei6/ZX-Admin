import { Dropdown, Tooltip, Grid } from 'antd'
import { TranslationOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { LANGUAGE_OPTIONS } from '@/locales'
import type { LocaleType } from '@/locales'
import { ActionIcon } from '../ActionIcon'

export const LanguageSwitch: React.FC = () => {
  const { locale, setLocale } = useAppStore(useShallow((s) => ({ locale: s.locale, setLocale: s.setLocale })))
  const { t } = useTranslation()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  return (
    <Dropdown
      menu={{
        items: LANGUAGE_OPTIONS.map((lang) => ({
          key: lang.value,
          label: lang.label,
          disabled: locale === lang.value,
        })),
        onClick: ({ key }) => setLocale(key as LocaleType),
        selectedKeys: [locale],
      }}
      trigger={['click']}
    >
      <Tooltip title={isMobile ? '' : t('switchLanguage')}>
        <ActionIcon ariaLabel={t('switchLanguage')}>
          <TranslationOutlined />
        </ActionIcon>
      </Tooltip>
    </Dropdown>
  )
}
