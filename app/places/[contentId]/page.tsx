/**
 * @file page.tsx
 * @description 관광지 상세페이지 - 동적 라우팅 페이지
 *
 * 이 페이지는 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 동적 라우팅을 통한 관광지 상세 정보 표시
 * 2. 뒤로가기 버튼 제공
 * 3. 기본 레이아웃 구조 (향후 섹션 추가 예정)
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router 동적 라우팅 사용
 * - Server Component로 구현 (초기 로딩 최적화)
 * - params를 Promise로 처리 (Next.js 15 요구사항)
 *
 * @dependencies
 * - next/navigation: notFound() 함수
 * - components/tour-detail/back-button.tsx: 뒤로가기 버튼
 *
 * @see {@link /docs/PRD.md#2.4-상세페이지} - 상세페이지 요구사항
 */

import { notFound } from "next/navigation";
import { BackButton } from "@/components/tour-detail/back-button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 관광지 상세페이지 메인 컴포넌트
 * 
 * @param params - URL 파라미터 (contentId)
 * @returns 상세페이지 JSX
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  // Next.js 15: params는 Promise로 처리
  const { contentId } = await params;

  // contentId 유효성 검사 (숫자만 허용)
  if (!/^\d+$/.test(contentId)) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* 뒤로가기 버튼 */}
        <BackButton />

        {/* 기본 레이아웃 구조 */}
        <div className="space-y-8">
          {/* 기본 정보 섹션 */}
          <DetailInfo contentId={contentId} />

          {/* 운영 정보 섹션 */}
          <DetailIntro contentId={contentId} />

          {/* 이미지 갤러리 섹션 */}
          <DetailGallery contentId={contentId} />

          {/* 지도 섹션 */}
          <DetailMap contentId={contentId} />
        </div>
      </div>
    </div>
  );
}

