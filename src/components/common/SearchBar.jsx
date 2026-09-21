import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div
      className={`relative flex items-center rounded-xl border border-[#00373A]/20 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-[#00373A] focus-within:ring-2 focus-within:ring-[#00373A]/10 ${className}`}
    >
      <Search size={18} className="text-[#00373A]/40 shrink-0 mr-2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#00373A] placeholder-[#00373A]/40 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="ml-1 text-[#00373A]/40 hover:text-[#00373A] transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
