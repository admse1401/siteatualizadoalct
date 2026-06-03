import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import forge from 'node-forge';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

const _mod  = require('@signpdf/signpdf') as any;
const _inst = _mod.default ?? _mod;
const signpdf: (pdf: Buffer, signer: any) => Promise<Buffer> = _inst.sign.bind(_inst);

// Signer base class required by @signpdf/signpdf for instanceof check
const SignerBase: any = require('@signpdf/utils').Signer;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface WindowsCertInfo {
  thumbprint:   string;
  commonName:   string;
  displayName:  string;
  cpf?:         string;
  issuer:       string;
  notAfter:     string;
  friendlyName?: string;
}

export interface SignPdfDto {
  pdfBytes:      Buffer;
  p12Bytes?:     Buffer;
  p12Password?:  string;
  thumbprint?:   string;
  signerName:    string;
  cpf?:          string;
  issuer:        string;
  widgetRect:    [number, number, number, number];
  rubricBytes?:  Buffer;
  rubricRect?:   [number, number, number, number];
  reason?:       string;
  location?:     string;
  tsaUrl?:       string;
}

// ─── Shared TSA helpers ───────────────────────────────────────────────────────

function _findSignerInfo(p7Asn1: forge.asn1.Asn1): forge.asn1.Asn1 {
  const contentCtx = (p7Asn1.value as forge.asn1.Asn1[])[1];
  const signedData = (contentCtx.value as forge.asn1.Asn1[])[0];
  const sdChildren = signedData.value as forge.asn1.Asn1[];
  for (let i = sdChildren.length - 1; i >= 0; i--) {
    const el = sdChildren[i];
    if (el.tagClass === forge.asn1.Class.UNIVERSAL && el.type === forge.asn1.Type.SET) {
      return (el.value as forge.asn1.Asn1[])[0];
    }
  }
  throw new Error('SignerInfos SET not found');
}

function _extractSignatureBytes(signerInfo: forge.asn1.Asn1): Buffer {
  for (const child of signerInfo.value as forge.asn1.Asn1[]) {
    if (child.tagClass === forge.asn1.Class.UNIVERSAL && child.type === forge.asn1.Type.OCTETSTRING) {
      return Buffer.from(child.value as string, 'binary');
    }
  }
  throw new Error('Signature OCTET STRING not found');
}

function _buildTsaRequest(hash: Buffer): Buffer {
  const sha256AlgId = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OID, false,
      forge.asn1.oidToDer('2.16.840.1.101.3.4.2.1').getBytes()),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.NULL, false, ''),
  ]);
  const nonce = '\x00' + forge.random.getBytesSync(8);
  const req = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.INTEGER,    false, '\x01'),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE,   true, [
      sha256AlgId,
      forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OCTETSTRING, false, hash.toString('binary')),
    ]),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.INTEGER, false, nonce),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.BOOLEAN, false, '\xff'),
  ]);
  return Buffer.from(forge.asn1.toDer(req).getBytes(), 'binary');
}

function _extractTsaToken(tsaResponse: Buffer): Buffer {
  const resp     = forge.asn1.fromDer(forge.util.createBuffer(tsaResponse.toString('binary')));
  const children = resp.value as forge.asn1.Asn1[];
  if (children.length < 2) throw new Error('TSA response missing timeStampToken');
  const code = ((children[0].value as forge.asn1.Asn1[])[0].value as string).charCodeAt(0);
  if (code !== 0 && code !== 1) throw new Error(`TSA error status: ${code}`);
  return Buffer.from(forge.asn1.toDer(children[1]).getBytes(), 'binary');
}

function _embedTsaInSignerInfo(signerInfo: forge.asn1.Asn1, tsaToken: Buffer): void {
  const tsaTokenAsn1 = forge.asn1.fromDer(forge.util.createBuffer(tsaToken.toString('binary')));
  const tsaAttr = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OID, false,
      forge.asn1.oidToDer('1.2.840.113549.1.9.16.2.14').getBytes()),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [tsaTokenAsn1]),
  ]);
  const siChildren  = signerInfo.value as forge.asn1.Asn1[];
  const CONTEXT     = forge.asn1.Class.CONTEXT_SPECIFIC;
  const existingIdx = siChildren.findIndex(c => c.tagClass === CONTEXT && c.type === 1);
  if (existingIdx >= 0) {
    (siChildren[existingIdx].value as forge.asn1.Asn1[]).push(tsaAttr);
  } else {
    siChildren.push(forge.asn1.create(CONTEXT, 1, true, [tsaAttr]));
  }
}

