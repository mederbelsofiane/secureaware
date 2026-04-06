"use client";

import Link from "next/link";

export default function UserDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-container">
      <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center max-w-lg mx-auto mt-16">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-xl">⚠</span>
        </div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Failed to Load User Profile
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          {error?.message ?? "An unexpected error occurred while loading this user."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link href="/admin/users" className="btn-secondary">
            ← Back to Users
          </Link>
        </div>
      </div>
    </div>
  );
}
