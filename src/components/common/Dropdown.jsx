import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Dropdown({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-primary/15 bg-white px-3 py-2 text-xs font-semibold text-primary whitespace-nowrap"
      >
        {selected?.label || placeholder}
        <ChevronDown size={13} className="text-primary/50" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl z-50 max-h-64 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                o.value === value ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.label}
              {o.value === value && <Check size={14} className="text-purple" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}