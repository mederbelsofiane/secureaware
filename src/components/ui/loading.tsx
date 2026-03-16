"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-600 border-t-accent-blue`} />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-600 border-t-accent-blue mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-dark-600 rounded w-1/3 mb-4" />
      <div className="h-8 bg-dark-600 rounded w-1/2 mb-2" />
      <div className="h-3 bg-dark-600 rounded w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-12 bg-dark-700/50" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-t border-gray-700/50 flex items-center gap-4 px-6">
          <div className="h-4 bg-dark-600 rounded w-1/4" />
          <div className="h-4 bg-dark-600 rounded w-1/6" />
          <div className="h-4 bg-dark-600 rounded w-1/5" />
          <div className="h-4 bg-dark-600 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}
