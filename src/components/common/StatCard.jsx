import React from "react";

export default function StatCard({ title, value, subtitle, icon: Icon, accentColor = "#00DC46" }) {
  return (
    <div className="rounded-2xl bg-white p-5 border border-primary/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-primary/60">{title}</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{value}</p>
          {subtitle && <p className="mt-1 text-[11px] text-primary/50">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${accentColor}1A` }}>
            <Icon size={20} style={{ color: accentColor }} />
          </div>
        )}
      </div>
    </div>
  );
}