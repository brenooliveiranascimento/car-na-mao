import { useQuery } from '@tanstack/react-query';
import * as Speech from 'expo-speech';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fetchWithCache, readCache } from '@/lib/db';
import type { CarNotification, ExplanationResponse } from '@/lib/types';

export function useNotificationViewModel(notificationId: string, propertyId: string) {
  const db = useSQLiteContext();
  const [speaking, setSpeaking] = useState(false);

  const notification = useQuery({
    queryKey: ['notification', notificationId],
    queryFn: async () => {
      const list = await readCache<CarNotification[]>(db, `notifications:${propertyId}`);
      return list?.find((n) => n.id === notificationId) ?? null;
    },
  });

  const explanation = useQuery({
    queryKey: ['explanation', notificationId],
    queryFn: () => fetchWithCache<ExplanationResponse>(db, `explanation:${notificationId}`, () => api.explain(notificationId)),
    staleTime: Infinity,
  });

  useEffect(() => () => void Speech.stop(), []);

  const toggleAudio = () => {
    const text = explanation.data?.data.explanation.audioScript;
    if (!text) return;
    if (speaking) {
      void Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    // Device text-to-speech: works offline once the explanation is cached.
    Speech.speak(text, { language: 'pt-BR', rate: 0.9, onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  return {
    notification: notification.data,
    explanation: explanation.data?.data,
    offline: explanation.data?.offline ?? false,
    loading: explanation.isLoading,
    error: explanation.error,
    speaking,
    toggleAudio,
  };
}
