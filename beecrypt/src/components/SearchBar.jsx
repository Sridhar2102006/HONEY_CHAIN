import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

/**
 * Generic global search. `index` is an array of { label, sublabel, to }.
 * Filters client-side — a real implementation would debounce and hit a
 * backend search endpoint instead.
 */
export default function SearchBar({ index = [], placeholder = "Search BeeCrypt..." }) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return index.filter((item) => item.label.toLowerCase().includes(lower) || item.sublabel?.toLowerCase().includes(lower)).slice(0, 6);
  }, [q, index]);

  return (
    <div className="relative w-60 hidden md:block">
      <div className="flex items-center bg-[#F3F1E8] rounded-xl px-3 py-2">
        <Search size={15} className="text-[#8A9086]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="border-none bg-transparent outline-none ml-2 text-[13.5px] w-full"
        />
      </div>
      {focused && results.length > 0 && (
        <div className="absolute top-[110%] left-0 right-0 bg-white rounded-xl border border-[#ECE6D6] shadow-lg z-30 overflow-hidden">
          {results.map((r, i) => (
            <div key={i} className="px-3.5 py-2.5 text-[13px] hover:bg-[#F8F6EC] cursor-pointer border-b border-[#ECE6D6] last:border-none">
              <div className="font-semibold">{r.label}</div>
              {r.sublabel && <div className="text-xs text-[#8A9086]">{r.sublabel}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
