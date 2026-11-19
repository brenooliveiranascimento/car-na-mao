# CAR na Mão

**O CAR explicado e resolvido pelo celular, até onde não tem sinal.**

Cerca de 600 mil cadastros do Cadastro Ambiental Rural (CAR) já analisados aguardam resposta do produtor, e mais de 80% da base é de pequenos imóveis. O CAR na Mão é um conjunto de módulos em código aberto que ajuda o pequeno produtor a entender e responder as notificações do CAR:

1. **Entende a notificação:** cada pendência vira uma explicação curta, em linguagem simples e em áudio, com o que fazer, os documentos e o prazo.
2. **Caminha pelo limite:** sem internet, o produtor percorre a cerca com o celular e o GPS registra o limite real do terreno.
3. **Responde com segurança:** a caminhada é comparada com o mapa declarado e com os imóveis vizinhos (PostGIS), mostrando a sobreposição e o caminho mais provável: corrigir o mapa ou juntar documentos.

Quem analisa e decide continua sendo o órgão estadual. A ferramenta orienta e organiza a resposta.

> Projeto inscrito no **InovaCAR — Soluções para o futuro do Cadastro Ambiental Rural (Ciclo 1)**, Desafio 1. Os dados de demonstração são fictícios.

## Estrutura

```
car-na-mao/
├── apps/
│   ├── mobile/   App do produtor (Expo / React Native). Roda no celular, fora do Docker.
│   ├── api/      API (NestJS + PostgreSQL/PostGIS). Docker.
│   └── web/      Site do projeto (Next.js). Docker.
├── docker-compose.yml        Desenvolvimento local (banco + API + site)
├── docker-compose.prod.yml   Produção na VPS (banco + API + site)
├── scripts/                  dev-mobile.sh, deploy.sh
└── docs/                     ARQUITETURA.md, DEPLOY.md
```

## Rodando localmente

Pré-requisitos: Docker, Node.js 22 e o app **Expo Go** no celular (mesma rede Wi-Fi do computador).

```bash
npm run setup     # instala as dependências dos três projetos
npm run dev       # sobe banco + API + site no Docker e o Expo do app, juntos
npm run db:seed   # (outro terminal, uma vez) cria o imóvel e as notificações de demonstração
```

- API: http://localhost:3000/health
- Site: http://localhost:3001
- App: escaneie o QR code do Expo com o celular.

Sem chave de IA, a API usa respostas-modelo (`AI_PROVIDER=mock`). Para explicações geradas pelo Gemini, crie um `.env` a partir do `.env.example` com `AI_PROVIDER=gemini` e `GEMINI_API_KEY`.

## API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/health` | Status da API e versão do PostGIS |
| GET | `/v1/properties/demo` | Imóvel de demonstração |
| GET | `/v1/properties/:id/notifications` | Notificações do imóvel |
| POST | `/v1/notifications/:id/explanation` | Explicação em linguagem simples (com cache por conteúdo) |
| POST | `/v1/surveys` | Recebe a caminhada (idempotente) e devolve a análise |
| GET | `/v1/surveys/:id/analysis` | Área declarada x caminhada x vizinhos |

## Princípios

- **Código aberto** (Apache 2.0) e **sem dependência de fornecedor**: tudo roda com `docker compose` em qualquer servidor, inclusive na infraestrutura do governo.
- **Dentro do ecossistema oficial:** pensado para funcionar com o Meu Imóvel Rural e o Sicar, sem app paralelo.
- **Offline primeiro:** dados e caminhadas ficam no celular e sincronizam quando houver sinal.
- **IA substituível e ancorada em fontes oficiais:** o provedor fica atrás de uma interface; as respostas citam a base legal e nunca decidem pelo órgão.
- **Acessível:** textos curtos, áudio, botões grandes e alto contraste (eMAG e WCAG 2.2 AA como meta).

## Licença

[Apache License 2.0](LICENSE).
