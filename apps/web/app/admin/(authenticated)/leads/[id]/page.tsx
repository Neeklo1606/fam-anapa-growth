import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Send, MessageCircle } from "lucide-react";

import { fetchLeadById, fetchManagers, fetchMe } from "@/lib/admin-api";
import { StatusBadge, statusLabel } from "@/components/admin/StatusBadge";
import { StatusUpdater } from "@/components/admin/StatusUpdater";
import { LeadCommentForm } from "@/components/admin/LeadCommentForm";
import { AssignManager } from "@/components/admin/AssignManager";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let lead;
  try {
    lead = await fetchLeadById(id);
  } catch {
    notFound();
  }

  const me = await fetchMe();
  const canAssign = me?.role === "ADMIN" || me?.role === "MANAGER";
  const managers = canAssign ? await fetchManagers() : [];

  const digits = lead.phone.replace(/\D/g, "");
  const tg = lead.telegram
    ? lead.telegram.startsWith("@")
      ? `https://t.me/${lead.telegram.slice(1)}`
      : lead.telegram
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60 hover:text-flame transition"
      >
        <ArrowLeft className="h-3 w-3" /> К заявкам
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-flame font-mono-pro">
            Заявка
          </div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">{lead.parentName}</h1>
          <p className="mt-1 text-sm text-ink/55">
            Ребёнок: <span className="font-medium text-ink">{lead.childName}</span>
            {lead.childBirthDate && (
              <>
                {" · "}д.р.{" "}
                {new Date(lead.childBirthDate).toLocaleDateString("ru-RU")}
              </>
            )}
          </p>
        </div>
        <StatusBadge status={lead.status} />
      </header>

      <section className="grid md:grid-cols-3 gap-3">
        <a
          href={`tel:${lead.phone}`}
          className="rounded-2xl border border-line bg-white p-4 flex items-center gap-3 hover:border-flame transition"
        >
          <Phone className="h-5 w-5 text-flame" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/45">Позвонить</div>
            <div className="font-mono-pro text-sm">{lead.phone}</div>
          </div>
        </a>
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-line bg-white p-4 flex items-center gap-3 hover:border-flame transition"
        >
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/45">WhatsApp</div>
            <div className="text-sm">Написать</div>
          </div>
        </a>
        {tg ? (
          <a
            href={tg}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-line bg-white p-4 flex items-center gap-3 hover:border-flame transition"
          >
            <Send className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink/45">Telegram</div>
              <div className="text-sm">{lead.telegram}</div>
            </div>
          </a>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white/50 p-4 text-xs text-ink/40 flex items-center">
            Telegram не указан
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Контакт">
            <Row label="Email">{lead.email ?? "—"}</Row>
            <Row label="Направление">{lead.direction ?? "—"}</Row>
            <Row label="Опыт">{lead.experienceLevel === "YES" ? "Есть опыт" : "Нет опыта"}</Row>
            <Row label="Комментарий">{lead.comment ?? "—"}</Row>
          </Card>

          <Card title="Источник">
            <Row label="Создана">{new Date(lead.createdAt).toLocaleString("ru-RU")}</Row>
            <Row label="Источник">{lead.source ?? "—"}</Row>
            <Row label="Landing">{lead.landingPage ?? "—"}</Row>
            <Row label="UTM">
              {[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ") || "—"}
            </Row>
            <Row label="IP / UA">
              <span className="text-xs">
                {lead.ip ?? "—"}
                {lead.userAgent ? <span className="block text-ink/40">{lead.userAgent}</span> : null}
              </span>
            </Row>
          </Card>

          <Card title="Комментарии">
            <LeadCommentForm leadId={lead.id} />
            <ul className="space-y-3 mt-4">
              {lead.comments.length === 0 && (
                <li className="text-sm text-ink/40">Пока нет.</li>
              )}
              {lead.comments.map((c) => (
                <li key={c.id} className="border-l-2 border-flame pl-3">
                  <div className="text-[10px] uppercase tracking-wider text-ink/45">
                    {c.author?.fullName ?? "—"} ·{" "}
                    {new Date(c.createdAt).toLocaleString("ru-RU")}
                  </div>
                  <div className="text-sm mt-1 whitespace-pre-wrap">{c.body}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Изменить статус">
            <StatusUpdater leadId={lead.id} current={lead.status} />
          </Card>

          {canAssign && (
            <Card title="Ответственный менеджер">
              <AssignManager
                leadId={lead.id}
                current={lead.assignedManagerId}
                managers={managers}
              />
              {lead.assignedManager && (
                <p className="mt-2 text-xs text-ink/55">
                  Сейчас: <span className="text-ink">{lead.assignedManager.fullName}</span>
                </p>
              )}
            </Card>
          )}

          <Card title="История">
            <ol className="space-y-3 text-sm">
              {lead.history.map((h) => (
                <li key={h.id} className="border-l-2 border-line pl-3">
                  <div className="text-[10px] uppercase tracking-wider text-ink/45">
                    {new Date(h.createdAt).toLocaleString("ru-RU")}
                    {h.changedBy ? ` · ${h.changedBy.fullName}` : ""}
                  </div>
                  <div className="mt-1">
                    {h.fromStatus ? `${statusLabel(h.fromStatus)} → ` : ""}
                    <span className="font-semibold">{statusLabel(h.toStatus)}</span>
                  </div>
                  {h.note && <div className="text-xs text-ink/55 mt-1">{h.note}</div>}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h3 className="font-display text-base tracking-tight mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="text-[10px] uppercase tracking-wider text-ink/45 self-start mt-1">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}
