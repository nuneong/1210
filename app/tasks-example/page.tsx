"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LuCheck, LuX, LuLoader2 } from "lucide-react";

/**
 * Clerk + Supabase 통합 예제 페이지
 * 
 * Clerk 공식 문서의 모범 사례를 따릅니다:
 * https://clerk.com/docs/guides/development/integrations/databases/supabase
 * 
 * 이 페이지는 tasks 테이블을 사용하여 다음을 보여줍니다:
 * - Clerk 세션 토큰을 사용한 Supabase 인증
 * - RLS 정책을 통한 데이터 보호
 * - 사용자별 데이터 조회 및 생성
 */
export default function TasksExamplePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Clerk hooks
  const { user } = useUser();
  const { session } = useSession();

  // Clerk와 통합된 Supabase 클라이언트
  const supabase = useClerkSupabaseClient();

  // 작업 목록 로드
  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("tasks").select();
        if (error) {
          console.error("Error loading tasks:", error);
          // tasks 테이블이 없을 수 있으므로 에러를 무시하지 않음
        } else {
          setTasks(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user, supabase]);

  // 새 작업 생성
  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          name: name.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        alert(`작업 생성 실패: ${error.message}`);
        return;
      }

      // 성공 시 목록에 추가
      setTasks((prev) => [...prev, data]);
      setName("");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("예상치 못한 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // 작업 완료 토글
  async function toggleTask(taskId: number) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        console.error("Error updating task:", error);
        return;
      }

      // 성공 시 목록 업데이트
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? data : t))
      );
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  // 작업 삭제
  async function deleteTask(taskId: number) {
    if (!confirm("정말 이 작업을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        return;
      }

      // 성공 시 목록에서 제거
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-8">
            이 페이지를 사용하려면 먼저 로그인해주세요.
          </p>
          <Link href="/">
            <Button>홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">작업 관리 예제</h1>
        <p className="text-gray-600">
          Clerk + Supabase 통합의 모범 사례를 보여주는 예제입니다.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 참고:</strong> 이 예제는{" "}
            <code className="bg-blue-100 px-1 rounded">tasks</code> 테이블을
            사용합니다. 테이블이 없으면{" "}
            <code className="bg-blue-100 px-1 rounded">
              supabase/migrations/setup_tasks_example.sql
            </code>{" "}
            파일을 실행하세요.
          </p>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
        <h2 className="font-semibold mb-2">현재 사용자</h2>
        <p className="text-sm text-gray-600">
          <strong>ID:</strong> {user.id}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
        </p>
        <p className="text-sm text-gray-600">
          <strong>세션:</strong> {session ? "활성" : "비활성"}
        </p>
      </div>

      {/* 작업 추가 폼 */}
      <form onSubmit={createTask} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            name="name"
            placeholder="새 작업 입력..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? (
              <>
                <LuLoader2 className="w-4 h-4 mr-2 animate-spin" />
                추가 중...
              </>
            ) : (
              "추가"
            )}
          </Button>
        </div>
      </form>

      {/* 작업 목록 */}
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold">작업 목록</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <LuLoader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
            로딩 중...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>작업이 없습니다. 위에서 새 작업을 추가해보세요.</p>
            <p className="text-sm mt-2">
              또는 <code>tasks</code> 테이블이 아직 생성되지 않았을 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {task.completed && <LuCheck className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={
                        task.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }
                    >
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      생성: {new Date(task.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <LuX className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 설명 */}
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold mb-2 text-green-900">
          ✅ 이 예제의 작동 원리
        </h3>
        <ul className="text-sm text-green-900 space-y-1 list-disc list-inside">
          <li>
            <code>useSession()</code>으로 Clerk 세션 토큰을 가져옵니다
          </li>
          <li>
            <code>useClerkSupabaseClient()</code>가 Clerk 토큰을 Supabase에
            자동으로 전달합니다
          </li>
          <li>
            RLS 정책에 따라 각 사용자는 자신의 작업만 조회/수정/삭제할 수
            있습니다
          </li>
          <li>
            새 작업 생성 시 <code>user_id</code>가 자동으로 설정됩니다
          </li>
        </ul>
      </div>
    </div>
  );
}

