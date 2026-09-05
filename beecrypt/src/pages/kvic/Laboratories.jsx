import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import DataTable from "../../components/DataTable.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useApp } from "../../hooks/useApp.js";
import { LABORATORIES } from "../../data/mockData.js";

export default function Laboratories() {
  const { certificates } = useApp();
  const rows = LABORATORIES.map((l) => ({
    ...l,
    testsCompleted: certificates.filter((c) => c.labId === l.labId).length,
    certificates: certificates.filter((c) => c.labId === l.labId).length,
    status: l.available ? "Active" : "Unavailable",
  }));
  const columns = [
    { key: "name", label: "Laboratory" },
    { key: "location", label: "Location" },
    { key: "testsCompleted", label: "Tests Completed" },
    { key: "certificates", label: "Certificates" },
    { key: "status", label: "Availability", render: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <div>
      <PageHeader title="Laboratories" />
      <DataTable columns={columns} rows={rows} rowKey="labId" emptyTitle="No laboratories registered" />
    </div>
  );
}
