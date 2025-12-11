/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지 상세페이지의 기본 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지명, 대표 이미지 표시
 * 2. 주소, 전화번호, 홈페이지, 개요 표시
 * 3. 주소 복사 기능
 * 4. 전화번호 클릭 시 전화 연결
 * 5. 관광 타입 및 카테고리 뱃지 표시
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (데이터 페칭)
 * - getDetailCommon() API 호출
 * - 정보 없는 항목 숨김 처리
 *
 * @dependencies
 * - lib/api/tour-api.ts: getDetailCommon, extractDetail
 * - lib/types/tour.ts: TourDetail, CONTENT_TYPE_NAMES
 * - next/image: 이미지 최적화
 * - components/tour-detail/copy-address-button.tsx: 주소 복사 버튼
 */

import { getDetailCommon, extractDetail } from "@/lib/api/tour-api";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import type { TourDetail } from "@/lib/types/tour";
import { CopyAddressButton } from "./copy-address-button";
import { DetailImage } from "./detail-image";
import { MapPin, Phone, Globe } from "lucide-react";
import { ErrorMessage } from "@/components/ui/error";

interface DetailInfoProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 관광지 기본 정보 섹션 컴포넌트
 */
export async function DetailInfo({ contentId }: DetailInfoProps) {
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
          title="관광지 정보를 불러올 수 없습니다"
          message={error?.message || "알 수 없는 오류가 발생했습니다."}
          variant="error"
        />
      </section>
    );
  }

  const imageUrl = tourDetail.firstimage || tourDetail.firstimage2 || DEFAULT_IMAGE;
  const contentTypeName =
    CONTENT_TYPE_NAMES[tourDetail.contenttypeid as keyof typeof CONTENT_TYPE_NAMES] ||
    "관광지";
  const fullAddress = tourDetail.addr2
    ? `${tourDetail.addr1} ${tourDetail.addr2}`
    : tourDetail.addr1;

  return (
    <section className="rounded-lg border bg-card p-6 space-y-6">
      {/* 관광 타입 및 카테고리 뱃지 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {contentTypeName}
        </span>
        {tourDetail.cat1 && (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {tourDetail.cat1}
          </span>
        )}
        {tourDetail.cat2 && (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {tourDetail.cat2}
          </span>
        )}
        {tourDetail.cat3 && (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {tourDetail.cat3}
          </span>
        )}
      </div>

      {/* 관광지명 */}
      <h1 className="text-3xl font-bold leading-tight">{tourDetail.title}</h1>

      {/* 대표 이미지 */}
      <DetailImage
        imageUrl={imageUrl}
        alt={tourDetail.title}
        defaultImage={DEFAULT_IMAGE}
      />

      {/* 기본 정보 그리드 */}
      <div className="space-y-4">
        {/* 주소 */}
        {tourDetail.addr1 && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">주소</p>
              <p className="text-base font-medium mt-1">{fullAddress}</p>
              <div className="mt-2">
                <CopyAddressButton address={fullAddress} />
              </div>
            </div>
          </div>
        )}

        {/* 전화번호 */}
        {tourDetail.tel && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">전화번호</p>
              <a
                href={`tel:${tourDetail.tel}`}
                className="text-base font-medium mt-1 hover:text-primary transition-colors"
              >
                {tourDetail.tel}
              </a>
            </div>
          </div>
        )}

        {/* 홈페이지 */}
        {tourDetail.homepage && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">홈페이지</p>
              <a
                href={tourDetail.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium mt-1 hover:text-primary transition-colors break-all"
              >
                {tourDetail.homepage}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 개요 */}
      {tourDetail.overview && (
        <div className="pt-4 border-t">
          <h2 className="text-xl font-semibold mb-3">개요</h2>
          <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {tourDetail.overview}
          </p>
        </div>
      )}
    </section>
  );
}

