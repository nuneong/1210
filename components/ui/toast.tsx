/**
 * @file toast.tsx
 * @description 토스트 알림 컴포넌트 및 훅
 *
 * sonner 라이브러리를 사용한 토스트 알림 시스템
 * - 성공, 에러, 정보, 경고 타입 지원
 * - 자동 사라짐 (기본 3초)
 * - 수동 닫기 가능
 * - 여러 토스트 동시 표시
 */

"use client";

import { toast as sonnerToast } from "sonner";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

/**
 * Toaster Provider 컴포넌트
 * app/layout.tsx에 추가해야 함
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={3000}
    />
  );
}

/**
 * 토스트 타입별 헬퍼 함수
 */
export const toast = {
  /**
   * 성공 토스트
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      icon: <CheckCircle2 className="w-5 h-5" />,
    });
  },

  /**
   * 에러 토스트
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      icon: <XCircle className="w-5 h-5" />,
    });
  },

  /**
   * 정보 토스트
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      icon: <Info className="w-5 h-5" />,
    });
  },

  /**
   * 경고 토스트
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      icon: <AlertTriangle className="w-5 h-5" />,
    });
  },

  /**
   * 기본 토스트 (커스텀)
   */
  default: (message: string, options?: Parameters<typeof sonnerToast>[1]) => {
    return sonnerToast(message, options);
  },
};

/**
 * useToast 훅 (호환성을 위한 래퍼)
 * @deprecated toast 객체를 직접 사용하는 것을 권장합니다.
 */
export function useToast() {
  return {
    toast,
  };
}

