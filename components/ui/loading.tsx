/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 다양한 크기와 스타일의 로딩 스피너 제공
 * - 중앙 정렬 또는 인라인 표시 옵션
 * - 전체 화면 오버레이 옵션
 * - 텍스트 메시지 표시 옵션
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /**
   * 스피너 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 기본 로딩 스피너 컴포넌트
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )}
      aria-label="로딩 중"
      aria-busy="true"
    />
  );
}

interface LoadingOverlayProps {
  /**
   * 표시할 메시지
   */
  message?: string;
  /**
   * 전체 화면 오버레이 여부
   * @default true
   */
  fullScreen?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 전체 화면 로딩 오버레이 컴포넌트
 */
export function LoadingOverlay({
  message,
  fullScreen = true,
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        !fullScreen && "min-h-[200px]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

interface LoadingInlineProps {
  /**
   * 표시할 메시지
   */
  message?: string;
  /**
   * 스피너 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 인라인 로딩 표시 컴포넌트
 */
export function LoadingInline({
  message,
  size = "md",
  className,
}: LoadingInlineProps) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

