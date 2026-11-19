import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AI_PROVIDER, AiProvider } from '../ai/ai.provider';
import { DISCLAIMER, Explanation, parseExplanation } from '../ai/explanation';
import { DatabaseService } from '../database/database.service';

interface NotificationRow {
  id: string;
  property_id: string;
  external_code: string;
  issued_by: string;
  issued_at: string;
  due_date: string | null;
  kind: string;
  original_text: string;
  status: string;
  municipality: string;
  state: string;
  fiscal_modules: string | null;
}

const SELECT_NOTIFICATION = `
  SELECT n.id, n.property_id, n.external_code, n.issued_by, to_char(n.issued_at, 'YYYY-MM-DD') AS issued_at,
         to_char(n.due_date, 'YYYY-MM-DD') AS due_date, n.kind, n.original_text, n.status,
         p.municipality, p.state, p.fiscal_modules
    FROM notifications n JOIN properties p ON p.id = n.property_id`;

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(AI_PROVIDER) private readonly ai: AiProvider,
  ) {}

  async listByProperty(propertyId: string) {
    const rows = await this.db.query<NotificationRow>(`${SELECT_NOTIFICATION} WHERE n.property_id = $1 ORDER BY n.due_date NULLS LAST`, [propertyId]);
    return rows.map(toDto);
  }

  async getById(id: string) {
    return toDto(await this.findById(id));
  }

  private async findById(id: string) {
    const row = await this.db.one<NotificationRow>(`${SELECT_NOTIFICATION} WHERE n.id = $1`, [id]);
    if (!row) throw new NotFoundException('Notificação não encontrada');
    return row;
  }

  /** Plain-language explanation, cached by notification content. */
  async explain(id: string): Promise<{ explanation: Explanation; disclaimer: string; provider: string; cached: boolean }> {
    const row = await this.findById(id);
    const hash = createHash('sha256').update(`${row.kind}\n${row.due_date ?? ''}\n${row.original_text}`).digest('hex');
    const cached = await this.db.one<{ explanation: unknown; provider: string }>(
      'SELECT explanation, provider FROM ai_explanations WHERE content_hash = $1',
      [hash],
    );
    if (cached) {
      return { explanation: parseExplanation(cached.explanation), disclaimer: DISCLAIMER, provider: cached.provider, cached: true };
    }
    const explanation = await this.ai.explainNotification({
      kind: row.kind,
      originalText: row.original_text,
      dueDate: row.due_date,
      municipality: row.municipality,
      state: row.state,
      fiscalModules: row.fiscal_modules == null ? null : Number(row.fiscal_modules),
    });
    await this.db.query(
      `INSERT INTO ai_explanations (content_hash, provider, model, explanation) VALUES ($1, $2, $3, $4)
       ON CONFLICT (content_hash) DO NOTHING`,
      [hash, this.ai.name, this.ai.model, JSON.stringify(explanation)],
    );
    return { explanation, disclaimer: DISCLAIMER, provider: this.ai.name, cached: false };
  }
}

function toDto(row: NotificationRow) {
  return {
    id: row.id,
    propertyId: row.property_id,
    externalCode: row.external_code,
    issuedBy: row.issued_by,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    kind: row.kind,
    originalText: row.original_text,
    status: row.status,
  };
}
