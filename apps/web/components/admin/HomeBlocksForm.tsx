"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import type {
  HomeCoachCard,
  HomePageContent,
  HomeVideoCardCfg,
  PrincipleItem,
} from "@/lib/home-page-content";
import { buildDefaultHomePageContent } from "@/lib/home-page-content";
import { updateHomePageContentAction } from "@/lib/auth-actions";
import { MediaPicker } from "@/components/admin/MediaPicker";

const inputCls =
  "h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";
const taCls =
  "min-h-[88px] w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

function dangerousUrlSchemeHead(s: string): boolean {
  const h = s.trim().slice(0, 22).toLowerCase();
  return (
    h.startsWith("javascript:") ||
    h.startsWith("data:") ||
    h.startsWith("vbscript:") ||
    h.startsWith("file:")
  );
}

/** Путь статики сайта (/img/…), загрузки (/uploads/…) или абсолютный http(s). */
function isAllowedHomeAssetUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (dangerousUrlSchemeHead(t)) return false;
  if (t.startsWith("//")) return false;
  if (t.startsWith("/")) {
    if (t.includes("..")) return false;
    if (/[\n\r\0\\]/.test(t)) return false;
    return true;
  }
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function validateHomeBeforeSave(h: HomePageContent): string[] {
  const errs: string[] = [];

  const need = (ok: boolean, msg: string) => {
    if (!ok) errs.push(msg);
  };

  need(isAllowedHomeAssetUrl(h.hero.videoSrc), "Hero: укажите URL основного видео (например /hero.mp4 или из «Медиа»).");
  need(isAllowedHomeAssetUrl(h.hero.posterSrc), "Hero: укажите URL постера.");
  need(isAllowedHomeAssetUrl(h.about.imageUrl), "Об академии: укажите URL изображения.");
  need(isAllowedHomeAssetUrl(h.goalkeeper.videoWebmSrc), "Школа вратарей: укажите URL WebM.");
  need(isAllowedHomeAssetUrl(h.goalkeeper.videoMp4Src), "Школа вратарей: укажите URL MP4.");
  need(isAllowedHomeAssetUrl(h.goalkeeper.videoPoster), "Школа вратарей: укажите URL постера видео.");

  h.coachesSection.staticCoaches.forEach((c, i) => {
    need(isAllowedHomeAssetUrl(c.photoUrl), `Тренеры · карточка ${i + 1}: укажите URL фото.`);
  });

  if (h.videosSection.show) {
    h.videosSection.cards.forEach((v, i) => {
      need(Boolean(v.url.trim()), `Видео · карточка ${i + 1}: укажите ссылку на ролик.`);
      if (v.posterUrl.trim()) {
        need(isAllowedHomeAssetUrl(v.posterUrl), `Видео · карточка ${i + 1}: некорректный URL постера.`);
      }
    });
  }

  return errs;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-[0.2em] text-ink/45">{label}</span>
      {children}
    </label>
  );
}

