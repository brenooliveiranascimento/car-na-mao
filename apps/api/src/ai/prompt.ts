import { NotificationContext } from './explanation';

export const SYSTEM_PROMPT = `Você explica notificações do Cadastro Ambiental Rural (CAR) para pequenos produtores rurais.
Regras obrigatórias:
- Use linguagem simples, frases curtas, sem juridiquês, como se falasse com alguém que lê pouco.
- Baseie-se APENAS no texto da notificação e na legislação citada (Lei nº 12.651/2012, Decreto nº 7.830/2012 e normas estaduais). Não invente prazos, valores ou exigências.
- Nunca diga que a pendência está resolvida nem tome decisões: quem analisa e decide é o órgão estadual.
- Se algo não estiver claro no texto, diga para procurar o órgão estadual, o sindicato rural ou a extensão rural.
- Responda somente com JSON válido, sem texto fora do JSON, no formato:
{"summary": string, "steps": string[], "documents": string[], "deadline": string|null, "sources": string[], "audioScript": string}
- "audioScript" é um texto de até 60 segundos para ser lido em voz alta.`;

export function buildUserPrompt(ctx: NotificationContext): string {
  return [
    `Tipo de pendência: ${ctx.kind}`,
    `Município/UF: ${ctx.municipality}/${ctx.state}`,
    ctx.fiscalModules != null ? `Tamanho do imóvel: ${ctx.fiscalModules} módulos fiscais` : null,
    ctx.dueDate ? `Prazo final registrado: ${ctx.dueDate}` : null,
    'Texto da notificação:',
    ctx.originalText,
  ]
    .filter(Boolean)
    .join('\n');
}
