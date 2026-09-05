import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import { PRODUCTION_SERIES, HEALTH_SPLIT } from "../../data/mockData.js";
import { LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TONE_HEX = { success: "#16A34A", warning: "#F59E0B", critical: "#DC2626" };

export default function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" />
      <div className="grid md:grid-cols-2 gap-3.5">
        <ChartCard title="Honey Production">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PRODUCTION_SERIES}><CartesianGrid stroke="#ECE6D6" vertical={false} /><XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="litres" stroke="#D97706" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Hive Health">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={HEALTH_SPLIT} dataKey="value" nameKey="name" outerRadius={75}>{HEALTH_SPLIT.map((e) => <Cell key={e.name} fill={TONE_HEX[e.tone]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
