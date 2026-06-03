/**
 * Compila server/ → dist-server/ usando transpileModule do TypeScript.
 * Processa um arquivo por vez — sem carregar todos os tipos na memória.
 * Equivalente ao ts-node --transpileOnly, sem depender do binário esbuild.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

function findTs(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...findTs(full));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) result.push(full);
  }
  return result;
}

const serverDir = new URL('../server', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const outDir    = new URL('../dist-server', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const files = findTs(serverDir);

for (const file of files) {
  const source = readFileSync(file, 'utf-8');

  const { outputText } = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module:                  ts.ModuleKind.CommonJS,
      target:                  ts.ScriptTarget.ES2022,
      experimentalDecorators:  true,
      emitDecoratorMetadata:   true,  // necessário para o DI do NestJS
      esModuleInterop:         true,
      allowSyntheticDefaultImports: true,
      sourceMap:               false,
    },
  });

  const rel     = relative(serverDir, file);
  const outFile = join(outDir, rel).replace(/\.ts$/, '.js');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, outputText);
}

// dist-server/ precisa declarar CommonJS para o Node não interpretar como ESM
// (o package.json raiz tem "type":"module")
writeFileSync(join(outDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

console.log(`✓ Compilados ${files.length} arquivos → dist-server/`);
