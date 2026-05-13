/** Пресеты моделей embeddings OpenAI (админ может ввести другой slug в форме через API позже расширим). */
export const OPENAI_EMBEDDING_MODEL_OPTIONS = [
  { id: "text-embedding-3-small", label: "text-embedding-3-small (рекомендуется)" },
  { id: "text-embedding-3-large", label: "text-embedding-3-large" },
  { id: "text-embedding-ada-002", label: "text-embedding-ada-002 (legacy)" },
] as const;
