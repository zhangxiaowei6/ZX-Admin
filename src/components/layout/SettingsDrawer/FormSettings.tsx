import React from 'react'
import { Segmented, Switch, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import type { FormSizePreset, FormLabelAlign, FormComponentSize, FormLayout } from '@/stores/useAppStore'

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <span>{label}</span>
    {children}
  </div>
)

export const FormSettings: React.FC = () => {
  const {
    formDisplayMode,
    setFormDisplayMode,
    formColumns,
    setFormColumns,
    formSizePreset,
    setFormSizePreset,
    formLabelAlign,
    setFormLabelAlign,
    formComponentSize,
    setFormComponentSize,
    formColon,
    setFormColon,
    formLayout,
    setFormLayout,
    formDrawerPlacement,
    setFormDrawerPlacement,
    formLabelWidth,
    setFormLabelWidth,
  } = useAppStore(useShallow((s) => ({
    formDisplayMode: s.formDisplayMode,
    setFormDisplayMode: s.setFormDisplayMode,
    formColumns: s.formColumns,
    setFormColumns: s.setFormColumns,
    formSizePreset: s.formSizePreset,
    setFormSizePreset: s.setFormSizePreset,
    formLabelAlign: s.formLabelAlign,
    setFormLabelAlign: s.setFormLabelAlign,
    formComponentSize: s.formComponentSize,
    setFormComponentSize: s.setFormComponentSize,
    formColon: s.formColon,
    setFormColon: s.setFormColon,
    formLayout: s.formLayout,
    setFormLayout: s.setFormLayout,
    formDrawerPlacement: s.formDrawerPlacement,
    setFormDrawerPlacement: s.setFormDrawerPlacement,
    formLabelWidth: s.formLabelWidth,
    setFormLabelWidth: s.setFormLabelWidth,
  })))
  const { t } = useTranslation('settings')

  return (
    <>
      <SettingRow label={t('form.formDisplay')}>
        <Segmented
          size="small"
          value={formDisplayMode}
          onChange={(v) => setFormDisplayMode(v as 'modal' | 'drawer')}
          options={[
            { label: t('form.drawer'), value: 'drawer' },
            { label: t('form.modal'), value: 'modal' },
          ]}
        />
      </SettingRow>
      {formDisplayMode === 'drawer' && (
        <>
          <SettingRow label={t('form.drawerPlacement')}>
            <Segmented
              size="small"
              value={formDrawerPlacement}
              onChange={(value) => setFormDrawerPlacement(value as 'left' | 'right' | 'top' | 'bottom')}
              options={[
                { label: t('form.left'), value: 'left' },
                { label: t('form.right'), value: 'right' },
                { label: t('form.top'), value: 'top' },
                { label: t('form.bottom'), value: 'bottom' },
              ]}
            />
          </SettingRow>
          {formLayout === 'horizontal' && (
            <SettingRow label={t('form.labelWidth')}>
              <Select
                size="small"
                value={formLabelWidth}
                onChange={setFormLabelWidth}
                style={{ width: 90 }}
                options={[80, 100, 120, 140].map((value) => ({ label: `${value}px`, value }))}
              />
            </SettingRow>
          )}
        </>
      )}
      <SettingRow label={t('form.formLayout')}>
        <Segmented
          size="small"
          value={formLayout}
          onChange={(v) => setFormLayout(v as FormLayout)}
          options={[
            { label: t('form.horizontal'), value: 'horizontal' },
            { label: t('form.vertical'), value: 'vertical' },
          ]}
        />
      </SettingRow>
      <SettingRow label={t('form.formColumns')}>
        <Segmented
          size="small"
          value={formColumns}
          onChange={(v) => setFormColumns(v as 1 | 2)}
          options={[
            { label: t('form.singleColumn'), value: 1 },
            { label: t('form.doubleColumn'), value: 2 },
          ]}
        />
      </SettingRow>
      <SettingRow label={t('form.formSize')}>
        <Segmented
          size="small"
          value={formSizePreset}
          onChange={(v) => setFormSizePreset(v as FormSizePreset)}
          options={[
            { label: t('form.small'), value: 'small' },
            { label: t('form.medium'), value: 'medium' },
            { label: t('form.large'), value: 'large' },
          ]}
        />
      </SettingRow>
      {formLayout === 'horizontal' && (
        <>
          <SettingRow label={t('form.formLabelAlign')}>
            <Segmented
              size="small"
              value={formLabelAlign}
              onChange={(v) => setFormLabelAlign(v as FormLabelAlign)}
              options={[
                { label: t('form.alignLeft'), value: 'left' },
                { label: t('form.alignRight'), value: 'right' },
              ]}
            />
          </SettingRow>
          <SettingRow label={t('form.formColon')}>
            <Switch checked={formColon} onChange={setFormColon} />
          </SettingRow>
        </>
      )}
      <SettingRow label={t('form.formComponentSize')}>
        <Segmented
          size="small"
          value={formComponentSize}
          onChange={(v) => setFormComponentSize(v as FormComponentSize)}
          options={[
            { label: t('form.small'), value: 'small' },
            { label: t('form.medium'), value: 'middle' },
            { label: t('form.large'), value: 'large' },
          ]}
        />
      </SettingRow>
    </>
  )
}
