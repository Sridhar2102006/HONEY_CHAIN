import React, { useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import BatchCard from "../../components/BatchCard.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

const FILTERS = ["All", "Pending", "In Progress", "Completed"];

export default function HoneyBatches() {
  const { batches } = useApp();
  const [filter, setFilter] = useState("All");
  const filtered = batches.filter((b) => filter === "All" || b.processingStatus === filter);

  return (
    <div>
      <PageHeader title="Honey Batches" sub="Every batch a beekeeper records appears here immediately." />
      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? <EmptyState title="No batches" /> : filtered.map((b) => (
          <BatchCard key={b.batchId} batch={b} to={`/app/processor/processing?batchId=${b.batchId}`} />
        ))}
      </div>
    </div>
  );
}
