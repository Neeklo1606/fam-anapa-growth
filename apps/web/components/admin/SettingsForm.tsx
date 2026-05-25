"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import type { SiteSettings } from "@/lib/admin-api";
import { updateSettingsAction } from "@/lib/auth-actions";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { SITE_PUBLIC_IMAGE_PATHS } from "@/lib/site-public-images";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState({
    brandName: initial.brandName ?? "",
    brandTagline: initial.brandTagline ?? "",
    phone: initial.phone ?? "",
    whatsapp: initial.whatsapp ?? "",
    telegram: initial.telegram ?? "",
    maxLink: initial.maxLink ?? "",
    email: initial.email ?? "",
    address: initial.address ?? "",
    yandexMapUrl: initial.yandexMapUrl ?? "",
    mapEmbed: initial.mapEmbed ?? "",
    logoFallbackUrl: initial.logoFallbackUrl ?? "",
    seoTitle: initial.seoTitle ?? "",
    seoDescription: initial.seoDescription ?? "",
    seoKeywords: initial.seoKeywords ?? "",
    ogImageFallbackUrl: initial.ogImageFallbackUrl ?? "",
    faviconFallbackUrl: initial.faviconFallbackUrl ?? "",
    copyrightText: initial.copyrightText ?? "",
  });
  const [logoPicked, setLogoPicked] = useState<{
    id: string;
    url: string;
    thumbUrl: string | null;
  } | null>(
    initial.logoMedia
      ? {
          id: initial.logoMedia.id,
          url: initial.logoMedia.webpUrl ?? initial.logoMedia.url,
          thumbUrl: initial.logoMedia.thumbUrl,
        }
      : null,
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onLogoPick = (v: (typeof logoPicked) | null) => {
    setLogoPicked(v);
    if (v) setForm((f) => ({ ...f, logoFallbackUrl: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await updateSettingsAction({
        ...form,
        logoMediaId: logoPicked?.id ?? null,
        logoFallbackUrl: logoPicked ? null : form.logoFallbackUrl?.trim() || null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
        seoKeywords: form.seoKeywords.trim() || null,
        ogImageFallbackUrl: form.ogImageFallbackUrl.trim() || null,
        faviconFallbackUrl: form.faviconFallbackUrl.trim() || null,
        copyrightText: form.copyrightText.trim() || null,
      });
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success("Настройки сохранены");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
      <SectionTitle>Брендинг</SectionTitle>
      <Field label="Название бренда" wide>
        <input className={inputCls} required value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
      </Field>
      <Field label="Слоган / подзаголовок" wide>
        <input className={inputCls} value={form.brandTagline} onChange={(e) => set("brandTagline", e.target.value)} />
      </Field>
      <Field label="Логотип сайта" wide>
        <MediaPicker
          value={logoPicked}
          onChange={onLogoPick}
          fallbackPreviewUrl={form.logoFallbackUrl}
          siteStaticPaths={SITE_PUBLIC_IMAGE_PATHS}
          onPickSiteStatic={(path) => {
            setLogoPicked(null);
            setForm((f) => ({ ...f, logoFallbackUrl: path }));
          }}
          hint="Выберите файл из медиатеки (лучше PNG/WebP с прозрачным фоном), из статики или укажите путь ниже. Без прозрачности на тёмной шапке будет видна подложка файла."
        />
      </Field>
      <Field label="Путь к логотипу в public (если не из медиатеки)" wide>
        <input
          className={inputCls}
          disabled={Boolean(logoPicked)}
          value={form.logoFallbackUrl}
          onChange={(e) => set("logoFallbackUrl", e.target.value)}
          placeholder="/img/logo.webp"
        />
      </Field>

      <SectionTitle>SEO и соцсети</SectionTitle>
      <Field label="Title (заголовок вкладки)" wide>
        <input className={inputCls} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Футбольная академия Морева в Анапе" />
      </Field>
      <Field label="Meta description" wide>
        <textarea className={`${inputCls} min-h-20`} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder="Краткое описание для поисковиков" />
      </Field>
      <Field label="Keywords (через запятую)" wide>
        <input className={inputCls} value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} placeholder="футбол дети Анапа, футбольная школа" />
      </Field>
      <Field label="OG:image (путь или URL)">
        <input className={inputCls} value={form.ogImageFallbackUrl} onChange={(e) => set("ogImageFallbackUrl", e.target.value)} placeholder="/img/hero-kid.jpg" />
      </Field>
      <Field label="Favicon (путь или URL)">
        <input className={inputCls} value={form.faviconFallbackUrl} onChange={(e) => set("faviconFallbackUrl", e.target.value)} placeholder="/img/logo.webp" />
      </Field>
      <Field label="Copyright (футер)" wide>
        <input className={inputCls} value={form.copyrightText} onChange={(e) => set("copyrightText", e.target.value)} placeholder="© Футбольная академия Морева" />
      </Field>

      <SectionTitle>Контакты</SectionTitle>
      <Field label="Телефон">
        <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+79180000000" />
      </Field>
      <Field label="Email">
        <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="WhatsApp link">
        <input className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="https://wa.me/79180000000" />
      </Field>
      <Field label="Telegram link">
        <input className={inputCls} value={form.telegram} onChange={(e) => set("telegram", e.target.value)} placeholder="https://t.me/fam_anapa" />
      </Field>
      <Field label="MAX link">
        <input className={inputCls} value={form.maxLink} onChange={(e) => set("maxLink", e.target.value)} placeholder="https://max.ru/fam_anapa" />
      </Field>
      <Field label="Яндекс.Карты URL">
        <input className={inputCls} value={form.yandexMapUrl} onChange={(e) => set("yandexMapUrl", e.target.value)} placeholder="https://yandex.ru/maps/..." />
      </Field>
      <Field label="Адрес" wide>
        <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} />
      </Field>
      <Field label="Embed карты (iframe src)" wide>
        <textarea
          className={`${inputCls} min-h-24`}
          value={form.mapEmbed}
          onChange={(e) => set("mapEmbed", e.target.value)}
          placeholder="https://www.openstreetmap.org/export/embed.html?..."
        />
      </Field>

      <div className="sm:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Сохранить
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2 pt-2 first:pt-0">
      <div className="text-[10px] uppercase tracking-[0.25em] text-flame font-mono-pro">{children}</div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
