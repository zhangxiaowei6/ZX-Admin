import { useState, useEffect } from 'react'
import { theme as antTheme } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useSliderCaptcha } from '../hooks/useSliderCaptcha'

const TRACK_HEIGHT = 40
const THUMB_WIDTH = 48

interface SliderCaptchaProps {
  onVerified: () => void
  style?: React.CSSProperties
}

export const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ onVerified, style }) => {
  const { token: themeToken } = antTheme.useToken()
  const { t } = useTranslation('login')
  const { verified, dragging, offsetX, trackRef, onDragStart } = useSliderCaptcha({ thumbWidth: THUMB_WIDTH })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (verified) onVerified()
  }, [verified, onVerified])

  const maxOffset = trackRef.current ? trackRef.current.offsetWidth - THUMB_WIDTH : 1
  const progress = maxOffset > 0 ? offsetX / maxOffset : 0

  const springTransition = 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
  const noTransition = 'none'
  const baseTransition = dragging ? noTransition : springTransition

  return (
    <div
      ref={trackRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { if (!dragging) setHovered(false) }}
      style={{
        position: 'relative',
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        background: verified
          ? themeToken.colorSuccessBg
          : themeToken.colorPrimaryBg,
        userSelect: 'none',
        overflow: 'hidden',
        transition: 'background 0.3s',
        ...style,
      }}
    >
      {/* 填充条 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: offsetX + THUMB_WIDTH,
          borderRadius: TRACK_HEIGHT / 2,
          background: verified
            ? themeToken.colorSuccess
            : themeToken.colorPrimaryBgHover,
          opacity: verified ? 0.18 : 1,
          transition: dragging ? noTransition : 'all 0.4s ease',
        }}
      />

      {/* 提示文字 */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 13,
          letterSpacing: 1,
          color: verified ? themeToken.colorSuccess : themeToken.colorPrimaryText,
          pointerEvents: 'none',
          transition: 'opacity 0.25s, color 0.3s',
          opacity: (progress < 0.12 || verified) ? 1 : 0,
        }}
      >
        {verified && <CheckOutlined style={{ fontSize: 12 }} />}
        {verified ? t('captchaVerified') : t('captchaSlideToVerify')}
      </span>

      {/* 滑块 */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: THUMB_WIDTH - 4,
          height: TRACK_HEIGHT - 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: verified
            ? themeToken.colorSuccess
            : themeToken.colorBgElevated,
          borderRadius: (TRACK_HEIGHT - 4) / 2,
          boxShadow: verified
            ? 'none'
            : dragging
              ? `0 2px 12px ${themeToken.colorPrimary}35`
              : hovered
                ? `0 2px 10px ${themeToken.colorPrimary}24`
                : `0 1px 6px ${themeToken.colorPrimary}18`,
          cursor: verified ? 'default' : dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offsetX}px)`,
          transition: verified ? 'all 0.3s ease' : baseTransition,
          zIndex: 1,
        }}
      >
        {verified ? (
          <CheckOutlined style={{ fontSize: 15, color: '#fff' }} />
        ) : (
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path
              d="M1 7h12M9 2l5 5-5 5"
              stroke={dragging || hovered ? themeToken.colorPrimary : themeToken.colorPrimaryText}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'stroke 0.2s' }}
            />
          </svg>
        )}
      </div>
    </div>
  )
}
