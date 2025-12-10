/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 다양한 에러 타입 표시 (API 에러, 네트워크 에러, 404 등)
 * - 재시도 버튼 제공
 * - 닫기 기능
 * - 아이콘 표시
 */

"use client";

import { AlertCircle, TriangleAlert, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ErrorMessageProps {
  /**
   * 에러 제목
   */
  title?: string;
  /**
   * 에러 메시지 (필수)
   */
  message: string;
  /**
   * 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 닫기 함수
   */
  onClose?: () => void;
  /**
   * 에러 타입
   * @default "error"
   */
  variant?: "error" | "warning" | "info";
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 에러 메시지 컴포넌트
 */
export function ErrorMessage({
  title,
  message,
  onRetry,
  onClose,
  variant = "error",
  className,
}: ErrorMessageProps) {
  const variantStyles = {
    error: {
      container: "bg-destructive/10 border-destructive/20 text-destructive",
      icon: AlertCircle,
      iconColor: "text-destructive",
    },
    warning: {
      container: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
      icon: TriangleAlert,
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    info: {
      container: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        style.container,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", style.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-xs"
              >
                다시 시도
              </Button>
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ErrorPageProps {
  /**
   * HTTP 상태 코드
   */
  statusCode?: number;
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 홈으로 가기 함수
   */
  onGoHome?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 전체 페이지 에러 표시 컴포넌트 (404 등)
 */
export function ErrorPage({
  statusCode,
  message,
  onGoHome,
  className,
}: ErrorPageProps) {
  const defaultMessages: Record<number, string> = {
    404: "페이지를 찾을 수 없습니다.",
    500: "서버 오류가 발생했습니다.",
    403: "접근 권한이 없습니다.",
  };

  const errorMessage = message || defaultMessages[statusCode || 500] || "오류가 발생했습니다.";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4",
        className
      )}
    >
      <div className="text-center space-y-4">
        {statusCode && (
          <h1 className="text-6xl font-bold text-muted-foreground">
            {statusCode}
          </h1>
        )}
        <h2 className="text-2xl font-semibold">오류가 발생했습니다</h2>
        <p className="text-muted-foreground max-w-md">{errorMessage}</p>
        <div className="flex gap-2 justify-center mt-6">
          {onGoHome ? (
            <Button onClick={onGoHome}>홈으로 가기</Button>
          ) : (
            <Button asChild>
              <Link href="/">홈으로 가기</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

