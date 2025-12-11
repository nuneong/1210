/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지 상세페이지의 운영 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 운영시간, 휴무일 표시
 * 2. 이용요금, 주차, 수용인원 표시
 * 3. 체험 프로그램, 유모차/반려동물 동반 가능 여부 표시
 * 4. 정보 없는 항목 숨김 처리
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (데이터 페칭)
 * - getDetailIntro() API 호출 (contentTypeId 필수)
 * - getDetailCommon()을 먼저 호출하여 contentTypeId 확보
 * - 타입별 필드 차이 처리
 *
 * @dependencies
 * - lib/api/tour-api.ts: getDetailCommon, getDetailIntro, extractDetail, extractIntro
 * - lib/types/tour.ts: TourIntro, ContentTypeId
 * - lucide-react: 아이콘
 */

import {
  getDetailCommon,
  getDetailIntro,
  extractDetail,
  extractIntro,
} from "@/lib/api/tour-api";
import type { TourIntro, ContentTypeId } from "@/lib/types/tour";
import { ErrorMessage } from "@/components/ui/error";
import {
  Clock,
  CalendarX,
  DollarSign,
  Car,
  Users,
  BookOpen,
  Baby,
  Dog,
  Info,
  CreditCard,
  Utensils,
} from "lucide-react";

interface DetailIntroProps {
  /**
   * 관광지 콘텐츠 ID
   */
  contentId: string;
}

/**
 * 정보 항목 컴포넌트
 */
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-medium mt-1 whitespace-pre-wrap break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * 타입별 운영시간 필드명 매핑
 */
function getUseTimeField(contentTypeId: string): string | null {
  const timeFields: Record<string, string> = {
    "12": "usetime",           // 관광지
    "14": "usetimeculture",    // 문화시설
    "15": "usetimefestival",   // 축제/행사
    "25": "usetime",           // 여행코스
    "28": "usetimeleports",    // 레포츠
    "32": "usetime",           // 숙박
    "38": "opentime",          // 쇼핑
    "39": "opentimefood",      // 음식점
  };
  return timeFields[contentTypeId] || "usetime"; // 기본값: usetime
}

/**
 * 타입별 요금 필드명 매핑 (요금 필드가 없으면 null)
 */
function getUseFeeField(contentTypeId: string): string | null {
  const feeFields: Record<string, string> = {
    "12": "usefee",           // 관광지
    "14": "usetimeculture",   // 문화시설
    "15": "usefestival",      // 축제/행사
    "25": "usefee",           // 여행코스 (usetime 대신 usefee)
    "28": "usefeeleports",    // 레포츠
    "32": "usefee",           // 숙박 (roomcount 대신 usefee)
    // "38": null,            // 쇼핑 - 요금 필드 없음
    "39": "usefee",           // 음식점 (firstmenu 대신 usefee)
  };
  return feeFields[contentTypeId] || null;
}

/**
 * 관광지 운영 정보 섹션 컴포넌트
 */
export async function DetailIntro({ contentId }: DetailIntroProps) {
  let tourIntro: TourIntro | null = null;
  let error: Error | null = null;

  try {
    // contentTypeId를 얻기 위해 getDetailCommon() 먼저 호출
    const detailResponse = await getDetailCommon({ contentId });
    const tourDetail = extractDetail(detailResponse);

    if (!tourDetail) {
      error = new Error("관광지 정보를 찾을 수 없습니다.");
    } else {
      // 운영 정보 조회
      const introResponse = await getDetailIntro({
        contentId,
        contentTypeId: tourDetail.contenttypeid as ContentTypeId,
      });
      tourIntro = extractIntro(introResponse);

      if (!tourIntro) {
        error = new Error("운영 정보를 찾을 수 없습니다.");
      }
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error("운영 정보를 불러올 수 없습니다.");
  }

  if (error || !tourIntro) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <ErrorMessage
          title="운영 정보를 불러올 수 없습니다"
          message={error?.message || "알 수 없는 오류가 발생했습니다."}
          variant="error"
        />
      </section>
    );
  }

  // 정보 항목 수집
  const infoItems: InfoItemProps[] = [];

  // 운영시간 (타입별 필드 매핑)
  const useTimeField = getUseTimeField(tourIntro.contenttypeid);
  const useTime = useTimeField ? tourIntro[useTimeField] : tourIntro.usetime;
  if (useTime) {
    infoItems.push({
      icon: <Clock className="h-5 w-5" />,
      label: "운영시간",
      value: useTime,
    });
  }

  // 휴무일
  if (tourIntro.restdate) {
    infoItems.push({
      icon: <CalendarX className="h-5 w-5" />,
      label: "휴무일",
      value: tourIntro.restdate,
    });
  }

  // 이용요금 (타입별 필드명 다름, 요금 필드가 없는 타입은 표시하지 않음)
  const useFeeField = getUseFeeField(tourIntro.contenttypeid);
  if (useFeeField) {
    const useFee = tourIntro[useFeeField];
    if (useFee) {
      infoItems.push({
        icon: <DollarSign className="h-5 w-5" />,
        label: "이용요금",
        value: useFee,
      });
    }
  }

  // 메뉴 (음식점만)
  if (tourIntro.contenttypeid === "39" && tourIntro.firstmenu) {
    infoItems.push({
      icon: <Utensils className="h-5 w-5" />,
      label: "메뉴",
      value: tourIntro.firstmenu,
    });
  }

  // 주차 가능 여부
  if (tourIntro.parking) {
    infoItems.push({
      icon: <Car className="h-5 w-5" />,
      label: "주차",
      value: tourIntro.parking,
    });
  }

  // 수용인원
  if (tourIntro.accomcount) {
    infoItems.push({
      icon: <Users className="h-5 w-5" />,
      label: "수용인원",
      value: tourIntro.accomcount,
    });
  }

  // 체험 프로그램
  if (tourIntro.expguide) {
    infoItems.push({
      icon: <BookOpen className="h-5 w-5" />,
      label: "체험 프로그램",
      value: tourIntro.expguide,
    });
  }

  // 유모차 대여
  if (tourIntro.chkbabycarriage) {
    infoItems.push({
      icon: <Baby className="h-5 w-5" />,
      label: "유모차",
      value: tourIntro.chkbabycarriage,
    });
  }

  // 반려동물 동반
  if (tourIntro.chkpet) {
    infoItems.push({
      icon: <Dog className="h-5 w-5" />,
      label: "반려동물 동반",
      value: tourIntro.chkpet,
    });
  }

  // 문의처
  if (tourIntro.infocenter) {
    infoItems.push({
      icon: <Info className="h-5 w-5" />,
      label: "문의처",
      value: tourIntro.infocenter,
    });
  }

  // 카드 결제 가능 여부
  if (tourIntro.chkcreditcard) {
    infoItems.push({
      icon: <CreditCard className="h-5 w-5" />,
      label: "카드 결제",
      value: tourIntro.chkcreditcard,
    });
  }

  // 정보가 없는 경우
  if (infoItems.length === 0) {
    return (
      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">운영 정보</h2>
        <p className="text-sm text-muted-foreground">
          운영 정보가 제공되지 않습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-6">운영 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoItems.map((item, index) => (
          <InfoItem key={index} {...item} />
        ))}
      </div>
    </section>
  );
}

