import { parseExplanation } from './explanation';
import { MockProvider } from './mock.provider';

describe('parseExplanation', () => {
  it('accepts fenced JSON and normalizes optional fields', () => {
    const result = parseExplanation('```json\n{"summary":"Resumo","steps":["Passo 1",""],"deadline":""}\n```');
    expect(result).toEqual({ summary: 'Resumo', steps: ['Passo 1'], documents: [], deadline: null, sources: [], audioScript: 'Resumo' });
  });

  it('rejects output without steps', () => {
    expect(() => parseExplanation({ summary: 'x', steps: [] })).toThrow('at least one step');
  });
});

describe('MockProvider', () => {
  it('returns a valid explanation for every kind', async () => {
    const provider = new MockProvider();
    for (const kind of ['overlap', 'legal_reserve', 'other']) {
      const result = await provider.explainNotification({ kind, originalText: 't', dueDate: '2027-01-30', municipality: 'Cordeiros', state: 'BA', fiscalModules: 0.8 });
      expect(parseExplanation(result).steps.length).toBeGreaterThan(0);
      expect(result.deadline).toBe('Até 2027-01-30');
    }
  });
});
