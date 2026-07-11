# Class Pulse — Frontend

React + TypeScript + Tailwind v4 (tokens em `src/index.css`), Bun + Vite.
Fonte de verdade do produto: `../SCOPE.md`. Tipos da API gerados do contrato
OpenAPI do backend (`bun run gen:api`, backend precisa estar de pé) — nunca
editar `src/api/schema.d.ts` na mão.

- Código em inglês; comentários em inglês e apenas quando necessário.
- Dados: TanStack Query; realtime = polling de 2,5s em `useQuestionsPolling`.
- `src/appConfig.ts` é o único módulo que lê `import.meta.env` (Jest faz stub dele).

## Comandos

```
bun run dev         # http://localhost:5173
bun run test        # Jest
bun run e2e         # Playwright — autocontido: sobe backend (8001, classpulse_test) + Vite (5174)
bun run e2e:headed  # idem, com Chrome visível
bun run lint        # biome check
bun run format      # biome format --write
bun run build
```

## Time de Defesa

- Pre-commit (`.githooks/pre-commit`, instalado pelo `bun install` via `prepare`):
  biome check + jest. Bypass: `git commit --no-verify`.
- E2E nunca toca o banco/servidores de dev; não rodar junto com `pytest` do backend
  (compartilham `classpulse_test`). Porta 8001 presa: `lsof -ti:8001 | xargs kill`.
