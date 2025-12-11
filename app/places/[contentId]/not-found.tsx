/**
 * @file not-found.tsx
 * @description 상세페이지 404 에러 컴포넌트
 *
 * 존재하지 않는 관광지 상세페이지 접근 시 표시되는 404 페이지입니다.
 *
 * @dependencies
 * - next/link: Link 컴포넌트
 * - components/ui/button.tsx: 버튼 컴포넌트
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 404 에러 페이지 컴포넌트
 */
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] py-8">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-16">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">관광지를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground max-w-md">
            요청하신 관광지 정보를 찾을 수 없습니다.
            <br />
            관광지 ID가 올바른지 확인해주세요.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">관광지 목록 보기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

