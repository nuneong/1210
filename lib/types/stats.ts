/**
 * @file stats.ts
 * @description 통계 대시보드 타입 정의
 *
 * 이 파일은 통계 대시보드 페이지에서 사용하는 모든 타입을 정의합니다.
 *
 * 주요 타입:
 * - RegionStats: 지역별 관광지 통계
 * - TypeStats: 타입별 관광지 통계
 * - StatsSummary: 통계 요약 정보
 *
 * @see {@link docs/PRD.md} - 통계 대시보드 요구사항 (2.6)
 */

import type { ContentTypeId } from './tour';

/**
 * 지역별 통계 정보
 */
export interface RegionStats {
  /** 지역 코드 */
  areaCode: string;
  /** 지역명 */
  areaName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 타입별 통계 정보
 */
export interface TypeStats {
  /** 콘텐츠 타입 ID */
  contentTypeId: ContentTypeId;
  /** 타입명 */
  typeName: string;
  /** 관광지 개수 */
  count: number;
  /** 전체 대비 비율 (백분율) */
  percentage?: number;
}

/**
 * Top 3 지역 정보
 */
export interface TopRegion {
  /** 지역 코드 */
  areaCode: string;
  /** 지역명 */
  areaName: string;
  /** 관광지 개수 */
  count: number;
  /** 순위 */
  rank: number;
}

/**
 * Top 3 타입 정보
 */
export interface TopType {
  /** 콘텐츠 타입 ID */
  contentTypeId: ContentTypeId;
  /** 타입명 */
  typeName: string;
  /** 관광지 개수 */
  count: number;
  /** 순위 */
  rank: number;
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** 가장 많은 관광지가 있는 지역 Top 3 */
  topRegions: TopRegion[];
  /** 가장 많은 관광 타입 Top 3 */
  topTypes: TopType[];
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}

/**
 * 통계 데이터 (전체)
 */
export interface StatsData {
  /** 지역별 통계 목록 */
  regionStats: RegionStats[];
  /** 타입별 통계 목록 */
  typeStats: TypeStats[];
  /** 통계 요약 */
  summary: StatsSummary;
}

