import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrate } from '@/lib/db';
import { colors } from '@/lib/theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } });

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="car-na-mao.db" onInit={migrate}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { fontSize: 20, fontWeight: '700', color: colors.text },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'CAR na Mão' }} />
          <Stack.Screen name="notificacao/[id]" options={{ title: 'Entenda a notificação' }} />
          <Stack.Screen name="coleta/index" options={{ title: 'Caminhar pelo limite' }} />
          <Stack.Screen name="resultado/[surveyId]" options={{ title: 'Resultado da caminhada' }} />
        </Stack>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}
