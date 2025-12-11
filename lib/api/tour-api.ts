/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트
 *
 * 이 모듈은 한국관광공사 공공 API를 호출하는 모든 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (getAreaCode)
 * 2. 지역 기반 목록 조회 (getAreaBasedList)
 * 3. 키워드 검색 (searchKeyword)
 * 4. 공통 정보 조회 (getDetailCommon)
 * 5. 소개 정보 조회 (getDetailIntro)
 * 6. 이미지 목록 조회 (getDetailImage)
 * 7. 반려동물 정보 조회 (getDetailPetTour)
 *
 * 핵심 구현 로직:
 * - 공통 파라미터 자동 생성 (serviceKey, MobileOS, MobileApp, _type)
 * - 에러 처리 및 재시도 로직 (지수 백오프)
 * - 타입 안전한 API 호출
 * - 응답 파싱 및 검증
 *
 * @dependencies
 * - lib/utils/env.ts: API 키 가져오기
 * - lib/types/tour.ts: 타입 정의
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

import { getTourApiKey } from "@/lib/utils/env";
import type {
  AreaCodeResponse,
  AreaBasedListResponse,
  SearchKeywordResponse,
  DetailCommonResponse,
  DetailIntroResponse,
  DetailImageResponse,
  DetailPetTourResponse,
  GetAreaCodeParams,
  GetAreaBasedListParams,
  SearchKeywordParams,
  GetDetailCommonParams,
  GetDetailIntroParams,
  GetDetailImageParams,
  GetDetailPetTourParams,
  TourItem,
  TourDetail,
} from "@/lib/types/tour";

/**
 * API Base URL (끝에 슬래시 포함)
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2/";

/**
 * 기본 타임아웃 (밀리초)
 */
const DEFAULT_TIMEOUT = 30000; // 30초 (공공 API 응답이 느릴 수 있음)

/**
 * 최대 재시도 횟수
 */
const MAX_RETRIES = 3;

/**
 * 재시도 간격 (밀리초) - 지수 백오프
 */
const RETRY_DELAYS = [1000, 2000, 4000]; // 1초, 2초, 4초

/**
 * 커스텀 에러 클래스
 */
export class TourApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown,
  ) {
    super(message);
    this.name = "TourApiError";
    Object.setPrototypeOf(this, TourApiError.prototype);
  }
}

/**
 * API 키 관련 에러
 */
export class TourApiKeyError extends TourApiError {
  constructor(message: string = "API 키가 설정되지 않았습니다.") {
    super(message);
    this.name = "TourApiKeyError";
    Object.setPrototypeOf(this, TourApiKeyError.prototype);
  }
}

/**
 * Rate Limit 초과 에러
 */
export class TourApiRateLimitError extends TourApiError {
  constructor(message: string = "API 호출 제한을 초과했습니다.") {
    super(message, 429);
    this.name = "TourApiRateLimitError";
    Object.setPrototypeOf(this, TourApiRateLimitError.prototype);
  }
}

/**
 * 네트워크 에러
 */
export class TourApiNetworkError extends TourApiError {
  constructor(message: string = "네트워크 오류가 발생했습니다.") {
    super(message);
    this.name = "TourApiNetworkError";
    Object.setPrototypeOf(this, TourApiNetworkError.prototype);
  }
}

/**
 * 공통 파라미터 생성
 */
