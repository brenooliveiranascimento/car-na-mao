import { AiProvider } from './ai.provider';
import { Explanation, NotificationContext } from './explanation';

/**
 * Deterministic explanations per notification kind. Lets the prototype run without any
 * API key and keeps tests reproducible.
 */
export class MockProvider implements AiProvider {
  readonly name = 'mock';
  readonly model = 'template-v1';

  async explainNotification(ctx: NotificationContext): Promise<Explanation> {
    const deadline = ctx.dueDate ? `Até ${ctx.dueDate}` : null;
    if (ctx.kind === 'overlap') {
      return {
        summary: 'O mapa do seu imóvel no CAR está passando por cima do mapa de um vizinho. É preciso mostrar qual é o limite certo.',
        steps: [
          'Caminhe pelo limite do seu terreno com o celular ligado no aplicativo, principalmente no lado do vizinho.',
          'Se o limite que você caminhou for diferente do mapa, corrija o desenho no CAR.',
          'Se o mapa estiver certo, junte documentos que mostram que a área é sua.',
          'Converse com o vizinho: os dois mapas precisam bater.',
        ],
        documents: ['Escritura, contrato ou documento de posse', 'Recibo do CAR', 'Documento de identidade (RG e CPF)'],
        deadline,
        sources: ['Lei nº 12.651/2012, art. 29 (Cadastro Ambiental Rural)', 'Decreto nº 7.830/2012'],
        audioScript:
          'Seu Raimundo, o mapa do seu sítio no CAR está encostando no mapa do vizinho. Vamos caminhar juntos pela cerca com o celular para ver qual é o limite certo. Depois, a gente corrige o mapa ou junta os documentos da sua terra. Você tem até a data da notificação para responder.',
      };
    }
    if (ctx.kind === 'legal_reserve') {
      return {
        summary: 'A área de mata que você declarou como Reserva Legal ficou menor do que a lei pede para a sua região.',
        steps: [
          'Confira no mapa onde está a mata nativa do seu imóvel.',
          'Veja se existe mata que não foi marcada como Reserva Legal e inclua no cadastro.',
          'Imóveis pequenos (até 4 módulos fiscais) podem ter regra especial: confirme com o órgão estadual ou o sindicato rural.',
        ],
        documents: ['Recibo do CAR', 'Mapa ou croqui do imóvel'],
        deadline,
        sources: ['Lei nº 12.651/2012, art. 12 (percentuais de Reserva Legal)', 'Lei nº 12.651/2012, art. 67 (imóveis com até 4 módulos fiscais)'],
        audioScript:
          'A lei pede que uma parte do seu imóvel fique com mata nativa, a Reserva Legal. O que foi marcado no seu cadastro ficou abaixo do mínimo. Como seu imóvel é pequeno, pode existir uma regra especial. Confira a mata no mapa e, se tiver dúvida, procure o sindicato rural.',
      };
    }
    return {
      summary: 'O órgão ambiental pediu uma correção no seu CAR.',
      steps: ['Leia com calma o que foi pedido.', 'Procure o órgão estadual, o sindicato rural ou a extensão rural se tiver dúvida.'],
      documents: ['Recibo do CAR'],
      deadline,
      sources: ['Lei nº 12.651/2012'],
      audioScript: 'O órgão ambiental pediu uma correção no seu cadastro. Se tiver dúvida, procure o sindicato rural.',
    };
  }
}
