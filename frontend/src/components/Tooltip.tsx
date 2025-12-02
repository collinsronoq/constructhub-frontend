import React from "react";

export const Tooltip: React.FC<{ content?: React.ReactNode; children?: React.ReactNode }> = ({
  content,
  children,
}) => {
  return (
    <span className="relative inline-flex items-center group">
      {children}
      {content && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-10 left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;