function createCommonParams(): {
  serviceKey: string;
  MobileOS: string;
  MobileApp: string;
  _type: string;
} {
  const serviceKey = getTourApiKey();
  if (!serviceKey) {
    throw new TourApiKeyError(
      "한국관광공사 API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 확인하세요.",
    );
  }

  return {
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * URL 생성 함수
 */
function buildApiUrl(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): string {
  // endpoint 앞의 슬래시 제거 (BASE_URL 끝에 이미 슬래시가 있음)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = new URL(cleanEndpoint, BASE_URL);
  const commonParams = createCommonParams();

  // 공통 파라미터 추가
  Object.entries(commonParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  // 추가 파라미터 추가 (undefined 제외)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
}

/**
 * 지연 함수 (재시도용)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API 호출 재시도 로직
 */
async function retryApiCall<T>(
  fn: () => Promise<T>,
  retryCount: number = 0,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // 재시도하지 않는 경우
    if (
      error instanceof TourApiKeyError ||
      error instanceof TourApiRateLimitError ||
      (error instanceof TourApiError &&
        error.statusCode &&
        error.statusCode < 500)
    ) {
      throw error;
    }

    // 최대 재시도 횟수 초과
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }

    // 재시도 대기
    const delayMs =
      RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    await delay(delayMs);

    // 재시도
    return retryApiCall(fn, retryCount + 1);
  }
}

/**
 * API 호출 함수 (공통)
 */
async function callApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = buildApiUrl(endpoint, params);

  // 디버깅: API 키 확인 (서버 사이드에서만)
  if (typeof window === 'undefined') {
    const apiKey = getTourApiKey();
    console.log('[Tour API Debug]', {
      endpoint,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyPrefix: apiKey?.substring(0, 10) + '...',
      url: url.replace(apiKey || '', '***'),
    });
  }

  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new TourApiNetworkError("요청 시간이 초과되었습니다.");
      }
      throw new TourApiNetworkError("네트워크 오류가 발생했습니다.");
    }
  };

  return retryApiCall(async () => {
    const response = await fetchWithTimeout();

    // Rate Limit 체크
    if (response.status === 429) {
      throw new TourApiRateLimitError();
    }

    // 응답 텍스트를 먼저 읽기 (body는 한 번만 읽을 수 있음)
    const responseText = await response.text();

    // 디버깅: 응답 상태 확인 (에러 발생 시)
    if (!response.ok || response.status === 500) {
      const apiKey = getTourApiKey();
      console.error('[Tour API Error]', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        hasApiKey: !!apiKey,
        responseTextPreview: responseText.substring(0, 1000),
        url: url.replace(apiKey || '', '***'),
      });
    }

    // 빈 응답 체크
    if (!responseText || responseText.trim().length === 0) {
      throw new TourApiError("빈 응답을 받았습니다.", response.status, null);
    }

    // HTML 응답 체크 (에러 페이지일 수 있음)
    if (responseText.trim().startsWith("<!")) {
      throw new TourApiError(
        "HTML 응답을 받았습니다. API 키를 확인해주세요.",
        response.status,
        responseText.substring(0, 200), // 처음 200자만
      );
    }

    // 응답 파싱
    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // 파싱 에러 상세 정보 로깅
      console.error("JSON 파싱 실패:", {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 500), // 처음 500자만
        error: parseError,
      });

      throw new TourApiError(
        `응답을 파싱할 수 없습니다. (상태: ${response.status})`,
        response.status,
        responseText.substring(0, 500),
      );
    }

    // 에러 응답 처리
    if (!response.ok) {
      throw new TourApiError(
        `API 호출 실패: ${response.statusText}`,
        response.status,
        data,
      );
    }

    // 응답 구조 검증
    if (
      !data ||
      typeof data !== "object" ||
      !("response" in data) ||
      !("header" in (data as { response: { header: unknown } }).response)
    ) {
      throw new TourApiError("잘못된 응답 형식입니다.", response.status, data);
    }

    const responseData = data as {
      response: {
        header: { resultCode: string; resultMsg: string };
        body: unknown;
      };
    };

    // 결과 코드 확인
    if (responseData.response.header.resultCode !== "0000") {
      throw new TourApiError(
        `API 오류: ${responseData.response.header.resultMsg}`,
        response.status,
        data,
      );
    }

    return data as T;
  });
}

/**
 * 지역코드 조회
 * @param params 조회 파라미터
 * @returns 지역코드 목록
 */
export async function getAreaCode(
  params: Partial<GetAreaCodeParams> = {},
): Promise<AreaCodeResponse> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params.numOfRows) queryParams.numOfRows = params.numOfRows;
  if (params.pageNo) queryParams.pageNo = params.pageNo;

  return callApi<AreaCodeResponse>("/areaCode2", queryParams);
}

/**
 * 지역 기반 목록 조회
 * @param params 조회 파라미터
 * @returns 관광지 목록
 */
export async function getAreaBasedList(
  params: GetAreaBasedListParams,
): Promise<AreaBasedListResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    areaCode: params.areaCode,
  };

  if (params.contentTypeId) queryParams.contentTypeId = params.contentTypeId;
  if (params.sigunguCode) queryParams.sigunguCode = params.sigunguCode;
  if (params.cat1) queryParams.cat1 = params.cat1;
  if (params.cat2) queryParams.cat2 = params.cat2;
  if (params.cat3) queryParams.cat3 = params.cat3;
  if (params.modifiedtime) queryParams.modifiedtime = params.modifiedtime;
  if (params.numOfRows) queryParams.numOfRows = params.numOfRows;
  if (params.pageNo) queryParams.pageNo = params.pageNo;

  return callApi<AreaBasedListResponse>("/areaBasedList2", queryParams);
}

