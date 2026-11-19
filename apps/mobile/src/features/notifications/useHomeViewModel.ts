import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { api } from '@/lib/api';
import { fetchWithCache } from '@/lib/db';
import { usePendingSurveys } from '@/features/survey/surveyStore';

export function useHomeViewModel() {
  const db = useSQLiteContext();

  const property = useQuery({
    queryKey: ['property', 'demo'],
    queryFn: () => fetchWithCache(db, 'property:demo', api.demoProperty),
  });

  const propertyId = property.data?.data.id;
  const notifications = useQuery({
    queryKey: ['notifications', propertyId],
    enabled: Boolean(propertyId),
    queryFn: () => fetchWithCache(db, `notifications:${propertyId}`, () => api.notifications(propertyId!)),
  });

  const pending = usePendingSurveys();

  return {
    property: property.data?.data,
    notifications: notifications.data?.data ?? [],
    offline: Boolean(property.data?.offline || notifications.data?.offline),
    loading: property.isLoading || notifications.isLoading,
    error: property.error ?? notifications.error,
    refresh: () => Promise.all([property.refetch(), notifications.refetch(), pending.refresh()]),
    pending,
  };
}
