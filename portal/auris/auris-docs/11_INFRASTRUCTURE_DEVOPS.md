# 11 · Infrastructure & DevOps — Auris Toolbox

## Ambientes

| Ambiente | Descrição |
|---|---|
| `development` | Local com Docker Compose |
| `staging` | Pré-produção para testes |
| `production` | Produção na Aliança Tur |

## Docker Compose (dev)

```yaml
services:
  postgres:           # Core DB
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: auris_core
      POSTGRES_USER: auris
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  postgres-claims:
    image: postgres:16
    ports: ["5433:5432"]
    environment:
      POSTGRES_DB: auris_claims

  postgres-signer:
    image: postgres:16
    ports: ["5434:5432"]
    environment:
      POSTGRES_DB: auris_signer

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"

  backend:
    build: .
    ports: ["3000:3000"]
    depends_on: [postgres]
    env_file: .env
```

## Scripts NPM

```json
{
  "dev": "vite",                           // frontend dev server
  "dev:server": "ts-node server/main.ts", // backend dev server
  "build": "tsc && vite build",
  "db:migrate": "prisma migrate dev",
  "db:seed": "ts-node prisma/seed.ts",
  "db:studio": "prisma studio"
}
```

## Setup Inicial (dev)

```bash
# 1. Criar .env a partir do exemplo
cp .env.example .env

# 2. Subir serviços
docker-compose up postgres minio -d

# 3. Criar banco e rodar migrations
npx prisma migrate dev

# 4. Seed: cria admin padrão + roles + permissions
npx ts-node prisma/seed.ts

# 5. Iniciar frontend
npm run dev

# 6. Iniciar backend (outro terminal)
npm run dev:server
```

## Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://auris:senha@localhost:5432/auris_core"
CLAIMS_DATABASE_URL="postgresql://auris:senha@localhost:5433/auris_claims"
SIGNER_DATABASE_URL="postgresql://auris:senha@localhost:5434/auris_signer"

# Auth
JWT_SECRET="segredo_muito_longo_e_aleatorio"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="outro_segredo_longo"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Email (Resend)
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="noreply@aliancatur.com.br"

# App
APP_URL="http://localhost:5173"
API_URL="http://localhost:3000"

# MinIO / S3
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="auris"
```

## CI/CD (a implementar)

```yaml
# Pipeline sugerido
on: [push to main]
jobs:
  test:
    - npm ci
    - npx prisma generate
    - npm run typecheck
    - npm run test

  build:
    - docker build -t auris-toolbox .
    - push to registry

  deploy:
    - pull nova imagem
    - docker-compose up -d
    - npx prisma migrate deploy
    - rollback automático se healthcheck falhar
```

## Monitoramento

- Health check: `GET /health` → retorna status dos serviços
- Logs: estruturados em JSON, centralizados
- Alertas: uptime e erros 5xx
- Backup: dump automático dos bancos diariamente
