import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * 관광지 카드용 스켈레톤
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      {/* 이미지 스켈레톤 */}
      <Skeleton className="aspect-video w-full rounded-lg mb-4" />
      
      {/* 제목 스켈레톤 */}
      <Skeleton className="h-6 w-3/4 mb-2" />
      
      {/* 주소 스켈레톤 */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      
      {/* 뱃지 스켈레톤 */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}

/**
 * 목록용 스켈레톤 (여러 카드)
 */
function SkeletonList({ 
  count = 6,
  className 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * 텍스트 라인용 스켈레톤
 */
function SkeletonText({ 
  lines = 3,
  width = "full",
  className 
}: { 
  lines?: number
  width?: "full" | "3/4" | "1/2" | "2/3"
  className?: string 
}) {
  const widthClass = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "2/3": "w-2/3",
  }[width]

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? widthClass : "w-full"
          )} 
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonText }
