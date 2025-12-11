/**
 * @file map-view.tsx
 * @description 지도 뷰 컴포넌트 (Client Component)
 *
 * 네이버 지도를 표시하고 마커를 표시하는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 초기화 및 표시
 * 2. 관광지 위치에 마커 표시
 * 3. 길찾기 버튼 제공
 * 4. 좌표 정보 표시 (선택 사항)
 *
 * @dependencies
 * - lib/utils/env.ts: getNaverMapClientId
 * - components/ui/button.tsx: 버튼 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { getNaverMapClientId } from "@/lib/utils/env";
import { Button } from "@/components/ui/button";
import { Navigation, Loader2 } from "lucide-react";

/**
 * 네이버 지도 전역 타입 선언
 */
declare global {
  interface Window {
    naver?: typeof naver;
  }
}

interface MapViewProps {
  /**
   * 위도 (WGS84)
   */
  lat: number;
  /**
   * 경도 (WGS84)
   */
  lng: number;
  /**
   * 관광지명
   */
  title: string;
}

/**
 * 네이버 지도 길찾기 URL 생성
 */
function getNaverMapDirectionsUrl(lat: number, lng: number): string {
  return `https://map.naver.com/v5/directions/${lat},${lng}`;
}

/**
 * 지도 뷰 컴포넌트
 */
export function MapView({ lat, lng, title }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 컴포넌트에서도 사용 가능)
    };
  }, []);

  /**
   * 지도 초기화
   */
  useEffect(() => {
    if (!mapRef.current || !window.naver?.maps || isLoading) {
      return;
    }

    // 기존 지도 인스턴스가 있으면 제거하지 않음 (재사용)
    if (mapInstanceRef.current) {
      return;
    }

    try {
      // 지도 생성
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom: 16,
        mapTypeControl: false,
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    } catch (err) {
      console.error("지도 초기화 실패:", err);
      setError("지도를 초기화할 수 없습니다.");
    }
  }, [lat, lng, isLoading]);

  /**
   * 마커 생성
   */
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.naver?.maps) {
      return;
    }

    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    try {
      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: mapInstanceRef.current,
        title: title,
      });

      markerRef.current = marker;
    } catch (err) {
      console.error("마커 생성 실패:", err);
    }
  }, [isMapReady, lat, lng, title]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, []);

  // 에러 상태
  if (error) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg bg-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const directionsUrl = getNaverMapDirectionsUrl(lat, lng);

  return (
    <div className="space-y-4">
      {/* 지도 컨테이너 */}
      <div
        ref={mapRef}
        className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden bg-muted"
        aria-label={`${title} 위치 지도`}
      />

      {/* 길찾기 버튼 */}
      <div className="flex justify-center">
        <Button
          asChild
          variant="default"
          className="gap-2"
        >
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="네이버 지도에서 길찾기"
          >
            <Navigation className="h-4 w-4" />
            길찾기
          </a>
        </Button>
      </div>
    </div>
  );
}

