/**
 * @file tour.ts
 * @description 한국관광공사 공공 API 타입 정의
 *
 * 이 파일은 한국관광공사 공공 API의 모든 응답 타입을 정의합니다.
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 항목
 * - TourDetail: 관광지 상세 정보
 * - TourIntro: 운영 정보
 * - TourImage: 이미지 정보
 * - PetTourInfo: 반려동물 정보
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

/**
 * 관광 타입 ID
 * - 12: 관광지
 * - 14: 문화시설
 * - 15: 축제/행사
 * - 25: 여행코스
 * - 28: 레포츠
 * - 32: 숙박
 * - 38: 쇼핑
 * - 39: 음식점
 */
export type ContentTypeId =
  | '12' // 관광지
  | '14' // 문화시설
  | '15' // 축제/행사
  | '25' // 여행코스
  | '28' // 레포츠
  | '32' // 숙박
  | '38' // 쇼핑
  | '39'; // 음식점

/**
 * 관광 타입 ID 상수
 */
export const CONTENT_TYPE_IDS = {
  TOURIST_SPOT: '12' as const,
  CULTURAL_FACILITY: '14' as const,
  FESTIVAL: '15' as const,
  TOUR_COURSE: '25' as const,
  LEISURE_SPORTS: '28' as const,
  ACCOMMODATION: '32' as const,
  SHOPPING: '38' as const,
  RESTAURANT: '39' as const,
} as const;

/**
 * 관광 타입 이름 매핑
 */
export const CONTENT_TYPE_NAMES: Record<ContentTypeId, string> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

/**
 * 지역 코드 타입 (문자열)
 */
export type AreaCode = string;

/**
 * 관광지 목록 항목 (areaBasedList2 응답)
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 제목 (관광지명) */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 제목 (관광지명) */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 */
  homepage?: string;
  /** 개요 (긴 설명) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계, 정수형) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) */
  mapy: string;
}

/**
 * 운영 정보 (detailIntro2 응답)
 * 타입별로 필드가 다르므로 선택적 필드로 정의
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 */
  chkbabycarriage?: string;
  /** 장애인 편의시설 */
  chkcreditcard?: string;
  /** 기타 정보 */
  [key: string]: string | undefined;
}

/**
 * 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 원본 이미지 URL */
  originimgurl: string;
  /** 썸네일 이미지 URL */
  smallimageurl: string;
  /** 이미지 순번 */
  serialnum: string;
}

/**
 * 반려동물 정보 (detailPetTour2 응답)
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 애완동물 동반 여부 */
  chkpetleash?: string;
  /** 애완동물 크기 */
  chkpetsize?: string;
  /** 입장 가능 장소 */
  chkpetplace?: string;
  /** 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
  /** 주차장 정보 */
  parking?: string;
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCodeItem {
  /** 지역코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 상위 지역코드 (시/도는 null) */
  rnum?: string;
}

/**
 * 제네릭 API 응답 래퍼
 */
export interface ApiResponse<T> {
  /** 응답 본문 */
  response: {
    /** 응답 헤더 */
    header: {
      /** 결과 코드 */
      resultCode: string;
      /** 결과 메시지 */
      resultMsg: string;
    };
    /** 응답 본문 */
    body: {
      /** 데이터 타입 */
      items?: {
        /** 항목 배열 */
        item?: T | T[];
      };
      /** 전체 개수 */
      totalCount?: number;
      /** 페이지 번호 */
      pageNo?: number;
      /** 페이지당 항목 수 */
      numOfRows?: number;
    };
  };
}

/**
 * 지역코드 조회 응답
 */
export type AreaCodeResponse = ApiResponse<AreaCodeItem>;

/**
 * 지역 기반 목록 응답
 */
export type AreaBasedListResponse = ApiResponse<TourItem>;

/**
 * 키워드 검색 응답
 */
export type SearchKeywordResponse = ApiResponse<TourItem>;

/**
 * 공통 정보 조회 응답
 */
export type DetailCommonResponse = ApiResponse<TourDetail>;

/**
 * 소개 정보 조회 응답
 */
export type DetailIntroResponse = ApiResponse<TourIntro>;

/**
 * 이미지 목록 조회 응답
 */
export type DetailImageResponse = ApiResponse<TourImage>;

/**
 * 반려동물 정보 조회 응답
 */
export type DetailPetTourResponse = ApiResponse<PetTourInfo>;

/**
 * API 요청 파라미터 타입
 */
export interface BaseApiParams {
  /** 서비스 키 */
  serviceKey: string;
  /** 모바일 OS */
  MobileOS: string;
  /** 모바일 앱 이름 */
  MobileApp: string;
  /** 응답 타입 */
  _type: string;
}

/**
 * 지역코드 조회 파라미터
 */
export interface GetAreaCodeParams extends Partial<BaseApiParams> {
  /** 페이지당 항목 수 */
  numOfRows?: number;
  /** 페이지 번호 */
  pageNo?: number;
}

/**
 * 지역 기반 목록 조회 파라미터
 */
export interface GetAreaBasedListParams extends Partial<BaseApiParams> {
  /** 지역코드 */
  areaCode: string;
  /** 콘텐츠타입ID */
  contentTypeId?: ContentTypeId;
  /** 시군구코드 */
  sigunguCode?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 */
  modifiedtime?: string;
  /** 페이지당 항목 수 */
  numOfRows?: number;
  /** 페이지 번호 */
  pageNo?: number;
}

/**
 * 키워드 검색 파라미터
 */
export interface SearchKeywordParams extends Partial<BaseApiParams> {
  /** 검색 키워드 */
  keyword: string;
  /** 지역코드 */
  areaCode?: string;
  /** 콘텐츠타입ID */
  contentTypeId?: ContentTypeId;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 목록 여부 */
  listYN?: string;
  /** 정렬 */
  arrange?: string;
  /** 수정일 */
  modifiedtime?: string;
  /** 페이지당 항목 수 */
  numOfRows?: number;
  /** 페이지 번호 */
  pageNo?: number;
}

/**
 * 공통 정보 조회 파라미터
 */
export interface GetDetailCommonParams extends Partial<BaseApiParams> {
  /** 콘텐츠ID */
  contentId: string;
  /** 콘텐츠타입ID */
  contentTypeId?: ContentTypeId;
  /** 기본 정보 여부 */
  defaultYN?: string;
  /** 첫 이미지 여부 */
  firstImageYN?: string;
  /** 지역코드 여부 */
  areacodeYN?: string;
  /** 카테고리 코드 여부 */
  catcodeYN?: string;
  /** 주소 정보 여부 */
  addrinfoYN?: string;
  /** 지도 정보 여부 */
  mapinfoYN?: string;
  /** 개요 여부 */
  overviewYN?: string;
}

/**
 * 소개 정보 조회 파라미터
 */
export interface GetDetailIntroParams extends Partial<BaseApiParams> {
  /** 콘텐츠ID */
  contentId: string;
  /** 콘텐츠타입ID */
  contentTypeId: ContentTypeId;
}

/**
 * 이미지 목록 조회 파라미터
 */
export interface GetDetailImageParams extends Partial<BaseApiParams> {
  /** 콘텐츠ID */
  contentId: string;
  /** 이미지 여부 */
  imageYN?: string;
  /** 서브 이미지 여부 */
  subImageYN?: string;
  /** 페이지당 항목 수 */
  numOfRows?: number;
  /** 페이지 번호 */
  pageNo?: number;
}

/**
 * 반려동물 정보 조회 파라미터
 */
export interface GetDetailPetTourParams extends Partial<BaseApiParams> {
  /** 콘텐츠ID */
  contentId: string;
}

