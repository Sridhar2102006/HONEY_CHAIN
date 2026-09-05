import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import HiveCard from "../../components/HiveCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import * as hiveService from "../../services/hiveService.js";

export default function MyHives() {
  const { currentActorId } = useAuth();
  const hives = hiveService.listHives(currentActorId);
  return (
    <div>
      <PageHeader title="My Hives" sub={`${hives.length} registered hives.`} />
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {hives.map((h) => <HiveCard key={h.hiveId} hive={h} />)}
      </div>
    </div>
  );
}