async function attachTimestamp(p7Der: Buffer, tsaUrl: string): Promise<Buffer> {
  const p7Asn1     = forge.asn1.fromDer(forge.util.createBuffer(p7Der.toString('binary')));
  const signerInfo = _findSignerInfo(p7Asn1);
  const rawSig     = _extractSignatureBytes(signerInfo);
  const sigHash    = createHash('sha256').update(rawSig).digest();
  const reqDer     = _buildTsaRequest(sigHash);

  const ac = new AbortController();
  const t  = setTimeout(() => ac.abort(), 10000);
  let tsaToken: Buffer;
  try {
    const res = await fetch(tsaUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/timestamp-query' },
      body: reqDer, signal: ac.signal,
    });
    if (!res.ok) throw new Error(`TSA HTTP ${res.status}`);
    tsaToken = _extractTsaToken(Buffer.from(await res.arrayBuffer()));
  } finally {
    clearTimeout(t);
  }

  _embedTsaInSignerInfo(signerInfo, tsaToken);
  return Buffer.from(forge.asn1.toDer(p7Asn1).getBytes(), 'binary');
}

// ─── P12 Signer (uploaded file) ───────────────────────────────────────────────

class FullChainP12Signer extends SignerBase {
  private readonly log = new Logger('FullChainP12Signer');

  constructor(
    private readonly p12Bytes:  Buffer,
    private readonly password:  string,
    private readonly tsaUrl:    string | null,
  ) { super(); }

  // pdfBuffer = concatenated ByteRange content (what @signpdf passes to sign)
  async sign(pdfBuffer: Buffer, _signingTime?: Date): Promise<Buffer> {
    const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(this.p12Bytes.toString('binary')));
    const p12     = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.password);

    const certBags = [...(p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? [])];
    const keyBags  = [
      ...(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] ?? []),
      ...(p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] ?? []),
    ];

    if (!keyBags.length)  throw new Error('Chave privada não encontrada no P12.');
    if (!certBags.length) throw new Error('Nenhum certificado encontrado no P12.');

    const privateKey  = keyBags[0].key!;
    const signingCert = certBags[0].cert!;
    const chainCerts  = certBags.slice(1).map(b => b.cert).filter((c): c is forge.pki.Certificate => !!c);

    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(pdfBuffer.toString('binary'));
    p7.addCertificate(signingCert);
    for (const cert of chainCerts) p7.addCertificate(cert);
    this.log.log(`Chain: ${1 + chainCerts.length} cert(s)`);

    p7.addSigner({
      key: privateKey, certificate: signingCert,
      digestAlgorithm: forge.pki.oids.sha256,
      authenticatedAttributes: [
        { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
        { type: forge.pki.oids.messageDigest },
        { type: forge.pki.oids.signingTime, value: new Date() as unknown as string },
      ],
    });
    p7.sign({ detached: true });

    let p7Der = Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary');
    this.log.log(`DER before TSA: ${p7Der.length} bytes`);

    if (this.tsaUrl) {
      try   { p7Der = await attachTimestamp(p7Der, this.tsaUrl); this.log.log(`TSA OK: ${p7Der.length} bytes`); }
      catch (err) { this.log.warn(`TSA failed: ${err}`); }
    }

    return p7Der;
  }
}

// ─── Windows Store Signer (non-exportable keys) ───────────────────────────────

/**
 * Signs using .NET System.Security.Cryptography.Pkcs.SignedCms via PowerShell.
 * Works with keys marked as non-exportable in the Windows Certificate Store.
 * The signing happens inside the Windows CryptoAPI — the private key never leaves.
 */
class WindowsStoreSigner extends SignerBase {
  private readonly log = new Logger('WindowsStoreSigner');

  constructor(
    private readonly thumbprint: string,
    private readonly tsaUrl:     string | null,
  ) { super(); }

