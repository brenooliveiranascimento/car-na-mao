import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { View } from 'react-native';
import { AreaPreview } from '@/components/AreaPreview';
import { Body, Card, Loading, Screen, Title } from '@/components/ui';
import { loadAnalysis } from '@/features/survey/surveyStore';
import { formatHa, outerRings } from '@/lib/geometry';
import { colors } from '@/lib/theme';
import type { NeighbourOverlap } from '@/lib/types';

const SUGGESTION: Record<NeighbourOverlap['suggestion'], string> = {
  correct_boundary: 'Pela sua caminhada, o mapa do CAR está avançando no terreno do vizinho. O caminho mais provável é corrigir o desenho do limite.',
  gather_documents: 'Sua caminhada também passa pela área em disputa. Junte os documentos que mostram que essa área é sua e converse com o vizinho.',
  talk_to_neighbour: 'Há uma diferença pequena com o vizinho. Vale conversar com ele para os dois mapas baterem.',
};

export default function ResultScreen() {
  const { surveyId } = useLocalSearchParams<{ surveyId: string }>();
  const db = useSQLiteContext();
  const { data: analysis, isLoading } = useQuery({ queryKey: ['analysis', surveyId], queryFn: () => loadAnalysis(db, surveyId) });

  if (isLoading) return <Screen><Loading /></Screen>;
  if (!analysis) return <Screen><Body>Resultado ainda não disponível. Envie a caminhada quando tiver internet.</Body></Screen>;

  const overlapRings = analysis.neighbours.flatMap((n) => outerRings(n.declaredOverlap));

  return (
    <Screen>
      <AreaPreview
        layers={[
          { label: 'mapa do CAR em verde', color: colors.declared, rings: outerRings(analysis.declaredArea) },
          { label: 'sua caminhada em azul tracejado', color: colors.surveyed, rings: outerRings(analysis.surveyedArea), dashed: true, fillOpacity: 0.05 },
          { label: 'sobreposição com vizinho em vermelho', color: colors.overlap, rings: overlapRings, fillOpacity: 0.45 },
        ]}
      />
      <View style={{ gap: 4 }}>
        <Body>Verde: mapa declarado no CAR ({formatHa(analysis.declaredAreaHa)})</Body>
        <Body>Azul tracejado: sua caminhada ({formatHa(analysis.surveyedAreaHa)})</Body>
        {overlapRings.length > 0 && <Body>Vermelho: área que também está no mapa do vizinho</Body>}
      </View>

      {analysis.neighbours.length === 0 ? (
        <Card>
          <Title>Nenhuma sobreposição encontrada</Title>
          <Body>O limite que você caminhou não entra no mapa de nenhum vizinho.</Body>
        </Card>
      ) : (
        analysis.neighbours.map((n) => (
          <Card key={n.propertyId}>
            <Title>Sobreposição com {n.name}</Title>
            <Body>No mapa do CAR: {formatHa(n.declaredOverlapHa)} em comum com o vizinho.</Body>
            <Body>Na sua caminhada: {formatHa(n.surveyedOverlapHa)} em comum.</Body>
            <Body>{SUGGESTION[n.suggestion]}</Body>
          </Card>
        ))
      )}

      <Card>
        <Body muted>
          Precisão média do GPS: {analysis.accuracyAvgM == null ? 'não informada' : `${Math.round(analysis.accuracyAvgM)} m`}. Esta comparação ajuda a
          responder a notificação; quem analisa e decide é o órgão ambiental do seu estado.
        </Body>
      </Card>
    </Screen>
  );
}
