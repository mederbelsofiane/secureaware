import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  suffix?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, change, suffix, className }: StatCardProps) {
  return (
    <div className={cn("stat-card group hover:border-gray-600/50 transition-all duration-200", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-blue" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">
          {value}{suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
        </span>
        {change !== undefined && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full mb-1",
            change >= 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}
