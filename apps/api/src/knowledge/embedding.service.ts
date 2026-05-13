import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/** Опциональные эмбеддинги OpenAI (`text-embedding-3-small`), если задан OPENAI_API_KEY. */
@Injectable()
export class EmbeddingService {
  private readonly log = new Logger(EmbeddingService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string | undefined {
    const k = this.config.get<string>("OPENAI_API_KEY");
    return typeof k === "string" && k.trim().length > 0 ? k.trim() : undefined;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Возвращает векторы в том же порядке; при отсутствии ключа или ошибке — null на позицию.
   */
  async embedTexts(texts: string[]): Promise<(number[] | null)[]> {
    const key = this.apiKey;
    if (!key || texts.length === 0) {
      return texts.map(() => null);
    }
    const sanitized = texts.map((t) => (t.trim().length > 0 ? t.slice(0, 30_000) : ""));
    const out: (number[] | null)[] = sanitized.map(() => null);
    const batchSize = 20;
    try {
      for (let i = 0; i < sanitized.length; i += batchSize) {
        const slice = sanitized.slice(i, i + batchSize);
        const input = slice.map((s, j) => (s.length === 0 ? "." : s));
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input,
          }),
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => res.statusText);
          this.log.warn(`OpenAI embeddings HTTP ${res.status}: ${msg.slice(0, 200)}`);
          continue;
        }
        const data = (await res.json()) as {
          data?: Array<{ index?: number; embedding?: number[] }>;
        };
        const rows = data.data ?? [];
        for (const row of rows) {
          const idx = row.index ?? 0;
          const glob = i + idx;
          if (glob >= 0 && glob < out.length && Array.isArray(row.embedding)) {
            out[glob] = row.embedding;
          }
        }
      }
    } catch (e) {
      this.log.warn(`embedTexts failed: ${(e as Error).message}`);
    }
    return out;
  }

  async embedOne(text: string): Promise<number[] | null> {
    const [v] = await this.embedTexts([text]);
    return v ?? null;
  }
}
