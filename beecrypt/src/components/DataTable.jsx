import React from "react";
import EmptyState from "./EmptyState.jsx";

/**
 * Mobile-First Responsive DataTable.
 * On mobile viewports (< 640px), automatically transforms rows into touch-friendly cards
 * so columns are never squished or clipped horizontally.
 * On desktop viewports (>= 640px), renders the traditional clean table.
 */
export default function DataTable({ columns, rows, rowKey = "id", emptyTitle = "No records" }) {
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} />;

  const titleCol = columns[0];
  const otherCols = columns.slice(1);

  return (
    <div>
      {/* Mobile Card List View (Phones / narrow containers) */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row[rowKey]}
            className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs"
          >
            {/* Header: First column as title */}
            <div className="font-display font-bold text-base text-bc-deep-green pb-2 border-b border-[#F2EDE2]">
              {titleCol.render ? titleCol.render(row) : row[titleCol.key]}
            </div>

            {/* Other columns formatted as 2-column key-value grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2.5 text-xs">
              {otherCols.map((c) => (
                <div key={c.key} className="flex flex-col">
                  <span className="text-[#8A9086] text-[11px] font-medium">{c.label}</span>
                  <div className="font-semibold text-bc-dark text-[13px] mt-0.5">
                    {c.render ? c.render(row) : row[c.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 640px) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-[#ECE6D6] overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#F3F1E8] text-left">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-bold text-[#6B7267] text-xs uppercase tracking-wider">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]} className="border-t border-[#ECE6D6] hover:bg-[#FAF8F2] transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
