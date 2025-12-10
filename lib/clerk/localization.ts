/**
 * Clerk 한국어 로컬라이제이션 설정
 * 
 * Clerk 공식 문서 기반:
 * https://clerk.com/docs/guides/customizing-clerk/localization
 * 
 * 기본 한국어 로컬라이제이션을 import하고, 필요시 커스텀 메시지를 추가합니다.
 */
import { koKR } from "@clerk/localizations";

/**
 * 커스텀 한국어 로컬라이제이션
 * 
 * 기본 koKR을 확장하여 애플리케이션에 맞게 메시지를 커스터마이징할 수 있습니다.
 * 
 * @example
 * ```tsx
 * import { customKoKR } from '@/lib/clerk/localization';
 * 
 * <ClerkProvider localization={customKoKR}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const customKoKR = {
  ...koKR,
  // 필요시 특정 메시지를 커스터마이징할 수 있습니다
  // 예: signIn: { ...koKR.signIn, title: '커스텀 로그인 제목' },
  
  // 에러 메시지 커스터마이징 예제
  unstable__errors: {
    ...koKR.unstable__errors,
    // 필요시 에러 메시지를 커스터마이징할 수 있습니다
    // 예: not_allowed_access: '접근이 허용되지 않은 이메일 도메인입니다. 관리자에게 문의하세요.',
  },
};

/**
 * 기본 한국어 로컬라이제이션 (권장)
 * 
 * Clerk에서 제공하는 기본 한국어 번역을 사용합니다.
 * 대부분의 경우 이 설정으로 충분합니다.
 */
export { koKR };

