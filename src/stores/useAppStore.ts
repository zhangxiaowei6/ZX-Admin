import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useUserStore } from './useUserStore'
import settings from '@/config/defaultSettings.json'
import i18n from '@/locales'
import type { LocaleType } from '@/locales'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'

export type LayoutMode = 'side' | 'top' | 'mix'
export type PageTransition = 'fade' | 'slide-left' | 'slide-up' | 'zoom' | 'none'
export type MotionPreference = 'system' | 'full' | 'reduced'
export type AnimationSpeed = 'fast' | 'standard' | 'relaxed'
export type FormDisplayMode = 'modal' | 'drawer'
export type FormColumns = 1 | 2
export type FormSizePreset = 'small' | 'medium' | 'large'
export type FormLabelAlign = 'left' | 'right'
export type FormComponentSize = 'small' | 'middle' | 'large'
export type FormLayout = 'horizontal' | 'vertical'
export type TabStyle = 'card' | 'line' | 'chrome' | 'rounded'
export type ContentWidth = 'fluid' | 'fixed'
export type TableSize = 'large' | 'middle' | 'small'
export type SideMenuType = 'sub' | 'group'
export type FormDrawerPlacement = 'left' | 'right' | 'top' | 'bottom'
export type FormModalPlacement = 'top' | 'bottom' | 'center'
export type FormLabelWidth = 80 | 100 | 120 | 140
export type TablePaginationPosition = 'left' | 'center' | 'right'
export type HeaderActionKey = 'menuSearch' | 'notification' | 'language' | 'darkMode' | 'fullscreen' | 'lockScreen'
export type SettingsPreset = 'default' | 'compact' | 'comfortable' | 'reducedMotion'
export type SettingsGroup = 'theme' | 'layout' | 'header' | 'tabs' | 'transition' | 'table' | 'form' | 'system'

export interface HeaderActionVisibility {
  menuSearch: boolean
  notification: boolean
  language: boolean
  darkMode: boolean
  fullscreen: boolean
  lockScreen: boolean
}

export interface HeaderActionOrder {
  primary: Array<'menuSearch' | 'notification'>
  utility: Array<'language' | 'darkMode' | 'fullscreen' | 'lockScreen'>
}

export interface TabItem {
  key: string
  label: string
  closable: boolean
}

interface AppSettings {
  // 主题
  darkMode: boolean
  primaryColor: string
  colorWeak: boolean
  grayMode: boolean
  compactMode: boolean
  fontSize: number
  borderRadius: number
  sidebarDark: boolean

  // 布局
  layoutMode: LayoutMode
  collapsed: boolean
  sidebarWidth: number
  showHeader: boolean
  fixedHeader: boolean
  showSidebar: boolean
  fixedSidebar: boolean
  showFooter: boolean
  showBreadcrumb: boolean
  contentWidth: ContentWidth
  menuAccordion: boolean
  sideMenuType: SideMenuType
  contentPadding: number

  // 顶部工具栏
  headerActionVisibility: HeaderActionVisibility
  headerActionOrder: HeaderActionOrder
  showHeaderUserName: boolean

  // 标签页
  showTabs: boolean
  tabStyle: TabStyle
  maxTabs: number
  restoreTabs: boolean
  showTabIcon: boolean
  tabs: TabItem[]
  activeTabKey: string

  // 动画
  enableTransition: boolean
  transitionName: PageTransition
  motionPreference: MotionPreference
  animationSpeed: AnimationSpeed

  // 锁屏
  isLocked: boolean
  lockPassword: string

  // 表单
  formDisplayMode: FormDisplayMode
  formColumns: FormColumns
  formSizePreset: FormSizePreset
  formLabelAlign: FormLabelAlign
  formComponentSize: FormComponentSize
  formColon: boolean
  formLayout: FormLayout
  formDrawerPlacement: FormDrawerPlacement
  formModalPlacement: FormModalPlacement
  formLabelWidth: FormLabelWidth

  // 系统
  systemName: string
  systemLogo: string
  showWatermark: boolean
  watermarkText: string

  // 表格
  tableSize: TableSize
  tableBordered: boolean
  tableResizable: boolean
  tableStriped: boolean
  tableDefaultPageSize: number
  tableShowIndex: boolean
  tableFixedHeader: boolean
  tableMaxHeight: number
  tableShowSizeChanger: boolean
  tableShowQuickJumper: boolean
  tableShowTotal: boolean
  tablePaginationPosition: TablePaginationPosition
  tableRememberColumnWidths: boolean

  // 国际化
  locale: LocaleType
}

