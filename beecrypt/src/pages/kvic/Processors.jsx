import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import DataTable from "../../components/DataTable.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useApp } from "../../hooks/useApp.js";
import { PROCESSORS } from "../../data/mockData.js";

export default function Processors() {
  const { batches } = useApp();
  const rows = PROCESSORS.map((p) => {
    const own = batches.filter((b) => b.processorId === p.processorId);
    return { ...p, received: own.length, completed: own.filter((b) => b.processingStatus === "Completed").length, status: "Active" };
  });
  const columns = [
    { key: "name", label: "Processor" },
    { key: "received", label: "Honey Batches" },
    { key: "completed", label: "Completed" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <div>
      <PageHeader title="Processors" />
      <DataTable columns={columns} rows={rows} rowKey="processorId" emptyTitle="No processors registered" />
    </div>
  );
}
