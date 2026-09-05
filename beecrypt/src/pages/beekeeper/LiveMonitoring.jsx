import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import SensorCard from "../../components/SensorCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import * as hiveService from "../../services/hiveService.js";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function LiveMonitoring() {
  const series = hiveService.getSensorSeries();
  return (
    <div>
      <PageHeader title="Live Hive Monitoring" />
      <div className="flex items-center gap-2 mb-4.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-bc-critical bc-pulse" />
        <span className="font-bold text-[13px] text-bc-critical">SIMULATED LIVE DATA</span>
        <span className="text-xs text-[#8A9086]">· last updated just now</span>
      </div>
      <div className="flex gap-3.5 flex-wrap">
        <SensorCard label="Temperature" value="34.8°C" />
        <SensorCard label="Humidity" value="61%" />
        <SensorCard label="Vibration" value="0.32g" />
      </div>
      <div className="grid md:grid-cols-2 gap-3.5 mt-5">
        <ChartCard title="Temperature">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series}><CartesianGrid stroke="#ECE6D6" vertical={false} /><XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="temp" stroke="#D97706" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Humidity">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series}><CartesianGrid stroke="#ECE6D6" vertical={false} /><XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="humidity" stroke="#166534" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Vibration" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={series}><CartesianGrid stroke="#ECE6D6" vertical={false} /><XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="vibration" stroke="#14532D" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
