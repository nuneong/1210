/**
 * @file coordinate.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API에서 제공하는 KATEC 좌표계를 WGS84 좌표계로 변환하는 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. KATEC 좌표계 → WGS84 좌표계 변환
 * 2. 좌표 유효성 검증
 *
 * 좌표 변환 공식:
 * - KATEC 좌표는 정수형으로 저장되어 있음 (예: 1269780000)
 * - WGS84로 변환하려면 10000000으로 나눔
 * - mapx: 경도 (longitude)
 * - mapy: 위도 (latitude)
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환합니다.
 *
 * @param mapx 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns WGS84 좌표 { lng: 경도, lat: 위도 }
 *
 * @example
 * ```ts
 * const { lng, lat } = convertKATECToWGS84("1269780000", "375665000");
 * // { lng: 126.978, lat: 37.5665 }
 * ```
 */
export function convertKATECToWGS84(
  mapx: string,
  mapy: string
): { lng: number; lat: number } | null {
  try {
    // 좌표가 없거나 빈 문자열인 경우
    if (!mapx || !mapy || mapx === "0" || mapy === "0") {
      console.warn("[좌표 변환] 좌표가 없거나 빈 문자열:", { mapx, mapy });
      return null;
    }

    // 문자열을 숫자로 변환
    const x = parseFloat(mapx);
    const y = parseFloat(mapy);

    // 유효하지 않은 숫자인 경우
    if (isNaN(x) || isNaN(y)) {
      console.warn("[좌표 변환] 숫자 변환 실패:", { mapx, mapy });
      return null;
    }

    let lng: number;
    let lat: number;

    // 좌표 형식 자동 감지
    // 1. 이미 WGS84 형식인 경우 (경도: 124~132, 위도: 33~43 범위의 소수)
    // 2. KATEC 형식인 경우 (큰 정수, 예: 1269780000)
    if (x >= 124 && x <= 132 && y >= 33 && y <= 43) {
      // 이미 WGS84 형식
      lng = x;
      lat = y;
      console.log("[좌표 변환] WGS84 형식 감지:", { lng, lat });
    } else if (x > 1000000 && y > 1000000) {
      // KATEC 형식 (큰 정수) - 10000000으로 나눔
      lng = x / 10000000;
      lat = y / 10000000;
      console.log("[좌표 변환] KATEC 형식 변환:", { original: { x, y }, converted: { lng, lat } });
    } else {
      // 알 수 없는 형식
      console.warn("[좌표 변환] 알 수 없는 좌표 형식:", { x, y });
      return null;
    }

    // 좌표 범위 검증 (한국 영역: 경도 124~132, 위도 33~43)
    if (lng < 124 || lng > 132 || lat < 33 || lat > 43) {
      console.warn(`[좌표 변환] 유효하지 않은 좌표 범위: lng=${lng}, lat=${lat}`);
      return null;
    }

    return { lng, lat };
  } catch (error) {
    console.error("[좌표 변환] 좌표 변환 실패:", error);
    return null;
  }
}

/**
 * 좌표가 유효한지 확인합니다.
 *
 * @param mapx 경도 (KATEC 좌표계)
 * @param mapy 위도 (KATEC 좌표계)
 * @returns 좌표가 유효하면 true
 */
export function isValidCoordinate(mapx: string, mapy: string): boolean {
  return convertKATECToWGS84(mapx, mapy) !== null;
}

