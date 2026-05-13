"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import type { GallerySlideCfg, HomeCoachCard, HomePageContent, PrincipleItem } from "@/lib/home-page-content";
import { buildDefaultHomePageContent } from "@/lib/home-page-content";
import { updateHomePageContentAction } from "@/lib/auth-actions";

const inputCls =
  "h-10 w-full px-3 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";
const taCls =
  "min-h-[88px] w-full px-3 py-2 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-flame";

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
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const persist = () => {
    startTransition(async () => {
      const payload = JSON.parse(JSON.stringify(form)) as Record<string, unknown>;
      const r = await updateHomePageContentAction(payload);
      if (!r.ok) {
        toast.error("Не удалось сохранить", { description: r.error });
        return;
      }
      toast.success("Главная страница сохранена");
      router.refresh();
    });
  };

  const h1a = form.hero.h1Lines[0] ?? "";
  const h1b = form.hero.h1Lines[1] ?? "";

  const setPrinciples = (items: PrincipleItem[]) =>
    setForm((f) => ({ ...f, principles: { ...f.principles, items } }));

  const setSlides = (carouselSlides: GallerySlideCfg[]) =>
    setForm((f) => ({ ...f, location: { ...f.location, carouselSlides } }));

  const setStaticCoaches = (staticCoaches: HomeCoachCard[]) =>
    setForm((f) => ({ ...f, coachesSection: { ...f.coachesSection, staticCoaches } }));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap gap-3 justify-between">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setForm(buildDefaultHomePageContent());
            toast.message("Подставлены значения из кода. Сохраните, чтобы записать на сервер.");
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-line text-[11px] font-semibold uppercase tracking-wider"
        >
          <RotateCcw className="h-3 w-3" /> Загрузить дефолты в форму
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => persist()}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-flame text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Сохранить
        </button>
      </div>

      <fieldset className="rounded-2xl border border-line bg-white p-5 space-y-4">
        <legend className="text-[10px] uppercase tracking-[0.25em] text-flame font-mono-pro px-1">
          Подключение коллекций
        </legend>
        <p className="text-xs text-ink/55 leading-relaxed">
          Данные из разделов «Тренеры», «Галерея», «Видео». При отключении подставляются поля блоков ниже — карусель локации
          (<code className="text-[11px]">/img/...</code>), статичные карточки тренеров.
        </p>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-line"
            checked={form.coachesSection.useCoachesApi}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                coachesSection: { ...f.coachesSection, useCoachesApi: e.target.checked },
              }))
            }
          />
          Тренеры с API («Тренеры»)
        </label>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-line"
            checked={form.location.useGalleryApi}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                location: { ...f.location, useGalleryApi: e.target.checked },
              }))
            }
          />
          Карусель локации с API («Галерея»)
        </label>
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
          Показывать блок видео
        </label>
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 rounded border-line"
            disabled={!form.videosSection.show}
            checked={form.videosSection.useVideosApi}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                videosSection: { ...f.videosSection, useVideosApi: e.target.checked },
              }))
            }
          />
          Ролики с API («Видео»)
        </label>
      </fieldset>

      <Section title="Hero (видео)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Видео (URL в public или абс.)">
            <input
              className={inputCls}
              value={form.hero.videoSrc}
              onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, videoSrc: e.target.value } }))}
            />
          </Field>
          <Field label="Постер (картинка)">
            <input
              className={inputCls}
              value={form.hero.posterSrc}
              onChange={(e) => setForm((f) => ({ ...f, hero: { ...f.hero, posterSrc: e.target.value } }))}
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
          <Field label="Подпись на карточке (верх)">
            <input
              className={inputCls}
              value={form.about.cardEyebrow}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, cardEyebrow: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Подпись на карточке">
            <input
              className={inputCls}
              value={form.about.cardTitle}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, cardTitle: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Изображение (URL)">
            <input
              className={inputCls}
              value={form.about.imageUrl}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  about: { ...f.about, imageUrl: e.target.value },
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
          <Field label="WebM источник">
            <input
              className={inputCls}
              value={form.goalkeeper.videoWebmSrc}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, videoWebmSrc: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="MP4 источник">
            <input
              className={inputCls}
              value={form.goalkeeper.videoMp4Src}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, videoMp4Src: e.target.value },
                }))
              }
            />
          </Field>
          <Field label="Постер видео">
            <input
              className={inputCls}
              value={form.goalkeeper.videoPoster}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  goalkeeper: { ...f.goalkeeper, videoPoster: e.target.value },
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

      <Section title="Тренеры (тексты и статические карточки)">
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
          Статические карточки используются, когда отключено API или API недоступно.
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
            <input
              className={inputCls}
              value={c.photoUrl}
              placeholder="URL фото"
              onChange={(e) => {
                const next = [...form.coachesSection.staticCoaches];
                next[idx] = { ...c, photoUrl: e.target.value };
                setStaticCoaches(next);
              }}
            />
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
              { fullName: "", role: "", photoUrl: "/img/", shortDescription: "" },
            ])
          }
        >
          <Plus className="h-3 w-3" /> Добавить карточку
        </button>
      </Section>

      <Section title="Видео (заголовки блока)">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow">
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
          <Field label="Часть до акцента">
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
        </div>
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
        <p className="text-xs text-ink/50">Слайды карусели (если API галереи выключен).</p>
        {form.location.carouselSlides.map((s, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 items-center">
            <input
              className={`${inputCls} flex-1 min-w-[200px]`}
              value={s.src}
              placeholder="/img/..."
              onChange={(e) => {
                const next = [...form.location.carouselSlides];
                next[idx] = { ...s, src: e.target.value };
                setSlides(next);
              }}
            />
            <input
              className={`${inputCls} flex-1 min-w-[160px]`}
              value={s.label}
              placeholder="Подпись"
              onChange={(e) => {
                const next = [...form.location.carouselSlides];
                next[idx] = { ...s, label: e.target.value };
                setSlides(next);
              }}
            />
            <button
              type="button"
              aria-label="Удалить слайд"
              className="h-10 w-10 rounded-lg border border-line text-red-600"
              onClick={() => setSlides(form.location.carouselSlides.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-4 w-4 mx-auto" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-flame"
          onClick={() => setSlides([...form.location.carouselSlides, { src: "/img/", label: "" }])}
        >
          <Plus className="h-3 w-3" /> Слайд
        </button>
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
