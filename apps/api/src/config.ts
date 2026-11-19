export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://carnamao:carnamao@localhost:5432/carnamao',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  ai: {
    // "gemini" calls the Gemini API; "mock" returns a deterministic template (no key needed).
    provider: (process.env.AI_PROVIDER ?? 'mock') as 'gemini' | 'mock',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  },
};
