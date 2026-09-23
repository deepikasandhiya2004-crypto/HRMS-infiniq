import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "#00DC46",
  trend,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-[#00373A]/10 transition-all hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#00373A]/60">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-[#00373A]">{value}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-[#00373A]/70 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold">
              <span
                className={
                  trend.isPositive ? "text-emerald-600" : "text-rose-600"
                }
              >
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
              <span className="text-[#00373A]/50">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${accentColor}18`,
              color: accentColor,
            }}
          >
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}
