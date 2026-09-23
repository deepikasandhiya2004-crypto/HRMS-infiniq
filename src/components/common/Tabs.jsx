import React from "react";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = "pill", // 'pill' | 'underline'
  className = "",
}) {
  if (variant === "underline") {
    return (
      <div className={`flex border-b border-[#00373A]/10 gap-6 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`group flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
                isActive
                  ? "text-[#00373A]"
                  : "text-[#00373A]/60 hover:text-[#00373A]"
              }`}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive
                      ? "bg-[#00373A] text-white"
                      : "bg-[#00373A]/10 text-[#00373A]/80"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00373A] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-2xl bg-[#00373A]/5 p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              isActive
                ? "bg-white text-[#00373A] shadow-sm"
                : "text-[#00373A]/60 hover:text-[#00373A]"
            }`}
          >
            {Icon && <Icon size={14} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  isActive
                    ? "bg-[#00373A]/10 text-[#00373A]"
                    : "bg-[#00373A]/10 text-[#00373A]/60"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
