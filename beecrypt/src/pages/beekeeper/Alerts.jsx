import React, { useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import AlertCard from "../../components/AlertCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import * as hiveService from "../../services/hiveService.js";

const FILTERS = ["All", "Critical", "Warning"];

export default function Alerts({ hiveId, compact = false }) {
  const [filter, setFilter] = useState("All");
  let alerts = hiveService.listAlerts(hiveId);
  if (filter !== "All") alerts = alerts.filter((a) => a.level === filter.toLowerCase());

  return (
    <div>
      {!compact && <PageHeader title="Alerts" sub="Stay ahead of hive conditions that need attention." />}
      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />
      <div className="flex flex-col gap-2.5">
        {alerts.length === 0 ? <EmptyState title="No alerts" /> : alerts.map((a) => <AlertCard key={a.alertId} alert={a} />)}
      </div>
    </div>
  );
}
