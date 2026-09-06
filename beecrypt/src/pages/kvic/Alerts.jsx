import React, { useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import AlertCard from "../../components/AlertCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

const FILTERS = ["All", "Critical", "Warning"];

export default function KvicAlerts() {
  const { hives } = useApp();
  const [filter, setFilter] = useState("All");

  const hiveAlerts = useMemo(() => {
    return (hives || [])
      .filter((h) => h.status !== "healthy")
      .map((h) => ({
        alertId: `ALT-${h.hiveId}`,
        hiveId: h.hiveId,
        level: h.status === "critical" ? "critical" : "warning",
        title: h.status === "critical" ? `Critical Temp Alert (${h.temp || "39.2"}°C)` : `Elevated Telemetry Alert`,
        message: `Abnormal sensor reading detected in ${h.block || h.region}. Inspect colony hive box.`,
        timestamp: "Recent",
        actionRequired: "Physical Frame Inspection",
      }));
  }, [hives]);

  const list = filter === "All" ? hiveAlerts : hiveAlerts.filter((a) => a.level === filter.toLowerCase());

  return (
    <div>
      <PageHeader title="System-Wide Alerts" />
      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />
      <div className="flex flex-col gap-2.5">
        {list.length === 0 ? <EmptyState title="No alerts" subtitle="All registered apiary hives operating within normal parameters." /> : list.map((a) => <AlertCard key={a.alertId} alert={a} />)}
      </div>
    </div>
  );
}
