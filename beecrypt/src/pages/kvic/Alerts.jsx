import React, { useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import AlertCard from "../../components/AlertCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { ALERTS } from "../../data/mockData.js";

const FILTERS = ["All", "Critical", "Warning"];

export default function KvicAlerts() {
  const [filter, setFilter] = useState("All");
  const list = filter === "All" ? ALERTS : ALERTS.filter((a) => a.level === filter.toLowerCase());
  return (
    <div>
      <PageHeader title="System-Wide Alerts" />
      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />
      <div className="flex flex-col gap-2.5">
        {list.length === 0 ? <EmptyState title="No alerts" /> : list.map((a) => <AlertCard key={a.alertId} alert={a} />)}
      </div>
    </div>
  );
}
