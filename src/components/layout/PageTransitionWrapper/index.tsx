import React, { Suspense, useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { PageSkeleton } from '@/components/common/PageSkeleton'

type PageTransitionState = {
  skipPageTransition?: boolean
}

const AnimatedOutlet: React.FC = () => {
  const location = useLocation()
  const { enableTransition, transitionName } = useAppStore(useShallow((s) => ({ enableTransition: s.enableTransition, transitionName: s.transitionName })))
  const wrapperRef = useRef<HTMLDivElement>(null)
  const skipPageTransition = Boolean((location.state as PageTransitionState | null)?.skipPageTransition)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el || !enableTransition || transitionName === 'none' || skipPageTransition) return

    const cls = `page-transition-${transitionName}`
    el.classList.remove(cls)
    void el.offsetHeight
    el.classList.add(cls)

    const onEnd = () => el.classList.remove(cls)
    el.addEventListener('animationend', onEnd)
    return () => el.removeEventListener('animationend', onEnd)
  }, [location.key, enableTransition, transitionName, skipPageTransition])

  return (
    <div ref={wrapperRef}>
      <Outlet />
    </div>
  )
}

export const PageTransitionWrapper: React.FC = () => {
  return (
    <Suspense fallback={<PageSkeleton type="table" />}>
      <AnimatedOutlet />
    </Suspense>
  )
}
