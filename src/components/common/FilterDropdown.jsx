import React from "react";
import { Filter } from "lucide-react";

export default function FilterDropdown({
  label,
  options = [],
  value,
  onChange,
  icon: Icon = Filter,
  className = "",
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#00373A]/20 bg-white py-2 pl-9 pr-8 text-sm font-medium text-[#00373A] shadow-sm transition-all hover:border-[#00373A]/40 focus:border-[#00373A] focus:outline-none focus:ring-2 focus:ring-[#00373A]/10 cursor-pointer"
        >
          {label && <option value="">{label}: All</option>}
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const text = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#00373A]/50">
          <Icon size={16} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#00373A]/40">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
