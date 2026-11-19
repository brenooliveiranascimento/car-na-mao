import { Logger } from '@nestjs/common';
import { AiProvider } from './ai.provider';
import { Explanation, NotificationContext, parseExplanation } from './explanation';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';

/** Calls the Gemini REST API directly (no SDK) so the dependency is easy to swap. */
export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(
    private readonly apiKey: string,
    readonly model: string,
  ) {}

  async explainNotification(context: NotificationContext): Promise<Explanation> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: buildUserPrompt(context) }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });
    if (!response.ok) {
      this.logger.error(`Gemini error ${response.status}: ${await response.text()}`);
      throw new Error(`AI provider returned ${response.status}`);
    }
    const body = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    return parseExplanation(text);
  }
}
