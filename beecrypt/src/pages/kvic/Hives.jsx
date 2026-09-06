import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import DataTable from "../../components/DataTable.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function KvicHives() {
  const { hives } = useApp();
  const columns = [
    { key: "hiveId", label: "Hive ID" },
    { key: "producerId", label: "Beekeeper (Actor ID)" },
    { key: "temp", label: "Temperature", render: (r) => `${r.temp}°C` },
    { key: "humidity", label: "Humidity", render: (r) => `${r.humidity}%` },
    { key: "vibration", label: "Vibration", render: (r) => `${r.vibration}g` },
    { key: "status", label: "Health", render: (r) => <StatusBadge status={r.status} /> },
    { key: "sensor", label: "Sensor", render: (r) => <span className="text-bc-success font-semibold">{r.sensor === "online" ? "Online" : "Offline"}</span> },
  ];
  return (
    <div>
      <PageHeader title="Hive Monitoring" sub="All registered hives across the ecosystem — simulated live data." />
      <DataTable columns={columns} rows={hives || []} rowKey="hiveId" />
    </div>
  );
}
