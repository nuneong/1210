/**
 * @file detail-image.tsx
 * @description 관광지 대표 이미지 컴포넌트 (Client Component)
 *
 * 관광지의 대표 이미지를 표시하는 Client Component입니다.
 * onError 핸들러를 사용하기 위해 Client Component로 분리되었습니다.
 *
 * @dependencies
 * - next/image: 이미지 최적화
 */

"use client";

import Image from "next/image";

interface DetailImageProps {
  /**
   * 이미지 URL
   */
  imageUrl: string;
  /**
   * 대체 텍스트
   */
  alt: string;
  /**
   * 기본 이미지 URL (이미지 로드 실패 시 사용)
   */
  defaultImage?: string;
}

/**
 * 기본 이미지 URL
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 관광지 대표 이미지 컴포넌트
 */
export function DetailImage({
  imageUrl,
  alt,
  defaultImage = DEFAULT_IMAGE,
}: DetailImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 이미지 로드 실패 시 기본 이미지로 대체
    const target = e.target as HTMLImageElement;
    if (target.src !== defaultImage) {
      target.src = defaultImage;
    }
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-muted">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 896px"
        unoptimized={imageUrl.includes("visitkorea")}
        onError={handleError}
      />
    </div>
  );
}