interface AppActions {
  // 主题
  setDarkMode: (v: boolean) => void
  setPrimaryColor: (v: string) => void
  setColorWeak: (v: boolean) => void
  setGrayMode: (v: boolean) => void
  setCompactMode: (v: boolean) => void
  setFontSize: (v: number) => void
  setBorderRadius: (v: number) => void
  setSidebarDark: (v: boolean) => void

  // 布局
  setLayoutMode: (v: LayoutMode) => void
  setCollapsed: (v: boolean) => void
  setSidebarWidth: (v: number) => void
  setShowHeader: (v: boolean) => void
  setFixedHeader: (v: boolean) => void
  setShowSidebar: (v: boolean) => void
  setFixedSidebar: (v: boolean) => void
  setShowFooter: (v: boolean) => void
  setShowBreadcrumb: (v: boolean) => void
  setContentWidth: (v: ContentWidth) => void
  setMenuAccordion: (v: boolean) => void
  setSideMenuType: (v: SideMenuType) => void
  setContentPadding: (v: number) => void

  setHeaderActionVisible: (key: HeaderActionKey, value: boolean) => void
  moveHeaderAction: (group: keyof HeaderActionOrder, key: HeaderActionKey, direction: -1 | 1) => void
  setShowHeaderUserName: (v: boolean) => void

  // 标签页
  setShowTabs: (v: boolean) => void
  setTabStyle: (v: TabStyle) => void
  setMaxTabs: (v: number) => void
  setRestoreTabs: (v: boolean) => void
  setShowTabIcon: (v: boolean) => void
  addTab: (tab: TabItem) => void
  removeTab: (key: string) => void
  removeOtherTabs: (key: string, scope?: string) => void
  removeAllTabs: (scope?: string, homePath?: string) => void
  setActiveTabKey: (key: string) => void

  // 动画
  setEnableTransition: (v: boolean) => void
  setTransitionName: (v: PageTransition) => void
  setMotionPreference: (v: MotionPreference) => void
  setAnimationSpeed: (v: AnimationSpeed) => void

  // 锁屏
  setIsLocked: (v: boolean) => void
  setLockPassword: (v: string) => void

  // 表单
  setFormDisplayMode: (v: FormDisplayMode) => void
  setFormColumns: (v: FormColumns) => void
  setFormSizePreset: (v: FormSizePreset) => void
  setFormLabelAlign: (v: FormLabelAlign) => void
  setFormComponentSize: (v: FormComponentSize) => void
  setFormColon: (v: boolean) => void
  setFormLayout: (v: FormLayout) => void
  setFormDrawerPlacement: (v: FormDrawerPlacement) => void
  setFormModalPlacement: (v: FormModalPlacement) => void
  setFormLabelWidth: (v: FormLabelWidth) => void

  // 系统
  setSystemName: (v: string) => void
  setSystemLogo: (v: string) => void
  setShowWatermark: (v: boolean) => void
  setWatermarkText: (v: string) => void

  // 表格
  setTableSize: (v: TableSize) => void
  setTableBordered: (v: boolean) => void
  setTableResizable: (v: boolean) => void
  setTableStriped: (v: boolean) => void
  setTableDefaultPageSize: (v: number) => void
  setTableShowIndex: (v: boolean) => void
  setTableFixedHeader: (v: boolean) => void
  setTableMaxHeight: (v: number) => void
  setTableShowSizeChanger: (v: boolean) => void
  setTableShowQuickJumper: (v: boolean) => void
  setTableShowTotal: (v: boolean) => void
  setTablePaginationPosition: (v: TablePaginationPosition) => void
  setTableRememberColumnWidths: (v: boolean) => void

  // 国际化
  setLocale: (v: LocaleType) => void

  applySettings: (settings: Partial<PersistedAppSettings>) => void
  applyPreset: (preset: SettingsPreset) => void
  resetSettingsGroup: (group: SettingsGroup) => void

  // 通用
  resetSettings: () => void
}

type AppState = AppSettings & AppActions

export type PersistedAppSettings = Omit<AppSettings, 'isLocked' | 'lockPassword' | 'tabs' | 'activeTabKey'> & {
  tabs?: TabItem[]
  activeTabKey?: string
}

const HOME_TAB: TabItem = { key: '/', label: i18n.t('menu:home'), closable: false }