export function HomeBlocksForm({ initial }: { initial: HomePageContent }) {
  const [form, setForm] = useState<HomePageContent>(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const persist = async () => {
    if (saving) return;
    setSaving(true);
    const toastLoadingId = "home-settings-save";
    try {
      const urlErrs = validateHomeBeforeSave(form);
      if (urlErrs.length > 0) {
        toast.error("Сохранение отменено: проверьте адреса файлов", {
          description: urlErrs.slice(0, 8).join(" · "),
          duration: 14_000,
        });
        return;
      }

      toast.loading("Сохранение на сервер…", { id: toastLoadingId, duration: 60_000 });
      const payload = JSON.parse(JSON.stringify(form)) as Record<string, unknown>;
      const r = await updateHomePageContentAction(payload);
      toast.dismiss(toastLoadingId);
      if (!r.ok) {
        toast.error("Не удалось сохранить главную", { description: r.error ?? "Неизвестная ошибка", duration: 14_000 });
        return;
      }
      toast.success("Главная страница сохранена");
      router.refresh();
    } catch (e) {
      toast.dismiss(toastLoadingId);
      toast.error("Сбой при сохранении", { description: (e as Error).message, duration: 14_000 });
    } finally {
      setSaving(false);
    }
  };

  const h1a = form.hero.h1Lines[0] ?? "";
  const h1b = form.hero.h1Lines[1] ?? "";

  const setPrinciples = (items: PrincipleItem[]) =>
    setForm((f) => ({ ...f, principles: { ...f.principles, items } }));

  const setStaticCoaches = (staticCoaches: HomeCoachCard[]) =>
    setForm((f) => ({ ...f, coachesSection: { ...f.coachesSection, staticCoaches } }));

  const setVideoCards = (cards: HomeVideoCardCfg[]) =>
    setForm((f) => ({ ...f, videosSection: { ...f.videosSection, cards } }));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap gap-3 justify-between">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setForm(buildDefaultHomePageContent());
            toast.message(
              "Подставлены тексты из кода. Пути /img/ и ролики из public для сохранения нужно заменить на файлы из раздела «Медиа».",
              { duration: 10_000 },
            );
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider"
        >
          <RotateCcw className="h-3 w-3" /> Загрузить дефолты в форму
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void persist()}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Сохранить
        </button>
      </div>

      <p className="text-[11px] text-ink/50 max-w-3xl leading-relaxed">
        Изображения и видео выбирайте из «Медиа» или вставляйте путь сайта (<code className="text-[10px]">/img/…</code>,{" "}
        <code className="text-[10px]">/uploads/…</code>). После «Сохранить» изменения попадают на лендинг сразу.
      </p>

      <Section title="Hero (видео)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Видео">
            <MediaPicker
              assetKind="VIDEO"
              includeBundles
              value={null}
              clearableFallback
              fallbackPreviewUrl={form.hero.videoSrc || null}
              hint="MP4 или WebM: из «Медиа», метка «Сборка», или уже заданный путь (/hero.mp4 …)."
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  hero: { ...f.hero, videoSrc: v?.url ?? "" },
                }))
              }
            />
          </Field>
          <Field label="Постер">
            <MediaPicker
              assetKind="IMAGE"
              includeBundles
              value={null}
              clearableFallback
              fallbackPreviewUrl={form.hero.posterSrc || null}
              hint="WebP после загрузки в «Медиа», либо путь вида /img/… или выбор из «Сборки»."
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  hero: { ...f.hero, posterSrc: v?.url ?? "" },
                }))
              }
            />
          </Field>
          <Field label="Заголовок · строка 1">
            <input
              className={inputCls}
              value={h1a}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  hero: {
                    ...f.hero,
                    h1Lines: [e.target.value, f.hero.h1Lines[1] ?? ""],
                  },
                }))
              }
            />
          </Field>
          <Field label="Заголовок · строка 2">
            <input
              className={inputCls}
              value={h1b}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  hero: {
                    ...f.hero,
                    h1Lines: [f.hero.h1Lines[0] ?? "", e.target.value],
                  },
                }))
              }
            />
          </Field>
          <Field label="Акцентное слово (курсив)">
            <input
              className={inputCls}
              value={form.hero.accentWord}
              onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, accentWord: e.target.value } }))}
            />
          </Field>
          <Field label="Текст кнопки">
            <input
              className={inputCls}
              value={form.hero.ctaLabel}
              onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, ctaLabel: e.target.value } }))}
            />
          </Field>
        </div>
      </Section>

      <Section title="Об академии">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Заголовок (до акцента)">
            <input
              className={inputCls}
              value={form.about.titleBefore}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, titleBefore: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Акцент заголовка">
            <input
              className={inputCls}
              value={form.about.titleAccent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, titleAccent: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Изображение">
            <MediaPicker
              assetKind="IMAGE"
              includeBundles
              value={null}
              clearableFallback
              fallbackPreviewUrl={form.about.imageUrl || null}
              hint="Из «Медиа», «Сборки» или существующий путь сайта (/img/…)."
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, imageUrl: v?.url ?? "" },
                }))
              }
            />
          </Field>
          <Field label="ALT изображения">
            <input
              className={inputCls}
              value={form.about.imageAlt}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, imageAlt: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Тексты (абзацы через пустую строку)">
          <textarea
            className={taCls}
            value={form.about.paragraphs.join("\n\n")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                about: {
                  ...f.about,
                  paragraphs: e.target.value.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
                },
              }))
            }
          />
        </Field>
      </Section>

      <Section title="Школа вратарей">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Заголовок">
            <input
              className={inputCls}
              value={form.goalkeeper.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Подпись оверлея (низ)">
            <input
              className={inputCls}
              value={form.goalkeeper.overlayTitle}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, overlayTitle: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Видео WebM">
            <MediaPicker
              assetKind="VIDEO"
              includeBundles
              value={null}
              clearableFallback
              fallbackPreviewUrl={form.goalkeeper.videoWebmSrc || null}
              hint=""
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, videoWebmSrc: v?.url ?? "" },
                }))
              }
            />
          </Field>
          <Field label="Видео MP4">
            <MediaPicker
              assetKind="VIDEO"
              includeBundles
              value={null}
              clearableFallback
              fallbackPreviewUrl={form.goalkeeper.videoMp4Src || null}
              hint=""
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, videoMp4Src: v?.url ?? "" },
                }))
              }
            />
          </Field>
          <Field label="Постер видео">
            <MediaPicker
              assetKind="IMAGE"
              includeBundles
              value={null}
              clearableFallback
              fallbackPreviewUrl={form.goalkeeper.videoPoster || null}
              hint=""
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, videoPoster: v?.url ?? "" },
                }))
              }
            />
          </Field>
          <Field label="Оверлей eyebrow">
            <input
              className={inputCls}
              value={form.goalkeeper.overlayEyebrow}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, overlayEyebrow: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Текст">
          <textarea
            className={taCls}
            value={form.goalkeeper.body}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                goalkeeper: { ...f.goalkeeper, body: e.target.value },
              }))
            }
          />
        </Field>
      </Section>

      <Section title="Принципы">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Заголовок (до акцента)">
            <input
              className={inputCls}
              value={form.principles.sectionTitleBefore}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  principles: { ...f.principles, sectionTitleBefore: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Акцент">
            <input
              className={inputCls}
              value={form.principles.sectionTitleAccent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  principles: { ...f.principles, sectionTitleAccent: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Вводный текст">
          <textarea
            className={taCls}
            value={form.principles.intro}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                principles: { ...f.principles, intro: e.target.value },
              }))
            }
          />
        </Field>
        <div className="space-y-3">
          {form.principles.items.map((item, idx) => (
            <div
              key={`${item.n}-${idx}`}
              className="rounded-xl border border-line p-4 grid gap-3 sm:grid-cols-[80px_1fr_1fr_auto]"
            >
              <input
                className={inputCls}
                value={item.n}
                placeholder="№"
                title="Номер"
                onChange={(e) => {
                  const next = [...form.principles.items];
                  next[idx] = { ...item, n: e.target.value };
                  setPrinciples(next);
                }}
              />
              <input
                className={inputCls}
                value={item.title}
                placeholder="Заголовок"
                onChange={(e) => {
                  const next = [...form.principles.items];
                  next[idx] = { ...item, title: e.target.value };
                  setPrinciples(next);
                }}
              />
              <input
                className={inputCls}
                value={item.text}
                placeholder="Текст"
                onChange={(e) => {
                  const next = [...form.principles.items];
                  next[idx] = { ...item, text: e.target.value };
                  setPrinciples(next);
                }}
              />
              <button
                type="button"
                aria-label="Удалить принцип"
                className="h-10 w-10 rounded-lg border border-line text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => setPrinciples(form.principles.items.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setPrinciples([
                ...form.principles.items,
                { n: String(form.principles.items.length + 1).padStart(2, "0"), title: "", text: "" },
              ])
            }
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-flame hover:underline"
          >
            <Plus className="h-3 w-3" /> Добавить принцип
          </button>
        </div>
      </Section>

      <Section title="Тренеры">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Первая строка заголовка">
            <input
              className={inputCls}
              value={form.coachesSection.titleLine1}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  coachesSection: { ...f.coachesSection, titleLine1: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Вторая строка (акцент)">
            <input
              className={inputCls}
              value={form.coachesSection.titleLine2Accent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  coachesSection: { ...f.coachesSection, titleLine2Accent: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Подзаголовок">
          <textarea
            className={taCls}
            value={form.coachesSection.subtitle}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                coachesSection: { ...f.coachesSection, subtitle: e.target.value },
              }))
            }
          />
        </Field>
        <p className="text-xs text-ink/50">
          Карточки тренеров, которые показываются на главной. Порядок — как в списке.
        </p>
        {form.coachesSection.staticCoaches.map((c, idx) => (
          <div key={idx} className="rounded-xl border border-line p-4 space-y-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={inputCls}
                value={c.fullName}
                placeholder="ФИО"
                onChange={(e) => {
                  const next = [...form.coachesSection.staticCoaches];
                  next[idx] = { ...c, fullName: e.target.value };
                  setStaticCoaches(next);
                }}
              />
              <input
                className={inputCls}
                value={c.role}
                placeholder="Роль"
                onChange={(e) => {
                  const next = [...form.coachesSection.staticCoaches];
                  next[idx] = { ...c, role: e.target.value };
                  setStaticCoaches(next);
                }}
              />
            </div>
            <div className="pt-1">
              <MediaPicker
                assetKind="IMAGE"
                includeBundles
                value={null}
                clearableFallback
                fallbackPreviewUrl={c.photoUrl || null}
                hint="«Медиа», метка «Сборка», пути /img/…"
                onChange={(v) => {
                  const next = [...form.coachesSection.staticCoaches];
                  next[idx] = { ...c, photoUrl: v?.url ?? "" };
                  setStaticCoaches(next);
                }}
              />
            </div>
            <textarea
              className={taCls}
              value={c.shortDescription}
              placeholder="Описание"
              onChange={(e) => {
                const next = [...form.coachesSection.staticCoaches];
                next[idx] = { ...c, shortDescription: e.target.value };
                setStaticCoaches(next);
              }}
            />
            <button
              type="button"
              className="text-xs text-red-600 hover:underline"
              onClick={() => setStaticCoaches(form.coachesSection.staticCoaches.filter((_, i) => i !== idx))}
            >
              Удалить карточку
            </button>
          </div>
        ))}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-flame"
          onClick={() =>
            setStaticCoaches([
              ...form.coachesSection.staticCoaches,
              { fullName: "", role: "", photoUrl: "", shortDescription: "" },
            ])
          }
        >
          <Plus className="h-3 w-3" /> Добавить карточку
        </button>
      </Section>

      <Section title="Видео">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-line"
            checked={form.videosSection.show}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                videosSection: { ...f.videosSection, show: e.target.checked },
              }))
            }
          />
          Показывать блок «Видео» на главной
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow (подпись над заголовком)">
            <input
              className={inputCls}
              value={form.videosSection.eyebrow}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  videosSection: { ...f.videosSection, eyebrow: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Часть заголовка до акцента">
            <input
              className={inputCls}
              value={form.videosSection.titleBefore}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  videosSection: { ...f.videosSection, titleBefore: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Акцент в заголовке">
            <input
              className={inputCls}
              value={form.videosSection.titleAccent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  videosSection: { ...f.videosSection, titleAccent: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <p className="text-xs text-ink/50">
          Карточки роликов. Поддерживаются ссылки YouTube (вставляется плеер) или внешние ссылки.
        </p>
        {form.videosSection.cards.map((v, idx) => (
          <div key={idx} className="rounded-xl border border-line p-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={inputCls}
                value={v.title}
                placeholder="Заголовок ролика"
                onChange={(e) => {
                  const next = [...form.videosSection.cards];
                  next[idx] = { ...v, title: e.target.value };
                  setVideoCards(next);
                }}
              />
              <input
                className={inputCls}
                value={v.url}
                placeholder="https://youtu.be/… или прямой URL"
                onChange={(e) => {
                  const next = [...form.videosSection.cards];
                  next[idx] = { ...v, url: e.target.value };
                  setVideoCards(next);
                }}
              />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink/45 mb-1.5">
                Постер (используется, если ссылка — не YouTube)
              </span>
              <MediaPicker
                assetKind="IMAGE"
                includeBundles
                value={null}
                clearableFallback
                fallbackPreviewUrl={v.posterUrl || null}
                hint="«Медиа», «Сборка» или путь /img/…"
                onChange={(picked) => {
                  const next = [...form.videosSection.cards];
                  next[idx] = { ...v, posterUrl: picked?.url ?? "" };
                  setVideoCards(next);
                }}
              />
            </div>
            <textarea
              className={taCls}
              value={v.description}
              placeholder="Краткое описание (необязательно)"
              onChange={(e) => {
                const next = [...form.videosSection.cards];
                next[idx] = { ...v, description: e.target.value };
                setVideoCards(next);
              }}
            />
            <button
              type="button"
              className="text-xs text-red-600 hover:underline"
              onClick={() => setVideoCards(form.videosSection.cards.filter((_, i) => i !== idx))}
            >
              Удалить ролик
            </button>
          </div>
        ))}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-flame"
          onClick={() =>
            setVideoCards([
              ...form.videosSection.cards,
              { title: "", url: "", posterUrl: "", description: "" },
            ])
          }
        >
          <Plus className="h-3 w-3" /> Добавить ролик
        </button>
      </Section>

      <Section title="Локация">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Заголовок">
            <input
              className={inputCls}
              value={form.location.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, title: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Яндекс.Карты (ссылка)">
            <input
              className={inputCls}
              value={form.location.mapUrl}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  location: { ...f.location, mapUrl: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Текст">
          <textarea
            className={taCls}
            value={form.location.body}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                location: { ...f.location, body: e.target.value },
              }))
            }
          />
        </Field>
        <Field label="Embed iframe URL">
          <input
            className={inputCls}
            value={form.location.embedSrc}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                location: { ...f.location, embedSrc: e.target.value },
              }))
            }
          />
        </Field>
        <Field label="Адрес одной строкой">
          <input
            className={inputCls}
            value={form.location.address}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                location: { ...f.location, address: e.target.value },
              }))
            }
          />
        </Field>
        <p className="text-xs text-ink/50">
          Фото в блоке локации — фиксированное фото стадиона (/img/stadium-field.webp).
        </p>
      </Section>

      <Section title="Блок записи">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Заголовок до акцента">
            <input
              className={inputCls}
              value={form.contactsSection.titleBefore}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactsSection: { ...f.contactsSection, titleBefore: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Акцент">
            <input
              className={inputCls}
              value={form.contactsSection.titleAccent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactsSection: { ...f.contactsSection, titleAccent: e.target.value },
                }))
              }
            />
          </Field>
        </div>
        <Field label="Вводный текст">
          <textarea
            className={taCls}
            value={form.contactsSection.intro}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                contactsSection: { ...f.contactsSection, intro: e.target.value },
              }))
            }
          />
        </Field>
        <Field label="Пункты списка (каждый с новой строки)">
          <textarea
            className={taCls}
            value={form.contactsSection.bullets.join("\n")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                contactsSection: {
                  ...f.contactsSection,
                  bullets: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                },
              }))
            }
          />
        </Field>
      </Section>

      <Section title="Вопросы и ответы (FAQ)">
        <p className="text-sm text-ink/55">
          Блок на главной перед формой записи. Эти же вопросы попадают в разметку FAQPage — по ней Яндекс,
          Google и ИИ-поисковики показывают ответы прямо в выдаче.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.faq.show}
            onChange={(e) => setForm((f) => ({ ...f, faq: { ...f.faq, show: e.target.checked } }))}
          />
          Показывать блок на сайте
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Заголовок (до акцента)">
            <input
              className={inputCls}
              value={form.faq.titleBefore}
              onChange={(e) => setForm((f) => ({ ...f, faq: { ...f.faq, titleBefore: e.target.value } }))}
            />
          </Field>
          <Field label="Акцент">
            <input
              className={inputCls}
              value={form.faq.titleAccent}
              onChange={(e) => setForm((f) => ({ ...f, faq: { ...f.faq, titleAccent: e.target.value } }))}
            />
          </Field>
        </div>
        <div className="space-y-3">
          {form.faq.items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-line p-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-2">
                <input
                  className={inputCls}
                  value={item.q}
                  placeholder="Вопрос"
                  onChange={(e) => {
                    const items = [...form.faq.items];
                    items[idx] = { ...item, q: e.target.value };
                    setForm((f) => ({ ...f, faq: { ...f.faq, items } }));
                  }}
                />
                <textarea
                  className={taCls}
                  value={item.a}
                  placeholder="Ответ"
                  onChange={(e) => {
                    const items = [...form.faq.items];
                    items[idx] = { ...item, a: e.target.value };
                    setForm((f) => ({ ...f, faq: { ...f.faq, items } }));
                  }}
                />
              </div>
              <button
                type="button"
                aria-label="Удалить вопрос"
                className="h-10 w-10 rounded-lg border border-line text-red-600 hover:bg-red-50 shrink-0"
                onClick={() =>
                  setForm((f) => ({ ...f, faq: { ...f.faq, items: f.faq.items.filter((_, i) => i !== idx) } }))
                }
              >
                <Trash2 className="h-4 w-4 mx-auto" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, faq: { ...f.faq, items: [...f.faq.items, { q: "", a: "" }] } }))
            }
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-flame hover:underline"
          >
            <Plus className="h-3 w-3" /> Добавить вопрос
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 space-y-4">
      <h2 className="font-display text-lg tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
