/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 섹션 컴포넌트
 *
 * 관광지 상세페이지의 이미지 갤러리를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지 이미지 목록 표시
 * 2. 이미지 슬라이드 기능 (캐러셀)
 * 3. 이미지 클릭 시 전체화면 모달
 * 4. 이미지 없음 처리
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (데이터 페칭)
 * - getDetailImage() API 호출
 * - 이미지가 없을 경우 섹션 숨김
 *
 * @dependencies
 * - lib/api/tour-api.ts: getDetailImage, extractImages
 * - lib/types/tour.ts: TourImage
 * - next/image: 이미지 최적화
 * - components/tour-detail/image-carousel.tsx: 이미지 캐러셀 (Client Component)
 */

import { getDetailImage, extractImages } from "@/lib/api/tour-api";
import type { TourImage } from "@/lib/types/tour";
import { ErrorMessage } from "@/components/ui/error";
import { ImageCarousel } from "./image-carousel";

interface DetailGalleryProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
}

/**
 * 관광지 이미지 갤러리 섹션 컴포넌트
 */
export async function DetailGallery({ contentId }: DetailGalleryProps) {
  let images: TourImage[] = [];
  let error: Error | null = null;

  try {
    const response = await getDetailImage({ contentId });
    images = extractImages(response);
  } catch (err) {
    error = err instanceof Error ? err : new Error("이미지를 불러올 수 없습니다.");
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <ErrorMessage
          title="이미지를 불러올 수 없습니다"
          message={error.message}
          variant="error"
        />
      </section>
    );
  }

  // 이미지가 없으면 섹션 숨김
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold mb-6">이미지 갤러리</h2>
      <ImageCarousel images={images} />
    </section>
  );
}

