import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import HiveCard from "../../components/HiveCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import * as hiveService from "../../services/hiveService.js";

export default function BeekeeperDashboard() {
  const { currentUser, currentActorId } = useAuth();
  const hives = hiveService.listHives(currentActorId);
  const healthy = hives.filter((h) => h.status === "healthy").length;
  const warning = hives.filter((h) => h.status === "warning").length;
  const critical = hives.filter((h) => h.status === "critical").length;

  return (
    <div>
      <PageHeader title={`Good morning, ${currentUser.name.split(" ")[0]} 👋`} sub="Here's what's happening with your apiary today." />
      <div className="flex gap-3.5 flex-wrap">
        <StatCard label="Total Hives" value={hives.length} />
        <StatCard label="Healthy" value={healthy} tone="success" />
        <StatCard label="Warning" value={warning} tone="warning" />
        <StatCard label="Critical" value={critical} tone="critical" />
      </div>
      <div className="flex gap-3.5 flex-wrap mt-3.5">
        <StatCard label="Active Sensors" value={hives.filter((h) => h.sensor === "online").length} tone="green" />
        <StatCard label="Honey Extracted (30d)" value="684 L" tone="gold" />
        <StatCard label="AI Health Checks" value="128" tone="green" />
      </div>
      <div className="font-bold text-base mt-7 mb-3.5">Hive Overview</div>
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {hives.map((h) => <HiveCard key={h.hiveId} hive={h} />)}
      </div>
    </div>
  );
}
