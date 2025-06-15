import { generateId } from 'ai';
import { genSaltSync, hashSync } from 'bcrypt-ts';

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function generateDummyPassword() {
  const password = generateId(12);
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}

interface KcCertificationResult {
  category: string | null;
  factor: string | null;
  certifications: string[] | null;
}

/**
 * KC 인증 정보 배열을 마크다운 테이블 문자열로 변환합니다.
 * @param certifications KcCertificationResult 객체 배열
 * @returns 마크다운 테이블 형식의 문자열, 결과 없으면 빈 문자열 반환
 */
export function certificationsToMarkdownTable(certifications: KcCertificationResult[]): string {
  if (!certifications || certifications.length === 0) {
    return '';
  }

  const headers = ['카테고리', '요소', '인증정보'];
  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;

  const bodyLines = certifications.map((cert) => {
    const rowData = [
      cert.category ?? 'N/A',
      cert.factor ?? 'N/A',
      cert.certifications && cert.certifications.length > 0
        ? cert.certifications.join(', ')
        : 'N/A',
    ];
    return `| ${rowData.join(' | ')} |`;
  });

  return [headerLine, separatorLine, ...bodyLines].join('\n');
}
