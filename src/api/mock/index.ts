import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'

type MockBody = Record<string, unknown> | unknown[] | string | null

export interface MockRequestContext {
  method: string
  pathname: string
  params: Record<string, string>
  query: Record<string, string>
  body: MockBody
}

// eslint-disable-next-line no-unused-vars
type MockHandler = (context: MockRequestContext) => ApiResponse

interface MockRoute {
  method: string
  pattern: string
  handler: MockHandler
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const ok = (data: unknown, msg = 'success'): ApiResponse => ({ code: 200, data, msg })
const created = (msg = '新增成功'): ApiResponse => ok({ id: 1 }, msg)
const changed = (msg = '操作成功'): ApiResponse => ok(null, msg)

const platforms = [
  { id: 1, name: '六合山庄', code: 'platform', description: '山庄管理后台', path: '/' },
  { id: 2, name: '山悦酒店', code: 'shanyue', description: '酒店管理后台', path: '/' },
  { id: 3, name: '星海民宿', code: 'xinghai', description: '民宿管理后台', path: '/' },
]

const adminMenu = [
  { id: 1, parentId: 0, name: '首页', path: '/', icon: 'DashboardOutlined', permission: 'dashboard', type: 2, sort: 0, visible: 1, status: 1, children: [], createdAt: '2024-01-01' },
  { id: 2, parentId: 0, name: '商户管理', path: '/tenant', icon: 'ShopOutlined', permission: 'tenant', type: 1, sort: 1, visible: 1, status: 1, children: [], createdAt: '2024-01-01' },
  { id: 3, parentId: 0, name: '消息中心', path: '/inbox', icon: 'MailOutlined', permission: 'message', type: 2, sort: 2, visible: 1, status: 1, children: [], createdAt: '2024-01-01' },
  { id: 4, parentId: 0, name: '系统管理', path: '/system', icon: 'SettingOutlined', permission: 'system', type: 1, sort: 3, visible: 1, status: 1, children: [], createdAt: '2024-01-01' },
]

const tenantMenu = [
  { id: 51, parentId: 0, name: '工作台', path: 'dashboard', icon: 'DashboardOutlined', permission: 'tenant:list:backend:dashboard', type: 2, sort: 0, visible: 1, status: 1, children: [], createdAt: '2024-01-01', clientType: 'admin' },
  { id: 52, parentId: 0, name: '订单管理', path: 'order', icon: 'ShoppingCartOutlined', permission: 'tenant:list:backend:order', type: 2, sort: 1, visible: 1, status: 1, children: [], createdAt: '2024-01-01', clientType: 'admin' },
  { id: 53, parentId: 0, name: '商品管理', path: 'product', icon: 'ShopOutlined', permission: 'tenant:list:backend:product', type: 2, sort: 2, visible: 1, status: 1, children: [], createdAt: '2024-01-01', clientType: 'admin' },
  { id: 54, parentId: 0, name: '店铺设置', path: 'setting', icon: 'SettingOutlined', permission: 'tenant:list:backend:setting', type: 2, sort: 3, visible: 1, status: 1, children: [], createdAt: '2024-01-01', clientType: 'admin' },
  { id: 55, parentId: 0, name: '系统管理', path: 'system', icon: 'SettingOutlined', permission: 'tenant:list:backend:system', type: 1, sort: 4, visible: 1, status: 1, children: [], createdAt: '2024-01-01', clientType: 'admin' },
]

const depts = [
  { id: 1, parentId: 0, name: '总公司', sort: 0, status: 1, children: [] },
  { id: 2, parentId: 1, name: '研发部', sort: 1, status: 1, children: [] },
  { id: 3, parentId: 1, name: '运营部', sort: 2, status: 1, children: [] },
]

const systemUsers = [
  { id: 1, username: 'admin', nickname: '系统管理员', phone: '13800138000', email: 'admin@example.com', roleIds: [1], roleNames: ['超级管理员'], status: 1, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, username: 'operator', nickname: '运营管理员', phone: '13800138001', email: 'operator@example.com', roleIds: [2], roleNames: ['运营管理员'], status: 1, createdAt: '2024-01-02 09:00:00', updatedAt: '2024-01-02 09:00:00' },
]

const roles = [
  { id: 1, name: '超级管理员', code: 'super_admin', description: '拥有所有权限', menuIds: [1, 2, 3, 4], deptIds: [1, 2, 3], status: 1, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, name: '运营管理员', code: 'operator', description: '负责日常运营管理', menuIds: [1, 2, 3], deptIds: [1, 2, 3], status: 1, createdAt: '2024-01-02 09:00:00', updatedAt: '2024-01-02 09:00:00' },
]

const tenants = [
  { id: 1, name: '星巴克旗舰店', code: 'T001', status: 1, contact: '张经理', phone: '13800138001', email: 'starbucks@example.com', address: '北京市朝阳区建国路88号', createdAt: '2024-01-05 09:30:00' },
  { id: 2, name: '肯德基中心店', code: 'T002', status: 1, contact: '李经理', phone: '13800138002', email: 'kfc@example.com', address: '上海市浦东新区陆家嘴环路166号', createdAt: '2024-01-12 14:20:00' },
  { id: 3, name: '麦当劳万达店', code: 'T003', status: 0, contact: '王经理', phone: '13800138003', email: 'mcd@example.com', address: '广州市天河区天河路230号', createdAt: '2024-02-03 10:15:00' },
]

const messages = [
  { id: 1, title: '系统升级通知', content: '系统将于近期进行版本升级维护，请提前做好相关安排。', type: 'announcement', priority: 'important', senderId: 1, senderName: '系统管理员', isRead: false, createdAt: '2026-03-08 10:00:00' },
  { id: 2, title: '账户安全提醒', content: '您的账户有新的登录记录，如非本人操作请及时处理。', type: 'notification', priority: 'urgent', senderId: 0, senderName: '系统', isRead: false, createdAt: '2026-03-07 08:32:00' },
  { id: 3, title: '项目进度汇报', content: '前端页面开发已完成，后端接口已就绪。', type: 'message', priority: 'normal', senderId: 2, senderName: '张三', isRead: true, createdAt: '2026-03-06 09:00:00' },
]

const products = [
  { id: 1, name: '示例商品一', description: '高品质示例商品', price: 99, stock: 120, category: '电子产品', unit: '个', status: 1, createdAt: '2024-01-01 10:00:00' },
  { id: 2, name: '示例商品二', description: '热销示例商品', price: 199, stock: 80, category: '食品', unit: '件', status: 1, createdAt: '2024-01-02 10:00:00' },
]

const orders = [
  { id: 1, orderNo: 'ORD20240001', customerName: '张三', amount: 128, status: 1, createdAt: '2024-01-15 10:00:00' },
  { id: 2, orderNo: 'ORD20240002', customerName: '李四', amount: 256.5, status: 2, createdAt: '2024-01-15 11:00:00' },
]

const specs = [
  { id: 1, productId: 1, specName: '颜色', specValue: '蓝色', price: 99, stock: 50, sort: 1 },
  { id: 2, productId: 1, specName: '尺寸', specValue: 'M', price: 99, stock: 70, sort: 2 },
]

const tenantUsers = [
  { id: 1, username: 'tenant-admin', nickname: '租户管理员', status: 1, roleIds: [1], roleNames: ['租户管理员'], enabledClients: ['admin'], dataScopes: { admin: 'all', miniapp: 'all' }, createdAt: '2024-01-01 09:00:00' },
]

const tenantRoles = [
  { id: 1, name: '租户管理员', code: 'tenant_admin', status: 1, description: '租户全部权限', adminMenuIds: [51, 52, 53, 54, 55], miniappMenuIds: [], adminDeptIds: [1, 2, 3], miniappDeptIds: [], createdAt: '2024-01-01 09:00:00' },
]

const dictTypes = [
  { id: 1, code: 'order_status', name: '订单状态', remark: '订单流转状态' },
  { id: 2, code: 'gender', name: '性别', remark: '用户性别' },
  { id: 3, code: 'status', name: '通用状态', remark: '启用/禁用' },
]

const dictItems: Record<string, Array<Record<string, string | number>>> = {
  order_status: [
    { id: 1, dictType: 'order_status', value: 0, label: '待支付', color: 'default', sort: 1 },
    { id: 2, dictType: 'order_status', value: 1, label: '已支付', color: 'processing', sort: 2 },
    { id: 3, dictType: 'order_status', value: 2, label: '已发货', color: 'warning', sort: 3 },
    { id: 4, dictType: 'order_status', value: 3, label: '已完成', color: 'success', sort: 4 },
  ],
  gender: [
    { id: 10, dictType: 'gender', value: 1, label: '男', color: 'blue', sort: 1 },
    { id: 11, dictType: 'gender', value: 2, label: '女', color: 'magenta', sort: 2 },
  ],
  status: [
    { id: 20, dictType: 'status', value: 1, label: '启用', color: 'success', sort: 1 },
    { id: 21, dictType: 'status', value: 0, label: '禁用', color: 'error', sort: 2 },
  ],
}

const page = (items: unknown[]) => ({ list: clone(items), total: items.length })

const routes: MockRoute[] = [
  { method: 'POST', pattern: '/api/admin/auth/pre-login', handler: () => ok({ tempToken: 'mock-temp-token', platforms }, '预登录成功') },
  { method: 'POST', pattern: '/api/admin/auth/login-platform', handler: () => ok({ token: 'mock-access-token', saasName: platforms[0].name, permissions: [], userInfo: { id: 1, username: 'admin', nickname: '系统管理员', avatar: '' } }, '登录成功') },
  { method: 'POST', pattern: '/api/admin/auth/switch-platform', handler: () => ok({ token: 'mock-access-token', saasName: platforms[0].name, permissions: [], userInfo: { id: 1, username: 'admin', nickname: '系统管理员', avatar: '' } }, '切换成功') },
  { method: 'POST', pattern: '/api/admin/auth/logout', handler: () => changed('登出成功') },
  { method: 'GET', pattern: '/api/admin/auth/info', handler: () => ok({ id: 1, username: 'admin', nickname: '系统管理员', avatar: '', roles: ['超级管理员'], permissions: [], platformId: 1 }) },
  { method: 'GET', pattern: '/api/admin/auth/platforms', handler: () => ok(platforms) },
  { method: 'GET', pattern: '/api/system/dict/types', handler: () => ok(dictTypes, 'ok') },
  { method: 'GET', pattern: '/api/system/dict/items/:dictType', handler: ({ params }) => ok(dictItems[params.dictType] || [], 'ok') },
  { method: 'POST', pattern: '/api/admin/message/list', handler: () => ok(page(messages)) },
  { method: 'GET', pattern: '/api/admin/message/unread-count', handler: () => ok({ total: 2, announcement: 1, notification: 1, message: 0 }) },
  { method: 'GET', pattern: '/api/admin/message/:id', handler: ({ params }) => ok(messages.find((item) => item.id === Number(params.id)) || messages[0]) },
  { method: 'POST', pattern: '/api/admin/message/read', handler: () => changed('标记成功') },
  { method: 'POST', pattern: '/api/admin/message/read-all', handler: () => changed('全部已读') },
  { method: 'POST', pattern: '/api/admin/message/delete', handler: () => changed('删除成功') },
  { method: 'POST', pattern: '/api/admin/tenant/list', handler: () => ok(page(tenants)) },
  { method: 'GET', pattern: '/api/admin/tenant/:id', handler: ({ params }) => ok(tenants.find((item) => item.id === Number(params.id)) || tenants[0]) },
  { method: 'POST', pattern: '/api/admin/tenant', handler: () => created() },
  { method: 'PUT', pattern: '/api/admin/tenant/:id', handler: () => changed('更新成功') },
  { method: 'DELETE', pattern: '/api/admin/tenant/:id', handler: () => changed('删除成功') },
  { method: 'DELETE', pattern: '/api/admin/tenant/batch', handler: () => changed('批量删除成功') },
  { method: 'PUT', pattern: '/api/admin/tenant/batch-status', handler: () => changed('状态更新成功') },
  { method: 'POST', pattern: '/api/admin/system/user/list', handler: () => ok(page(systemUsers)) },
  { method: 'GET', pattern: '/api/admin/system/user/:id', handler: ({ params }) => ok(systemUsers.find((item) => item.id === Number(params.id)) || systemUsers[0]) },
  { method: 'POST', pattern: '/api/admin/system/user', handler: () => created() },
  { method: 'PUT', pattern: '/api/admin/system/user/:id/reset-password', handler: () => changed('密码重置成功') },
  { method: 'PUT', pattern: '/api/admin/system/user/:id', handler: () => changed('更新成功') },
  { method: 'DELETE', pattern: '/api/admin/system/user/:id', handler: () => changed('删除成功') },
  { method: 'DELETE', pattern: '/api/admin/system/user/batch', handler: () => changed('批量删除成功') },
  { method: 'PUT', pattern: '/api/admin/system/user/batch-status', handler: () => changed('状态更新成功') },
  { method: 'POST', pattern: '/api/admin/system/role/list', handler: () => ok(page(roles)) },
  { method: 'GET', pattern: '/api/admin/system/role/all', handler: () => ok(roles) },
  { method: 'GET', pattern: '/api/admin/system/role/:id', handler: ({ params }) => ok(roles.find((item) => item.id === Number(params.id)) || roles[0]) },
  { method: 'POST', pattern: '/api/admin/system/role', handler: () => created() },
  { method: 'PUT', pattern: '/api/admin/system/role/:id/permission', handler: () => changed('权限保存成功') },
  { method: 'PUT', pattern: '/api/admin/system/role/:id', handler: () => changed('更新成功') },
  { method: 'DELETE', pattern: '/api/admin/system/role/:id', handler: () => changed('删除成功') },
  { method: 'DELETE', pattern: '/api/admin/system/role/batch', handler: () => changed('批量删除成功') },
  { method: 'GET', pattern: '/api/admin/system/menu/tree', handler: () => ok(adminMenu) },
  { method: 'GET', pattern: '/api/admin/system/menu/:id', handler: ({ params }) => ok(adminMenu.find((item) => item.id === Number(params.id)) || adminMenu[0]) },
  { method: 'POST', pattern: '/api/admin/system/menu', handler: () => created() },
  { method: 'PUT', pattern: '/api/admin/system/menu/:id', handler: () => changed('更新成功') },
  { method: 'DELETE', pattern: '/api/admin/system/menu/:id', handler: () => changed('删除成功') },
  { method: 'GET', pattern: '/api/admin/system/dept/tree', handler: () => ok(depts) },
  { method: 'POST', pattern: '/api/tenant/auth/user/list', handler: () => ok(page(tenantUsers)) },
  { method: 'POST', pattern: '/api/tenant/auth/user', handler: () => created('新增用户成功') },
  { method: 'PUT', pattern: '/api/tenant/auth/user/:id', handler: () => changed('更新用户成功') },
  { method: 'DELETE', pattern: '/api/tenant/auth/user/:id', handler: () => changed('删除用户成功') },
  { method: 'POST', pattern: '/api/tenant/auth/role/list', handler: () => ok(page(tenantRoles)) },
  { method: 'GET', pattern: '/api/tenant/auth/role/all', handler: () => ok(tenantRoles) },
  { method: 'POST', pattern: '/api/tenant/auth/role', handler: () => created('新增角色成功') },
  { method: 'PUT', pattern: '/api/tenant/auth/role/:id', handler: () => changed('更新角色成功') },
  { method: 'DELETE', pattern: '/api/tenant/auth/role/:id', handler: () => changed('删除角色成功') },
  { method: 'DELETE', pattern: '/api/tenant/auth/role/batch', handler: () => changed('批量删除角色成功') },
  { method: 'PUT', pattern: '/api/tenant/auth/role/:id/permission', handler: () => changed('权限保存成功') },
  { method: 'GET', pattern: '/api/tenant/auth/menu/tree', handler: ({ query }) => ok(tenantMenu.map((item) => ({ ...item, clientType: query.clientType || 'admin' }))) },
  { method: 'POST', pattern: '/api/tenant/auth/menu', handler: () => created('新增菜单成功') },
  { method: 'PUT', pattern: '/api/tenant/auth/menu/:id', handler: () => changed('更新菜单成功') },
  { method: 'DELETE', pattern: '/api/tenant/auth/menu/:id', handler: () => changed('删除菜单成功') },
  { method: 'GET', pattern: '/api/tenant/auth/dept/tree', handler: () => ok(depts) },
  { method: 'GET', pattern: '/api/tenant/dashboard/stats', handler: () => ok({ todayOrders: 36, todayRevenue: 4280.5, totalProducts: 152, totalCustomers: 1893 }) },
  { method: 'GET', pattern: '/api/tenant/dashboard/recent-orders', handler: () => ok(orders) },
  { method: 'POST', pattern: '/api/tenant/order/list', handler: () => ok(page(orders)) },
  { method: 'DELETE', pattern: '/api/tenant/order/:id', handler: () => changed('删除成功') },
  { method: 'DELETE', pattern: '/api/tenant/order/batch', handler: () => changed('批量删除成功') },
  { method: 'POST', pattern: '/api/tenant/product/list', handler: () => ok(page(products)) },
  { method: 'POST', pattern: '/api/tenant/product', handler: () => created() },
  { method: 'PUT', pattern: '/api/tenant/product/:id', handler: () => changed('更新成功') },
  { method: 'DELETE', pattern: '/api/tenant/product/:id', handler: () => changed('删除成功') },
  { method: 'DELETE', pattern: '/api/tenant/product/batch', handler: () => changed('批量删除成功') },
  { method: 'PUT', pattern: '/api/tenant/product/batch-status', handler: () => changed('状态更新成功') },
  { method: 'GET', pattern: '/api/tenant/product/:id/specs', handler: ({ params }) => ok(specs.filter((item) => item.productId === Number(params.id))) },
  { method: 'POST', pattern: '/api/tenant/product/:id/spec', handler: () => changed('保存成功') },
  { method: 'DELETE', pattern: '/api/tenant/product/:id/spec/:specId', handler: () => changed('删除成功') },
  { method: 'GET', pattern: '/api/tenant/setting', handler: () => ok({ storeName: '示例店铺', storeDesc: '这是一家示例店铺', storeLogo: '', contactPhone: '13800138000', contactEmail: 'store@example.com', address: '北京市朝阳区xxx路xxx号', isOpen: true, autoConfirm: false }) },
  { method: 'PUT', pattern: '/api/tenant/setting', handler: () => changed('保存成功') },
]

const toPathname = (url: string) => new URL(url, 'http://mock.local').pathname.replace(/\/$/, '') || '/'

const toBody = (data: unknown): MockBody => {
  if (data === undefined || data === null || data === '') return null
  if (typeof data !== 'string') return data as MockBody
  try {
    return JSON.parse(data) as MockBody
  } catch {
    return data
  }
}

const toQuery = (params: AxiosRequestConfig['params']): Record<string, string> => {
  if (!params) return {}
  if (params instanceof URLSearchParams) return Object.fromEntries(params.entries())
  return Object.fromEntries(Object.entries(params as Record<string, unknown>).map(([key, value]) => [key, String(value)]))
}

const matchRoute = (method: string, pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean)
  return routes
    .filter((route) => route.method === method)
    .map((route) => {
      const patternSegments = route.pattern.split('/').filter(Boolean)
      if (patternSegments.length !== pathSegments.length) return null
      const params: Record<string, string> = {}
      let score = 0
      for (let index = 0; index < patternSegments.length; index += 1) {
        const patternSegment = patternSegments[index]
        const pathSegment = pathSegments[index]
        if (patternSegment.startsWith(':')) params[patternSegment.slice(1)] = decodeURIComponent(pathSegment)
        else if (patternSegment !== pathSegment) return null
        else score += 1
      }
      return { route, params, score }
    })
    .filter((item): item is { route: MockRoute; params: Record<string, string>; score: number } => item !== null)
    .sort((left, right) => right.score - left.score)[0]
}

export const mockRequest = (config: AxiosRequestConfig): ApiResponse => {
  const rawUrl = String(config.url || '/')
  const pathname = toPathname(rawUrl)
  const match = matchRoute(String(config.method || 'GET').toUpperCase(), pathname)
  if (!match) return { code: 404, data: null, msg: `Mock route not found: ${String(config.method || 'GET').toUpperCase()} ${pathname}` }

  return clone(match.route.handler({
    method: String(config.method || 'GET').toUpperCase(),
    pathname,
    params: match.params,
    query: toQuery(config.params),
    body: toBody(config.data),
  }))
}
