# Módulo · Auris Signer

## O que é
Assinatura de documentos PDF em lote com certificado digital ICP-Brasil. Padrão Adobe — fundo transparente, borda azul, layout de duas colunas com dados do certificado.

## Status
- ✅ UI completa implementada
- ✅ Validação de certificado A1 (.p12) com node-forge
- ✅ Posicionamento visual da assinatura (arrastar + redimensionar)
- ✅ Layout de assinatura padrão Adobe (fundo transparente)
- ✅ Suporte a rubrica PNG com canal alfa
- ⚠️ Assinatura digital válida PKCS#7 — em andamento (`@signpdf`)
- ⏳ Backend para persistência e histórico

## Arquivos
```
src/pages/modules/signer/
├── SignerPage.tsx          # Orquestrador dos steps
├── types.ts                # AppStep, CertMethod, CertificateInfo
└── components/
    ├── FileUploader.tsx     # Upload de PDFs + certificado + rubrica
    ├── CertificateValidator.tsx  # Senha do cert, validação node-forge
    └── PdfSigner.tsx        # Editor visual + embed no PDF
```

## Fluxo de uso (4 steps)
```
1. ORIGEM      → Selecionar PDFs + certificado A1 (.p12) + rubrica (opcional)
2. IDENTIDADE  → Informar senha do certificado → validar com node-forge
3. ASSINATURA  → Clicar no PDF para posicionar selo → arrastar/redimensionar
4. CONCLUÍDO   → Download individual ou .zip
```

## Layout do Selo (padrão Adobe)
```
┌──────────────────────────────────────────────────────┐  ← borda azul 0.5px
│  NOME DO ASSINANTE    │  Assinado digitalmente         │
│  (uppercase, bold)    │  por: Nome Sobrenome           │
│                       │  Emissor: AC Certificadora     │
│  CPF: xxx.xxx.xxx-xx  │  Data: DD.MM.YYYY              │
│                       │  HH:MM:SS -03'00'              │
└──────────────────────────────────────────────────────┘
```
- Fundo: transparente (opacity: 0) → não cobre o conteúdo do documento
- Borda: `rgba(0.18, 0.37, 0.82)`, width 0.5px
- Linha divisória vertical a 44% da largura

## Dependências instaladas
```
pdf-lib        # Manipulação e embed do selo no PDF
pdfjs-dist     # Renderização do PDF no canvas
jszip          # Download em lote como .zip
node-forge     # Parse e validação do certificado .p12
@signpdf/signpdf      # Assinatura PKCS#7 válida (em implementação)
@signpdf/signer-p12   # Provider para certificados A1
buffer         # Polyfill para Node.js Buffer no browser
```

## Problema pendente — Assinatura válida
O código atual embute o selo visualmente mas não cria uma assinatura digital válida (PKCS#7/CMS). Para o Adobe Reader marcar como "Assinatura válida" é necessário:
1. Extrair a chave privada do .p12 com node-forge
2. Usar `@signpdf/signpdf` + `@signpdf/signer-p12` para criar a estrutura PKCS#7
3. O processo exige que o PDF seja processado no backend (nunca expor chave privada no browser)

**Solução**: mover o processo de assinatura para o backend NestJS. O frontend envia o PDF + posição do selo + certificado criptografado, o backend assina e retorna o PDF válido.

## Certificado Windows Store
Requer `window.electronAPI.getSystemCertificates()` — disponível apenas em ambiente Electron. No browser, exibe mensagem de incompatibilidade. Planejado para versão desktop.

## Regras de Negócio
- Rubrica deve ser PNG com canal alfa (fundo transparente)
- Certificado A1 (.p12 / .pfx) ou certificado instalado no Windows
- Múltiplos PDFs processados em lote com o mesmo certificado
- Cada PDF recebe um selo independente na mesma posição
