import React from 'react'
import { ModalForm, DrawerForm } from '@ant-design/pro-components'
import type { ModalFormProps, DrawerFormProps } from '@ant-design/pro-components'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { FORM_SIZE_MAP, type FormSizePreset } from '@/constants/ui'

type FormContainerProps = ModalFormProps & DrawerFormProps & {
  formSize?: FormSizePreset
}

export const FormContainer: React.FC<FormContainerProps> = (props) => {
  const { formDisplayMode, formColumns, formSizePreset, formLabelAlign, formComponentSize, formColon, formLayout, formDrawerPlacement, formModalPlacement, formLabelWidth } = useAppStore(useShallow((s) => ({
    formDisplayMode: s.formDisplayMode,
    formColumns: s.formColumns,
    formSizePreset: s.formSizePreset,
    formLabelAlign: s.formLabelAlign,
    formComponentSize: s.formComponentSize,
    formColon: s.formColon,
    formLayout: s.formLayout,
    formDrawerPlacement: s.formDrawerPlacement,
    formModalPlacement: s.formModalPlacement,
    formLabelWidth: s.formLabelWidth,
  })))

  const isDrawer = formDisplayMode === 'drawer'
  const Form = isDrawer ? DrawerForm : ModalForm

  const sizeKey = props.formSize ?? formSizePreset
  const { modalProps, drawerProps, formSize: ignoredFormSize, ...restProps } = props
  void ignoredFormSize
  const effectiveDrawerPlacement = drawerProps?.placement ?? formDrawerPlacement
  const isVerticalDrawer = effectiveDrawerPlacement === 'top' || effectiveDrawerPlacement === 'bottom'
  const defaultWidth = FORM_SIZE_MAP[sizeKey].modal

  const containerProps = isDrawer
    ? {
        drawerProps: {
          destroyOnClose: true,
          placement: effectiveDrawerPlacement,
          ...(isVerticalDrawer
            ? { height: FORM_SIZE_MAP[sizeKey].drawerHeight }
            : { width: FORM_SIZE_MAP[sizeKey].drawer }),
          ...drawerProps,
        },
      }
    : {
        modalProps: {
          destroyOnClose: true,
          centered: formModalPlacement === 'center',
          width: defaultWidth,
          wrapClassName: `form-modal-position-${formModalPlacement}`,
          ...modalProps,
        },
      }

  const gridProps = formColumns === 2
    ? { grid: true as const, colProps: { span: 12, ...props.colProps } }
    : {}

  // 水平布局时需要设置 labelCol，标签对齐才会生效
  const layoutProps = formLayout === 'horizontal'
    ? {
      layout: formLayout,
      labelAlign: formLabelAlign,
      ...(formLabelAlign === 'left'
        ? { labelCol: props.labelCol ?? { flex: '0 0 auto' }, wrapperCol: props.wrapperCol ?? { flex: 1 }, labelWrap: true }
        : { labelCol: props.labelCol ?? { flex: `0 0 ${formLabelWidth}px` }, wrapperCol: props.wrapperCol }),
    }
    : { layout: formLayout }

  return <Form {...restProps} {...containerProps} {...gridProps} {...layoutProps} size={formComponentSize} colon={formColon} />
}
