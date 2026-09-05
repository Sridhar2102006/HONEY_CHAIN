import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import AlertsList from "./Alerts.jsx";
import * as hiveService from "../../services/hiveService.js";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TABS = ["Overview", "Monitoring", "Alerts", "Extraction History"];

export default function HiveDetail() {
  const { hiveId } = useParams();
  const [tab, setTab] = useState("Overview");
  const hive = hiveService.getHive(hiveId);
  const series = hiveService.getSensorSeries(hiveId);

  if (!hive) return <div className="text-sm text-[#8A9086]">Hive not found.</div>;

  return (
    <div>
      <Link to="/app/beekeeper/hives" className="text-bc-deep-green font-bold text-[13.5px] mb-4 inline-block">← Back to hives</Link>
      <PageHeader title={`Hive ${hive.hiveId}`} sub={hive.block} />
      <StatusBadge status={hive.status} />
      <div className="flex gap-3.5 flex-wrap mt-4.5 mt-4">
        <StatCard label="Temperature" value={`${hive.temp}°C`} />
        <StatCard label="Humidity" value={`${hive.humidity}%`} />
        <StatCard label="Vibration" value={`${hive.vibration}g`} />
        <StatCard label="Battery" value={`${hive.battery}%`} />
      </div>
      <div className="flex gap-1.5 mt-6 border-b border-[#ECE6D6]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-2.5 text-[13.5px] font-bold ${tab === t ? "text-bc-deep-green border-b-2 border-bc-deep-green" : "text-[#8A9086]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="pt-5">
        {tab === "Overview" && <div className="text-[13.5px] text-[#8A9086]">Sensor {hive.sensor}, transmitting simulated data every 5 minutes.</div>}
        {tab === "Monitoring" && (
          <ChartCard title="Temperature — Simulated Live Data">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={series}>
                <CartesianGrid stroke="#ECE6D6" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#D97706" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
        {tab === "Alerts" && <AlertsList hiveId={hive.hiveId} compact />}
        {tab === "Extraction History" && <div className="text-[13.5px] text-[#8A9086]">3 extractions recorded for this hive.</div>}
      </div>
    </div>
  );
}
