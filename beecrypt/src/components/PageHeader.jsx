import React from "react";

export default function PageHeader({ title, sub, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-bc-deep-green tracking-tight leading-tight">
          {title}
        </h1>
        {sub && (
          <p className="text-xs sm:text-sm text-[#6B7267] mt-1 leading-relaxed">
            {sub}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
