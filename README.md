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
2. **Этап 1** ✓ Монорепо + перенос UI на Next.js 15
3. **Этап 2** ✓ Prisma schema + NestJS modules (Public/Admin API, Auth/RBAC)
4. **Этап 3** ✓ Admin panel (`/admin`) на Next.js
5. **Этап 4** ✓ CRM заявок (статусы, фильтры, экспорт, deep-links)
6. **Этап 5** ✓ Очередь **BullMQ** + Redis; новая заявка → **Telegram**, **MAX**, опционально **Webhook** и **Email (SMTP)**.
7. **Этап 6** ✓ Медиа-центр (upload/resize/webp/thumbnails)
8. **Этап 7** ✓ (база) **SEO** — абсолютные canonical/OpenGraph на юридических страницах; **события аналитики** — `POST /api/analytics/events` + трекинг ключевых действий на сайте (форма, видео-герой, контакты в подвале и на главной).

9. **Этап 8** ✓ (база) **Knowledge Base + RAG-заготовка**: таблицы `knowledge_documents` / `chunks`, админ `/admin/knowledge`, публичные `GET /api/knowledge`, `GET /api/knowledge/search`, `POST /api/knowledge/retrieve`, опционально эмбеддинги через `OPENAI_API_KEY`; доработки: связка с сайтом, pgvector при росте объёма, LLM-ответы.
10. **Этап 9** ✓ (база) **Security & Performance**: глобальный **rate limit** (`ThrottlerGuard` + дефолт 100/мин, строже на `/auth/login`, вебхуки без лимита); **CSRF** double-submit (`fam_csrf` + `X-CSRF-Token`) для мутаций при сессионных cookies; **gzip** на API; усиленный **helmet** (без CSP на JSON API); на фронте расширены **metadata/OG/Twitter**, **COOP** + DNS-prefetch заголовки. Дальше: жёсткая CSP на Next, refresh-флоу под CSRF без исключения `/auth/refresh`.
11. **Этап 10** — CI/CD (GitHub Actions), production backups

Все этапы выполняются последовательно, без поломок текущего UI.
