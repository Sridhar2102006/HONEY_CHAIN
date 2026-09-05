import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import CertificateCard from "../../components/CertificateCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function KvicCertifications() {
  const { certificates } = useApp();
  return (
    <div>
      <PageHeader title="Certifications" sub="All certificates issued across the ecosystem." />
      <div className="flex flex-col gap-3.5">
        {certificates.length === 0 ? <EmptyState title="No certificates yet" /> : certificates.map((c) => <CertificateCard key={c.certificateId} cert={c} />)}
      </div>
    </div>
  );
}
