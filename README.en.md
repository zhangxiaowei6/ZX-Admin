# ZX-Admin

Multi-platform multi-tenant enterprise admin dashboard, built with React 18 + TypeScript + Ant Design, designed for SaaS scenarios.

[![Version](https://img.shields.io/badge/version-1.4.0-blue)](https://github.com/zhangxiaowei6/ZX-Admin)
[![Stars](https://img.shields.io/github/stars/zhangxiaowei6/ZX-Admin?style=flat)](https://github.com/zhangxiaowei6/ZX-Admin)
[![License](https://img.shields.io/github/license/zhangxiaowei6/ZX-Admin)](LICENSE)

[Live Demo](https://zhangxiaowei6.github.io/zx-admin/) | Test account: `admin` / `zx@123` | [Changelog](./CHANGELOG.md) | [中文](./README.md)

---

## Features

- **Dual-Level Multi-Tenancy**: Platform and tenant sides share one codebase, supporting seamless multi-platform switching
- **Enterprise-Grade Security**: Request signing (X-Sign + Timestamp + Nonce), optional AES encryption, cross-tab logout sync
- **Highly Configurable**: 20+ auto-persisted settings — theme, layout, form, table preferences, all adjustable in real-time
- **Modern Stack**: Vite 5 + Zustand + React Query, instant HMR, lightweight state management

---

## Tech Stack

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

## Quick Start

**Requirements**: Node.js >= 18.0.0

```bash
git clone https://github.com/zhangxiaowei6/zx-admin.git
cd zx-admin
npm install
cp .env.example .env.local   # fill in your config if needed
npm run dev
```

Open http://localhost:3000 and log in with `admin` / `zx@123`.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000, with Mock API) |
| `npm run build` | Build for production |
| `npm run build:demo` | Build demo version |
| `npm run preview` | Preview production build |
| `npm run preview:demo` | Build and preview demo version |
| `npm run lint` | Run ESLint |

---

## Environment Variables

```bash
# .env.development
VITE_API_BASE_URL=           # Empty = use Mock; set to backend URL to connect real API
VITE_CRYPTO_ENABLED=false    # Enable AES encryption
VITE_APP_KEY=merchant-admin  # Signing key (must match backend)
VITE_APP_SECRET=dev-secret   # Signing secret (change in production)
VITE_BASE_PATH=/             # Deployment sub-path
```

To connect a real backend, create `.env.development.local` (not committed to git):

```bash
VITE_API_BASE_URL=http://your-backend-url.com
VITE_CRYPTO_ENABLED=true
VITE_APP_KEY=your-app-key
VITE_APP_SECRET=your-app-secret
```

> Signing algorithm: `src/utils/sign.ts`. Encryption algorithm: `src/utils/crypto.ts`.

---

## Project Structure

```
ZX-Admin/
├── mock/                    # Mock server (platform / tenant)
├── src/
│   ├── api/                 # API layer
│   ├── components/          # Shared and layout components
│   ├── config/              # Default settings (defaultSettings.json)
│   ├── constants/           # Global constants and menu config
│   ├── hooks/               # Custom hooks
│   ├── locales/             # i18n translations (zh-CN/en-US/ja-JP)
│   ├── pages/               # Page components
│   ├── routes/              # Routes and guards
│   ├── services/            # Business logic (role/menu tree utils)
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── .env.example
├── .env.development
├── .env.production
├── vite.config.ts
└── package.json
```

---

## Deployment

**Nginx**

```bash
npm run build
# Deploy dist/ to your web server
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

## FAQ

**How to switch to a real API?**
Create `.env.development.local` with `VITE_API_BASE_URL` set, then restart the dev server.

**Login fails?**
In Mock mode, ensure `VITE_API_BASE_URL` is empty and use `admin` / `zx@123`. For real backend, verify Key/Secret match and that CORS is enabled.

**How to customize theme colors?**
Click the ⚙️ icon in the top-right corner. All settings persist automatically in `localStorage`.

**How to add a new menu?**
- Platform routes and menu: edit `src/config/routes/platform.config.tsx`
- Tenant routes and menu: edit `src/config/routes/tenant.config.tsx`

**How to resolve CORS issues?**
In development, configure a proxy in `vite.config.ts`. In production, use Nginx reverse proxy or configure CORS on the backend.

**How to disable AES encryption?**
Set `VITE_CRYPTO_ENABLED=false`. Request signing cannot be disabled; to modify the logic edit `src/utils/sign.ts`.

---

## Adding a Business Module

Using "Notice Management" as an example:

1. **Configure routes and menu**: Add a unified entry in `src/config/routes/platform.config.tsx`
2. **Create page**: Create `src/pages/Platform/Notice/index.tsx`
3. **Define API**: Create `src/api/modules/platform/notice.ts` and call `src/api/request.ts`
4. **Create hook** (optional): Create `src/pages/Platform/Notice/hooks/useNotice.ts`
5. **Add types**: Add and export the domain types under `src/types/platform/`
6. **Add mock**: Register a fixed route and response in `src/api/mock/index.ts`
7. **Add translations**: Update the matching namespace in `zh-CN`, `en-US`, and `ja-JP`

No framework code needs to be modified.

---

## Browser Support

Chrome 90+ / Firefox 88+ / Edge 90+ / Safari 14+

> Requires View Transition API and BroadcastChannel API. IE is not supported.

---

## Contributing

1. Fork this repository
2. Create a branch: `git checkout -b feature/AmazingFeature`
3. Commit: `git commit -m 'feat: add some feature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). See [CONTRIBUTING.en.md](CONTRIBUTING.en.md) for details.

---

## License

[MIT](LICENSE) © 2026 zhangxiaowei6
