import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import DataTable from "../../components/DataTable.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { Link } from "react-router-dom";
import { useApp } from "../../hooks/useApp.js";

export default function KvicHoneyBatches() {
  const { batches } = useApp();
  const columns = [
    { key: "batchId", label: "Batch ID", render: (r) => <Link to={`/app/traceability?batchId=${r.batchId}`} className="font-bold text-bc-deep-green">{r.batchId}</Link> },
    { key: "hiveId", label: "Hive" },
    { key: "processorId", label: "Processor" },
    { key: "quantity", label: "Quantity", render: (r) => `${r.quantity} L` },
    { key: "processingStatus", label: "Processing", render: (r) => <StatusBadge status={r.processingStatus} /> },
    { key: "labId", label: "Laboratory" },
    { key: "certStatus", label: "Certification", render: (r) => <StatusBadge status={r.certStatus} /> },
  ];
  return (
    <div>
      <PageHeader title="Honey Batches" />
      <DataTable columns={columns} rows={batches} rowKey="batchId" />
    </div>
  );
}
