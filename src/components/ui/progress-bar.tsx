"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "red" | "yellow";
  showLabel?: boolean;
  className?: string;
}

const colorMap = {
  blue: "bg-accent-blue",
  green: "bg-emerald-500",
  purple: "bg-accent-purple",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
};

const sizeMap = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  color = "blue",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-gray-300 font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-dark-700 rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorMap[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
