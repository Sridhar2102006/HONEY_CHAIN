import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { PRODUCTION_SERIES } from "../../data/mockData.js";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ProcessorDashboard() {
  const { batches } = useApp();
  const pending = batches.filter((b) => b.stage === 1).length;
  const processing = batches.filter((b) => b.stage === 2).length;
  const completed = batches.filter((b) => b.stage >= 3).length;
  const awaitingLab = batches.filter((b) => b.stage === 4).length;
  const certified = batches.filter((b) => b.certStatus === "CERTIFIED").length;
  const totalLitres = batches.reduce((s, b) => s + Number(b.quantity), 0);

  return (
    <div>
      <PageHeader title="Processor Dashboard" />
      <div className="flex gap-3.5 flex-wrap">
        <StatCard label="Honey Received" value={`${totalLitres.toFixed(1)} L`} tone="gold" />
        <StatCard label="Pending Processing" value={pending} tone="warning" />
        <StatCard label="Processing" value={processing} />
        <StatCard label="Completed" value={completed} tone="success" />
      </div>
      <div className="flex gap-3.5 flex-wrap mt-3.5">
        <StatCard label="Awaiting Laboratory" value={awaitingLab} tone="warning" />
        <StatCard label="Certified" value={certified} tone="success" />
      </div>
      <div className="font-bold text-base mt-7 mb-3.5">Monthly Honey Volume</div>
      <ChartCard>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PRODUCTION_SERIES}>
            <CartesianGrid stroke="#ECE6D6" vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="litres" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