const PERSISTED_KEYS: Array<keyof PersistedAppSettings> = [
  'darkMode', 'primaryColor', 'colorWeak', 'grayMode', 'compactMode', 'fontSize', 'borderRadius', 'sidebarDark',
  'layoutMode', 'collapsed', 'sidebarWidth', 'showHeader', 'fixedHeader', 'showSidebar', 'fixedSidebar', 'showFooter',
  'showBreadcrumb', 'contentWidth', 'menuAccordion', 'sideMenuType', 'contentPadding', 'headerActionVisibility',
  'headerActionOrder', 'showHeaderUserName', 'showTabs', 'tabStyle', 'maxTabs', 'restoreTabs', 'showTabIcon',
  'enableTransition', 'transitionName', 'motionPreference', 'animationSpeed', 'formDisplayMode', 'formColumns',
  'formSizePreset', 'formLabelAlign', 'formComponentSize', 'formColon', 'formLayout', 'formDrawerPlacement',
  'formModalPlacement', 'formLabelWidth', 'systemName', 'systemLogo', 'showWatermark', 'watermarkText', 'tableSize', 'tableBordered',
  'tableResizable', 'tableStriped', 'tableDefaultPageSize', 'tableShowIndex', 'tableFixedHeader', 'tableMaxHeight',
  'tableShowSizeChanger', 'tableShowQuickJumper', 'tableShowTotal', 'tablePaginationPosition',
  'tableRememberColumnWidths', 'locale',
]

const pickPersistedSettings = (state: AppState): PersistedAppSettings => {
  const persisted = {} as PersistedAppSettings
  PERSISTED_KEYS.forEach((key) => Object.assign(persisted, { [key]: state[key] }))
  if (state.restoreTabs) {
    persisted.tabs = state.tabs
    persisted.activeTabKey = state.activeTabKey
  }
  return persisted
}

const normalizeOrder = <T extends HeaderActionKey>(value: unknown, allowed: readonly T[]): T[] => {
  if (!Array.isArray(value)) return [...allowed]
  const unique = value.filter((key): key is T => allowed.includes(key as T)).filter((key, index, array) => array.indexOf(key) === index)
  return [...unique, ...allowed.filter((key) => !unique.includes(key))]
}

const BOOLEAN_SETTING_KEYS: Array<keyof PersistedAppSettings> = [
  'darkMode', 'colorWeak', 'grayMode', 'compactMode', 'sidebarDark', 'collapsed', 'showHeader', 'fixedHeader',
  'showSidebar', 'fixedSidebar', 'showFooter', 'showBreadcrumb', 'menuAccordion', 'showHeaderUserName', 'showTabs',
  'restoreTabs', 'showTabIcon', 'enableTransition', 'formColon', 'showWatermark', 'tableBordered', 'tableResizable',
  'tableStriped', 'tableShowIndex', 'tableFixedHeader', 'tableShowSizeChanger', 'tableShowQuickJumper', 'tableShowTotal',
  'tableRememberColumnWidths',
]

const STRING_SETTING_KEYS: Array<keyof PersistedAppSettings> = [
  'primaryColor', 'systemName', 'systemLogo', 'watermarkText',
]

const NUMBER_SETTING_RANGES: Partial<Record<keyof PersistedAppSettings, readonly [number, number]>> = {
  fontSize: [12, 20],
  borderRadius: [0, 16],
  sidebarWidth: [160, 320],
  contentPadding: [0, 48],
  maxTabs: [0, 50],
  tableDefaultPageSize: [1, 200],
  tableMaxHeight: [300, 1200],
}

const ENUM_SETTING_VALUES: Partial<Record<keyof PersistedAppSettings, readonly unknown[]>> = {
  layoutMode: ['side', 'top', 'mix'],
  contentWidth: ['fluid', 'fixed'],
  sideMenuType: ['sub', 'group'],
  tabStyle: ['card', 'line', 'chrome', 'rounded'],
  transitionName: ['fade', 'slide-left', 'slide-up', 'zoom', 'none'],
  motionPreference: ['system', 'full', 'reduced'],
  animationSpeed: ['fast', 'standard', 'relaxed'],
  formDisplayMode: ['modal', 'drawer'],
  formColumns: [1, 2],
  formSizePreset: ['small', 'medium', 'large'],
  formLabelAlign: ['left', 'right'],
  formComponentSize: ['small', 'middle', 'large'],
  formLayout: ['horizontal', 'vertical'],
  formDrawerPlacement: ['left', 'right', 'top', 'bottom'],
  formModalPlacement: ['top', 'bottom', 'center'],
  formLabelWidth: [80, 100, 120, 140],
  tableSize: ['large', 'middle', 'small'],
  tablePaginationPosition: ['left', 'center', 'right'],
  locale: ['zh-CN', 'en-US', 'ja-JP'],
}

