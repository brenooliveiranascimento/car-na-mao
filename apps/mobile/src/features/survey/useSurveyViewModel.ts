import { useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import * as Location from 'expo-location';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { approximateAreaHa } from '@/lib/geometry';
import { syncSurvey } from './surveyStore';

type Phase = 'idle' | 'recording' | 'sending' | 'saved_offline';

export function useSurveyViewModel(propertyId: string) {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const surveyId = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [points, setPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => subscription.current?.remove(), []);

  const start = async () => {
    setError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setError('Sem permissão de localização não dá para registrar o limite. Libere a localização nas configurações do celular.');
      return;
    }
    const id = Crypto.randomUUID();
    surveyId.current = id;
    await db.runAsync("INSERT INTO surveys (id, property_id, status, started_at) VALUES (?, ?, 'recording', ?)", id, propertyId, new Date().toISOString());
    setPoints([]);
    setPhase('recording');
    subscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, distanceInterval: 3 },
      (location) => {
        const { latitude, longitude, accuracy: acc } = location.coords;
        setAccuracy(acc ?? null);
        // Every point goes to disk immediately: closing the app or losing battery keeps the walk.
        void db.runAsync(
          'INSERT INTO survey_points (survey_id, latitude, longitude, accuracy, timestamp) VALUES (?, ?, ?, ?, ?)',
          id,
          latitude,
          longitude,
          acc ?? null,
          location.timestamp,
        );
        setPoints((prev) => [...prev, { latitude, longitude }]);
      },
      (message) => setError(message),
    );
  };

  /** Stops recording and tries to send. Returns the survey id when the analysis is ready. */
  const finish = async (): Promise<string | null> => {
    subscription.current?.remove();
    subscription.current = null;
    const id = surveyId.current;
    if (!id) return null;
    await db.runAsync("UPDATE surveys SET status = 'pending_sync' WHERE id = ?", id);
    setPhase('sending');
    try {
      await syncSurvey(db, id);
      await queryClient.invalidateQueries({ queryKey: ['surveys'] });
      setPhase('idle');
      return id;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase('saved_offline');
      await queryClient.invalidateQueries({ queryKey: ['surveys'] });
      return null;
    }
  };

  return {
    phase,
    pointCount: points.length,
    approximateAreaHa: approximateAreaHa(points),
    accuracy,
    error,
    start,
    finish,
  };
}
