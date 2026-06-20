"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableSelectProps {
  value: number | null;
  onChange: (val: number) => void;
  className?: string;
}

export default function TableSelect({ value, onChange, className }: TableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-coffee-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm font-medium transition-all hover:bg-coffee-50"
      >
        <span className={value ? "text-coffee-900 font-bold" : "text-coffee-400"}>
          {value ? `Table ${value}` : "Select Table"}
        </span>
        <ChevronDown size={18} className={cn("text-coffee-500 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-coffee-100 py-2 z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                onChange(num);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-coffee-50 text-coffee-800 transition-colors"
            >
              <span className="font-medium">Table {num}</span>
              {value === num && <Check size={16} className="text-olive" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
