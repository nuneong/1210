# Phase 3.1: 상세페이지 기본 구조 개발 계획

> **목표**: `/places/[contentId]` 동적 라우팅 페이지의 기본 구조 구현
> 
> **참고 문서**: 
> - PRD.md 2.4 상세페이지 섹션
> - TODO.md Phase 3 (188-193 항목)
> - db.sql (북마크 테이블 구조)

---

## 📋 개발 범위

### Phase 3.1: 페이지 기본 구조 (188-193 항목)

```
- [ ] 페이지 기본 구조
  - [ ] `app/places/[contentId]/page.tsx` 생성
    - [ ] 동적 라우팅 설정
    - [ ] 뒤로가기 버튼 (헤더)
    - [ ] 기본 레이아웃 구조
    - [ ] 라우팅 테스트
```

---

## 🎯 계층적 개발 구조

### Level 1: 파일 생성 및 기본 설정

#### 1.1 디렉토리 구조 생성
- **작업**: `app/places/[contentId]/` 디렉토리 생성
- **목적**: Next.js App Router 동적 라우팅 준비
- **검증**: 디렉토리 생성 확인

#### 1.2 기본 페이지 파일 생성
- **작업**: `app/places/[contentId]/page.tsx` 파일 생성
- **목적**: 동적 라우팅 페이지 기본 틀 생성
- **구현 내용**:
  ```typescript
  // 최소한의 Server Component 구조
  export default async function PlaceDetailPage({
    params,
  }: {
    params: Promise<{ contentId: string }>;
  }) {
    const { contentId } = await params;
    return <div>상세페이지: {contentId}</div>;
  }
  ```
- **검증**: 파일 생성 및 기본 렌더링 확인

---

### Level 2: 동적 라우팅 설정

#### 2.1 URL 파라미터 추출
- **작업**: `contentId` 파라미터 추출 및 타입 정의
- **목적**: Next.js 15의 async params 처리
- **구현 내용**:
  - `params`를 `Promise`로 처리 (Next.js 15 요구사항)
  - `await params`로 비동기 처리
  - 타입 안정성 확보
- **검증**: 
  - URL 파라미터 정상 추출 확인
  - 타입 에러 없음 확인

#### 2.2 라우팅 테스트
- **작업**: 홈페이지에서 상세페이지로 이동 테스트
- **목적**: 동적 라우팅 정상 작동 확인
- **테스트 시나리오**:
  1. 홈페이지에서 `TourCard` 클릭
  2. `/places/[contentId]` URL로 이동 확인
  3. `contentId` 값이 정상적으로 표시되는지 확인
- **검증**: 
  - 클라이언트 사이드 네비게이션 정상 작동
  - URL 파라미터 정확히 전달

---

### Level 3: 기본 레이아웃 구조

#### 3.1 페이지 컨테이너 구조
- **작업**: 반응형 컨테이너 및 기본 레이아웃 설정
- **목적**: PRD 요구사항에 따른 단일 컬럼 레이아웃 구현
- **구현 내용**:
  ```typescript
  <div className="min-h-[calc(100vh-80px)] py-8">
    <div className="max-w-4xl mx-auto px-4 lg:px-8">
      {/* 페이지 내용 */}
    </div>
  </div>
  ```
- **스타일 가이드**:
  - 최대 너비: `max-w-4xl` (단일 컬럼)
  - 패딩: 모바일 `px-4`, 데스크톱 `lg:px-8`
  - 상하 여백: `py-8`
- **검증**: 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)

#### 3.2 섹션 구분 구조
- **작업**: 섹션별 구분선 또는 카드 레이아웃 준비
- **목적**: 향후 섹션 추가를 위한 구조 확립
- **구현 내용**:
  ```typescript
  <div className="space-y-8">
    {/* 기본 정보 섹션 (향후 구현) */}
    <section className="rounded-lg border bg-card p-6">
      {/* 섹션 내용 */}
    </section>
    
    {/* 운영 정보 섹션 (향후 구현) */}
    <section className="rounded-lg border bg-card p-6">
      {/* 섹션 내용 */}
    </section>
  </div>
  ```
