# 06 · Database & DER — Auris Toolbox

## Princípio: Banco por Módulo
Core tem seu banco central. Cada módulo tem banco próprio. Integração acontece via JWT/API, nunca via banco compartilhado.

---

## Core Database

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  passwordHash  String
  cargo         String?
  setor         String?
  avatarUrl     String?
  isActive      Boolean   @default(false)   // ativa no primeiro acesso
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userRoles     UserRole[]
  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]
  notifications Notification[]
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique   // ex: "admin", "operacoes", "ti"
  description String?

  userRoles        UserRole[]
  rolePermissions  RolePermission[]
}

model Permission {
  id     String @id @default(uuid())
  action String @unique   // ex: "claims.view", "signer.use", "admin.users"

  rolePermissions RolePermission[]
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  module    String   // "core", "claims", "signer", etc.
  action    String   // "login", "create_claim", "sign_document"
  metadata  Json?    // dados extras da ação
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  body      String
  read      Boolean  @default(false)
  module    String?
  link      String?
  createdAt DateTime @default(now())
}
```

---

## Claims Database

```prisma
model Claim {
  id          String      @id @default(uuid())
  title       String
  description String
  type        String      // tipo de sinistro
  status      ClaimStatus @default(PENDING)
  createdBy   String      // userId do Core
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  files    ClaimFile[]
  history  ClaimHistory[]
  approval Approval?
}

enum ClaimStatus { PENDING APPROVED REJECTED CLOSED }

model ClaimFile {
  id        String @id @default(uuid())
  claimId   String
  claim     Claim  @relation(fields: [claimId], references: [id])
  filename  String
  url       String
  size      Int
  createdAt DateTime @default(now())
}

model ClaimHistory {
  id        String @id @default(uuid())
  claimId   String
  claim     Claim  @relation(fields: [claimId], references: [id])
  action    String
  userId    String
  note      String?
  createdAt DateTime @default(now())
}

model Approval {
  id          String   @id @default(uuid())
  claimId     String   @unique
  claim       Claim    @relation(fields: [claimId], references: [id])
  approvedBy  String?
  rejectedBy  String?
  note        String?
  createdAt   DateTime @default(now())
}
```

---

## Signer Database

```prisma
model Document {
  id          String   @id @default(uuid())
  filename    String
  url         String
  signedUrl   String?
  status      DocStatus @default(PENDING)
  uploadedBy  String   // userId do Core
  createdAt   DateTime @default(now())

  signatures SignatureLog[]
}

enum DocStatus { PENDING SIGNED }

model SignatureLog {
  id          String   @id @default(uuid())
  documentId  String
  document    Document @relation(fields: [documentId], references: [id])
  signedBy    String   // userId do Core
  certIssuer  String
  certName    String
  signedAt    DateTime @default(now())
}
```

---

## Calendar Database

```prisma
model Event {
  id          String   @id @default(uuid())
  title       String
  description String?
  startAt     DateTime
  endAt       DateTime
  createdBy   String
  createdAt   DateTime @default(now())

  participants Participant[]
  reminders    Reminder[]
}

model Participant {
  id      String @id @default(uuid())
  eventId String
  event   Event  @relation(fields: [eventId], references: [id])
  userId  String
}

model Reminder {
  id        String   @id @default(uuid())
  eventId   String
  event     Event    @relation(fields: [eventId], references: [id])
  minutesBefore Int
  sent      Boolean  @default(false)
}
```

---

## Permissões por Módulo

| Permissão | Módulo | Ação |
|---|---|---|
| `claims.view` | Claims | Ver sinistros |
| `claims.create` | Claims | Criar sinistro |
| `claims.edit` | Claims | Editar sinistro |
| `claims.approve` | Claims | Aprovar/rejeitar |
| `signer.use` | Signer | Assinar documentos |
| `calendar.view` | Calendar | Ver calendário |
| `calendar.manage` | Calendar | Criar/editar eventos |
| `admin.users` | Admin | Gerenciar usuários |
| `admin.audit` | Admin | Ver logs de auditoria |
| `admin.settings` | Admin | Configurações globais |
