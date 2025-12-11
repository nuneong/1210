/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 지도 API v3 (NCP)를 사용하여 관광지 목록을 지도에 마커로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 초기화 및 표시
 * 2. 관광지 마커 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 리스트-지도 양방향 연동
 * 5. 지도 컨트롤 (줌, 지도 유형)
 *
 * 핵심 구현 로직:
 * - Naver Maps API 스크립트 동적 로드
 * - KATEC 좌표를 WGS84로 변환하여 마커 표시
 * - 선택된 관광지로 지도 이동 및 마커 강조
 *
 * @dependencies
 * - lib/utils/coordinate.ts: 좌표 변환 유틸리티
 * - lib/utils/region-coordinates.ts: 지역별 중심 좌표
 * - lib/utils/env.ts: 환경변수 유틸리티
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { convertKATECToWGS84 } from "@/lib/utils/coordinate";
import { getRegionCenter } from "@/lib/utils/region-coordinates";
import { getNaverMapClientId } from "@/lib/utils/env";
import type { TourItem } from "@/lib/types/tour";

/**
 * 네이버 지도 전역 타입 선언
 */
declare global {
  interface Window {
    naver?: typeof naver;
  }
}

interface NaverMapProps {
  /**
   * 관광지 목록
   */
  tours: TourItem[];
  /**
   * 선택된 관광지 ID
   */
  selectedTourId?: string | null;
  /**
   * 관광지 선택 콜백
   */
  onTourSelect?: (tourId: string) => void;
  /**
   * 초기 중심 좌표
   */
  initialCenter?: { lng: number; lat: number };
  /**
   * 초기 줌 레벨
   */
  initialZoom?: number;
  /**
   * 지역 코드 (초기 중심 좌표 결정용)
   */
  areaCode?: string | null;
}

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedTourId,
  onTourSelect,
  initialCenter,
  initialZoom = 10,
  areaCode,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"normal" | "satellite">("normal");

  // 초기 중심 좌표 결정
  const center = initialCenter || getRegionCenter(areaCode);

  /**
   * 네이버 지도 API 스크립트 로드
   */
  useEffect(() => {
    const clientId = getNaverMapClientId();
    if (!clientId) {
      setError("네이버 지도 API 키가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      setIsLoading(false);
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      setIsLoading(false);
    };
    script.onerror = () => {
      setError("네이버 지도 API를 불러올 수 없습니다.");
      setIsLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
      // document.head.removeChild(script);
    };
  }, []);

  /**
   * 지도 초기화
   */
  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps || isLoading) {
      return;
    }

    // 기존 지도 인스턴스가 있으면 제거
    if (mapInstanceRef.current) {
      return;
    }

    try {
      console.log("[NaverMap] 지도 초기화 시작");
      
      // 지도 생성
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: initialZoom,
        mapTypeControl: false, // 기본 컨트롤 비활성화 (커스텀 컨트롤 사용)
      });

      mapInstanceRef.current = map;

      // 지도 타입 설정
      if (mapType === "satellite") {
        map.setMapTypeId(window.naver.maps.MapTypeId.SATELLITE);
      }

      // 지도 준비 완료 상태 설정 (마커 생성 트리거)
      setIsMapReady(true);
      console.log("[NaverMap] 지도 초기화 완료");
    } catch (err) {
      console.error("지도 초기화 실패:", err);
      setError("지도를 초기화할 수 없습니다.");
    }
  }, [center.lat, center.lng, initialZoom, isLoading, mapType]);

  /**
   * 마커 생성 및 표시
   */
  useEffect(() => {
    // 지도가 준비되지 않았으면 건너뛰기
    if (!isMapReady) {
      console.warn("[NaverMap] 지도가 아직 준비되지 않았습니다.");
      return;
    }

    // 조건 확인 강화
    if (!mapInstanceRef.current) {
      console.warn("[NaverMap] 지도 인스턴스가 없습니다.");
      return;
    }

    if (!window.naver?.maps) {
      console.warn("[NaverMap] 네이버 지도 API가 로드되지 않았습니다.");
      return;
    }

    if (!tours || tours.length === 0) {
      console.warn("[NaverMap] 관광지 목록이 비어있습니다.");
      return;
    }

    const map = mapInstanceRef.current;
    console.log(`[NaverMap] 마커 생성 준비: ${tours.length}개 관광지, 지도 인스턴스 존재:`, !!map);

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 인포윈도우 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 새로운 마커 생성
    console.log(`[NaverMap] 마커 생성 시작: ${tours.length}개 관광지`);
    
    tours.forEach((tour) => {
      const coords = convertKATECToWGS84(tour.mapx, tour.mapy);
      if (!coords) {
        console.warn(`[NaverMap] 좌표 변환 실패: ${tour.title}`, { mapx: tour.mapx, mapy: tour.mapy });
        return; // 좌표가 없으면 마커 생성 안 함
      }

      const position = new window.naver.maps.LatLng(coords.lat, coords.lng);

      // 마커 생성
      const isSelected = tour.contentid === selectedTourId;
      const icon = getMarkerIcon(tour.contenttypeid, isSelected);
      
      if (!icon) {
        console.error(`[NaverMap] 마커 아이콘 생성 실패: ${tour.title}`);
        return;
      }

      try {
        const marker = new window.naver.maps.Marker({
          position,
          map,
          title: tour.title,
          icon: icon,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, "click", () => {
          if (onTourSelect) {
            onTourSelect(tour.contentid);
          }

          // 인포윈도우 표시
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.naver.maps.InfoWindow({
              content: getInfoWindowContent(tour),
            });
          } else {
            infoWindowRef.current.setContent(getInfoWindowContent(tour));
          }

          infoWindowRef.current.open(map, marker);
        });

        markersRef.current.push(marker);
        console.log(`[NaverMap] 마커 생성 완료: ${tour.title}`, { coords, isSelected });
      } catch (error) {
        console.error(`[NaverMap] 마커 생성 실패: ${tour.title}`, error);
      }
    });
    
    console.log(`[NaverMap] 마커 생성 완료: 총 ${markersRef.current.length}개 마커 표시`);
  }, [tours, selectedTourId, onTourSelect, isMapReady]);

  /**
   * 선택된 관광지로 지도 이동 및 마커 아이콘 업데이트
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const map = mapInstanceRef.current;

    // 모든 마커의 아이콘 업데이트 (선택 상태 반영)
    markersRef.current.forEach((marker, index) => {
      const tour = tours[index];
      if (!tour) return;

      const isSelected = tour.contentid === selectedTourId;
      const icon = getMarkerIcon(tour.contenttypeid, isSelected);
      marker.setIcon(icon);
    });

    // 선택된 관광지가 있으면 지도 이동
    if (selectedTourId) {
      const tour = tours.find((t) => t.contentid === selectedTourId);
      if (!tour) {
        return;
      }

      const coords = convertKATECToWGS84(tour.mapx, tour.mapy);
      if (!coords) {
        return;
      }

      const position = new window.naver.maps.LatLng(coords.lat, coords.lng);

      // 지도 이동 (애니메이션)
      map.panTo(position);

      // 해당 마커 찾아서 인포윈도우 표시
      const marker = markersRef.current.find(
        (m) => m.getTitle() === tour.title
      );
      if (marker) {
        if (!infoWindowRef.current) {
          infoWindowRef.current = new window.naver.maps.InfoWindow({
            content: getInfoWindowContent(tour),
          });
        } else {
          infoWindowRef.current.setContent(getInfoWindowContent(tour));
        }
        infoWindowRef.current.open(map, marker);
      }
    }
  }, [selectedTourId, tours]);

  /**
   * 지도 타입 변경
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    const map = mapInstanceRef.current;
    if (mapType === "satellite") {
      map.setMapTypeId(window.naver.maps.MapTypeId.SATELLITE);
    } else {
      map.setMapTypeId(window.naver.maps.MapTypeId.NORMAL);
    }
  }, [mapType]);

  /**
   * 줌 인
   */
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const zoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(zoom + 1);
    }
  };

  /**
   * 줌 아웃
   */
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const zoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(zoom - 1);
    }
  };

  /**
   * 지도 타입 토글
   */
  const handleToggleMapType = () => {
    setMapType((prev) => (prev === "normal" ? "satellite" : "normal"));
  };

  if (error) {
    return (
      <div className="h-full min-h-[600px] lg:min-h-[600px] rounded-lg border bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-semibold mb-2">⚠️ 지도 로드 실패</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[600px] lg:min-h-[600px] rounded-lg border overflow-hidden">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">지도 로딩 중...</p>
          </div>
        </div>
      )}

      {/* 지도 컨트롤 */}
      {!isLoading && mapInstanceRef.current && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* 줌 컨트롤 */}
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="줌 인"
            >
              <span className="text-xl">+</span>
            </button>
            <div className="border-t" />
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="줌 아웃"
            >
              <span className="text-xl">−</span>
            </button>
          </div>

          {/* 지도 타입 토글 */}
          <button
            onClick={handleToggleMapType}
            className="bg-white rounded-lg shadow-md border px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
            aria-label={`지도 타입: ${mapType === "normal" ? "일반" : "스카이뷰"}`}
          >
            {mapType === "normal" ? "🗺️ 일반" : "🛰️ 스카이뷰"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 마커 아이콘 생성
 */
function getMarkerIcon(
  contentTypeId: string,
  isSelected: boolean
): any {
  if (!window.naver?.maps) {
    console.error("[NaverMap] 네이버 지도 API가 로드되지 않았습니다.");
    return null;
  }

  const colors: Record<string, string> = {
    "12": "#3B82F6", // 관광지 - 파란색
    "14": "#8B5CF6", // 문화시설 - 보라색
    "15": "#EC4899", // 축제/행사 - 핑크색
    "25": "#10B981", // 여행코스 - 초록색
    "28": "#F59E0B", // 레포츠 - 주황색
    "32": "#6366F1", // 숙박 - 인디고색
    "38": "#EF4444", // 쇼핑 - 빨간색
    "39": "#F97316", // 음식점 - 오렌지색
  };

  const color = colors[contentTypeId] || "#6B7280";
  const size = isSelected ? 32 : 24;
  const borderWidth = isSelected ? 3 : 2;

  try {
    return {
      content: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: ${borderWidth}px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>
      `,
      size: new window.naver.maps.Size(size, size),
      anchor: new window.naver.maps.Point(size / 2, size / 2),
    };
  } catch (error) {
    console.error("[NaverMap] 마커 아이콘 생성 실패:", error);
    return null;
  }
}

/**
 * 인포윈도우 내용 HTML 생성
 */
function getInfoWindowContent(tour: TourItem): string {
  const imageUrl = tour.firstimage || tour.firstimage2 || "/logo.png";
  const detailUrl = `/places/${tour.contentid}`;

  return `
    <div style="
      min-width: 200px;
      max-width: 300px;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="margin-bottom: 8px;">
        <img 
          src="${imageUrl}" 
          alt="${tour.title}"
          style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;"
          onerror="this.src='/logo.png'"
        />
        <h3 style="
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #1F2937;
        ">${tour.title}</h3>
        <p style="
          font-size: 12px;
          color: #6B7280;
          margin: 0 0 8px 0;
        ">${tour.addr1 || "주소 정보 없음"}</p>
      </div>
      <a 
        href="${detailUrl}"
        onclick="window.open('${detailUrl}', '_blank'); return false;"
        style="
          display: inline-block;
          padding: 6px 12px;
          background-color: #3B82F6;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        "
        onmouseover="this.style.backgroundColor='#2563EB'"
        onmouseout="this.style.backgroundColor='#3B82F6'"
      >
        상세보기
      </a>
    </div>
  `;
}

