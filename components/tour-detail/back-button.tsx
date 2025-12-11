/**
 * @file back-button.tsx
 * @description 뒤로가기 버튼 컴포넌트
 *
 * 관광지 상세페이지에서 이전 페이지로 돌아가기 위한 버튼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 브라우저 히스토리 기반 뒤로가기
 * 2. 접근성 고려 (키보드 네비게이션, ARIA 라벨)
 *
 * @dependencies
 * - next/navigation: useRouter 훅
 * - components/ui/button.tsx: shadcn/ui 버튼 컴포넌트
 * - lucide-react: ArrowLeft 아이콘
 */

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * 뒤로가기 버튼 컴포넌트
 * 
 * 브라우저 히스토리를 사용하여 이전 페이지로 이동합니다.
 */
export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      aria-label="이전 페이지로 돌아가기"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      뒤로가기
    </Button>
  );
}

