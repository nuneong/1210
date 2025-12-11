/**
 * @file image-carousel.tsx
 * @description 이미지 캐러셀 컴포넌트 (Client Component)
 *
 * 이미지 슬라이드 기능과 전체화면 모달을 제공하는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이미지 슬라이드 (이전/다음 버튼)
 * 2. 이미지 인디케이터
 * 3. 이미지 클릭 시 전체화면 모달
 * 4. 키보드 네비게이션 (좌우 화살표, ESC)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - components/ui/dialog.tsx: 모달
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { TourImage } from "@/lib/types/tour";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  /**
   * 이미지 목록
   */
  images: TourImage[];
}

/**
 * 기본 이미지 URL
 */
const DEFAULT_IMAGE = "/logo.png";

/**
 * 이미지 캐러셀 컴포넌트
 */
export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // 키보드 네비게이션
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setModalIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setModalIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, images.length]);

  const handlePrevious = () => {
    setModalIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setModalIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleImageClick = (index: number) => {
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== DEFAULT_IMAGE) {
      target.src = DEFAULT_IMAGE;
    }
  };

  const currentImage = images[currentIndex];
  const modalImage = images[modalIndex];

  return (
    <>
      {/* 캐러셀 뷰 */}
      <div className="relative">
        {/* 메인 이미지 */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-muted mb-4">
          {currentImage && (
            <Image
              src={currentImage.originimgurl || currentImage.smallimageurl || DEFAULT_IMAGE}
              alt={`이미지 ${currentIndex + 1}`}
              fill
              className="object-cover cursor-pointer"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 896px"
              unoptimized={currentImage.originimgurl?.includes("visitkorea") || currentImage.smallimageurl?.includes("visitkorea")}
              onError={handleImageError}
              onClick={() => handleImageClick(currentIndex)}
            />
          )}
        </div>

        {/* 이전/다음 버튼 */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* 인디케이터 */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50"
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}

        {/* 이미지 인덱스 표시 */}
        {images.length > 1 && (
          <div className="text-center text-sm text-muted-foreground mt-2">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* 전체화면 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0">
          {modalImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* 이미지 */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={modalImage.originimgurl || modalImage.smallimageurl || DEFAULT_IMAGE}
                  alt={`이미지 ${modalIndex + 1}`}
                  fill
                  className="object-contain"
                  unoptimized={modalImage.originimgurl?.includes("visitkorea") || modalImage.smallimageurl?.includes("visitkorea")}
                  onError={handleImageError}
                />
              </div>

              {/* 이전 버튼 */}
              {images.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                  onClick={handlePrevious}
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* 다음 버튼 */}
              {images.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                  onClick={handleNext}
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* 이미지 인덱스 표시 */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-4 py-2 rounded-full text-sm">
                  {modalIndex + 1} / {images.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

