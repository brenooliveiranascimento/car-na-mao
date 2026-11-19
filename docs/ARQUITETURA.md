# Arquitetura

## Visão geral

```
Celular (Expo)                    VPS / servidor do órgão (Docker)
┌────────────────────────┐        ┌──────────────────────────────────────────┐
│ SQLite local           │  HTTPS │ API NestJS ── PostgreSQL 16 + PostGIS 3  │
│ - cache de imóvel e    │ ─────► │   │                                      │
│   notificações         │        │   └── Provedor de IA (Gemini ou modelo   │
│ - fila de caminhadas   │        │       aberto hospedado pelo governo)     │
│ GPS + voz do aparelho  │        │ Site Next.js                             │
└────────────────────────┘        └──────────────────────────────────────────┘
```

## Decisões

| Decisão | Motivo |
|---|---|
| PostgreSQL + PostGIS | Sobreposição e áreas calculadas no banco (`ST_Intersection`, `ST_Difference`, área geodésica). Padrão aberto, usado em órgãos públicos. |
| SIRGAS 2000 (EPSG:4674) | Referencial geodésico oficial do Brasil. |
| SQL puro nas migrações | Esquema legível e auditável por qualquer equipe técnica. |
| Fila local de caminhadas | Cada ponto de GPS vai para o disco na hora; o envio usa um id gerado no celular, então reenviar não duplica. |
| Desenho do imóvel em SVG | Mostra declarado x caminhada x sobreposição sem depender de mapas online. |
| Voz do próprio aparelho (TTS) | O áudio funciona offline depois que a explicação foi baixada uma vez. |
| Cache de explicações por conteúdo | Notificações iguais (muito comuns) reaproveitam a mesma resposta e não geram novo custo de IA. |
| IA atrás de `AiProvider` | Trocar Gemini por um modelo aberto é trocar uma classe. Saída validada em JSON. |

## Integrações previstas (fase de aceleração)

- **Meu Imóvel Rural (MIR):** notificações centralizadas e compartilhamento controlado com técnicos de confiança.
- **Sicar / Retificação Dinamizada:** leitura da proposta automática e envio da resposta.
- **Login gov.br.**
- **Bases de referência:** malha fundiária do Incra e MapBiomas.
- **Canais:** WhatsApp e e-mail com o mesmo conteúdo do app.
- **Estados com sistema próprio** (ex.: CEFIR na Bahia): por configuração.
