import React, { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { 
  Package, Factory, FlaskConical, ShieldCheck, 
  ArrowRight, QrCode, TrendingUp, Droplets 
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import BatchCard from "../../components/BatchCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ProcessorDashboard() {
  const { batches } = useApp();
  const { currentUser } = useAuth();
  const outletContext = useOutletContext();

  const pending = batches.filter((b) => b.stage === 1).length;
  const processing = batches.filter((b) => b.stage === 2).length;
  const awaitingLab = batches.filter((b) => b.stage === 4).length;
  const certified = batches.filter((b) => b.certStatus === "CERTIFIED").length;
  const totalLitres = batches.reduce((s, b) => s + Number(b.quantity), 0);

  const productionSeries = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const series = months.slice(0, Math.max(currentMonthIdx + 1, 6)).map((m) => ({ m, litres: 0 }));
    batches.forEach((b) => {
      const d = b.harvestDate || b.extractedAt || b.createdAt ? new Date(b.harvestDate || b.extractedAt || b.createdAt) : null;
      if (d && !isNaN(d.getTime())) {
        const mName = months[d.getMonth()];
        const entry = series.find((s) => s.m === mName);
        if (entry) entry.litres += Number(b.quantity || 0);
      }
    });
    return series;
  }, [batches]);

  return (
    <div className="space-y-4">
      {/* Processor Facility Hero Banner */}
      <div className="bg-gradient-to-br from-bc-deep-green to-bc-forest rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-bc-gold flex items-center gap-1.5">
            <Factory size={14} /> Processing Facility
          </span>
          <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
            AGMARK Empanelled
          </span>
        </div>

        <h2 className="font-display font-bold text-2xl mt-1 tracking-tight">
          Facility Overview
        </h2>
        <p className="text-xs text-white/80 mt-0.5">
          {currentUser?.org} · {currentUser?.location || "Tamil Nadu"}
        </p>

        {/* Facility Summary Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
          <div>
            <div className="font-display font-bold text-xl text-bc-gold">{totalLitres.toFixed(1)} L</div>
            <div className="text-[10.5px] text-white/70">Total Received</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-white">{batches.length}</div>
            <div className="text-[10.5px] text-white/70">Batches</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-bc-light-green">{certified}</div>
            <div className="text-[10.5px] text-white/70">Certified</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          to="/app/processor/batches"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center mb-1.5">
            <Package size={18} />
          </div>
          <span className="text-xs font-bold text-bc-dark">All Batches</span>
        </Link>

        <Link
          to="/app/processor/laboratories"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-bc-light-green text-bc-forest flex items-center justify-center mb-1.5">
            <FlaskConical size={18} />
          </div>
          <span className="text-xs font-bold text-bc-dark">Find Labs</span>
        </Link>

        <button
          onClick={() => outletContext?.openScanner?.()}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
            <QrCode size={18} />
          </div>
          <span className="text-xs font-bold text-bc-dark">Scan Batch</span>
        </button>
      </div>

      {/* Pipeline Status Gauges */}
      <div>
        <div className="text-xs font-bold text-[#8A9086] uppercase tracking-wider mb-2 px-1">
          Processing Pipeline
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Pending Processing"
            value={pending}
            sub="Awaiting Extraction"
            tone="warning"
            icon={Package}
          />
          <StatCard
            label="In Processing"
            value={processing}
            sub="Cold/Heat Extraction"
            tone="dark"
            icon={Factory}
          />
          <StatCard
            label="At Laboratory"
            value={awaitingLab}
            sub="Awaiting Test Results"
            tone="warning"
            icon={FlaskConical}
          />
          <StatCard
            label="Quality Certified"
            value={certified}
            sub="AGMARK / NABL Verified"
            tone="success"
            icon={ShieldCheck}
          />
        </div>
      </div>

      {/* Production Chart */}
      <ChartCard title="Monthly Production Volume (Litres)">
        <div className="py-1">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={productionSeries}>
              <CartesianGrid stroke="#ECE6D6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="litres" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Inbound Honey Batches List */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-display font-bold text-base text-bc-deep-green">
            Recent Honey Batches
          </h3>
          <Link
            to="/app/processor/batches"
            className="text-xs font-bold text-bc-deep-green flex items-center gap-0.5 hover:underline"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-3">
          {batches.length > 0 ? (
            batches.slice(0, 3).map((b) => (
              <BatchCard
                key={b.batchId}
                batch={b}
                to={`/app/processor/processing?batchId=${b.batchId}`}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#ECE6D6] p-6 text-center shadow-xs">
              <Package size={30} className="text-[#C9C2AC] mx-auto mb-2" />
              <div className="font-bold text-bc-dark text-sm">No Batches Received Yet</div>
              <p className="text-xs text-[#8A9086] mt-1 max-w-xs mx-auto">
                When beekeepers extract honey batches, they will arrive in your facility queue for processing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
