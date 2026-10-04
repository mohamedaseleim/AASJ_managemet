import QRCode from 'qrcode';

export interface CertificateVerificationPayload {
  serial: string;
  reviewerName: string;
  reviewerId: string;
  affiliation: string;
  manuscriptId?: string;
  manuscriptTitle?: string;
  issueDate: string;
  verifiedBy: string;
}

export async function generateCertificateQRCodeSvg(
  payload: CertificateVerificationPayload,
  verificationBaseUrl = 'https://aasj.journals.ekb.eg/verify-cert'
): Promise<string> {
  const queryParams = new URLSearchParams({
    serial: payload.serial,
    rev: payload.reviewerName,
    inst: payload.affiliation,
    date: payload.issueDate,
    mid: payload.manuscriptId || '',
  });

  const verificationUrl = `${verificationBaseUrl}?${queryParams.toString()}`;

  try {
    const rawSvg = await QRCode.toString(verificationUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#064e3b', // Deep Al-Azhar emerald
        light: '#ffffff',
      },
    });

    // Make SVG fully responsive with viewBox and 100% width/height
    const responsiveSvg = rawSvg
      .replace(/width="\d+"/, 'width="100%"')
      .replace(/height="\d+"/, 'height="100%"');

    return responsiveSvg;
  } catch (err) {
    console.error('Failed to generate QR code SVG:', err);
    return '';
  }
}

export async function generateCertificateQRCodeDataUrl(
  payload: CertificateVerificationPayload,
  verificationBaseUrl = 'https://aasj.journals.ekb.eg/verify-cert'
): Promise<string> {
  const queryParams = new URLSearchParams({
    serial: payload.serial,
    rev: payload.reviewerName,
    inst: payload.affiliation,
    date: payload.issueDate,
    mid: payload.manuscriptId || '',
  });

  const verificationUrl = `${verificationBaseUrl}?${queryParams.toString()}`;

  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
      width: 200,
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code DataURL:', err);
    return '';
  }
}

export interface AcceptanceVerificationPayload {
  manuscriptId: string;
  articleTitle: string;
  authorName: string;
  doi?: string;
  issueDate: string;
  volume?: number;
  issue?: number;
}

export async function generateAcceptanceQRCodeSvg(
  payload: AcceptanceVerificationPayload,
  verificationBaseUrl = 'https://aasj.journals.ekb.eg/verify-acceptance'
): Promise<string> {
  const queryParams = new URLSearchParams({
    id: payload.manuscriptId,
    doi: payload.doi || `10.21608/aasj.${payload.manuscriptId.toLowerCase()}`,
    auth: payload.authorName,
    date: payload.issueDate,
    vol: String(payload.volume || '8'),
    iss: String(payload.issue || '1'),
  });

  const verificationUrl = `${verificationBaseUrl}?${queryParams.toString()}`;

  try {
    const rawSvg = await QRCode.toString(verificationUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff',
      },
    });

    // Make SVG fully responsive and preserve crisp edges & perfect square aspect ratio
    const responsiveSvg = rawSvg
      .replace(/width="\d+"/, 'width="100%"')
      .replace(/height="\d+"/, 'height="100%"');

    return responsiveSvg;
  } catch (err) {
    console.error('Failed to generate Acceptance QR code SVG:', err);
    return '';
  }
}
