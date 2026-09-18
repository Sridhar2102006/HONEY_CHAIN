import React, { useMemo } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Droplets, Hexagon } from "lucide-react";

const TONE_HEX = { success: "#16A34A", warning: "#F59E0B", critical: "#DC2626" };

export default function Analytics() {
  const { batches, hives } = useApp();

  const totalVolume = batches.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
  const totalVolumeDisplay = `${totalVolume.toFixed(1)} L`;

  const healthyCount = (hives || []).filter((h) => h.status === "healthy").length;
  const warningCount = (hives || []).filter((h) => h.status === "warning").length;
  const criticalCount = (hives || []).filter((h) => h.status === "critical").length;

  const colonyHealthDisplay =
    hives && hives.length > 0 ? `${Math.round((healthyCount / hives.length) * 100)}%` : "N/A";

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

  const healthSplit = useMemo(() => {
    return [
      { name: "Healthy", value: healthyCount, tone: "success" },
      { name: "Warning", value: warningCount, tone: "warning" },
      { name: "Critical", value: criticalCount, tone: "critical" },
    ];
  }, [healthyCount, warningCount, criticalCount]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Analytics"
        sub="Production trends, apiary health distribution, and regional harvest intelligence."
      />

      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Total Volume"
          value={totalVolumeDisplay}
          sub="Recorded Honey Harvest"
          tone="gold"
          icon={Droplets}
        />
        <StatCard
          label="Colony Health"
          value={colonyHealthDisplay}
          sub="Healthy Apiary Index"
          tone="success"
          icon={Hexagon}
        />
      </div>

      <ChartCard title="Honey Harvest Growth (kg)">
        <div className="py-1">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={productionSeries}>
              <CartesianGrid stroke="#ECE6D6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="litres"
                stroke="#D97706"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#D97706" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Colony Health Distribution">
        <div className="py-1 flex items-center justify-center">
          {hives.length === 0 ? (
            <div className="text-xs text-[#8A9086] py-12 text-center">
              No registered hives to display health distribution.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
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
