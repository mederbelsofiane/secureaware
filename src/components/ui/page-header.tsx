import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent-blue" />
          </div>
        )}
        <div>
          <h1 className="section-title">{title}</h1>
          {description && <p className="section-subtitle mb-0">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
