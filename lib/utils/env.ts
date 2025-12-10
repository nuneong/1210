/**
 * @file env.ts
 * @description 환경변수 검증 및 타입 안전성을 위한 유틸리티
 *
 * 이 모듈은 프로젝트에서 사용하는 환경변수를 타입 안전하게 접근하고,
 * 개발 환경에서 누락된 환경변수를 경고하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 필수 환경변수 존재 여부 확인
 * 2. 개발 환경에서 누락된 환경변수 경고 로그
 * 3. 타입 안전성을 위한 환경변수 타입 정의
 *
 * @dependencies
 * - process.env: Node.js 환경변수
 */

/**
 * 환경변수 타입 정의
 */
export interface Env {
  // 한국관광공사 API
  NEXT_PUBLIC_TOUR_API_KEY?: string;
  TOUR_API_KEY?: string;

  // 네이버 지도 API
  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?: string;

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL?: string;

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NEXT_PUBLIC_STORAGE_BUCKET?: string;
}

/**
 * 필수 환경변수 목록
 */
const REQUIRED_ENV_VARS = {
  // 한국관광공사 API (둘 중 하나는 필수)
  tourApi: ['NEXT_PUBLIC_TOUR_API_KEY', 'TOUR_API_KEY'] as const,
  // 네이버 지도 API
  naverMap: ['NEXT_PUBLIC_NAVER_MAP_CLIENT_ID'] as const,
  // Clerk (필수)
  clerk: [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ] as const,
  // Supabase (필수)
  supabase: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ] as const,
} as const;

/**
 * 환경변수 그룹별 설명
 */
const ENV_GROUP_DESCRIPTIONS = {
  tourApi: '한국관광공사 API',
  naverMap: '네이버 지도 API',
  clerk: 'Clerk 인증',
  supabase: 'Supabase',
} as const;

/**
 * 환경변수 검증 결과
 */
interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 특정 환경변수 그룹의 필수 변수들이 모두 설정되어 있는지 확인
 */
function validateEnvGroup(
  group: keyof typeof REQUIRED_ENV_VARS,
): ValidationResult {
  const required = REQUIRED_ENV_VARS[group];
  const missing: string[] = [];
  const warnings: string[] = [];

  // 특수 케이스: 한국관광공사 API는 둘 중 하나만 있으면 됨
  if (group === 'tourApi') {
    const hasPublic = !!process.env.NEXT_PUBLIC_TOUR_API_KEY;
    const hasServer = !!process.env.TOUR_API_KEY;

    if (!hasPublic && !hasServer) {
      missing.push(...required);
      warnings.push(
        '한국관광공사 API 키가 없습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나를 설정하세요.',
      );
    } else if (!hasPublic && hasServer) {
      warnings.push(
        'NEXT_PUBLIC_TOUR_API_KEY가 없습니다. 클라이언트 사이드에서 API를 호출할 수 없습니다.',
      );
    } else if (hasPublic && !hasServer) {
      warnings.push(
        'TOUR_API_KEY가 없습니다. 서버 사이드에서 API를 호출할 때 문제가 발생할 수 있습니다.',
      );
    }
  } else {
    // 일반 케이스: 모든 필수 변수가 있어야 함
    for (const envVar of required) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 모든 필수 환경변수가 설정되어 있는지 확인
 * 개발 환경에서만 경고를 출력합니다.
 */
export function validateEnv(): ValidationResult {
  const allMissing: string[] = [];
  const allWarnings: string[] = [];

  for (const group of Object.keys(REQUIRED_ENV_VARS) as Array<
    keyof typeof REQUIRED_ENV_VARS
  >) {
    const result = validateEnvGroup(group);

    if (!result.isValid) {
      allMissing.push(...result.missing);
    }

    if (result.warnings.length > 0) {
      allWarnings.push(...result.warnings);
    }
  }

  // 개발 환경에서만 경고 출력
  if (process.env.NODE_ENV === 'development') {
    if (allMissing.length > 0) {
      console.warn(
        '\n⚠️  누락된 환경변수가 있습니다:\n',
        allMissing.map((v) => `  - ${v}`).join('\n'),
        '\n\n.env.example 파일을 참고하여 .env 파일을 생성하세요.\n',
      );
    }

    if (allWarnings.length > 0) {
      console.warn(
        '\n⚠️  환경변수 경고:\n',
        allWarnings.map((w) => `  - ${w}`).join('\n'),
        '\n',
      );
    }
  }

  return {
    isValid: allMissing.length === 0,
    missing: allMissing,
    warnings: allWarnings,
  };
}

/**
 * 한국관광공사 API 키를 안전하게 가져옵니다.
 * 클라이언트 사이드에서는 NEXT_PUBLIC_TOUR_API_KEY를 우선 사용하고,
 * 없으면 TOUR_API_KEY를 사용합니다 (서버 사이드에서만).
 */
export function getTourApiKey(): string | undefined {
  // 클라이언트 사이드
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_TOUR_API_KEY;
  }

  // 서버 사이드: NEXT_PUBLIC_TOUR_API_KEY 우선, 없으면 TOUR_API_KEY
  const apiKey = process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;
  
  // 디버깅 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && !apiKey) {
    console.warn('[Tour API] API 키가 없습니다:', {
      hasPublic: !!process.env.NEXT_PUBLIC_TOUR_API_KEY,
      hasServer: !!process.env.TOUR_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    });
  }
  
  return apiKey;
}

/**
 * 네이버 지도 API 클라이언트 ID를 가져옵니다.
 */
export function getNaverMapClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
}

/**
 * 환경변수 검증을 실행합니다 (선택사항).
 * 앱 시작 시 호출하여 누락된 환경변수를 조기에 발견할 수 있습니다.
 *
 * @example
 * ```ts
 * // app/layout.tsx 또는 middleware.ts에서
 * if (process.env.NODE_ENV === 'development') {
 *   validateEnv();
 * }
 * ```
 */
export function initEnvValidation(): void {
  if (process.env.NODE_ENV === 'development') {
    validateEnv();
  }
}

