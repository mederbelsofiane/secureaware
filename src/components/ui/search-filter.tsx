"use client";

import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
  }[];
  className?: string;
}

export function SearchFilter({
  searchValue, onSearchChange, placeholder = "Search...", filters, className,
}: SearchFilterProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-10 pr-10"
          maxLength={200}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-dark-600 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      {filters?.map((filter) => (
        <div key={filter.value} className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="input-field py-2 min-w-[140px]"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
