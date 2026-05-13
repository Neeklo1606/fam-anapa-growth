# Футбольная академия Морева — production monorepo

Производственная архитектура (по ТЗ):

- **`apps/web`** — Next.js 15 + React 19 + Tailwind 4 + shadcn/ui (SSR, SEO, JSON-LD, OpenGraph, App Router)
- **`apps/api`** — NestJS + Prisma + PostgreSQL + Redis + BullMQ (Этап 2+)
- **`packages/types`** — общие типы DTO и контракты API
- **`packages/utils`** — переиспользуемые утилиты (slugify, formatRuPhone, …)
- **`packages/ui`** — placeholder для общих shadcn-компонентов между web и admin (Этап 3)
- **`packages/config`** — общие конфиги (tsconfig.base, prettier)

## Tooling

- **pnpm** workspaces (`packageManager: pnpm@10.33.0`, `node >= 20`)
- **Turborepo** (`turbo run build|dev|lint|typecheck|test`)
- **TypeScript 5.7**, strict, `noUncheckedIndexedAccess`

## Quickstart

```bash
pnpm install
pnpm dev               # all apps in watch mode
pnpm --filter @fam/web dev
pnpm --filter @fam/api dev
pnpm build
```

## Environments

- **Production**: `https://morev.neeklo.ru` — Next.js (PM2) + Nginx reverse proxy on VPS 89.169.39.244 (Ubuntu 24.04, HAProxy SNI → nginx 127.0.0.1:9443 → next standalone on :3000)
- Backend, PostgreSQL, Redis — нативно на VPS (Этап 2+ деплой)

## Этапы реализации

1. **Этап 0** ✓ SPA-staging на morev.neeklo.ru, Let's Encrypt SSL
2. **Этап 1** ✓ Монорепо + перенос UI на Next.js 15 (текущий шаг)
3. **Этап 2** — Prisma schema + NestJS modules (Public/Admin API, Auth/RBAC)
4. **Этап 3** — Admin panel (`/admin`) на Next.js
5. **Этап 4** — CRM заявок (статусы, фильтры, экспорт, deep-links)
6. **Этап 5** — Notifications (Telegram/MAX/Email/Webhook) + BullMQ
7. **Этап 6** — Медиа-центр (upload/resize/webp/thumbnails)
8. **Этап 7** — SEO + Analytics events
9. **Этап 8** — AI-ready слой (Knowledge Base, embeddings, RAG)
10. **Этап 9** — Security & Performance (rate limit, CSRF, XSS, Lighthouse 90+)
11. **Этап 10** — CI/CD (GitHub Actions), production backups

Все этапы выполняются последовательно, без поломок текущего UI.