- **스타일 가이드**:
  - 섹션 간격: `space-y-8`
  - 카드 스타일: `rounded-lg border bg-card p-6`
- **검증**: 섹션 구조 시각적 확인

---

### Level 4: 뒤로가기 버튼 (헤더)

#### 4.1 뒤로가기 버튼 컴포넌트 생성
- **작업**: `components/tour-detail/back-button.tsx` 생성
- **목적**: 재사용 가능한 뒤로가기 버튼 컴포넌트
- **구현 내용**:
  ```typescript
  "use client";
  
  import { useRouter } from "next/navigation";
  import { Button } from "@/components/ui/button";
  import { ArrowLeft } from "lucide-react";
  
  export function BackButton() {
    const router = useRouter();
    
    return (
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로가기
      </Button>
    );
  }
  ```
- **기능**:
  - `useRouter().back()` 사용 (브라우저 히스토리 기반)
  - 아이콘: `lucide-react`의 `ArrowLeft`
  - 스타일: `variant="ghost"` (부드러운 스타일)
- **검증**: 
  - 버튼 클릭 시 이전 페이지로 이동
  - 아이콘 및 텍스트 정상 표시

#### 4.2 페이지에 뒤로가기 버튼 통합
- **작업**: `page.tsx`에 `BackButton` 컴포넌트 추가
- **목적**: 페이지 상단에 뒤로가기 버튼 배치
- **구현 내용**:
  ```typescript
  import { BackButton } from "@/components/tour-detail/back-button";
  
  export default async function PlaceDetailPage({ params }) {
    const { contentId } = await params;
    
    return (
      <div className="min-h-[calc(100vh-80px)] py-8">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <BackButton />
          {/* 페이지 내용 */}
        </div>
      </div>
    );
  }
  ```
- **배치 위치**: 페이지 컨테이너 최상단
- **검증**: 
  - 버튼이 페이지 상단에 정상 표시
  - 클릭 시 정상 작동

---

### Level 5: 에러 처리 및 로딩 상태

#### 5.1 404 에러 처리
- **작업**: 존재하지 않는 `contentId` 처리
- **목적**: 잘못된 URL 접근 시 사용자 친화적 에러 표시
- **구현 내용**:
  ```typescript
  import { notFound } from "next/navigation";
  
  // contentId 유효성 검사 (예: 숫자만 허용)
  if (!/^\d+$/.test(contentId)) {
    notFound();
  }
  ```
- **검증**: 
  - 잘못된 URL 접근 시 404 페이지 표시
  - 정상적인 `contentId`는 정상 렌더링

#### 5.2 로딩 상태 (선택 사항)
- **작업**: `app/places/[contentId]/loading.tsx` 생성 (선택)
- **목적**: 페이지 로딩 중 스켈레톤 UI 표시
- **구현 내용**:
  ```typescript
  import { Skeleton } from "@/components/ui/skeleton";
  
  export default function Loading() {
    return (
      <div className="min-h-[calc(100vh-80px)] py-8">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-8">
          <Skeleton className="h-10 w-32" /> {/* 뒤로가기 버튼 */}
          <Skeleton className="h-64 w-full" /> {/* 제목/이미지 영역 */}
          <Skeleton className="h-32 w-full" /> {/* 정보 영역 */}
        </div>
      </div>
    );
  }
  ```
- **검증**: 페이지 로딩 중 스켈레톤 UI 표시 확인

---

## 📝 개발 순서 (순차적 진행)

### Step 1: 파일 생성 및 기본 설정
1. ✅ `app/places/[contentId]/` 디렉토리 생성
2. ✅ `app/places/[contentId]/page.tsx` 기본 파일 생성
3. ✅ 최소한의 렌더링 확인 (하드코딩된 텍스트)

### Step 2: 동적 라우팅 설정
4. ✅ `params` 파라미터 추출 (async 처리)
5. ✅ `contentId` 값 표시 확인
6. ✅ 홈페이지에서 상세페이지로 이동 테스트

