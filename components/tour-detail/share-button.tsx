/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 관광지 상세페이지 URL을 클립보드에 복사하는 기능을 제공하는 버튼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 클립보드 API를 사용한 URL 복사
 * 2. 복사 완료 토스트 메시지
 * 3. 에러 처리 (HTTPS 환경 확인)
 *
 * @dependencies
 * - components/ui/button.tsx: 버튼 컴포넌트
 * - components/ui/toast.tsx: 토스트 알림
 * - lucide-react: Share2, Check 아이콘
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ShareButtonProps {
  /**
   * 공유할 URL (절대 URL)
   */
  url: string;
}

/**
 * 공유 버튼 컴포넌트
 */
export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // 클립보드 API 사용 (HTTPS 환경 필수)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback: 구식 방법 (HTTPS가 아닌 환경)
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand("copy");
        } catch (err) {
          throw new Error("복사에 실패했습니다.");
        } finally {
          document.body.removeChild(textArea);
        }
      }

      setCopied(true);
      toast.success("링크가 복사되었습니다");
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("링크 복사 실패:", error);
      toast.error("링크 복사에 실패했습니다");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2"
      aria-label="링크 공유"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          공유
        </>
      )}
    </Button>
  );
}

