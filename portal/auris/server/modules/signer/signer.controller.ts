import {
  Body, Controller, Get, Header, HttpCode, HttpException,
  HttpStatus, Logger, Post, StreamableFile,
} from '@nestjs/common';
import {
  IsArray, IsNumber, IsOptional, IsString,
  ArrayMinSize, ArrayMaxSize,
} from 'class-validator';
import { SignerService } from './signer.service';

// ─── Request DTO ──────────────────────────────────────────────────────────────

export class SignPdfRequestDto {
  @IsString()
  pdfBase64!: string;

  /** Mode A: P12 file upload */
  @IsString() @IsOptional()
  p12Base64?: string;

  @IsString() @IsOptional()
  p12Password?: string;

  /** Mode B: Windows Certificate Store */
  @IsString() @IsOptional()
  thumbprint?: string;

  @IsString()
  signerName!: string;

  @IsString() @IsOptional()
  cpf?: string;

  @IsString()
  issuer!: string;

  @IsArray() @ArrayMinSize(4) @ArrayMaxSize(4) @IsNumber({}, { each: true })
  widgetRect!: [number, number, number, number];

  @IsString() @IsOptional()
  rubricBase64?: string;

  @IsArray() @IsOptional() @ArrayMinSize(4) @ArrayMaxSize(4) @IsNumber({}, { each: true })
  rubricRect?: [number, number, number, number];

  @IsString() @IsOptional()
  reason?: string;

  @IsString() @IsOptional()
  location?: string;

  @IsString() @IsOptional()
  tsaUrl?: string;
}

// ─── Controller ───────────────────────────────────────────────────────────────

@Controller('signer')
export class SignerController {
  private readonly log = new Logger(SignerController.name);

  constructor(private readonly signerService: SignerService) {}

  /** GET /api/signer/certs — lista certificados do Windows com chave privada */
  @Get('certs')
  async listCerts() {
    try {
      return await this.signerService.listWindowsCerts();
    } catch (err: any) {
      this.log.error('listCerts failed:', err?.message);
      throw new HttpException(err?.message || 'Falha ao listar certificados', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** POST /api/signer/sign — assina PDF com cadeia ICP-Brasil + TSA RFC 3161 */
  @Post('sign')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="signed.pdf"')
  async sign(@Body() dto: SignPdfRequestDto): Promise<StreamableFile> {
    try {
      const signedPdf = await this.signerService.sign({
        pdfBytes:    Buffer.from(dto.pdfBase64, 'base64'),
        p12Bytes:    dto.p12Base64 ? Buffer.from(dto.p12Base64, 'base64') : undefined,
        p12Password: dto.p12Password,
        thumbprint:  dto.thumbprint,
        signerName:  dto.signerName,
        cpf:         dto.cpf,
        issuer:      dto.issuer,
        widgetRect:  dto.widgetRect,
        rubricBytes: dto.rubricBase64 ? Buffer.from(dto.rubricBase64, 'base64') : undefined,
        rubricRect:  dto.rubricRect,
        reason:      dto.reason,
        location:    dto.location,
        tsaUrl:      dto.tsaUrl,
      });
      return new StreamableFile(signedPdf);
    } catch (err: any) {
      this.log.error('sign failed:', err?.message, err?.stack);
      throw new HttpException(err?.message || 'Erro ao assinar PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
