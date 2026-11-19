/** Structured, plain-language explanation of a CAR notification. */
export interface Explanation {
  /** One or two short sentences, plain Portuguese, no jargon. */
  summary: string;
  /** Concrete steps, in order. */
  steps: string[];
  /** Documents the producer should gather. */
  documents: string[];
  /** Deadline as written in the notice, if any. */
  deadline: string | null;
  /** Legal basis the explanation relies on (law, article). */
  sources: string[];
  /** Short script to be read aloud (text-to-speech). */
  audioScript: string;
}

export interface NotificationContext {
  kind: string;
  originalText: string;
  dueDate: string | null;
  municipality: string;
  state: string;
  fiscalModules: number | null;
}

export const DISCLAIMER =
  'Esta explicação ajuda a entender a notificação. Quem analisa e decide é o órgão ambiental do seu estado.';

/** Validates and normalizes the model output; throws if it is not usable. */
export function parseExplanation(raw: unknown): Explanation {
  const value = typeof raw === 'string' ? JSON.parse(stripCodeFence(raw)) : raw;
  if (!value || typeof value !== 'object') throw new Error('explanation is not an object');
  const v = value as Record<string, unknown>;
  const strings = (x: unknown) => (Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string' && i.trim() !== '') : []);
  if (typeof v.summary !== 'string' || v.summary.trim() === '') throw new Error('summary is required');
  const steps = strings(v.steps);
  if (steps.length === 0) throw new Error('at least one step is required');
  return {
    summary: v.summary.trim(),
    steps,
    documents: strings(v.documents),
    deadline: typeof v.deadline === 'string' && v.deadline.trim() !== '' ? v.deadline.trim() : null,
    sources: strings(v.sources),
    audioScript: typeof v.audioScript === 'string' && v.audioScript.trim() !== '' ? v.audioScript.trim() : v.summary.trim(),
  };
}

function stripCodeFence(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}
