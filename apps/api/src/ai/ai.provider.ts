import { Explanation, NotificationContext } from './explanation';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

/**
 * Any model can sit behind this interface (Gemini today, an open model hosted by the
 * government tomorrow). Nothing else in the code base knows which provider is in use.
 */
export interface AiProvider {
  readonly name: string;
  readonly model: string;
  explainNotification(context: NotificationContext): Promise<Explanation>;
}
