"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import useDebounce from "@/hooks/useDebounce";

type TableSearchProps = {
  placeholder?: string;
  setSearchQuery?: (value: string) => void;
  onSearch?: (value: string) => void;
  value?: string; // Added for controlled input
  ariaLabel?: string; // Added for accessibility
};

const TableSearch = ({
  placeholder = "Search...",
  setSearchQuery,
  onSearch,
  value: controlledValue,
  ariaLabel,
}: TableSearchProps) => {
  const [internalValue, setInternalValue] = useState("");
  // Use controlledValue if provided, otherwise fall back to internalValue
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    console.log("TableSearch:", { debouncedValue, setSearchQuery, onSearch });
    if (setSearchQuery && typeof setSearchQuery === "function") {
      setSearchQuery(debouncedValue);
    } else if (onSearch && typeof onSearch === "function") {
      onSearch(debouncedValue);
    } else {
      console.warn("TableSearch: No valid search handler", { setSearchQuery, onSearch });
    }
  }, [debouncedValue, setSearchQuery, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      // Update internal state only if not controlled
      setInternalValue(newValue);
    }
    // Call onSearch or setSearchQuery immediately if provided
    if (onSearch && typeof onSearch === "function") {
      onSearch(newValue);
    } else if (setSearchQuery && typeof setSearchQuery === "function") {
      setSearchQuery(newValue);
    }
  };

  return (
    <div className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="Search" width={14} height={14} />
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-[200px] p-2 bg-transparent outline-none"
        placeholder={placeholder}
        aria-label={ariaLabel || "Search"}
      />
    </div>
  );
};

export default TableSearch;














