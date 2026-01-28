import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  subtext?: string;
}

export function KPICard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon,
  className,
  subtext
}: KPICardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return "text-emerald-400";
    if (trend === 'down') return "text-rose-400";
    return "text-slate-500";
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        {icon && <div className="opacity-70">{icon}</div>}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
        {(trend || subtext) && (
          <div className="flex items-center mt-1">
            {trend && (
              <span className={cn("flex items-center text-xs font-medium mr-2", getTrendColor())}>
                {getTrendIcon()}
                {trendValue}
              </span>
            )}
            {subtext && (
              <p className="text-xs text-slate-500">
                {subtext}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