### Step 3: 기본 레이아웃 구조
7. ✅ 반응형 컨테이너 구조 추가
8. ✅ 섹션 구분 구조 추가 (빈 섹션)
9. ✅ 반응형 레이아웃 확인 (모바일/데스크톱)

### Step 4: 뒤로가기 버튼
10. ✅ `components/tour-detail/back-button.tsx` 생성
11. ✅ `page.tsx`에 뒤로가기 버튼 통합
12. ✅ 뒤로가기 기능 테스트

### Step 5: 에러 처리 및 최종 검증
13. ✅ 404 에러 처리 추가
14. ✅ 로딩 상태 추가 (선택)
15. ✅ 최종 통합 테스트

---

## 🧪 테스트 체크리스트

### 기능 테스트
- [ ] 홈페이지에서 관광지 카드 클릭 시 상세페이지로 이동
- [ ] URL 파라미터(`contentId`) 정상 추출
- [ ] 뒤로가기 버튼 클릭 시 이전 페이지로 이동
- [ ] 잘못된 `contentId` 접근 시 404 페이지 표시

### UI/UX 테스트
- [ ] 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)
- [ ] 뒤로가기 버튼 정상 표시 및 클릭 가능
- [ ] 섹션 구분 구조 시각적 확인
- [ ] 로딩 상태 정상 표시 (선택)

### 접근성 테스트
- [ ] 키보드 네비게이션 (Tab 키로 뒤로가기 버튼 접근)
- [ ] 스크린 리더 호환성 (ARIA 라벨 확인)

---

## 📦 필요한 컴포넌트 및 유틸리티

### 새로 생성할 파일
1. `app/places/[contentId]/page.tsx` - 메인 페이지
2. `app/places/[contentId]/loading.tsx` - 로딩 상태 (선택)
3. `components/tour-detail/back-button.tsx` - 뒤로가기 버튼

### 사용할 기존 컴포넌트
- `components/ui/button.tsx` - shadcn/ui 버튼
- `components/ui/skeleton.tsx` - 로딩 스켈레톤
- `lucide-react` - 아이콘 (ArrowLeft)

### 사용할 기존 유틸리티
- `lib/utils.ts` - `cn` 함수 (클래스명 병합)

---

## 🎨 디자인 가이드라인

### 레이아웃
- **최대 너비**: `max-w-4xl` (단일 컬럼)
- **패딩**: 모바일 `px-4`, 데스크톱 `lg:px-8`
- **섹션 간격**: `space-y-8`

### 색상 및 스타일
- **카드 스타일**: `rounded-lg border bg-card p-6`
- **버튼 스타일**: `variant="ghost"` (뒤로가기)
- **아이콘**: `lucide-react` 사용

### 반응형
- **모바일 우선**: 기본 스타일은 모바일 기준
- **브레이크포인트**: `lg:` (1024px 이상) 데스크톱 스타일

---

## ⚠️ 주의사항

### Next.js 15 요구사항
- `params`는 `Promise`로 처리해야 함
- `await params`로 비동기 처리 필수
- Server Component 우선 사용

### 타입 안정성
- `contentId` 타입 검증 (숫자만 허용)
- 잘못된 타입 접근 시 `notFound()` 호출

### 성능
- Server Component로 구현하여 초기 로딩 최적화
- 향후 API 호출 시 `Suspense` 활용 고려

---

## 🔄 다음 단계 (Phase 3.2)

Phase 3.1 완료 후 다음 단계:
- **Phase 3.2**: 기본 정보 섹션 (MVP 2.4.1)
  - `components/tour-detail/detail-info.tsx` 생성
  - `getDetailCommon()` API 연동
  - 관광지명, 이미지, 주소, 전화번호 등 표시

---

## 📚 참고 자료

- [Next.js 15 App Router 문서](https://nextjs.org/docs/app)
- [Next.js 동적 라우팅](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [shadcn/ui Button 컴포넌트](https://ui.shadcn.com/docs/components/button)
- [lucide-react 아이콘](https://lucide.dev/icons/arrow-left)