/**
 * 키워드 검색
 * @param params 검색 파라미터
 * @returns 검색 결과 목록
 */
export async function searchKeyword(
  params: SearchKeywordParams,
): Promise<SearchKeywordResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    keyword: params.keyword,
  };

  if (params.areaCode) queryParams.areaCode = params.areaCode;
  if (params.contentTypeId) queryParams.contentTypeId = params.contentTypeId;
  if (params.cat1) queryParams.cat1 = params.cat1;
  if (params.cat2) queryParams.cat2 = params.cat2;
  if (params.cat3) queryParams.cat3 = params.cat3;
  if (params.listYN) queryParams.listYN = params.listYN;
  if (params.arrange) queryParams.arrange = params.arrange;
  if (params.modifiedtime) queryParams.modifiedtime = params.modifiedtime;
  if (params.numOfRows) queryParams.numOfRows = params.numOfRows;
  if (params.pageNo) queryParams.pageNo = params.pageNo;

  return callApi<SearchKeywordResponse>("/searchKeyword2", queryParams);
}

/**
 * 공통 정보 조회
 * @param params 조회 파라미터
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  params: GetDetailCommonParams,
): Promise<DetailCommonResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    contentId: params.contentId,
  };

  if (params.contentTypeId) queryParams.contentTypeId = params.contentTypeId;
  if (params.defaultYN) queryParams.defaultYN = params.defaultYN;
  if (params.firstImageYN) queryParams.firstImageYN = params.firstImageYN;
  if (params.areacodeYN) queryParams.areacodeYN = params.areacodeYN;
  if (params.catcodeYN) queryParams.catcodeYN = params.catcodeYN;
  if (params.addrinfoYN) queryParams.addrinfoYN = params.addrinfoYN;
  if (params.mapinfoYN) queryParams.mapinfoYN = params.mapinfoYN;
  if (params.overviewYN) queryParams.overviewYN = params.overviewYN;

  return callApi<DetailCommonResponse>("/detailCommon2", queryParams);
}

/**
 * 소개 정보 조회
 * @param params 조회 파라미터
 * @returns 운영 정보
 */
export async function getDetailIntro(
  params: GetDetailIntroParams,
): Promise<DetailIntroResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    contentId: params.contentId,
    contentTypeId: params.contentTypeId,
  };

  return callApi<DetailIntroResponse>("/detailIntro2", queryParams);
}

/**
 * 이미지 목록 조회
 * @param params 조회 파라미터
 * @returns 이미지 목록
 */
export async function getDetailImage(
  params: GetDetailImageParams,
): Promise<DetailImageResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    contentId: params.contentId,
  };

  if (params.imageYN) queryParams.imageYN = params.imageYN;
  if (params.subImageYN) queryParams.subImageYN = params.subImageYN;
  if (params.numOfRows) queryParams.numOfRows = params.numOfRows;
  if (params.pageNo) queryParams.pageNo = params.pageNo;

  return callApi<DetailImageResponse>("/detailImage2", queryParams);
}

/**
 * 반려동물 정보 조회
 * @param params 조회 파라미터
 * @returns 반려동물 정보
 */
export async function getDetailPetTour(
  params: GetDetailPetTourParams,
): Promise<DetailPetTourResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    contentId: params.contentId,
  };

  return callApi<DetailPetTourResponse>("/detailPetTour2", queryParams);
}

/**
 * 응답에서 항목 배열 추출 헬퍼 함수
 */
export function extractItems<T>(response: {
  response: { body: { items?: { item?: T | T[] } } };
}): T[] {
  const items = response.response.body.items?.item;
  if (!items) {
    return [];
  }
  return Array.isArray(items) ? items : [items];
}

/**
 * TourItem 타입 가드
 */
export function isTourItem(item: unknown): item is TourItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "contentid" in item &&
    "title" in item &&
    typeof (item as TourItem).contentid === "string" &&
    typeof (item as TourItem).title === "string"
  );
}

/**
 * TourDetail 타입 가드
 */
export function isTourDetail(item: unknown): item is TourDetail {
  return (
    typeof item === "object" &&
    item !== null &&
    "contentid" in item &&
    "title" in item &&
    typeof (item as TourDetail).contentid === "string" &&
    typeof (item as TourDetail).title === "string"
  );
}