export const sanitizeAppSettings = (value: unknown): Partial<PersistedAppSettings> => {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const sanitized: Partial<PersistedAppSettings> = {}

  BOOLEAN_SETTING_KEYS.forEach((key) => {
    if (typeof source[key] === 'boolean') Object.assign(sanitized, { [key]: source[key] })
  })
  STRING_SETTING_KEYS.forEach((key) => {
    if (typeof source[key] === 'string') Object.assign(sanitized, { [key]: source[key] })
  })
  Object.entries(NUMBER_SETTING_RANGES).forEach(([key, range]) => {
    const settingValue = source[key]
    if (range && typeof settingValue === 'number' && Number.isFinite(settingValue) && settingValue >= range[0] && settingValue <= range[1]) {
      Object.assign(sanitized, { [key]: settingValue })
    }
  })
  Object.entries(ENUM_SETTING_VALUES).forEach(([key, allowed]) => {
    if (allowed?.includes(source[key])) Object.assign(sanitized, { [key]: source[key] })
  })

  const visibility = source.headerActionVisibility
  if (visibility && typeof visibility === 'object') {
    const visibilitySource = visibility as Record<string, unknown>
    const validVisibility = { ...DEFAULT_SETTINGS.headerActionVisibility }
    ;(Object.keys(validVisibility) as HeaderActionKey[]).forEach((key) => {
      if (typeof visibilitySource[key] === 'boolean') validVisibility[key] = visibilitySource[key] as boolean
    })
    sanitized.headerActionVisibility = validVisibility
  }

  const order = source.headerActionOrder
  if (order && typeof order === 'object') {
    const orderSource = order as Partial<HeaderActionOrder>
    sanitized.headerActionOrder = {
      primary: normalizeOrder(orderSource.primary, DEFAULT_SETTINGS.headerActionOrder.primary),
      utility: normalizeOrder(orderSource.utility, DEFAULT_SETTINGS.headerActionOrder.utility),
    }
  }

  if (Array.isArray(source.tabs)) {
    sanitized.tabs = source.tabs.filter((tab): tab is TabItem => {
      if (!tab || typeof tab !== 'object') return false
      const candidate = tab as Record<string, unknown>
      return typeof candidate.key === 'string' && typeof candidate.label === 'string' && typeof candidate.closable === 'boolean'
    })
  }
  if (typeof source.activeTabKey === 'string') sanitized.activeTabKey = source.activeTabKey

  return sanitized
}

const migrateSettings = (persistedState: unknown): PersistedAppSettings => {
  const sanitized = sanitizeAppSettings(persistedState)
  const merged = { ...DEFAULT_SETTINGS, ...sanitized } as AppSettings
  merged.headerActionVisibility = sanitized.headerActionVisibility ?? { ...DEFAULT_SETTINGS.headerActionVisibility }
  merged.headerActionOrder = sanitized.headerActionOrder ?? {
    primary: [...DEFAULT_SETTINGS.headerActionOrder.primary],
    utility: [...DEFAULT_SETTINGS.headerActionOrder.utility],
  }
  merged.isLocked = false
  merged.lockPassword = ''
  if (!merged.restoreTabs) {
    merged.tabs = [HOME_TAB]
    merged.activeTabKey = '/'
  }
  return pickPersistedSettings(merged as AppState)
}

export const getDefaultAppSettings = (): AppSettings => ({
  ...DEFAULT_SETTINGS,
  headerActionVisibility: { ...DEFAULT_SETTINGS.headerActionVisibility },
  headerActionOrder: {
    primary: [...DEFAULT_SETTINGS.headerActionOrder.primary],
    utility: [...DEFAULT_SETTINGS.headerActionOrder.utility],
  },
  tabs: [HOME_TAB],
})

export const getPersistedAppSettings = (): PersistedAppSettings => pickPersistedSettings(useAppStore.getState())

export const getAnimationDuration = (speed: AnimationSpeed): number => ({ fast: 180, standard: 300, relaxed: 450 })[speed]

