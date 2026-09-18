import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { 
  Store, Package, ShieldCheck, QrCode, 
  CheckCircle2, ArrowRight, TrendingUp, Sparkles, Droplets
} from "lucide-react";
import StatCard from "../../components/StatCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function RetailerDashboard() {
  const { batches } = useApp();
  const { currentUser } = useAuth();
  const outletContext = useOutletContext();

  // Certified batches that are ready for or already on retail shelves (stage >= 5 or certified)
  const shelfBatches = batches.filter((b) => b.stage >= 5 || b.certStatus === "CERTIFIED");
  const totalStockKg = shelfBatches.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
  const pendingIntake = batches.filter((b) => b.stage === 3).length;

  return (
    <div className="space-y-4">
      {/* Retail Store Hero Banner */}
      <div className="bg-gradient-to-br from-[#1F4D2E] to-[#2F6B3F] rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
            <Store size={15} /> Retail Storefront
          </span>
          <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
            Certified Distribution Point
          </span>
        </div>

        <h2 className="font-display font-bold text-2xl mt-1 tracking-tight">
          Store Operations
        </h2>
        <p className="text-xs text-white/80 mt-0.5">
          {currentUser?.org || "Nilgiris Fresh Mart"} · {currentUser?.location || "Coimbatore, Tamil Nadu"}
        </p>

        {/* Store Summary Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
          <div>
            <div className="font-display font-bold text-xl text-[#FFD166]">{totalStockKg.toFixed(1)} kg</div>
            <div className="text-[10.5px] text-white/70">Verified Shelf Stock</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-white">{shelfBatches.length}</div>
            <div className="text-[10.5px] text-white/70">Certified Batches</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-[#A3E635]">{shelfBatches.length > 0 ? "100%" : "—"}</div>
            <div className="text-[10.5px] text-white/70">Purity Guarantee</div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/app/retailer/verify"
          className="bg-[#FFFDF7] border border-[#EBE5D3] hover:border-[#D99518] rounded-2xl p-4 transition-all flex items-center justify-between group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#D99518] flex items-center justify-center group-hover:scale-105 transition-transform">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F4D2E]">Intake Batch Scanner</h3>
              <p className="text-xs text-[#657365]">Verify & accept new batches from processors</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#8F9D8F] group-hover:text-[#D99518] transition-colors" />
        </Link>

        <Link
          to="/app/retailer/inventory"
          className="bg-[#FFFDF7] border border-[#EBE5D3] hover:border-[#2F6B3F] rounded-2xl p-4 transition-all flex items-center justify-between group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] text-[#2F6B3F] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1F4D2E]">Store Inventory</h3>
              <p className="text-xs text-[#657365]">Manage shelf stock & print consumer QRs</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#8F9D8F] group-hover:text-[#2F6B3F] transition-colors" />
        </Link>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="On-Shelf Honey"
          value={`${totalStockKg.toFixed(0)} kg`}
          sub="AGMARK Certified"
          icon={Droplets}
        />
        <StatCard
          label="Active Lots"
          value={shelfBatches.length}
          sub="Ready for sale"
          icon={Package}
        />
        <StatCard
          label="Awaiting Intake"
          value={pendingIntake}
          sub="Processed lots"
          icon={Store}
        />
        <StatCard
          label="Trust Index"
          value={shelfBatches.length > 0 ? "100%" : "—"}
          sub="Ledger confirmed"
          icon={ShieldCheck}
        />
      </div>

      {/* Certified Batches on Shelves */}
      <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#2F6B3F]" />
            <h3 className="font-bold text-sm text-[#1F4D2E]">Certified Honey on Shelves</h3>
          </div>
          <Link to="/app/retailer/inventory" className="text-xs font-bold text-[#2F6B3F] hover:underline">
            View All ({shelfBatches.length})
          </Link>
        </div>

        {shelfBatches.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8F9D8F]">
            No certified batches currently in stock. Use the intake scanner to verify new stock.
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE0]">
            {shelfBatches.slice(0, 4).map((b) => (
              <div key={b.batchId} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1F4D2E]">{b.batchId}</span>
                    <span className="bg-[#EBF5EE] text-[#2F6B3F] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Certified
                    </span>
                  </div>
                  <div className="text-xs text-[#657365] mt-0.5">
                    {b.honeyType} · {b.floralSource || "Wildflower"} · {b.quantity} kg
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/verify/${b.batchId}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#D99518] bg-[#FFF8E7] px-2.5 py-1.5 rounded-lg hover:bg-[#FFF3D6] transition-colors"
                  >
                    <QrCode size={13} />
                    Consumer View
                  </Link>
                  <Link
                    to="/app/traceability"
                    className="text-[11px] font-bold text-[#2F6B3F] bg-[#EBF5EE] px-2.5 py-1.5 rounded-lg hover:bg-[#D8EEDF] transition-colors"
                  >
                    Provenance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consumer Trust Banner */}
      <div className="bg-[#FFFDF7] border border-[#EBE5D3] rounded-2xl p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#D99518] flex items-center justify-center shrink-0">
          <Sparkles size={20} />
        </div>
        <div className="text-xs">
          <h4 className="font-bold text-[#1F4D2E]">Retail Assurance Record</h4>
          <p className="text-[#657365] mt-0.5">
            Every bottle displayed on store shelves carries an immutable QR provenance code linking directly to KVIC & lab testing reports.
          </p>
        </div>
      </div>
    </div>
  );
}
