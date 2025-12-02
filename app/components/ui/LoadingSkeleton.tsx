interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export default function LoadingSkeleton({
  count = 1,
  height = 'h-4',
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
