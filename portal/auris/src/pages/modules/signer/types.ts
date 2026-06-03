
export interface CertificateInfo {
  commonName: string;
  organization?: string;
  expiryDate: Date;
  issuer: string;
  thumbprint?: string;
  p12Buffer?: ArrayBuffer;
  p12Password?: string;
}

export interface SignaturePosition {
  x: number;
  y: number;
  page: number;
}

export enum AppStep {
  FILE_SELECTION,
  CERTIFICATE_VALIDATION,
  PDF_VIEWER_SIGNING,
  COMPLETED
}
