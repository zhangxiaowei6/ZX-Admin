import { forwardRef } from 'react'
import { theme } from 'antd'

interface ActionIconProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  ariaLabel?: string
  title?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Header 工具栏统一图标按钮
 * 提供一致的尺寸、hover 效果和交互反馈
 */
export const ActionIcon = forwardRef<HTMLSpanElement, ActionIconProps>(
  ({ children, onClick, ariaLabel, title, className, style }, ref) => {
    const { token } = theme.useToken()
    return (
      <span
        ref={ref}
        className={className}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        title={title}
        onClick={onClick}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            e.preventDefault()
            onClick(e as unknown as React.MouseEvent<HTMLSpanElement>)
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 16,
          color: 'inherit',
          opacity: 0.65,
          transition: 'background-color 0.2s, color 0.2s, opacity 0.2s',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = token.colorBgTextHover
          e.currentTarget.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.opacity = '0.65'
        }}
      >
        {children}
      </span>
    )
  }
)

ActionIcon.displayName = 'ActionIcon'
