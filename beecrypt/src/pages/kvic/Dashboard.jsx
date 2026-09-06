import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Users, Factory, FlaskConical, Hexagon, 
  Package, AlertTriangle, ArrowRight, TrendingUp, CheckCircle2 
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { ORGANIZATIONS } from "../../data/mockData.js";
import { blockchainReadiness } from "../../services/blockchainService.js";
import { BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TONE_HEX = { success: "#16A34A", warning: "#F59E0B", critical: "#DC2626" };

export default function KvicDashboard() {
  const { batches, pendingApplications, hives, provenanceEvents, certificates } = useApp();
  const pendingCount = pendingApplications.filter((a) => a.status === "Pending").length;

  const beekeeperCount = ORGANIZATIONS.filter((o) => o.type === "beekeeper" || o.type === "multi").length;
  const processorCount = ORGANIZATIONS.filter((o) => o.type === "processor" || o.type === "multi").length;
  const labCount = ORGANIZATIONS.filter((o) => o.type === "laboratory" || o.type === "multi").length;

  const certifiedCount = batches.filter((b) => b.certStatus === "CERTIFIED" || b.testStatus === "PASS").length;
  const complianceRate = batches.length > 0 ? `${Math.round((certifiedCount / batches.length) * 100)}%` : "—";
  const readiness = `${blockchainReadiness(batches, provenanceEvents, certificates)}%`;

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

  const { healthSplit, healthyCount, warningCount, criticalCount } = useMemo(() => {
    const healthy = (hives || []).filter((h) => h.status === "healthy").length;
    const warning = (hives || []).filter((h) => h.status === "warning").length;
    const critical = (hives || []).filter((h) => h.status === "critical").length;
    return {
      healthyCount: healthy,
      warningCount: warning,
      criticalCount: critical,
      healthSplit: [
        { name: "Healthy", value: healthy, tone: "success" },
        { name: "Warning", value: warning, tone: "warning" },
        { name: "Critical", value: critical, tone: "critical" },
      ],
    };
  }, [hives]);

  return (
    <div className="space-y-4">
      {/* KVIC Oversight Hero */}
      <div className="bg-gradient-to-br from-bc-deep-green to-bc-forest rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-bc-gold flex items-center gap-1.5">
            <ShieldCheck size={14} /> National Regulatory Oversight
          </span>
          <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
            KVIC Central
          </span>
        </div>

        <h2 className="font-display font-bold text-2xl mt-1 tracking-tight">
          Ecosystem Oversight
        </h2>
        <p className="text-xs text-white/80 mt-0.5">
          Khadi &amp; Village Industries Commission — Honey Chain Registry
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
          <div>
            <div className="font-display font-bold text-xl text-white">{beekeeperCount}</div>
            <div className="text-[10.5px] text-white/70">Beekeepers</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-bc-gold">{processorCount}</div>
            <div className="text-[10.5px] text-white/70">Processors</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-bc-light-green">{labCount}</div>
            <div className="text-[10.5px] text-white/70">Laboratories</div>
          </div>
        </div>
      </div>

      {/* Pending Applications Alert Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
              {pendingCount}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                Registrations Pending Verification
              </div>
              <div className="text-[11px] text-amber-700">
                New beekeepers &amp; processors waiting for approval
              </div>
            </div>
          </div>

          <Link
            to="/app/kvic/verification"
            className="px-3 py-1.5 rounded-xl bg-bc-deep-green text-white font-bold text-xs active:scale-95 transition-transform shrink-0"
          >
            Review
          </Link>
        </div>
      )}

      {/* Ecosystem Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Registered Hives"
          value={hives.length}
          sub="Connected Telemetry"
          tone="gold"
          icon={Hexagon}
        />
        <StatCard
          label="Tracked Batches"
          value={batches.length}
          sub="Active Honey Batches"
          tone="dark"
          icon={Package}
        />
        <StatCard
          label="Compliance Rate"
          value={complianceRate}
          sub="Quality Verification"
          tone="success"
          icon={ShieldCheck}
        />
        <StatCard
          label="Ledger Readiness"
          value={readiness}
          sub="Canonical Event Ready"
          tone="green"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          to="/app/kvic/verification"
          className="p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs text-center active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center mx-auto mb-1">
            <Users size={16} />
          </div>
          <span className="text-xs font-bold text-bc-dark block">Verify Users</span>
        </Link>

        <Link
          to="/app/kvic/analytics"
          className="p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs text-center active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-bc-light-green text-bc-forest flex items-center justify-center mx-auto mb-1">
            <TrendingUp size={16} />
          </div>
          <span className="text-xs font-bold text-bc-dark block">Analytics</span>
        </Link>

        <Link
          to="/app/kvic/readiness"
          className="p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs text-center active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-1">
            <ShieldCheck size={16} />
          </div>
          <span className="text-xs font-bold text-bc-dark block">Readiness</span>
        </Link>
      </div>

      {/* Honey Production Bar Chart */}
      <ChartCard title="Ecosystem Production Volume (Litres)">
        <div className="py-1">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={productionSeries}>
              <CartesianGrid stroke="#ECE6D6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="litres" fill="#166534" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Hive Health Pie Chart */}
      <ChartCard title="Apiary Health Split">
        <div className="py-1 flex items-center justify-center">
          {hives.length === 0 ? (
            <div className="text-xs text-[#8A9086] py-12 text-center">
              No registered hives in ecosystem yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={healthSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={35}
                  outerRadius={65}
                >
                  {healthSplit.map((e) => (
                    <Cell key={e.name} fill={TONE_HEX[e.tone]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-center gap-4 text-xs pt-1 border-t border-[#F2EDE2]">
          <span className="flex items-center gap-1 text-bc-success font-semibold">● {healthyCount} Healthy</span>
          <span className="flex items-center gap-1 text-bc-amber font-semibold">● {warningCount} Warning</span>
          <span className="flex items-center gap-1 text-bc-critical font-semibold">● {criticalCount} Critical</span>
        </div>
      </ChartCard>
    </div>
  );
}
