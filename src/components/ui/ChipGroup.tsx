"use client";

import { useState } from "react";

interface ChipGroupProps<T extends string> {
  options: readonly T[];
  defaultValue: T;
  label: string;
  className?: string;
  onChange?: (value: T) => void;
}

/** Single-select pill chips (e.g. the analytics time range). */
export function ChipGroup<T extends string>({
  options,
  defaultValue,
  label,
  className,
  onChange,
}: ChipGroupProps<T>) {
  const [value, setValue] = useState<T>(defaultValue);
  return (
    <div className={`chiprow${className ? ` ${className}` : ""}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`chip${option === value ? " on" : ""}`}
          aria-pressed={option === value}
          onClick={() => {
            setValue(option);
            onChange?.(option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
