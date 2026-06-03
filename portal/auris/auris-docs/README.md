# Auris Toolbox Core

O ecossistema corporativo central da Aliança Tur.

## Pré-requisitos
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (se não usar Docker)

## Como rodar localmente (Com Docker)

1. Crie o arquivo `.env` baseado no `.env.example`
2. Suba o banco de dados e a aplicação:
   ```bash
   docker-compose up -d
   ```
3. Acesse em `http://localhost:3000`

## Como rodar localmente (Sem Docker)

1. Suba o banco de dados (ex: via Docker independente)
   ```bash
   docker run --name auris-postgres -e POSTGRES_USER=auris -e POSTGRES_PASSWORD=auris123 -e POSTGRES_DB=auris_core -p 5432:5432 -d postgres:16
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Gere o Prisma Client:
   ```bash
   npm run postinstall
   ```
4. Rode as migrations e o seed:
   ```bash
   npx prisma migrate dev
   npx tz tsx prisma/seed.ts
   ```
5. Inicie em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## Banco de Dados / Prisma Seed

O projeto já contém um script de seed `prisma/seed.ts`. Rode com:
```bash
npx tsx prisma/seed.ts
```

## Como criar o primeiro usuário via admin

O administrador inicial (`admin@aliancatur.com.br`) é inserido no seed com a senha `Admin@2025`.
Faça login com esta conta, navegue até a tela **Auris Admin** e adicione novos usuários utilizando a interface!

## Estrutura do projeto
Nesta implementação consolidada para o ambiente, usamos:
*   `server/` — Toda a infraestrutura backend NestJS e Prisma.
*   `src/` — Toda a infraestrutura Vite/React.
*   `Dockerfile` - Deploy fullstack unificado.
*   Navegação gerada via React Router com design system glassmorphism e cores oficiais.
