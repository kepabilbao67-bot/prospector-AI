"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
  subtitle?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              changeType === "positive" && "bg-green-100 text-green-700",
              changeType === "negative" && "bg-red-100 text-red-700",
              changeType === "neutral" && "bg-gray-100 text-gray-700"
            )}
          >
            {changeType === "positive" && "↑"}
            {changeType === "negative" && "↓"}
            {change}
          </span>
          <span className="text-xs text-gray-400">vs. semana anterior</span>
        </div>
      )}
    </div>
  );
}
