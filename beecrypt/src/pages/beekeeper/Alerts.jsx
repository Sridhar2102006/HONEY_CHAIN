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
    <div className="space-y-3.5">
      {!compact && (
        <PageHeader
          title="Apiary Alerts"
          sub="Real-time environmental and sensor condition notifications."
        />
      )}
      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />
      <div className="space-y-2.5">
        {alerts.length === 0 ? (
          <EmptyState
            title="All systems normal"
            subtitle="No critical or warning events detected for this apiary."
          />
        ) : (
          alerts.map((a) => <AlertCard key={a.alertId} alert={a} />)
        )}
      </div>
    </div>
  );
}
