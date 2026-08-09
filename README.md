

```markdown
# ZX-Admin

多平台多租户企业级管理后台，基于 React 18 + TypeScript + Ant Design 构建，为 SaaS 场景设计，开箱即用。

[![Version](https://img.shields.io/badge/version-1.4.0-blue)](https://github.com/zhangxiaowei6/ZX-Admin)
[![Stars](https://img.shields.io/github/stars/zhangxiaowei6/ZX-Admin?style=flat)](https://github.com/zhangxiaowei6/ZX-Admin)
[![License](https://img.shields.io/github/license/zhangxiaowei6/ZX-Admin)](LICENSE)

[在线演示](https://zhangxiaowei6.github.io/ZX-Admin/) | 测试账号：`admin` / `zx@123` | [更新日志](./CHANGELOG.md) | [English](./README.en.md)

---

## 特性

- **双层级多租户**：平台方和租户方共用一套代码，支持多平台无缝切换
- **企业级安全**：请求签名（X-Sign + Timestamp + Nonce）、可选 AES 加密、跨标签页同步登出
- **高度可配置**：20+ 配置项自动持久化，主题/布局/表单/表格偏好实时调整
- **现代技术栈**：Vite 5 + Zustand + React Query，极速 HMR，轻量状态管理

---

## 技术栈

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.21-0170FE?style=flat-square&logo=antdesign&logoColor=white)](https://ant.design)
[![Zustand](https://img.shields.io/badge/Zustand-4.4-443E44?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![React Query](https://img.shields.io/badge/React%20Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)

---

## 快速开始

**环境要求**：Node.js >= 18.0.0

```bash
git clone https://github.com/zhangxiaowei6/ZX-Admin.git
cd ZX-Admin
npm install
cp .env.example .env.local   # 按需填入实际配置
npm run dev
```

浏览器访问 http://localhost:3000，使用 `admin` / `zx@123` 登录。

---

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（默认端口 3000，带 Mock API） |
| `npm run build` | 构建生产版本 |
| `npm run build:demo` | 构建 Demo 版本 |
| `npm run preview` | 预览生产构建 |
| `npm run preview:demo` | 构建并预览 Demo 版本 |
| `npm run lint` | ESLint 检查 |

---

## 环境变量

```bash
# .env.development
VITE_API_BASE_URL=           # 留空使用 Mock，填写真实地址则对接后端
VITE_CRYPTO_ENABLED=false    # 是否开启 AES 加密
VITE_APP_KEY=merchant-admin  # 请求签名 Key（需与后端一致）
VITE_APP_SECRET=dev-secret   # 请求签名 Secret（生产必须修改）
VITE_BASE_PATH=/             # 部署子路径
```

对接真实后端时，创建 `.env.development.local`（不会提交到 git）：

```bash
VITE_API_BASE_URL=http://your-backend-url.com
VITE_CRYPTO_ENABLED=true
VITE_APP_KEY=your-app-key
VITE_APP_SECRET=your-app-secret
```

> 签名算法见 `src/utils/sign.ts`，加密算法见 `src/utils/crypto.ts`。

---

## 项目结构

```
ZX-Admin/
├── mock/                    # Mock 服务（平台/租户）
├── src/
│   ├── api/                 # API 请求层
│   ├── components/          # 通用组件与布局组件
│   ├── config/              # 默认配置（defaultSettings.json）
│   ├── constants/           # 全局常量与菜单配置
│   ├── hooks/               # 自定义 Hooks
│   ├── locales/             # 国际化翻译（zh-CN/en-US/ja-JP）
│   ├── pages/               # 页面组件
│   ├── routes/              # 路由配置与守卫
│   ├── services/            # 业务逻辑层（角色/菜单树转换等）
│   ├── stores/              # Zustand 状态管理
│   ├── types/               # TypeScript 类型
│   └── utils/               # 工具函数
├── .env.example
├── .env.development
├── .env.production
├── vite.config.ts
└── package.json
```

---

## 部署

**Nginx 静态托管**

```bash
npm run build
# 将 dist/ 部署到 Web 服务器
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

**Docker**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t zx-admin .
docker run -d -p 80:80 zx-admin
```

---

## 常见问题

**如何切换到真实 API？**
创建 `.env.development.local` 并设置 `VITE_API_BASE_URL`，重启开发服务器。

**登录失败怎么办？**
Mock 模式下确保 `VITE_API_BASE_URL` 为空，使用 `admin` / `zx@123`。对接后端时检查 Key/Secret 是否与后端一致，并确认后端支持 CORS。

**如何自定义主题色？**
点击右上角 ⚙️ 图标，在设置抽屉中实时调整，所有配置自动保存到 `localStorage`。

**如何添加新菜单？**
- 平台菜单：编辑 `src/constants/menu/platformMenu.tsx`
- 租户菜单：编辑 `src/constants/menu/tenantMenu.tsx`

**跨域问题如何解决？**
开发环境在 `vite.config.ts` 中配置代理，生产环境通过 Nginx 反向代理或后端配置 CORS。

**如何禁用 AES 加密？**
设置 `VITE_CRYPTO_ENABLED=false`。请求签名无法禁用，如需修改逻辑编辑 `src/utils/sign.ts`。

---

## 新增业务模块

以「公告管理」为例，完整流程如下：

1. **注册路由**：在 `src/routes/modules/platform.tsx` 添加路由
2. **添加菜单**：在 `src/constants/menu/platformMenu.tsx` 添加菜单项
3. **编写页面**：新建 `src/pages/Platform/Notice/index.tsx`
4. **定义 API**：新建 `src/api/modules/platform/notice.ts`
5. **编写 Hook**（可选）：新建 `src/pages/Platform/Notice/hooks/useNotice.ts`
6. **添加 Mock**：新建 `mock/platform/notice.ts` 并在 `mock/index.ts` 中导入

> 注：当前菜单与路由为静态配置，新增页面组件需同时更新路由配置；若仅将新菜单指向已有页面组件，则无需修改代码。无需修改框架核心代码。

---

## 浏览器支持

Chrome 90+ / Firefox 88+ / Edge 90+ / Safari 14+

> 项目使用了 View Transition API 和 BroadcastChannel API，不支持 IE。

---

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

提交遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

[MIT](LICENSE) © 2026 zhangxiaowei6
```
