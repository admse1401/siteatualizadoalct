# 09 · Design System — Auris Toolbox

## Identidade Visual

### Fundo
```css
background: linear-gradient(135deg, #0a1628 0%, #0d2045 50%, #0a1a3a 100%);
```

### Bolhas (Background.tsx)
```css
/* Bolha 1 */  background: #1a4fc4; filter: blur(60px); opacity: 0.35;
/* Bolha 2 */  background: #0f3a8a; filter: blur(60px); opacity: 0.35;
/* Bolha 3 */  background: #2563eb; filter: blur(60px); opacity: 0.35;
```

## Tokens de Cor

| Token | Valor | Uso |
|---|---|---|
| `bg-primary` | `#0a1628` | Background principal |
| `bg-mid` | `#0d2045` | Gradiente fundo |
| `blue-action` | `#2563eb` | Botões, destaques, ações |
| `blue-light` | `#60a5fa` | Nomes, links, badges ativos |
| `text-primary` | `#ffffff` | Títulos, labels |
| `text-secondary` | `rgba(255,255,255,0.4)` | Descrições, metadados |
| `text-muted` | `rgba(255,255,255,0.25)` | Placeholders |
| `text-label` | `rgba(255,255,255,0.35)` | Labels uppercase |
| `border-subtle` | `rgba(255,255,255,0.13)` | Bordas de cards |
| `border-active` | `rgba(96,165,250,0.3)` | Bordas hover/active |
| `glass-bg` | `rgba(255,255,255,0.07)` | Fundo de cards |
| `glass-bg-hover` | `rgba(255,255,255,0.11)` | Fundo hover |

## Glassmorphism — Padrão de Card

```css
background: rgba(255, 255, 255, 0.07);
border: 0.5px solid rgba(255, 255, 255, 0.13);
border-radius: 16px;
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

## Tipografia

| Uso | Tamanho | Peso | Cor |
|---|---|---|---|
| Título de tela | 20px | 700 | #fff |
| Título de seção | 15-16px | 700 | #fff |
| Nome de módulo | 13px | 600 | #fff |
| Corpo/descrição | 11-12px | 400 | #fff/40% |
| Label uppercase | 10-11px | 600 | #fff/30-35% |
| Metadado | 10px | 400 | #fff/35% |

Labels uppercase: `letter-spacing: 1.2–1.4px`, `text-transform: uppercase`

## Botões

### Primário (ação principal)
```css
background: #2563eb;
color: #ffffff;
border-radius: 12px;
padding: 12px 24px;
font-size: 14px;
font-weight: 600;
```

### Secundário (ação suave)
```css
background: rgba(255, 255, 255, 0.07);
border: 0.5px solid rgba(255, 255, 255, 0.13);
color: rgba(255, 255, 255, 0.7);
border-radius: 12px;
```

### Icon Button (header)
```css
width: 36px; height: 36px;
background: rgba(255, 255, 255, 0.07);
border: 0.5px solid rgba(255, 255, 255, 0.12);
border-radius: 10px;
```

## Badges

| Tipo | Background | Cor | Borda |
|---|---|---|---|
| Ativo (live) | `rgba(16,185,129,0.15)` | `#6ee7b7` | `rgba(16,185,129,0.25)` |
| Novo | `rgba(99,102,241,0.2)` | `#a5b4fc` | `rgba(99,102,241,0.3)` |
| Admin | `rgba(168,85,247,0.15)` | `#d8b4fe` | `rgba(168,85,247,0.25)` |
| Erro | `rgba(239,68,68,0.1)` | `rgba(239,68,68,0.9)` | `rgba(239,68,68,0.25)` |
| Info | `rgba(59,130,246,0.12)` | `rgba(255,255,255,0.65)` | `rgba(59,130,246,0.22)` |

## Ícones de Módulo

| Módulo | Ícone (lucide) | Cor | Background |
|---|---|---|---|
| Claims | ShieldCheck | `#93c5fd` | `rgba(59,130,246,0.2)` |
| Signer | FileSignature | `#a5b4fc` | `rgba(99,102,241,0.2)` |
| Calendar | CalendarDays | `#5eead4` | `rgba(20,184,166,0.18)` |
| Admin | Users | `#d8b4fe` | `rgba(168,85,247,0.2)` |

## Animações (motion/react)

```typescript
// Entrada de página
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -12 }}
transition={{ duration: 0.3 }}

// Card hover
whileHover={{ y: -2 }}
whileTap={{ scale: 0.97 }}

// Dropdown
initial={{ opacity: 0, y: -8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.18 }}
```

## Inputs

```css
background: rgba(255, 255, 255, 0.07);
border: 0.5px solid rgba(255, 255, 255, 0.12);
border-radius: 10px;
padding: 12px 16px;
color: #ffffff;
font-size: 14px;
outline: none;

/* Error state */
border-color: rgba(239, 68, 68, 0.5);
```

## Referências de Produto
Notion · Linear · ClickUp · Monday · Jira Cloud · Microsoft Loop

## Regra de Glassmorphism
Glassmorphism é aplicado apenas onde agrega valor visual. Áreas de trabalho (tabelas, formulários complexos) usam fundo sólido para melhor legibilidade. Não aplicar glass em todo lugar só por estética.
