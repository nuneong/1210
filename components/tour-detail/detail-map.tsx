/**
 * @file detail-map.tsx
 * @description 관광지 지도 섹션 컴포넌트
 *
 * 관광지 상세페이지의 지도 섹션을 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지 위치를 네이버 지도에 표시
 * 2. 마커 1개 표시
 * 3. 길찾기 버튼 제공
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (데이터 페칭)
 * - getDetailCommon() API 호출하여 좌표 정보 가져오기
 * - 좌표 변환 후 MapView Client Component에 전달
 *
 * @dependencies
 * - lib/api/tour-api.ts: getDetailCommon, extractDetail
 * - lib/utils/coordinate.ts: convertKATECToWGS84
 * - lib/types/tour.ts: TourDetail
 * - components/tour-detail/map-view.tsx: 지도 뷰 (Client Component)
 */

import { getDetailCommon, extractDetail } from "@/lib/api/tour-api";
import { convertKATECToWGS84 } from "@/lib/utils/coordinate";
import type { TourDetail } from "@/lib/types/tour";
import { ErrorMessage } from "@/components/ui/error";
import { MapView } from "./map-view";

interface DetailMapProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
}

/**
 * 관광지 지도 섹션 컴포넌트
 */
export async function DetailMap({ contentId }: DetailMapProps) {
  let tourDetail: TourDetail | null = null;
  let error: Error | null = null;

  try {
    const response = await getDetailCommon({ contentId });
    tourDetail = extractDetail(response);
    
    if (!tourDetail) {
      error = new Error("관광지 정보를 찾을 수 없습니다.");
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error("관광지 정보를 불러올 수 없습니다.");
  }

  if (error || !tourDetail) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <ErrorMessage
          title="지도 정보를 불러올 수 없습니다"
          message={error?.message || "알 수 없는 오류가 발생했습니다."}
          variant="error"
        />
      </section>
    );
  }

  // 좌표 변환
  const coordinates = convertKATECToWGS84(tourDetail.mapx, tourDetail.mapy);
  
  // 좌표가 없으면 섹션 숨김
  if (!coordinates) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-2xl font-bold mb-6">위치</h2>
      <MapView
        lat={coordinates.lat}
        lng={coordinates.lng}
        title={tourDetail.title}
      />
    </section>
  );
}

