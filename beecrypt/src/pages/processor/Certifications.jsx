import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import CertificateCard from "../../components/CertificateCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function Certifications() {
  const { certificates } = useApp();

  return (
    <div className="space-y-3.5">
      <PageHeader
        title="Quality Certifications"
        sub="Accredited laboratory purity certificates for your honey batches."
      />

      <div className="space-y-3">
        {certificates.length === 0 ? (
          <EmptyState
            title="No certificates issued yet"
            subtitle="Certificates issued by testing laboratories will appear here."
          />
        ) : (
          certificates.map((c) => (
            <CertificateCard key={c.certificateId} cert={c} />
          ))
        )}
      </div>
    </div>
  );
}