  // pdfBuffer = concatenated ByteRange content (what @signpdf passes to sign)
  async sign(pdfBuffer: Buffer, _signingTime?: Date): Promise<Buffer> {
    const ts       = Date.now();
    const dataPath = join(tmpdir(), `auris_d_${ts}.bin`);
    const sigPath  = join(tmpdir(), `auris_s_${ts}.der`);

    await writeFile(dataPath, pdfBuffer);

    // PowerShell uses SignedCms to produce detached PKCS#7 DER.
    // Use ::new() constructor syntax to avoid PowerShell overload-resolution bugs with New-Object.
    // EndCertOnly avoids WholeChain CRL-download failures on machines without internet access.
    const thumb = this.thumbprint.replace(/[^0-9A-Fa-f]/g, '');
    const script = [
      `$ErrorActionPreference = 'Stop'`,
      `Add-Type -AssemblyName System.Security`,
      `$cert = Get-Item 'Cert:\\CurrentUser\\My\\${thumb}'`,
      `$data = [byte[]][IO.File]::ReadAllBytes('${dataPath}')`,
      `$oid  = [System.Security.Cryptography.Oid]::new('1.2.840.113549.1.7.1')`,
      `$ci   = [System.Security.Cryptography.Pkcs.ContentInfo]::new($oid, $data)`,
      `$cms  = [System.Security.Cryptography.Pkcs.SignedCms]::new($ci, $true)`,
      `$sgr  = [System.Security.Cryptography.Pkcs.CmsSigner]::new($cert)`,
      `$sgr.DigestAlgorithm = [System.Security.Cryptography.Oid]::new('2.16.840.1.101.3.4.2.1')`,
      `$sgr.IncludeOption = [System.Security.Cryptography.X509Certificates.X509IncludeOption]::EndCertOnly`,
      `$cms.ComputeSignature($sgr, $true)`,
      `[IO.File]::WriteAllBytes('${sigPath}', $cms.Encode())`,
    ].join('; ');

    const encoded = Buffer.from(script, 'utf16le').toString('base64');

    let execErr: Error | null = null;
    try {
      await execAsync(`powershell.exe -NonInteractive -EncodedCommand ${encoded}`, { timeout: 60000 });
    } catch (err: any) {
      execErr = err;
    } finally {
      await unlink(dataPath).catch(() => {});
    }

    let p7Der: Buffer;
    try {
      p7Der = await readFile(sigPath);
      await unlink(sigPath).catch(() => {});
    } catch {
      // execErr.stderr has the raw PowerShell error; .message starts with "Command failed: powershell..."
      const stderr: string = (execErr as any)?.stderr ?? '';
      const msg = stderr.replace(/#<\s*CLIXML[\s\S]*/i, '').trim()
        || execErr?.message?.split('\n').filter((l: string) => l && !l.startsWith('Command failed') && !l.includes('-EncodedCommand')).slice(-5).join(' ').trim()
        || 'PowerShell não gerou a assinatura.';
      throw new Error(msg);
    }

    this.log.log(`SignedCms DER: ${p7Der.length} bytes`);

    if (this.tsaUrl) {
      try   { p7Der = await attachTimestamp(p7Der, this.tsaUrl); this.log.log(`TSA OK: ${p7Der.length} bytes`); }
      catch (err) { this.log.warn(`TSA failed: ${err}`); }
    }

    return p7Der;
  }
}

// ─── SignerService ────────────────────────────────────────────────────────────

@Injectable()
export class SignerService {
  private readonly log = new Logger(SignerService.name);

  private extractCN(dn: string): string {
    const m = dn?.match(/CN=([^,]+)/);
    return m ? m[1].trim() : (dn || '');
  }

  async listWindowsCerts(): Promise<WindowsCertInfo[]> {
    const script = [
      `Get-ChildItem Cert:\\CurrentUser\\My`,
      `| Where-Object { $_.HasPrivateKey }`,
      `| Select-Object @{N='thumbprint';E={$_.Thumbprint}},@{N='subject';E={$_.Subject}},@{N='issuer';E={$_.Issuer}},@{N='notAfter';E={$_.NotAfter.ToString('o')}},@{N='friendlyName';E={$_.FriendlyName}}`,
      `| ConvertTo-Json -Compress`,
    ].join(' ');

    const encoded = Buffer.from(script, 'utf16le').toString('base64');
    const { stdout } = await execAsync(
      `powershell.exe -NonInteractive -EncodedCommand ${encoded}`,
      { timeout: 15000 },
    );

    const raw = stdout.trim();
    if (!raw || raw === 'null') return [];
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [parsed];

    return arr.map((c: any) => {
      const cn    = this.extractCN(c.subject ?? '');
      const parts = cn.split(':');
      return {
        thumbprint:   (c.thumbprint ?? '').toUpperCase(),
        commonName:   cn,
        displayName:  parts[0].trim(),
        cpf:          parts[1]?.trim() || undefined,
        issuer:       this.extractCN(c.issuer ?? ''),
        notAfter:     c.notAfter ?? '',
        friendlyName: c.friendlyName || undefined,
      } as WindowsCertInfo;
    });
  }

