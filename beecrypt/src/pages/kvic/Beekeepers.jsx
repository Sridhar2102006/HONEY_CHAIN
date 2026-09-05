import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import DataTable from "../../components/DataTable.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { HIVES, ORGANIZATIONS } from "../../data/mockData.js";

export default function Beekeepers() {
  const orgs = ORGANIZATIONS.filter((o) => o.type === "beekeeper" || o.type === "multi");
  const rows = orgs.map((o) => ({
    ...o,
    hives: HIVES.filter((h) => h.region === o.region).length,
    status: "Active",
    lastActivity: "Today",
  }));
  const columns = [
    { key: "name", label: "Name" },
    { key: "region", label: "Location" },
    { key: "hives", label: "Hives" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "lastActivity", label: "Last Activity" },
  ];
  return (
    <div>
      <PageHeader title="Beekeepers" />
      <DataTable columns={columns} rows={rows} rowKey="orgId" emptyTitle="No beekeepers registered" />
    </div>
  );
}
