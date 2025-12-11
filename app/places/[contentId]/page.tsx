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
 * 4. Open Graph 메타태그 (SEO 최적화)
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router 동적 라우팅 사용
 * - Server Component로 구현 (초기 로딩 최적화)
 * - params를 Promise로 처리 (Next.js 15 요구사항)
 * - generateMetadata 함수로 동적 메타태그 생성
 *
 * @dependencies
 * - next/navigation: notFound() 함수
 * - next: Metadata 타입
 * - components/tour-detail/back-button.tsx: 뒤로가기 버튼
 * - lib/api/tour-api.ts: getDetailCommon, extractDetail
 * - lib/utils/url.ts: getAbsoluteUrl
 *
 * @see {@link /docs/PRD.md#2.4-상세페이지} - 상세페이지 요구사항
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackButton } from "@/components/tour-detail/back-button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { ShareButton } from "@/components/tour-detail/share-button";
import { getDetailCommon, extractDetail } from "@/lib/api/tour-api";
import { getAbsoluteUrl } from "@/lib/utils/url";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * Open Graph 메타태그 생성
 * 
 * 관광지 정보를 기반으로 동적 메타태그를 생성합니다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ contentId: string }>;
}): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const response = await getDetailCommon({ contentId });
    const tourDetail = extractDetail(response);

    if (!tourDetail) {
      return {
        title: "관광지 정보",
        description: "관광지 정보를 찾을 수 없습니다.",
      };
    }

    // 설명 텍스트 처리 (100자 이내)
    const description = tourDetail.overview
      ? tourDetail.overview
          .replace(/<[^>]*>/g, "") // HTML 태그 제거
          .replace(/\n/g, " ") // 줄바꿈 제거
          .substring(0, 100)
          .trim()
      : `${tourDetail.title} 관광지 정보`;

    // 이미지 URL (절대 URL로 변환)
    const imageUrl = tourDetail.firstimage || tourDetail.firstimage2;
    const absoluteImageUrl = imageUrl
      ? imageUrl.startsWith("http")
        ? imageUrl
        : undefined // 상대 경로는 제외 (외부 도메인 이미지 사용)
      : undefined;

    // 절대 URL 생성
    const pageUrl = getAbsoluteUrl(`/places/${contentId}`);

    return {
      title: tourDetail.title,
      description,
      openGraph: {
        title: tourDetail.title,
        description,
        url: pageUrl,
        siteName: "My Trip",
        images: absoluteImageUrl
          ? [
              {
                url: absoluteImageUrl,
                width: 1200,
                height: 630,
                alt: tourDetail.title,
              },
            ]
          : [],
        locale: "ko_KR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: tourDetail.title,
        description,
        images: absoluteImageUrl ? [absoluteImageUrl] : [],
      },
    };
  } catch (error) {
    console.error("메타데이터 생성 실패:", error);
    return {
      title: "관광지 정보",
      description: "관광지 정보를 불러올 수 없습니다.",
    };
  }
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

  // 절대 URL 생성 (공유 버튼용)
  const shareUrl = getAbsoluteUrl(`/places/${contentId}`);

  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* 헤더 영역 (뒤로가기 버튼 + 공유 버튼) */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <BackButton />
          <ShareButton url={shareUrl} />
        </div>

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

