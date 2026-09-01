import { useCallback, useEffect, useRef } from 'react'

interface ResizableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  resizableWidth?: number
  onResizeEnd?: (...args: [number]) => void
  resizable?: boolean
}

const MIN_COLUMN_WIDTH = 50

export const ResizableHeaderCell: React.FC<ResizableHeaderCellProps> = ({
  resizableWidth,
  onResizeEnd,
  resizable,
  children,
  style,
  ...restProps
}) => {
  const thRef = useRef<HTMLTableCellElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => () => {
    cleanupRef.current?.()
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0 || !thRef.current) return

    event.preventDefault()
    event.stopPropagation()

    const th = thRef.current
    const handle = event.currentTarget
    const startX = event.clientX
    const startWidth = resizableWidth || th.offsetWidth || MIN_COLUMN_WIDTH
    const thIndex = th.parentElement ? Array.from(th.parentElement.children).indexOf(th) : -1
    const container = th.closest('.ant-table-container') || th.closest('.ant-table-wrapper')
    const colElements: HTMLElement[] = []
    const headerElements: HTMLElement[] = []

    if (container && thIndex >= 0) {
      container.querySelectorAll('table').forEach((table) => {
        const col = table.querySelector('colgroup')?.children[thIndex] as HTMLElement | undefined
        if (col) colElements.push(col)
        const header = table.querySelector('thead tr')?.children[thIndex] as HTMLElement | undefined
        if (header) headerElements.push(header)
      })
    }

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    let latestX = startX
    let frameId: number | null = null

    const getWidth = (clientX: number) => Math.max(MIN_COLUMN_WIDTH, startWidth + clientX - startX)
    const applyWidth = (width: number) => {
      const px = `${width}px`
      colElements.forEach((col) => {
        col.style.width = px
        col.style.minWidth = px
      })
      headerElements.forEach((header) => {
        header.style.width = px
        header.style.minWidth = px
      })
      th.style.width = px
      th.style.minWidth = px
    }
    const scheduleWidth = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        applyWidth(getWidth(latestX))
      })
    }
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return
      moveEvent.preventDefault()
      latestX = moveEvent.clientX
      scheduleWidth()
    }
    const cleanup = (cancelled = false) => {
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      if (cancelled) applyWidth(startWidth)
      document.removeEventListener('pointermove', handlePointerMove, true)
      document.removeEventListener('pointerup', handlePointerUp, true)
      document.removeEventListener('pointercancel', handlePointerCancel, true)
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId)
      handle.classList.remove('is-resizing')
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      cleanupRef.current = null
      if (!cancelled) onResizeEnd?.(getWidth(latestX))
    }
    const handlePointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== event.pointerId) return
      latestX = upEvent.clientX
      applyWidth(getWidth(latestX))
      cleanup()
    }
    const handlePointerCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId === event.pointerId) cleanup(true)
    }

    cleanupRef.current = () => cleanup(true)
    handle.setPointerCapture(event.pointerId)
    handle.classList.add('is-resizing')
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('pointermove', handlePointerMove, true)
    document.addEventListener('pointerup', handlePointerUp, true)
    document.addEventListener('pointercancel', handlePointerCancel, true)
  }, [onResizeEnd, resizableWidth])

  if (!resizable || resizableWidth == null) {
    return (
      <th ref={thRef} style={style} {...restProps}>
        {children}
      </th>
    )
  }

  return (
    <th ref={thRef} style={{ ...style, position: 'relative' }} {...restProps}>
      {children}
      <span
        className="resizable-header-cell__handle"
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -4,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'col-resize',
          zIndex: 1,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
      />
    </th>
  )
}
