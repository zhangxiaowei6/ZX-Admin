import type {
  DashboardStats,
  Dept,
  DictItem,
  DictType,
  Menu,
  Message,
  Platform,
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

export const platforms: Platform[] = [
  { id: 1, name: '六合山庄', code: 'platform', description: '山庄管理后台', path: '/' },
  { id: 2, name: '山悦酒店', code: 'shanyue', description: '酒店管理后台', path: '/' },
  { id: 3, name: '星海民宿', code: 'xinghai', description: '民宿管理后台', path: '/' },
]

export const departments: Dept[] = [
  { id: 1, parentId: 0, name: '总公司', sort: 0, status: 1, children: [] },
  { id: 2, parentId: 1, name: '研发部', sort: 1, status: 1, children: [] },
  { id: 3, parentId: 1, name: '运营部', sort: 2, status: 1, children: [] },
]

export const dictTypes: DictType[] = [
  { id: 1, code: 'order_status', name: '订单状态', remark: '订单流转状态' },
  { id: 2, code: 'gender', name: '性别', remark: '用户性别' },
  { id: 3, code: 'status', name: '通用状态', remark: '启用/禁用' },
]

export const dictItems: Record<string, DictItem[]> = {
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

export const dashboardStats: DashboardStats = {
  todayOrders: 36,
  todayRevenue: 4280.5,
  totalProducts: 152,
  totalCustomers: 1893,
}

export const initialTenants: Tenant[] = [
  { id: 1, name: '星巴克旗舰店', code: 'T001', status: 1, contact: '张经理', phone: '13800138001', email: 'starbucks@example.com', address: '北京市朝阳区建国路88号', createdAt: '2024-01-05 09:30:00' },
  { id: 2, name: '肯德基中心店', code: 'T002', status: 1, contact: '李经理', phone: '13800138002', email: 'kfc@example.com', address: '上海市浦东新区陆家嘴环路166号', createdAt: '2024-01-12 14:20:00' },
  { id: 3, name: '麦当劳万达店', code: 'T003', status: 0, contact: '王经理', phone: '13800138003', email: 'mcd@example.com', address: '广州市天河区天河路230号', createdAt: '2024-02-03 10:15:00' },
]

export const initialSystemUsers: SystemUser[] = [
  { id: 1, username: 'admin', nickname: '系统管理员', phone: '13800138000', email: 'admin@example.com', roleIds: [1], roleNames: ['超级管理员'], status: 1, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, username: 'operator', nickname: '运营管理员', phone: '13800138001', email: 'operator@example.com', roleIds: [2], roleNames: ['运营管理员'], status: 1, createdAt: '2024-01-02 09:00:00', updatedAt: '2024-01-02 09:00:00' },
]

export const initialRoles: Role[] = [
  { id: 1, name: '超级管理员', code: 'super_admin', description: '拥有所有权限', menuIds: [1, 2, 3, 4], deptIds: [1, 2, 3], status: 1, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, name: '运营管理员', code: 'operator', description: '负责日常运营管理', menuIds: [1, 2, 3], deptIds: [1, 2, 3], status: 1, createdAt: '2024-01-02 09:00:00', updatedAt: '2024-01-02 09:00:00' },
]

export const initialAdminMenus: Menu[] = [
  { id: 1, parentId: 0, name: '首页', path: '/', icon: 'DashboardOutlined', permission: 'dashboard', type: 2, sort: 0, visible: 1, status: 1, createdAt: '2024-01-01' },
  { id: 2, parentId: 0, name: '商户管理', path: '/tenant', icon: 'ShopOutlined', permission: 'tenant', type: 1, sort: 1, visible: 1, status: 1, createdAt: '2024-01-01' },
  { id: 3, parentId: 0, name: '消息中心', path: '/inbox', icon: 'MailOutlined', permission: 'message', type: 2, sort: 2, visible: 1, status: 1, createdAt: '2024-01-01' },
  { id: 4, parentId: 0, name: '系统管理', path: '/system', icon: 'SettingOutlined', permission: 'system', type: 1, sort: 3, visible: 1, status: 1, createdAt: '2024-01-01' },
]

export const initialMessages: Message[] = [
  { id: 1, title: '系统升级通知', content: '系统将于近期进行版本升级维护，请提前做好相关安排。', type: 'announcement', priority: 'important', senderId: 1, senderName: '系统管理员', isRead: false, createdAt: '2026-03-08 10:00:00' },
  { id: 2, title: '账户安全提醒', content: '您的账户有新的登录记录，如非本人操作请及时处理。', type: 'notification', priority: 'urgent', senderId: 0, senderName: '系统', isRead: false, createdAt: '2026-03-07 08:32:00' },
  { id: 3, title: '项目进度汇报', content: '前端页面开发已完成，后端接口已就绪。', type: 'message', priority: 'normal', senderId: 2, senderName: '张三', isRead: true, createdAt: '2026-03-06 09:00:00' },
]

export const initialTenantUsers: TenantAuthUser[] = [
  { id: 1, username: 'tenant-admin', nickname: '租户管理员', status: 1, roleIds: [1], roleNames: ['租户管理员'], enabledClients: ['admin'], dataScopes: { admin: 'all', miniapp: 'all' }, createdAt: '2024-01-01 09:00:00' },
]

export const initialTenantRoles: TenantAuthRole[] = [
  { id: 1, name: '租户管理员', code: 'tenant_admin', status: 1, description: '租户全部权限', adminMenuIds: [51, 52, 53, 54, 55], miniappMenuIds: [], adminDeptIds: [1, 2, 3], miniappDeptIds: [], createdAt: '2024-01-01 09:00:00' },
]

export const initialTenantMenus: TenantAuthMenuItem[] = [
  { id: 51, parentId: 0, name: '工作台', path: 'dashboard', icon: 'DashboardOutlined', permission: 'tenant:list:backend:dashboard', type: 2, sort: 0, visible: 1, status: 1, createdAt: '2024-01-01', clientType: 'admin' },
  { id: 52, parentId: 0, name: '订单管理', path: 'order', icon: 'ShoppingCartOutlined', permission: 'tenant:list:backend:order', type: 2, sort: 1, visible: 1, status: 1, createdAt: '2024-01-01', clientType: 'admin' },
  { id: 53, parentId: 0, name: '商品管理', path: 'product', icon: 'ShopOutlined', permission: 'tenant:list:backend:product', type: 2, sort: 2, visible: 1, status: 1, createdAt: '2024-01-01', clientType: 'admin' },
  { id: 54, parentId: 0, name: '店铺设置', path: 'setting', icon: 'SettingOutlined', permission: 'tenant:list:backend:setting', type: 2, sort: 3, visible: 1, status: 1, createdAt: '2024-01-01', clientType: 'admin' },
  { id: 55, parentId: 0, name: '系统管理', path: 'system', icon: 'SettingOutlined', permission: 'tenant:list:backend:system', type: 1, sort: 4, visible: 1, status: 1, createdAt: '2024-01-01', clientType: 'admin' },
]

export const initialProducts: TenantProduct[] = [
  { id: 1, name: '示例商品一', description: '高品质示例商品', price: 99, stock: 120, category: '电子产品', unit: '个', status: 1, createdAt: '2024-01-01 10:00:00' },
  { id: 2, name: '示例商品二', description: '热销示例商品', price: 199, stock: 80, category: '食品', unit: '件', status: 1, createdAt: '2024-01-02 10:00:00' },
]

export const initialOrders: TenantOrder[] = [
  { id: 1, orderNo: 'ORD20240001', customerName: '张三', amount: 128, status: 1, createdAt: '2024-01-15 10:00:00' },
  { id: 2, orderNo: 'ORD20240002', customerName: '李四', amount: 256.5, status: 2, createdAt: '2024-01-15 11:00:00' },
]

export const initialSpecs: ProductSpec[] = [
  { id: 1, productId: 1, specName: '颜色', specValue: '蓝色', price: 99, stock: 50, sort: 1 },
  { id: 2, productId: 1, specName: '尺寸', specValue: 'M', price: 99, stock: 70, sort: 2 },
]

export const initialStoreSetting: StoreSetting = {
  storeName: '示例店铺',
  storeDesc: '这是一家示例店铺',
  storeLogo: '',
  contactPhone: '13800138000',
  contactEmail: 'store@example.com',
  address: '北京市朝阳区xxx路xxx号',
  isOpen: true,
  autoConfirm: false,
}
