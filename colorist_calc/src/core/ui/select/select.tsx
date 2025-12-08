import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

export const Select: React.FC<{
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}> = ({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  disabled = false,
  style,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={Object.assign({ padding: "8px", fontSize: "16px" }, style)}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
