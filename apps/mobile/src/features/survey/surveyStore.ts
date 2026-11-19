import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { api, ApiError } from '@/lib/api';
import type { SurveyAnalysis, SurveyPoint } from '@/lib/types';

/** Outbox of walks: recorded offline, sent when there is signal, never lost. */
export async function syncSurvey(db: SQLiteDatabase, surveyId: string): Promise<SurveyAnalysis> {
  const survey = await db.getFirstAsync<{ id: string; property_id: string; started_at: string }>(
    'SELECT id, property_id, started_at FROM surveys WHERE id = ?',
    surveyId,
  );
  if (!survey) throw new Error('Caminhada não encontrada');
  const points = await db.getAllAsync<SurveyPoint>(
    'SELECT latitude, longitude, accuracy, timestamp FROM survey_points WHERE survey_id = ? ORDER BY timestamp',
    surveyId,
  );
  try {
    const analysis = await api.createSurvey({ propertyId: survey.property_id, clientId: survey.id, collectedAt: survey.started_at, points });
    await db.runAsync("UPDATE surveys SET status = 'synced', analysis = ?, last_error = NULL WHERE id = ?", JSON.stringify(analysis), surveyId);
    return analysis;
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Sem conexão. A caminhada ficou guardada e será enviada depois.';
    await db.runAsync('UPDATE surveys SET last_error = ? WHERE id = ?', message, surveyId);
    throw new Error(message);
  }
}

export async function loadAnalysis(db: SQLiteDatabase, surveyId: string): Promise<SurveyAnalysis | null> {
  const row = await db.getFirstAsync<{ analysis: string | null }>('SELECT analysis FROM surveys WHERE id = ?', surveyId);
  return row?.analysis ? (JSON.parse(row.analysis) as SurveyAnalysis) : null;
}

export function usePendingSurveys() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['surveys', 'pending'],
    queryFn: () => db.getAllAsync<{ id: string; last_error: string | null }>("SELECT id, last_error FROM surveys WHERE status = 'pending_sync'"),
  });

  const syncAll = async () => {
    const results = await Promise.allSettled((query.data ?? []).map((s) => syncSurvey(db, s.id)));
    await queryClient.invalidateQueries({ queryKey: ['surveys'] });
    return results.filter((r) => r.status === 'fulfilled').length;
  };

  return { items: query.data ?? [], syncAll, refresh: query.refetch };
}
