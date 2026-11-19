import { router, useLocalSearchParams } from 'expo-router';
import { Banner, Body, Button, Card, Screen, Title } from '@/components/ui';
import { useSurveyViewModel } from '@/features/survey/useSurveyViewModel';
import { formatHa } from '@/lib/geometry';

export default function SurveyScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const vm = useSurveyViewModel(propertyId);

  const finish = async () => {
    const surveyId = await vm.finish();
    if (surveyId) router.replace({ pathname: '/resultado/[surveyId]', params: { surveyId } });
  };

  return (
    <Screen>
      {vm.phase === 'idle' && (
        <>
          <Title>Como funciona</Title>
          <Card>
            <Body>1. Vá até um canto do seu terreno.</Body>
            <Body>2. Toque em “Começar” e caminhe junto da cerca, dando a volta no terreno.</Body>
            <Body>3. Quando voltar ao ponto de partida, toque em “Terminei”.</Body>
            <Body muted>Funciona sem internet. A caminhada fica guardada no celular e é enviada quando tiver sinal.</Body>
          </Card>
          <Button label="Começar" onPress={() => void vm.start()} />
        </>
      )}

      {vm.phase === 'recording' && (
        <>
          <Title>Caminhando…</Title>
          <Card>
            <Body>Pontos marcados: {vm.pointCount}</Body>
            <Body>Área aproximada: {formatHa(vm.approximateAreaHa)}</Body>
            <Body muted>{vm.accuracy == null ? 'Procurando sinal de GPS…' : vm.accuracy <= 10 ? 'Sinal de GPS bom' : 'Sinal de GPS fraco: vá para um lugar aberto'}</Body>
          </Card>
          <Button label="Terminei" onPress={() => void finish()} disabled={vm.pointCount < 4} hint="Encerra a caminhada e compara com o mapa do CAR" />
        </>
      )}

      {vm.phase === 'sending' && <Body>Comparando sua caminhada com o mapa do CAR…</Body>}

      {vm.phase === 'saved_offline' && (
        <>
          <Banner>Caminhada guardada no celular. Ela será enviada quando houver internet.</Banner>
          <Button label="Voltar ao início" variant="secondary" onPress={() => router.back()} />
        </>
      )}

      {vm.error && vm.phase !== 'saved_offline' && <Banner>{vm.error}</Banner>}
    </Screen>
  );
}
