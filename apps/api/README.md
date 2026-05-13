# @fam/api — NestJS backend

Skeleton for the production backend.

**Этап 2** filling plan:

- Prisma schema (users/roles/permissions, leads, hero/about/coaches/gallery/videos/locations/contacts, seo_meta, media_files, events, integrations, notifications, ai_settings)
- AuthModule: JWT + Refresh + RBAC guards
- Public API: `/api/site`, `/api/home`, `/api/coaches`, `/api/gallery`, `/api/videos`, `/api/location`, `/api/seo/:page`, `POST /api/leads`, `POST /api/events`
- Admin API: CRUD over all entities
- LeadsModule (Этап 4), NotificationModule + BullMQ + Redis (Этап 5)
- MediaModule (Этап 6), AnalyticsModule (Этап 7), AIModule (Этап 8)

Run locally:

```bash
pnpm --filter @fam/api dev
```
