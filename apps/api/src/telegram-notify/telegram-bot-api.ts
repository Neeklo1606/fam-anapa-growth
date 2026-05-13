/** Telegram Bot API helpers (minimal). */

export async function tgCall<TResult>(token: string, method: string, body?: object): Promise<TResult> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const raw = await res.json().catch(() => ({}));
  if (!(raw as { ok?: boolean }).ok) {
    const desc =
      typeof (raw as { description?: string }).description === "string"
        ? (raw as { description: string }).description
        : JSON.stringify(raw);
    throw new Error(`Telegram ${method}: HTTP ${res.status} — ${desc}`);
  }
  return (raw as { result: TResult }).result;
}
