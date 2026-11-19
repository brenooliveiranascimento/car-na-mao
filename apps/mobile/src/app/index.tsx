import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Banner, Body, Button, Card, Loading, Screen, Title } from '@/components/ui';
import { useHomeViewModel } from '@/features/notifications/useHomeViewModel';
import { formatHa } from '@/lib/geometry';
import { colors, font, space } from '@/lib/theme';
import { KIND_LABEL } from '@/lib/types';

export default function HomeScreen() {
  const vm = useHomeViewModel();

  if (vm.loading) return <Screen><Loading label="Buscando seu imóvel…" /></Screen>;
  if (vm.error || !vm.property) {
    return (
      <Screen>
        <Banner>Não foi possível carregar seu imóvel. Verifique a internet e tente de novo.</Banner>
        <Button label="Tentar de novo" onPress={() => void vm.refresh()} />
      </Screen>
    );
  }

  const { property } = vm;
  return (
    <Screen>
      {vm.offline && <Banner>Você está sem internet. Mostrando as últimas informações salvas no celular.</Banner>}

      <Card>
        <Title>{property.name}</Title>
        <Body muted>
          {property.municipality}/{property.state} · {formatHa(property.declaredAreaHa)}
        </Body>
        <Body muted>CAR {property.carCode}</Body>
      </Card>

      {vm.pending.items.length > 0 && (
        <Card>
          <Body>
            {vm.pending.items.length === 1 ? '1 caminhada guardada' : `${vm.pending.items.length} caminhadas guardadas`} esperando internet para enviar.
          </Body>
          <Button label="Enviar agora" variant="secondary" onPress={() => void vm.pending.syncAll()} />
        </Card>
      )}

      <Title>Pendências do seu CAR</Title>
      {vm.notifications.length === 0 && <Body>Nenhuma pendência. Seu cadastro está em dia.</Body>}
      {vm.notifications.map((n) => (
        <Pressable
          key={n.id}
          accessibilityRole="button"
          accessibilityLabel={`${KIND_LABEL[n.kind]}. ${n.dueDate ? `Prazo ${formatDate(n.dueDate)}` : ''}. Toque para entender.`}
          onPress={() => router.push({ pathname: '/notificacao/[id]', params: { id: n.id, propertyId: property.id } })}
        >
          <Card>
            <Text style={{ fontSize: font.body, fontWeight: '700', color: colors.text }}>{KIND_LABEL[n.kind]}</Text>
            {n.dueDate && <Text style={{ fontSize: font.body, color: colors.warning }}>Responder até {formatDate(n.dueDate)}</Text>}
            <View style={{ marginTop: space.xs }}>
              <Text style={{ fontSize: font.body, color: colors.primary, fontWeight: '700' }}>Entender o que fazer ›</Text>
            </View>
          </Card>
        </Pressable>
      ))}

      <Button
        label="Caminhar pelo limite do imóvel"
        variant="secondary"
        hint="Registra com o GPS o limite real do terreno, mesmo sem internet"
        onPress={() => router.push({ pathname: '/coleta', params: { propertyId: property.id } })}
      />
    </Screen>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
