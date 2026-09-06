import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, Search, QrCode, ShieldCheck, 
  CheckCircle2, ExternalLink, X, Printer, Filter
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import QRCodeCard from "../../components/QRCodeCard.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function RetailerInventory() {
  const { batches } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Filter batches for retail shelves
  const retailBatches = batches.filter((b) => {
    const matchesSearch = 
      b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.honeyType && b.honeyType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.floralSource && b.floralSource.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Store Honey Inventory"
        subtitle="Stocked retail batches with AGMARK certifications & shelf verification QR codes."
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9D8F]" />
          <input
            type="text"
            placeholder="Search by Batch ID, honey type or floral origin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EBE5D3] rounded-xl text-sm text-[#243024] placeholder-[#8F9D8F] focus:outline-none focus:border-[#2F6B3F] focus:ring-1 focus:ring-[#2F6B3F]"
          />
        </div>
      </div>

      {/* Inventory Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#ECE6D6] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#ECE6D6] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#1F4D2E]">
            <Package size={17} className="text-[#2F6B3F]" />
            <span>Retail Stock Batches ({retailBatches.length})</span>
          </div>
          <span className="text-xs text-[#657365]">Product records are available; external provenance verification is temporarily unavailable.</span>
        </div>

        {retailBatches.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8F9D8F]">
            No inventory batches match your search filter.
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE0]">
            {retailBatches.map((b) => (
              <div key={b.batchId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFFDF7] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#1F4D2E]">{b.batchId}</span>
                    {b.certStatus === "CERTIFIED" ? (
                      <span className="bg-[#EBF5EE] text-[#2F6B3F] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> AGMARK Certified
                      </span>
                    ) : (
                      <span className="bg-[#FFF8E7] text-[#D99518] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        Stage {b.stage}: {b.processingStatus || "In Verification"}
                      </span>
                    )}
                    {b.certificateId && (
                      <span className="text-[11px] font-mono text-[#8F9D8F] bg-[#F7F5EC] px-2 py-0.5 rounded">
                        {b.certificateId}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#657365] flex items-center gap-3 flex-wrap">
                    <span><strong>Type:</strong> {b.honeyType}</span>
                    <span>•</span>
                    <span><strong>Floral Origin:</strong> {b.floralSource || "Wildflower"}</span>
                    <span>•</span>
                    <span><strong>Stock:</strong> {b.quantity} kg</span>
                    {b.harvestDate && (
                      <>
                        <span>•</span>
                        <span><strong>Harvested:</strong> {b.harvestDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedBatch(b)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#D99518] bg-[#FFF8E7] hover:bg-[#FFF3D6] border border-[#F4B942]/40 px-3 py-2 rounded-xl transition-all active:scale-95"
                  >
                    <QrCode size={15} />
                    Shelf QR Code
                  </button>

                  <Link
                    to={`/verify/${b.batchId}`}
                    target="_blank"
                    className="text-xs font-bold text-[#2F6B3F] bg-[#EBF5EE] hover:bg-[#D8EEDF] px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Shelf Sticker Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-[#ECE6D6] animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1F4D2E]">
                <ShieldCheck size={18} className="text-[#2F6B3F]" />
                <span>Store Shelf Label QR</span>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="w-8 h-8 rounded-full hover:bg-[#F3F1E8] flex items-center justify-center text-[#8F9D8F]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="bg-[#FFFDF7] border-2 border-dashed border-[#D99518]/40 rounded-2xl p-4 flex flex-col items-center">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1F4D2E] mb-1">
                  BeeCrypt Verified Honey
                </div>
                <div className="text-[11px] text-[#657365] mb-3">
                  {selectedBatch.honeyType} · {selectedBatch.quantity} kg
                </div>
                
                <QRCodeCard batchId={selectedBatch.batchId} size={150} />

                <div className="text-[10px] font-mono text-[#8F9D8F] mt-2">
                  Scan with any phone to verify provenance
                </div>
              </div>

              <div className="text-xs text-[#657365] text-left space-y-1 bg-[#F9F8F3] p-3 rounded-xl">
                <div><strong>Batch ID:</strong> {selectedBatch.batchId}</div>
                <div><strong>Certificate:</strong> {selectedBatch.certificateId || "Pending"}</div>
                <div><strong>Test Status:</strong> {selectedBatch.testStatus || "PASSED"}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1F4D2E] text-white text-xs font-bold rounded-xl hover:bg-[#2F6B3F] transition-colors"
              >
                <Printer size={15} />
                Print Shelf Label
              </button>
              <button
                onClick={() => setSelectedBatch(null)}
                className="py-2.5 px-4 bg-[#F3F1E8] text-[#243024] text-xs font-semibold rounded-xl hover:bg-[#EAE6D6] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