  async sign(dto: SignPdfDto): Promise<Buffer> {
    const {
      pdfBytes,
      signerName, cpf, issuer,
      widgetRect, rubricBytes, rubricRect,
      reason   = 'Assinatura Digital ICP-Brasil',
      location = 'Brasil',
      tsaUrl   = process.env['TSA_URL'] ?? 'http://freetsa.org/tsr',
    } = dto;

    const [sx, sy, ex, ey] = widgetRect;
    const sw = ex - sx;
    const sh = ey - sy;

    // 1. Draw visual stamp
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page   = pdfDoc.getPages()[0];
    const fName  = sh * 0.155;
    const fDet   = sh * 0.115;

    page.drawRectangle({ x: sx, y: sy, width: sw, height: sh,
      color: rgb(1,1,1), opacity: 0, borderColor: rgb(0.18,0.37,0.82), borderWidth: 0.5, borderOpacity: 0.75 });
    page.drawLine({
      start: { x: sx + sw*0.44, y: sy + sh*0.08 }, end: { x: sx + sw*0.44, y: sy + sh*0.92 },
      thickness: 0.4, color: rgb(0.18,0.37,0.82), opacity: 0.35,
    });

    const nameLines = signerName.match(/.{1,18}(\s|$)/g) ?? [signerName];
    let leftY = sy + sh * 0.83;
    nameLines.slice(0, 2).forEach(line => {
      page.drawText(line.trim(), { x: sx+4, y: leftY, size: fName, color: rgb(0,0,0) });
      leftY -= fName * 1.25;
    });
    if (cpf) page.drawText(cpf, { x: sx+4, y: sy+sh*0.1, size: fDet, color: rgb(0.2,0.2,0.2) });

    const now  = new Date();
    const col2 = sx + sw * 0.46;
    const issuerShort = issuer.split(':')[0].substring(0, 22);
    ([
      { text: 'Assinado digitalmente',                               y: sy+sh*0.86 },
      { text: `por: ${signerName.split(' ').slice(0,2).join(' ')}`,  y: sy+sh*0.72 },
      { text: `Emissor: ${issuerShort}`,                             y: sy+sh*0.56 },
      { text: `Data: ${now.toLocaleDateString('pt-BR').replace(/\//g,'.')}`, y: sy+sh*0.40 },
      { text: `${now.toLocaleTimeString('pt-BR')} -03'00'`,          y: sy+sh*0.24 },
    ] as { text: string; y: number }[]).forEach(({ text, y }) =>
      page.drawText(text, { x: col2, y, size: fDet, color: rgb(0.1,0.1,0.1) }),
    );

    if (rubricBytes && rubricRect) {
      const [rx, ry, rex, rey] = rubricRect;
      const img = await pdfDoc.embedPng(rubricBytes);
      page.drawImage(img, { x: rx, y: ry, width: rex-rx, height: rey-ry, opacity: 0.85 });
    }

    // 2. Placeholder
    pdflibAddPlaceholder({
      pdfDoc, reason,
      contactInfo: `${signerName}${cpf ? ':'+cpf : ''}`,
      name: signerName, location, signatureLength: 32768,
      widgetRect: [sx, sy, sx+sw, sy+sh],
    });
    const pdfWithPlaceholder = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));

    // 3. Sign
    this.log.log(`Signing — TSA: ${tsaUrl}, thumbprint: ${dto.thumbprint ?? 'P12'}`);

    let signer: FullChainP12Signer | WindowsStoreSigner;

    if (dto.thumbprint) {
      signer = new WindowsStoreSigner(dto.thumbprint, tsaUrl);
    } else if (dto.p12Bytes && dto.p12Password != null) {
      signer = new FullChainP12Signer(dto.p12Bytes, dto.p12Password, tsaUrl);
    } else {
      throw new Error('Forneça thumbprint (Windows Store) ou p12Base64 + p12Password.');
    }

    const signed = await signpdf(pdfWithPlaceholder, signer);
    this.log.log(`Signed: ${signed.length} bytes`);
    return signed;
  }
}
