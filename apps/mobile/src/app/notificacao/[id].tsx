import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Banner, Body, Button, Card, Loading, Screen, Title } from '@/components/ui';
import { useNotificationViewModel } from '@/features/notifications/useNotificationViewModel';
import { colors, font } from '@/lib/theme';
import { KIND_LABEL } from '@/lib/types';

export default function NotificationScreen() {
  const { id, propertyId } = useLocalSearchParams<{ id: string; propertyId: string }>();
  const vm = useNotificationViewModel(id, propertyId);

  if (vm.loading) return <Screen><Loading label="Preparando a explicação…" /></Screen>;
  if (vm.error || !vm.explanation) {
    return (
      <Screen>
        <Banner>Não conseguimos explicar esta notificação agora. Conecte-se à internet e tente de novo.</Banner>
      </Screen>
    );
  }

  const { explanation, disclaimer } = vm.explanation;
  const isOverlap = vm.notification?.kind === 'overlap';

  return (
    <Screen>
      {vm.notification && <Title>{KIND_LABEL[vm.notification.kind]}</Title>}

      <Button
        label={vm.speaking ? 'Parar o áudio' : 'Ouvir a explicação'}
        onPress={vm.toggleAudio}
        hint="Lê a explicação em voz alta"
      />

      <Card>
        <Text style={{ fontSize: font.title, fontWeight: '700', color: colors.text }}>{explanation.summary}</Text>
        {explanation.deadline && <Text style={{ fontSize: font.body, color: colors.warning, fontWeight: '700' }}>Prazo: {explanation.deadline}</Text>}
      </Card>

      <Card>
        <Title>O que fazer</Title>
        {explanation.steps.map((step, i) => (
          <View key={step} style={{ flexDirection: 'row', gap: 8 }}>
            <Body>{i + 1}.</Body>
            <View style={{ flex: 1 }}>
              <Body>{step}</Body>
            </View>
          </View>
        ))}
      </Card>

      {explanation.documents.length > 0 && (
        <Card>
          <Title>Documentos para separar</Title>
          {explanation.documents.map((d) => (
            <Body key={d}>• {d}</Body>
          ))}
        </Card>
      )}

      {isOverlap && (
        <Button
          label="Caminhar pelo limite agora"
          onPress={() => router.push({ pathname: '/coleta', params: { propertyId } })}
          hint="Mostra se o seu limite real bate com o mapa do CAR"
        />
      )}

      <Card>
        <Body muted>Base legal: {explanation.sources.join('; ')}</Body>
        <Body muted>{disclaimer}</Body>
        {vm.notification && <Body muted>Texto original: {vm.notification.originalText}</Body>}
      </Card>
    </Screen>
  );
}
