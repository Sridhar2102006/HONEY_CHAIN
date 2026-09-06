import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Upload, ShieldCheck, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import UploadBox from "../../components/UploadBox.jsx";
import CertificateCard from "../../components/CertificateCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/Modal.jsx";
import { useApp } from "../../hooks/useApp.js";
import { validateCertificateIssue } from "../../utils/validators.js";

export default function Certificates() {
  const { batches, certificates, issueCertificate, showToast } = useApp();
  const [params] = useSearchParams();
  const [selectedBatchForCert, setSelectedBatchForCert] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Batches that passed analysis but have no certificate yet
  const eligible = batches.filter(
    (b) => b.stage >= 5 && b.certStatus !== "CERTIFIED"
  );

  const handleIssue = (e) => {
    e.preventDefault();
    if (!selectedBatchForCert) return;

    const fileName = uploadedFiles[0] || `${selectedBatchForCert.batchId}-AGMARK-Report.pdf`;
    const values = { certificateId: "auto", file: fileName };
    const { valid, errors: errs } = validateCertificateIssue(values);
    setErrors(errs);
    if (!valid && uploadedFiles.length === 0) return;

    issueCertificate({
      batchId: selectedBatchForCert.batchId,
      testDate: selectedBatchForCert.harvestDate || new Date().toISOString().slice(0, 10),
      result: selectedBatchForCert.testStatus || "PASS",
      fileName,
    });

    setSelectedBatchForCert(null);
    setUploadedFiles([]);
    showToast(`Certificate issued for ${selectedBatchForCert.batchId}. Stored off-chain.`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lab Certificates"
        sub="Issue certified quality reports stored off-chain with immutable cryptographic hash linkage."
      />

      {/* Eligible Batches Awaiting Certification */}
      {eligible.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <ShieldCheck size={16} className="text-bc-amber" />
            <span>Ready for Certificate Issuance ({eligible.length})</span>
          </div>

          <div className="space-y-2">
            {eligible.map((b) => (
              <div
                key={b.batchId}
                className="bg-white rounded-2xl p-3.5 border border-amber-100 flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="font-mono font-bold text-sm text-bc-deep-green">
                    {b.batchId}
                  </div>
                  <div className="text-xs text-[#8A9086] mt-0.5">
                    Test Result: <b className="text-bc-success">PASS</b> · {b.quantity} L
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBatchForCert(b)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs active:scale-95 transition-transform flex items-center gap-1 shadow-xs"
                >
                  <FileText size={13} />
                  <span>Issue Cert</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issued Certificates History */}
      <div>
        <h3 className="font-display font-bold text-base text-bc-deep-green mb-2 px-1">
          Issued Certificates ({certificates.length})
        </h3>
        <div className="space-y-3">
          {certificates.length === 0 ? (
            <EmptyState
              title="No certificates issued yet"
              subtitle="Analyze samples and issue accredited certificates here."
            />
          ) : (
            certificates.map((c) => (
              <CertificateCard key={c.certificateId} cert={c} />
            ))
          )}
        </div>
      </div>

      {/* Certificate Upload & Sign Bottom Sheet Modal */}
      {selectedBatchForCert && (
        <Modal
          title={`Issue Certificate — ${selectedBatchForCert.batchId}`}
          onClose={() => setSelectedBatchForCert(null)}
        >
          <form onSubmit={handleIssue} className="space-y-3 text-xs">
            <p className="text-[#8A9086]">
              Attach the accredited laboratory PDF report. The document is archived off-chain while its cryptographic SHA-256 fingerprint will be anchored on-chain.
            </p>

            <UploadBox
              label="Select laboratory PDF report"
              files={uploadedFiles}
              onFiles={(names) => setUploadedFiles(names)}
              onRemove={() => setUploadedFiles([])}
            />

            <div className="bg-[#F8F6EC] p-3 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8A9086]">Target Batch:</span>
                <span className="font-mono font-bold">{selectedBatchForCert.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9086]">Purity Result:</span>
                <span className="font-bold text-bc-success">PASS</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={16} />
              <span>Confirm &amp; Sign Certificate</span>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
