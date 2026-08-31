import type {
  Menu,
  Message,
  ProductSpec,
  Role,
  StoreSetting,
  SystemUser,
  Tenant,
  TenantAuthMenuItem,
  TenantAuthRole,
  TenantAuthUser,
  TenantOrder,
  TenantProduct,
} from '@/types'
import {
  initialAdminMenus,
  initialMessages,
  initialOrders,
  initialProducts,
  initialRoles,
  initialSpecs,
  initialStoreSetting,
  initialSystemUsers,
  initialTenantMenus,
  initialTenantRoles,
  initialTenants,
  initialTenantUsers,
} from './data'
import { clone } from './helpers'

const MOCK_STATE_VERSION = 1
const MOCK_STATE_KEY = `zx-admin-mock-state:v${MOCK_STATE_VERSION}`

export interface MockState {
  tenants: Tenant[]
  systemUsers: SystemUser[]
  roles: Role[]
  adminMenus: Menu[]
  messages: Message[]
  tenantUsers: TenantAuthUser[]
  tenantRoles: TenantAuthRole[]
  tenantMenus: TenantAuthMenuItem[]
  products: TenantProduct[]
  specs: ProductSpec[]
  orders: TenantOrder[]
  storeSetting: StoreSetting
}

interface PersistedMockState {
  version: number
  data: MockState
}

let memoryState: MockState | null = null

const createInitialMockState = (): MockState => clone({
  tenants: initialTenants,
  systemUsers: initialSystemUsers,
  roles: initialRoles,
  adminMenus: initialAdminMenus,
  messages: initialMessages,
  tenantUsers: initialTenantUsers,
  tenantRoles: initialTenantRoles,
  tenantMenus: initialTenantMenus,
  products: initialProducts,
  specs: initialSpecs,
  orders: initialOrders,
  storeSetting: initialStoreSetting,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const isMockState = (value: unknown): value is MockState => {
  if (!isRecord(value)) return false
  const arrayKeys: Array<keyof MockState> = [
    'tenants',
    'systemUsers',
    'roles',
    'adminMenus',
    'messages',
    'tenantUsers',
    'tenantRoles',
    'tenantMenus',
    'products',
    'specs',
    'orders',
  ]
  return arrayKeys.every((key) => Array.isArray(value[key])) && isRecord(value.storeSetting)
}

const getSessionStorage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

const persistState = (state: MockState) => {
  try {
    getSessionStorage()?.setItem(MOCK_STATE_KEY, JSON.stringify({
      version: MOCK_STATE_VERSION,
      data: state,
    } satisfies PersistedMockState))
  } catch {
    // sessionStorage 不可用时保留当前标签页内的内存状态
  }
}

const loadPersistedState = (): MockState | null => {
  try {
    const raw = getSessionStorage()?.getItem(MOCK_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedMockState>
    if (parsed.version !== MOCK_STATE_VERSION || !isMockState(parsed.data)) return null
    return parsed.data
  } catch {
    return null
  }
}

export const getMockState = (): MockState => {
  if (memoryState) return memoryState
  memoryState = loadPersistedState() || createInitialMockState()
  persistState(memoryState)
  return memoryState
}

export const saveMockState = (state: MockState): void => {
  memoryState = state
  persistState(state)
}
