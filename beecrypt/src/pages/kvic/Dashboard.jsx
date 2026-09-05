import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { PRODUCTION_SERIES, HEALTH_SPLIT, HIVES } from "../../data/mockData.js";
import { BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TONE_HEX = { success: "#16A34A", warning: "#F59E0B", critical: "#DC2626" };

export default function KvicDashboard() {
  const { batches, pendingApplications, certificates } = useApp();
  const pendingCount = pendingApplications.filter((a) => a.status === "Pending").length;

  return (
    <div>
      <PageHeader title="KVIC Dashboard" sub="Ecosystem-wide oversight." />
      <div className="flex gap-3.5 flex-wrap">
        <StatCard label="Beekeepers" value="1,248" tone="green" />
        <StatCard label="Processors" value="324" />
        <StatCard label="Laboratories" value="246" />
      </div>
      <div className="flex gap-3.5 flex-wrap mt-3.5">
        <StatCard label="Hives" value={HIVES.length * 3103} tone="gold" />
        <StatCard label="Honey Batches" value={batches.length} />
        <StatCard label="Pending Verifications" value={pendingCount} tone="warning" />
      </div>
      <div className="grid md:grid-cols-2 gap-3.5 mt-7">
        <ChartCard title="Honey Production (L)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PRODUCTION_SERIES}><CartesianGrid stroke="#ECE6D6" vertical={false} /><XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="litres" fill="#166534" radius={[6, 6, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Hive Health Split">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={HEALTH_SPLIT} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>{HEALTH_SPLIT.map((e) => <Cell key={e.name} fill={TONE_HEX[e.tone]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
