import React, { useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import BatchCard from "../../components/BatchCard.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

const FILTERS = ["All", "Pending", "In Progress", "Completed"];

export default function HoneyBatches() {
  const { batches } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = batches.filter((b) => {
    const matchesFilter = filter === "All" || b.processingStatus === filter;
    const matchesSearch =
      b.batchId.toLowerCase().includes(search.toLowerCase()) ||
      b.producerName.toLowerCase().includes(search.toLowerCase()) ||
      (b.honeyType && b.honeyType.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-3.5">
      <PageHeader
        title="Honey Batches"
        sub="Inbound harvest records synced from registered beekeepers."
      />

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9086]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Batch ID, beekeeper, or honey type..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#ECE6D6] text-xs outline-none focus:border-bc-deep-green shadow-xs"
        />
      </div>

      {/* Filter Tabs */}
      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />

      {/* Batch Cards Stack */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="No batches found"
            subtitle="Try changing the filter or search query."
          />
        ) : (
          filtered.map((b) => (
            <BatchCard
              key={b.batchId}
              batch={b}
              to={`/app/processor/processing?batchId=${b.batchId}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
