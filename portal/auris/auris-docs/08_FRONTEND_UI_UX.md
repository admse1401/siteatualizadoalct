# 08 · Frontend UI/UX — Auris Toolbox

## Estrutura de Rotas

```
/login                    → Login.tsx (sem Layout)
/                         → Layout.tsx
  /                       → Dashboard.tsx
  /claims                 → ClaimsPage.tsx
  /signer                 → SignerPage.tsx  ✅
  /calendar               → CalendarPage.tsx
  /admin                  → AdminPage.tsx
  /activate?token=xxx     → ActivatePage.tsx  (a criar)
  /forgot-password        → ForgotPasswordPage.tsx  (a criar)
  /reset-password?token=  → ResetPasswordPage.tsx  (a criar)
```

## Componentes Globais

### Layout.tsx
Shell principal que envolve tudo. Responsabilidades:
- Renderiza `<Header>` sempre visível
- Renderiza `<Background>` (bolhas)
- Gerencia painel flutuante de IA (toggle)
- Gerencia painel flutuante de perfil (toggle)
- Mostra `app-greeting-bar` ao entrar em módulo (saudação + lembrete + botão Voltar + chip do módulo)
- Anima transição de rota com `motion/react` (opacity + y, 300ms)

### Header.tsx
- Logo hexagonal + "Auris Toolbox" (Toolbox em #60a5fa)
- Botão IA (Bot icon) → abre painel assistente
- Botão notificações (Bell) + dot azul de badge
- Avatar com iniciais → abre menu de perfil

### Background.tsx
- 3 bolhas abstratas posicionadas absolutas
- Cores: #1a4fc4, #0f3a8a, #2563eb
- blur(60px), opacity 0.35

## Painel de IA
- Dropdown do header, posição `right:4, top:62`
- Largura: 270px
- Estado: placeholder ("IA corporativa — em breve")
- Input de texto + botão enviar
- Fecha ao clicar fora

## Menu de Perfil
- Dropdown do header
- Avatar grande + nome + cargo/setor
- Itens: Meu perfil, Foto de perfil, Alterar senha, Preferências
- Separador + Sair (vermelho)
- Fecha ao clicar fora

## Dashboard
- Sub-label "PORTAL DO COLABORADOR" (caps, #fff/35%, letter-spacing)
- "Olá, [Nome] 👋" (20px, bold, nome em #60a5fa)
- "SEUS APLICATIVOS" (seção label, caps, #fff/30%)
- Grid: `repeat(3, 1fr)`, gap 12px
- Cards: glassmorphism, hover levanta 2px + borda azul

## Cards de Módulo
Cada card:
- Ícone colorido com fundo semi-transparente (40x40, borderRadius 11)
- Nome do módulo (13px, bold, branco)
- Descrição (11px, #fff/40%)
- Badge colorido (status: Ativo/Novo/Admin)
- Linha de brilho no topo (gradiente horizontal transparente)
- Hover: fundo `rgba(255,255,255,0.11)`, borda `rgba(96,165,250,0.3)`

## App Greeting Bar (dentro de módulo)
- Saudação: "Olá, [Nome] 👋"
- Chip com lembrete contextual (bolinha azul + texto)
- Chip com ícone + nome do módulo (lado direito)
- Botão "← Voltar" (volta para dashboard)

## Estado de Loading
- Todos os componentes assíncronos têm loading state
- Usar Loader2 (lucide-react) com animate-spin
- Botões desabilitam durante processamento

## Gerenciamento de Estado (Zustand)
```typescript
// store/authStore.ts  (a criar)
interface AuthState {
  user: User | null
  accessToken: string | null
  permissions: string[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  hasPermission: (permission: string) => boolean
}
```

## Axios Interceptor
```typescript
// lib/api.ts  (a criar)
// Request interceptor: adiciona Authorization header
// Response interceptor: em 401, tenta refresh → retenta → redireciona para /login
```
