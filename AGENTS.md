# Guia para agentes de código

Monorepo com três projetos independentes (cada um com seu `package.json` e lockfile; sem workspaces):

- `apps/mobile` — Expo SDK 58 + Expo Router (rotas em `src/app/`). Padrão MVVM: telas em `src/app`, view models em `src/features/*/use*ViewModel.ts`, estado de servidor com React Query, persistência local em SQLite (`src/lib/db.ts`). Use `npx expo install` para dependências. A API do Expo muda a cada SDK: consulte https://docs.expo.dev/versions/v58.0.0/ antes de usar uma API.
- `apps/api` — NestJS 11 + `pg` (SQL puro) + PostGIS. Migrações em `apps/api/migrations/*.sql` (nunca edite uma migração já aplicada; crie a próxima). Toda conta geográfica fica no PostGIS, em SIRGAS 2000 (EPSG:4674).
- `apps/web` — Next.js 16 (App Router, `output: "standalone"`). Leia `apps/web/AGENTS.md`.

Regras:
- Código e comentários em inglês; textos para o usuário e documentação em português, em linguagem simples.
- Nunca commitar segredos. `.env` fica fora do git.
- A IA só fala por meio de `AiProvider` (`apps/api/src/ai`). A saída precisa passar em `parseExplanation`. Nunca deixe a IA "decidir" pela regularização: quem decide é o órgão estadual.
- Antes de concluir: `npm run typecheck` e `npm test` na raiz.
- Dados de demonstração são fictícios e devem continuar marcados como tal.
