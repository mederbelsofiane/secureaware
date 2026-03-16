import { cn, getRiskColor, getRiskLabel, getRiskBgColor } from "@/lib/utils";

interface RiskScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RiskScore({ score, size = "md", showLabel = true }: RiskScoreProps) {
  const sizes = { sm: "w-12 h-12 text-sm", md: "w-20 h-20 text-xl", lg: "w-28 h-28 text-3xl" };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "rounded-full border-2 flex items-center justify-center font-bold",
        sizes[size], getRiskBgColor(score), getRiskColor(score)
      )}>
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", getRiskColor(score))}>
          {getRiskLabel(score)}
        </span>
      )}
    </div>
  );
}