export const isReducedMotion = (preference: MotionPreference): boolean => {
  if (preference === 'reduced') return true
  if (preference === 'full') return false
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const DEFAULT_SETTINGS: AppSettings = {
  // 主题
  darkMode: settings.theme.darkMode,
  primaryColor: settings.theme.primaryColor,
  colorWeak: settings.theme.colorWeak,
  grayMode: settings.theme.grayMode,
  compactMode: settings.theme.compactMode,
  fontSize: settings.theme.fontSize,
  borderRadius: settings.theme.borderRadius,
  sidebarDark: (settings.theme as { sidebarDark?: boolean }).sidebarDark ?? false,

  // 布局
  layoutMode: settings.layout.layoutMode as LayoutMode,
  collapsed: settings.layout.collapsed,
  sidebarWidth: settings.layout.sidebarWidth,
  showHeader: settings.layout.showHeader,
  fixedHeader: settings.layout.fixedHeader,
  showSidebar: settings.layout.showSidebar,
  fixedSidebar: settings.layout.fixedSidebar,
  showFooter: settings.layout.showFooter,
  showBreadcrumb: settings.layout.showBreadcrumb,
  contentWidth: settings.layout.contentWidth as ContentWidth,
  menuAccordion: settings.layout.menuAccordion,
  sideMenuType: (settings.layout as { sideMenuType?: string }).sideMenuType as SideMenuType ?? 'sub',
  contentPadding: settings.layout.contentPadding,

  // 顶部工具栏
  headerActionVisibility: {
    ...settings.header.actionVisibility,
  },
  headerActionOrder: {
    primary: [...settings.header.actionOrder.primary] as HeaderActionOrder['primary'],
    utility: [...settings.header.actionOrder.utility] as HeaderActionOrder['utility'],
  },
  showHeaderUserName: settings.header.showUserName,

  // 标签页
  showTabs: settings.tabs.showTabs,
  tabStyle: settings.tabs.tabStyle as TabStyle,
  maxTabs: settings.tabs.maxTabs,
  restoreTabs: (settings.tabs as { restoreTabs?: boolean }).restoreTabs ?? true,
  showTabIcon: (settings.tabs as { showTabIcon?: boolean }).showTabIcon ?? false,
  tabs: [HOME_TAB],
  activeTabKey: '/',

  // 动画
  enableTransition: settings.transition.enableTransition,
  transitionName: settings.transition.transitionName as PageTransition,
  motionPreference: (settings.transition as { motionPreference?: MotionPreference }).motionPreference ?? 'system',
  animationSpeed: (settings.transition as { animationSpeed?: AnimationSpeed }).animationSpeed ?? 'standard',

  // 锁屏（运行时状态，不放入配置文件）
  isLocked: false,
  lockPassword: '',

  // 表单
  formDisplayMode: settings.form.formDisplayMode as FormDisplayMode,
  formColumns: (settings.form as { formColumns?: number }).formColumns as FormColumns ?? 1,
  formSizePreset: (settings.form as { formSizePreset?: string }).formSizePreset as FormSizePreset ?? 'medium',
  formLabelAlign: (settings.form as { formLabelAlign?: string }).formLabelAlign as FormLabelAlign ?? 'right',
  formComponentSize: (settings.form as { formComponentSize?: string }).formComponentSize as FormComponentSize ?? 'middle',
  formColon: (settings.form as { formColon?: boolean }).formColon ?? true,
  formLayout: (settings.form as { formLayout?: string }).formLayout as FormLayout ?? 'horizontal',
  formDrawerPlacement: (settings.form as { formDrawerPlacement?: FormDrawerPlacement }).formDrawerPlacement ?? 'right',
  formModalPlacement: (settings.form as { formModalPlacement?: FormModalPlacement }).formModalPlacement ?? 'center',
  formLabelWidth: (settings.form as { formLabelWidth?: FormLabelWidth }).formLabelWidth ?? 100,

  // 系统
  systemName: settings.system.systemName,
  systemLogo: settings.system.systemLogo,
  showWatermark: settings.system.showWatermark,
  watermarkText: settings.system.watermarkText,

  // 表格
  tableSize: settings.table.tableSize as TableSize,
  tableBordered: settings.table.tableBordered,
  tableResizable: settings.table.tableResizable,
  tableStriped: (settings.table as any).tableStriped ?? false,
  tableDefaultPageSize: (settings.table as any).tableDefaultPageSize ?? 20,
  tableShowIndex: (settings.table as any).tableShowIndex ?? false,
  tableFixedHeader: (settings.table as any).tableFixedHeader ?? false,
  tableMaxHeight: (settings.table as any).tableMaxHeight ?? 600,
  tableShowSizeChanger: (settings.table as any).tableShowSizeChanger ?? true,
  tableShowQuickJumper: (settings.table as any).tableShowQuickJumper ?? true,
  tableShowTotal: (settings.table as any).tableShowTotal ?? false,
  tablePaginationPosition: (settings.table as any).tablePaginationPosition ?? 'right',
  tableRememberColumnWidths: (settings.table as any).tableRememberColumnWidths ?? false,

  // 国际化
  locale: (i18n.language || 'zh-CN') as LocaleType,
}

/**
 * 使用 View Transition API 包裹状态更新
 * 先截图当前画面，等 DOM 完全更新后再做整体过渡，消除黑白闪烁
 */
function withViewTransition(callback: () => void, className?: string) {
  if (isReducedMotion(useAppStore.getState().motionPreference) || !document.startViewTransition) {
    callback()
    return
  }
  if (className) {
    document.documentElement.classList.add(className)
  }
  const transition = document.startViewTransition(callback)

  // 确保在过渡完成或失败时都清理 className
  const cleanup = () => {
    if (className) {
      document.documentElement.classList.remove(className)
    }
  }

  transition.finished.then(cleanup).catch(cleanup)
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      // 主题（使用 View Transition 平滑过渡）
      setDarkMode: (darkMode) => withViewTransition(() => set({ darkMode }), 'dark-transition'),
      setPrimaryColor: (primaryColor) => withViewTransition(() => set({ primaryColor })),
      setColorWeak: (colorWeak) => withViewTransition(() => set({ colorWeak }), 'dark-transition'),
      setGrayMode: (grayMode) => withViewTransition(() => set({ grayMode }), 'dark-transition'),
      setCompactMode: (compactMode) => withViewTransition(() => set({ compactMode })),
      setFontSize: (fontSize) => set({ fontSize }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      setSidebarDark: (sidebarDark) => withViewTransition(() => set({ sidebarDark }), 'dark-transition'),

      // 布局
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setCollapsed: (collapsed) => set({ collapsed }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setShowHeader: (showHeader) => set({ showHeader }),
      setFixedHeader: (fixedHeader) => set({ fixedHeader }),
      setShowSidebar: (showSidebar) => set({ showSidebar }),
      setFixedSidebar: (fixedSidebar) => set({ fixedSidebar }),
      setShowFooter: (showFooter) => set({ showFooter }),
      setShowBreadcrumb: (showBreadcrumb) => set({ showBreadcrumb }),
      setContentWidth: (contentWidth) => set({ contentWidth }),
      setMenuAccordion: (menuAccordion) => set({ menuAccordion }),
      setSideMenuType: (sideMenuType) => set({ sideMenuType }),
      setContentPadding: (contentPadding) => set({ contentPadding }),

      setHeaderActionVisible: (key, value) => set((state) => ({
        headerActionVisibility: { ...state.headerActionVisibility, [key]: value },
      })),
      moveHeaderAction: (group, key, direction) => set((state) => {
        const order = [...state.headerActionOrder[group]] as HeaderActionKey[]
        const index = order.indexOf(key)
        const target = index + direction
        if (index < 0 || target < 0 || target >= order.length) return state
        ;[order[index], order[target]] = [order[target], order[index]]
        return { headerActionOrder: { ...state.headerActionOrder, [group]: order } as HeaderActionOrder }
      }),
      setShowHeaderUserName: (showHeaderUserName) => set({ showHeaderUserName }),

      // 标签页
      setShowTabs: (showTabs) => set({ showTabs }),
      setTabStyle: (tabStyle) => set({ tabStyle }),
      setMaxTabs: (maxTabs) => set({ maxTabs }),
      setRestoreTabs: (restoreTabs) => set({ restoreTabs }),
      setShowTabIcon: (showTabIcon) => set({ showTabIcon }),
      addTab: (tab) => {
        const { tabs, maxTabs } = get()
        if (!tabs.find((t) => t.key === tab.key)) {
          let newTabs = [...tabs, tab]
          // 超出最大数量时，关闭最早的可关闭标签
          if (maxTabs > 0) {
            while (newTabs.length > maxTabs) {
              const idx = newTabs.findIndex((t) => t.closable)
              if (idx === -1) break
              newTabs = newTabs.filter((_, i) => i !== idx)
            }
          }
          set({ tabs: newTabs })
        }
      },
      removeTab: (key) => {
        const { tabs, activeTabKey } = get()
        const newTabs = tabs.filter((t) => t.key !== key || !t.closable)
        if (activeTabKey === key && newTabs.length > 0) {
          const idx = tabs.findIndex((t) => t.key === key)
          const newActive = newTabs[Math.min(idx, newTabs.length - 1)]
          set({ tabs: newTabs, activeTabKey: newActive.key })
        } else {
          set({ tabs: newTabs })
        }
      },
      removeOtherTabs: (key, scope) => {
        const { tabs } = get()
        const filtered = scope
          ? tabs.filter((t) => t.key === key || !t.closable || !t.key.startsWith(scope))
          : tabs.filter((t) => t.key === key || !t.closable)
        set({ tabs: filtered, activeTabKey: key })
      },
      removeAllTabs: (scope, homePath) => {
        if (scope && homePath) {
          const { tabs } = get()
          // 只移除当前后台的可关闭标签，保留另一套后台的标签
          const otherTabs = tabs.filter((t) => !t.key.startsWith(scope))
          const homeTab: TabItem = { key: homePath, label: i18n.t('menu:home'), closable: false }
          set({ tabs: [...otherTabs, homeTab], activeTabKey: homePath })
        } else {
          set({ tabs: [HOME_TAB], activeTabKey: '/' })
        }
      },
      setActiveTabKey: (activeTabKey) => set({ activeTabKey }),

      // 动画
      setEnableTransition: (enableTransition) => set({ enableTransition }),
      setTransitionName: (transitionName) => set({ transitionName }),
      setMotionPreference: (motionPreference) => set({ motionPreference }),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),

      // 锁屏
      setIsLocked: (isLocked) => set({ isLocked }),
      setLockPassword: (lockPassword) => set({ lockPassword }),

      // 表单
      setFormDisplayMode: (formDisplayMode) => set({ formDisplayMode }),
      setFormColumns: (formColumns) => set({ formColumns }),
      setFormSizePreset: (formSizePreset) => set({ formSizePreset }),
      setFormLabelAlign: (formLabelAlign) => set({ formLabelAlign }),
      setFormComponentSize: (formComponentSize) => set({ formComponentSize }),
      setFormColon: (formColon) => set({ formColon }),
      setFormLayout: (formLayout) => set({ formLayout }),
      setFormDrawerPlacement: (formDrawerPlacement) => set({ formDrawerPlacement }),
      setFormModalPlacement: (formModalPlacement) => set({ formModalPlacement }),
      setFormLabelWidth: (formLabelWidth) => set({ formLabelWidth }),

      // 系统
      setSystemName: (systemName) => set({ systemName }),
      setSystemLogo: (systemLogo) => set({ systemLogo }),
      setShowWatermark: (showWatermark) => set({ showWatermark }),
      setWatermarkText: (watermarkText) => set({ watermarkText }),

      // 表格
      setTableSize: (tableSize) => set({ tableSize }),
      setTableBordered: (tableBordered) => set({ tableBordered }),
      setTableResizable: (tableResizable) => set({ tableResizable }),
      setTableStriped: (tableStriped) => set({ tableStriped }),
      setTableDefaultPageSize: (tableDefaultPageSize) => set({ tableDefaultPageSize }),
      setTableShowIndex: (tableShowIndex) => set({ tableShowIndex }),
      setTableFixedHeader: (tableFixedHeader) => set({ tableFixedHeader }),
      setTableMaxHeight: (tableMaxHeight) => set({ tableMaxHeight }),
      setTableShowSizeChanger: (tableShowSizeChanger) => set({ tableShowSizeChanger }),
      setTableShowQuickJumper: (tableShowQuickJumper) => set({ tableShowQuickJumper }),
      setTableShowTotal: (tableShowTotal) => set({ tableShowTotal }),
      setTablePaginationPosition: (tablePaginationPosition) => set({ tablePaginationPosition }),
      setTableRememberColumnWidths: (tableRememberColumnWidths) => set({ tableRememberColumnWidths }),

      // 国际化
      setLocale: (locale) => {
        const dayjsLocaleMap: Record<LocaleType, string> = {
          'zh-CN': 'zh-cn',
          'en-US': 'en',
          'ja-JP': 'ja',
        }
        i18n.changeLanguage(locale)
        dayjs.locale(dayjsLocaleMap[locale])
        localStorage.setItem('app-locale', locale)
        set({ locale })
      },

      applySettings: (nextSettings) => set((state) => ({
        ...state,
        ...migrateSettings({ ...pickPersistedSettings(state), ...nextSettings }),
      })),
      applyPreset: (preset) => {
        if (preset === 'default') {
          const { tabs, activeTabKey, locale, systemName, systemLogo, showWatermark, watermarkText } = get()
          set({ ...getDefaultAppSettings(), tabs, activeTabKey, locale, systemName, systemLogo, showWatermark, watermarkText })
        } else if (preset === 'compact') {
          set({ compactMode: true, fontSize: 13, contentPadding: 16, tableSize: 'small', formSizePreset: 'small', animationSpeed: 'fast' })
        } else if (preset === 'comfortable') {
          set({ compactMode: false, fontSize: 14, contentPadding: 24, tableSize: 'large', formSizePreset: 'medium', animationSpeed: 'standard' })
        } else if (preset === 'reducedMotion') {
          set({ motionPreference: 'reduced', enableTransition: false })
        }
      },
      resetSettingsGroup: (group) => {
        const defaults = getDefaultAppSettings()
        const groupValues: Record<SettingsGroup, Partial<AppSettings>> = {
          theme: { darkMode: defaults.darkMode, primaryColor: defaults.primaryColor, colorWeak: defaults.colorWeak, grayMode: defaults.grayMode, compactMode: defaults.compactMode, fontSize: defaults.fontSize, borderRadius: defaults.borderRadius, sidebarDark: defaults.sidebarDark },
          layout: { layoutMode: defaults.layoutMode, collapsed: defaults.collapsed, sidebarWidth: defaults.sidebarWidth, showHeader: defaults.showHeader, fixedHeader: defaults.fixedHeader, showSidebar: defaults.showSidebar, fixedSidebar: defaults.fixedSidebar, showFooter: defaults.showFooter, showBreadcrumb: defaults.showBreadcrumb, contentWidth: defaults.contentWidth, menuAccordion: defaults.menuAccordion, sideMenuType: defaults.sideMenuType, contentPadding: defaults.contentPadding },
          header: { headerActionVisibility: { ...defaults.headerActionVisibility }, headerActionOrder: { primary: [...defaults.headerActionOrder.primary], utility: [...defaults.headerActionOrder.utility] }, showHeaderUserName: defaults.showHeaderUserName },
          tabs: { showTabs: defaults.showTabs, tabStyle: defaults.tabStyle, maxTabs: defaults.maxTabs, restoreTabs: defaults.restoreTabs, showTabIcon: defaults.showTabIcon },
          transition: { enableTransition: defaults.enableTransition, transitionName: defaults.transitionName, motionPreference: defaults.motionPreference, animationSpeed: defaults.animationSpeed },
          table: { tableSize: defaults.tableSize, tableBordered: defaults.tableBordered, tableResizable: defaults.tableResizable, tableStriped: defaults.tableStriped, tableDefaultPageSize: defaults.tableDefaultPageSize, tableShowIndex: defaults.tableShowIndex, tableFixedHeader: defaults.tableFixedHeader, tableMaxHeight: defaults.tableMaxHeight, tableShowSizeChanger: defaults.tableShowSizeChanger, tableShowQuickJumper: defaults.tableShowQuickJumper, tableShowTotal: defaults.tableShowTotal, tablePaginationPosition: defaults.tablePaginationPosition, tableRememberColumnWidths: defaults.tableRememberColumnWidths },
          form: { formDisplayMode: defaults.formDisplayMode, formColumns: defaults.formColumns, formSizePreset: defaults.formSizePreset, formLabelAlign: defaults.formLabelAlign, formComponentSize: defaults.formComponentSize, formColon: defaults.formColon, formLayout: defaults.formLayout, formDrawerPlacement: defaults.formDrawerPlacement, formModalPlacement: defaults.formModalPlacement, formLabelWidth: defaults.formLabelWidth },
          system: { systemName: defaults.systemName, systemLogo: defaults.systemLogo, showWatermark: defaults.showWatermark, watermarkText: defaults.watermarkText, locale: defaults.locale },
        }
        set(groupValues[group])
      },

      // 通用
      resetSettings: () => {
        const { tabs, activeTabKey } = get()
        const saasName = useUserStore.getState().saasName
        set({
          ...DEFAULT_SETTINGS,
          tabs,
          activeTabKey,
          ...(saasName ? { systemName: saasName } : {}),
        })
      },
    }),
    {
      name: 'app-settings',
      // 仅持久化明确列出的用户偏好，运行时状态和锁屏密码不得落盘
      version: 2,
      partialize: pickPersistedSettings,
      migrate: (persistedState) => migrateSettings(persistedState),
      merge: (persistedState, currentState) => {
        const migrated = migrateSettings(persistedState)
        return {
          ...currentState,
          ...migrated,
          tabs: migrated.restoreTabs && migrated.tabs?.length ? migrated.tabs : currentState.tabs,
          activeTabKey: migrated.restoreTabs && migrated.activeTabKey ? migrated.activeTabKey : currentState.activeTabKey,
          isLocked: false,
          lockPassword: '',
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const dayjsLocaleMap: Record<string, string> = {
          'zh-CN': 'zh-cn',
          'en-US': 'en',
          'ja-JP': 'ja',
        }
        i18n.changeLanguage(state.locale)
        dayjs.locale(dayjsLocaleMap[state.locale] ?? 'zh-cn')
      },
    }
  )
)
