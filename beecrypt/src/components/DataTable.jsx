import React from "react";
import EmptyState from "./EmptyState.jsx";

/**
 * Generic table. columns: [{ key, label, render? }]
 */
export default function DataTable({ columns, rows, rowKey = "id", emptyTitle = "No records" }) {
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} />;
  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#F3F1E8] text-left">
            {columns.map((c) => (
              <th key={c.key} className="px-3.5 py-2.5 font-bold text-[#6B7267]">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-t border-[#ECE6D6]">
              {columns.map((c) => (
                <td key={c.key} className="px-3.5 py-2.5">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
