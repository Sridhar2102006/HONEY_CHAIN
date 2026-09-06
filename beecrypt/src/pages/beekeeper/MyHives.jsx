import React, { useMemo, useState } from "react";
import { History, Droplets, TrendingUp, CalendarDays, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageHeader from "../../components/PageHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import * as hiveService from "../../services/hiveService.js";

export default function MyHives() {
  const { currentActorId } = useAuth();
  const { batches, hives: allHives } = useApp();
  const [historyCutoff, setHistoryCutoff] = useState("");

  const hives = (allHives || []).filter((h) => h.producerId === currentActorId);

  const allHarvestedBatches = useMemo(
    () => batches.filter((batch) => batch.producerId === currentActorId && batch.hiveId),
    [batches, currentActorId]
  );

  const harvestedBatches = useMemo(
    () => allHarvestedBatches.filter((batch) => !historyCutoff || batch.harvestDate <= historyCutoff),
    [allHarvestedBatches, historyCutoff]
  );

  const harvestByHive = useMemo(() => {
    const totals = hives.map((hive) => {
      const records = harvestedBatches.filter((batch) => batch.hiveId === hive.hiveId);
      return {
        hiveId: hive.hiveId.replace("H-", ""),
        fullHiveId: hive.hiveId,
        quantity: records.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0),
        batches: records.length,
      };
    });
    return totals.filter((item) => item.batches > 0).sort((a, b) => b.quantity - a.quantity);
  }, [harvestedBatches, hives]);

  const harvestTimeline = useMemo(() => {
    const grouped = harvestedBatches.reduce((result, batch) => {
      const date = new Date(batch.harvestDate);
      const key = Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      result[key] = (result[key] || 0) + Number(batch.quantity || 0);
      return result;
    }, {});
    return Object.entries(grouped).map(([date, quantity]) => ({ date, quantity: Number(quantity.toFixed(1)) }));
  }, [harvestedBatches]);

  const honeyTypeMix = useMemo(() => {
    const grouped = harvestedBatches.reduce((result, batch) => {
      result[batch.honeyType] = (result[batch.honeyType] || 0) + Number(batch.quantity || 0);
      return result;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }));
  }, [harvestedBatches]);

  const totalHarvest = harvestedBatches.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0);
  const averageHarvest = harvestedBatches.length ? totalHarvest / harvestedBatches.length : 0;
  const chartColors = ["#2F6B3F", "#D99518", "#4EA5D9", "#8B5CF6", "#D97706"];

  return (
    <div className="space-y-3.5">
      <PageHeader
        title="Hive History"
        sub={`${hives.length} hives · ${harvestedBatches.length} harvested batch records.`}
      />

      {/* Historical date filter */}
      <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center">
            <CalendarDays size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-bc-dark">View history up to</div>
            <div className="text-[11px] text-[#8A9086]">Choose an earlier date to fetch past harvest records.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={historyCutoff}
            onChange={(event) => setHistoryCutoff(event.target.value)}
            aria-label="Show harvest history up to date"
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-[#E5E0CE] text-xs font-bold text-bc-deep-green bg-[#FBF9F2] outline-none focus:border-bc-deep-green"
          />
          {historyCutoff && (
            <button
              type="button"
              onClick={() => setHistoryCutoff("")}
              className="px-3 py-2 rounded-xl bg-[#F3F1E8] text-bc-dark text-xs font-bold"
            >
              All history
            </button>
          )}
        </div>
      </div>

      {/* Harvest overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#8A9086] text-[11px] font-bold uppercase tracking-wide">
            Harvested Volume <Droplets size={15} className="text-bc-amber" />
          </div>
          <div className="font-display font-bold text-2xl text-bc-deep-green mt-1">{totalHarvest.toFixed(1)} L</div>
          <div className="text-[11px] text-[#8A9086]">Across linked hives</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#8A9086] text-[11px] font-bold uppercase tracking-wide">
            Harvest Records <History size={15} className="text-bc-forest" />
          </div>
          <div className="font-display font-bold text-2xl text-bc-deep-green mt-1">{harvestedBatches.length}</div>
          <div className="text-[11px] text-[#8A9086]">Batch events recorded</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#8A9086] text-[11px] font-bold uppercase tracking-wide">
            Avg. Harvest <TrendingUp size={15} className="text-sky-500" />
          </div>
          <div className="font-display font-bold text-2xl text-bc-deep-green mt-1">{averageHarvest.toFixed(1)} L</div>
          <div className="text-[11px] text-[#8A9086]">Per batch</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <div className="flex items-center justify-between text-[#8A9086] text-[11px] font-bold uppercase tracking-wide">
            Active Sources <BarChart3 size={15} className="text-purple-500" />
          </div>
          <div className="font-display font-bold text-2xl text-bc-deep-green mt-1">{harvestByHive.length}</div>
          <div className="text-[11px] text-[#8A9086]">Hives with harvests</div>
        </div>
      </div>

      {/* Power BI-style analytics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-display font-bold text-base text-bc-deep-green">Harvest Analytics</h2>
            <p className="text-[11px] text-[#8A9086]">Visual summary of the current beekeeper batch records.</p>
          </div>
          <CalendarDays size={18} className="text-bc-amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
            <div className="text-xs font-bold text-bc-dark mb-2">Harvest Volume by Hive</div>
            {harvestByHive.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-[#8A9086]">No harvest records yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={harvestByHive} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE0" />
                  <XAxis dataKey="hiveId" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="L" />
                  <Tooltip formatter={(value) => [`${value} L`, "Harvest"]} />
                  <Bar dataKey="quantity" fill="#2F6B3F" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
            <div className="text-xs font-bold text-bc-dark mb-2">Harvest Trend</div>
            {harvestTimeline.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-[#8A9086]">No timeline data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={harvestTimeline} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="L" />
                  <Tooltip formatter={(value) => [`${value} L`, "Harvest"]} />
                  <Line type="monotone" dataKey="quantity" stroke="#D99518" strokeWidth={3} dot={{ r: 4, fill: "#D99518" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
          <div className="text-xs font-bold text-bc-dark mb-2">Honey Type Mix</div>
          {honeyTypeMix.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-xs text-[#8A9086]">No honey type data yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={honeyTypeMix} dataKey="value" nameKey="name" innerRadius={42} outerRadius={65} paddingAngle={3}>
                    {honeyTypeMix.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} L`, "Volume"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {honeyTypeMix.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-[#4B5548]"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.name}</span>
                    <span className="font-bold text-bc-dark">{item.value} L</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Harvested hive details */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-display font-bold text-base text-bc-deep-green">Harvested Hive Details</h2>
            <p className="text-[11px] text-[#8A9086]">Hive-level records linked to harvested batches.</p>
          </div>
          <History size={18} className="text-bc-forest" />
        </div>
        {harvestByHive.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ECE6D6] p-5 text-center text-xs text-[#8A9086]">Harvest a batch to see hive history here.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {harvestByHive.map((item) => {
              const hive = hives.find((entry) => entry.hiveId === item.fullHiveId);
              const records = harvestedBatches.filter((batch) => batch.hiveId === item.fullHiveId).sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
              const latest = records[0];
              return (
                <div key={item.fullHiveId} className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display font-bold text-base text-bc-deep-green">Hive {item.fullHiveId}</div>
                      <div className="text-[11px] text-[#8A9086]">{hive?.block || "Apiary source"}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-bc-light-green text-bc-success">{hive?.status || "active"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F0EBE0] text-xs">
                    <div><div className="text-[#8A9086]">Total</div><div className="font-bold text-bc-dark">{item.quantity.toFixed(1)} L</div></div>
                    <div><div className="text-[#8A9086]">Batches</div><div className="font-bold text-bc-dark">{item.batches}</div></div>
                    <div><div className="text-[#8A9086]">Latest</div><div className="font-bold text-bc-dark">{latest?.harvestDate || "-"}</div></div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {records.map((record) => (
                      <div key={record.batchId} className="flex items-center justify-between rounded-lg bg-[#FBF9F2] px-2.5 py-2 text-[11px]">
                        <span className="font-mono text-bc-forest">{record.batchId}</span>
                        <span className="font-bold text-bc-dark">{record.quantity} L · {record.honeyType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
