# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 현재 설정

프로젝트는 이미 Clerk 한국어 로컬라이제이션이 적용되어 있습니다:

- **위치**: `app/layout.tsx`
- **로컬라이제이션**: `koKR` (한국어)
- **HTML lang 속성**: `lang="ko"`

## 작동 방식

Clerk의 `ClerkProvider`에 `localization` prop을 전달하여 모든 Clerk 컴포넌트가 한국어로 표시됩니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@/lib/clerk/localization";

<ClerkProvider localization={koKR}>
  {/* 모든 Clerk 컴포넌트가 한국어로 표시됩니다 */}
</ClerkProvider>
```

## 커스터마이징

### 기본 한국어 사용

대부분의 경우 기본 한국어 로컬라이제이션으로 충분합니다:

```tsx
import { koKR } from "@/lib/clerk/localization";

<ClerkProvider localization={koKR}>
  ...
</ClerkProvider>
```

### 커스텀 메시지 추가

특정 메시지를 커스터마이징하려면 `lib/clerk/localization.ts` 파일을 수정하세요:

```tsx
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    title: '커스텀 로그인 제목',
  },
  signUp: {
    ...koKR.signUp,
    start: {
      subtitle: '{{applicationName}}에 가입하여 시작하세요',
    },
  },
};
```

그리고 `app/layout.tsx`에서 사용:

```tsx
import { customKoKR } from "@/lib/clerk/localization";

<ClerkProvider localization={customKoKR}>
  ...
</ClerkProvider>
```

### 에러 메시지 커스터마이징

에러 메시지를 커스터마이징하려면:

```tsx
export const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access: '접근이 허용되지 않은 이메일 도메인입니다. 관리자에게 문의하세요.',
    form_password_pwned: '이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.',
  },
};
```

## 지원되는 Clerk 컴포넌트

다음 Clerk 컴포넌트들이 자동으로 한국어로 표시됩니다:

- `<SignIn />` - 로그인 컴포넌트
- `<SignUp />` - 회원가입 컴포넌트
- `<UserButton />` - 사용자 버튼
- `<UserProfile />` - 사용자 프로필
- `<SignInButton />` - 로그인 버튼
- `<SignUpButton />` - 회원가입 버튼
- 기타 모든 Clerk 컴포넌트

## 참고 자료

- [Clerk 공식 로컬라이제이션 가이드](https://clerk.com/docs/guides/customizing-clerk/localization)
- [Clerk 한국어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/ko-KR.ts)

## 주의사항

> ⚠️ **실험적 기능**: Clerk 로컬라이제이션은 현재 실험적(experimental) 단계입니다. 
> 예상치 못한 동작이 발생할 수 있으므로, 문제가 있으면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

## 확인 방법

1. 개발 서버 실행: `pnpm dev`
2. 브라우저에서 `/sign-in` 또는 `/sign-up` 페이지 방문
3. 모든 텍스트가 한국어로 표시되는지 확인

## 문제 해결

### 한국어가 적용되지 않는 경우

1. `@clerk/localizations` 패키지가 설치되어 있는지 확인:
   ```bash
   npm list @clerk/localizations
   ```

2. `app/layout.tsx`에서 `localization` prop이 올바르게 전달되는지 확인

3. 브라우저 캐시를 지우고 다시 시도

4. 개발 서버를 재시작

### 특정 메시지만 영어로 표시되는 경우

해당 메시지가 `koKR`에 포함되어 있지 않을 수 있습니다. 커스텀 로컬라이제이션을 사용하여 수동으로 추가하세요.

