# 01 · Product Vision — Auris Toolbox

## Problema que resolve
Sistemas corporativos isolados criam experiências fragmentadas: múltiplos logins, múltiplas interfaces, múltiplas formas de gerenciar acesso. O colaborador perde tempo, o admin perde controle.

## Solução
Um único portal onde todos os sistemas da Aliança Tur vivem integrados. Login único, permissões centralizadas, experiência unificada.

## Conceito Fundamental — O que NÃO é
- ❌ Não é uma página com links para sistemas externos
- ❌ Não abre novas abas ao entrar em módulos
- ❌ Não tem autenticação separada por módulo
- ❌ Não tem visual diferente por módulo

## O que É
- ✅ SPA (Single Page Application) — navegação sem reload
- ✅ Header sempre visível em qualquer módulo
- ✅ Transições fluidas: dashboard → módulo → dashboard
- ✅ Saudação personalizada ("Olá, João da Silva") em todas as telas
- ✅ Dashboard montado dinamicamente pelas permissões do usuário
- ✅ Cards desaparecem ao entrar em módulo — foco total

## Comportamento ao abrir um módulo
1. Clique no card no dashboard
2. Cards somem com transição suave
3. Header permanece fixo
4. Saudação sobe para a barra do módulo
5. Lembrete contextual aparece ao lado da saudação
6. Botão "Voltar" retorna ao dashboard com animação

## Objetivo Final
> "Como construir o Auris Toolbox Core para que qualquer ferramenta futura seja integrada nativamente ao ecossistema sem criar sistemas isolados, mantendo experiência unificada, permissões centralizadas, autenticação única, escalabilidade e crescimento sustentável por muitos anos?"

Quando o Core estiver pronto, cada novo sistema nasce como módulo já conectado:
- O colaborador faz login uma única vez
- Acessa tudo que seu perfil permite
- Nunca percebe que está em sistemas diferentes
- O admin gerencia tudo de um único lugar
- Novos módulos entram sem reestruturar nada
