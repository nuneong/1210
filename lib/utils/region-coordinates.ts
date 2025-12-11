/**
 * @file region-coordinates.ts
 * @description 지역별 중심 좌표 유틸리티
 *
 * 한국관광공사 API의 지역 코드에 해당하는 중심 좌표를 제공합니다.
 * 지도 초기화 시 선택된 지역의 중심 좌표로 지도를 표시하기 위해 사용됩니다.
 *
 * 주요 기능:
 * 1. 지역 코드별 중심 좌표 조회
 * 2. 기본 중심 좌표 제공 (서울)
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

/**
 * 지역 코드별 중심 좌표 (WGS84)
 * 한국관광공사 API의 지역 코드와 매핑됩니다.
 */
const REGION_COORDINATES: Record<string, { lng: number; lat: number }> = {
  // 시/도 단위
  "1": { lng: 126.9780, lat: 37.5665 }, // 서울특별시
  "2": { lng: 129.0756, lat: 35.1796 }, // 인천광역시
  "3": { lng: 129.0756, lat: 35.1796 }, // 대전광역시
  "4": { lng: 127.3845, lat: 36.3504 }, // 대구광역시
  "5": { lng: 129.0756, lat: 35.1796 }, // 광주광역시
  "6": { lng: 129.0756, lat: 35.1796 }, // 대전광역시 (중복)
  "7": { lng: 129.0756, lat: 35.1796 }, // 울산광역시
  "8": { lng: 128.5556, lat: 35.8722 }, // 세종특별자치시
  "31": { lng: 127.7669, lat: 37.2636 }, // 경기도
  "32": { lng: 127.2892, lat: 36.8000 }, // 강원도
  "33": { lng: 127.4998, lat: 36.8000 }, // 충청북도
  "34": { lng: 126.8450, lat: 36.5184 }, // 충청남도
  "35": { lng: 127.1414, lat: 35.5384 }, // 전라북도
  "36": { lng: 126.7052, lat: 34.8679 }, // 전라남도
  "37": { lng: 128.6910, lat: 35.5384 }, // 경상북도
  "38": { lng: 128.3016, lat: 35.5384 }, // 경상남도
  "39": { lng: 126.5312, lat: 33.4996 }, // 제주특별자치도
  "99": { lng: 126.9780, lat: 37.5665 }, // 전체 (서울 기준)
};

/**
 * 기본 중심 좌표 (서울)
 */
const DEFAULT_CENTER = { lng: 126.9780, lat: 37.5665 };

/**
 * 지역 코드에 해당하는 중심 좌표를 반환합니다.
 *
 * @param areaCode 지역 코드 (한국관광공사 API 지역 코드)
 * @returns 중심 좌표 { lng: 경도, lat: 위도 }
 *
 * @example
 * ```ts
 * const center = getRegionCenter("1"); // 서울
 * // { lng: 126.9780, lat: 37.5665 }
 * ```
 */
export function getRegionCenter(
  areaCode?: string | null
): { lng: number; lat: number } {
  if (!areaCode) {
    return DEFAULT_CENTER;
  }

  return REGION_COORDINATES[areaCode] || DEFAULT_CENTER;
}

/**
 * 모든 지역 코드 목록을 반환합니다.
 *
 * @returns 지역 코드 배열
 */
export function getAllRegionCodes(): string[] {
  return Object.keys(REGION_COORDINATES);
}

