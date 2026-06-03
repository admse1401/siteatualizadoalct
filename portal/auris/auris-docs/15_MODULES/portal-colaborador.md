# Módulo · Portal do Colaborador (Core Shell)

## O que é
O shell que envolve todos os módulos. Não é um módulo em si — é a infraestrutura visual e de navegação do ecossistema.

## Componentes implementados
- ✅ `Layout.tsx` — shell principal com header, painéis flutuantes, greeting bar
- ✅ `Header.tsx` — logo, IA, notificações, avatar
- ✅ `Background.tsx` — bolhas glassmorphism
- ✅ `Dashboard.tsx` — grid de cards

## Rotas
```
/         → Dashboard (cards dos módulos)
/login    → Tela de login
```

## Comportamento de navegação
- Entrar em módulo: `app-greeting-bar` aparece, cards do dashboard somem
- Sair do módulo: botão "Voltar" → animação de retorno ao dashboard
- Header sempre visível em qualquer rota

## Estado de autenticação (a implementar)
- Zustand `authStore` com user, permissions, tokens
- PrivateRoute protegendo todas as rotas exceto /login
- Dashboard monta cards dinamicamente via `hasPermission()`

## Painéis flutuantes
- **IA**: dropdown do header com input de texto (placeholder por enquanto)
- **Perfil**: dropdown com avatar, menu de ações, logout

## Próximos passos
1. Implementar authStore (Zustand)
2. Conectar saudação ao nome real do usuário
3. Conectar badge de notificações à API
4. Implementar PrivateRoute
