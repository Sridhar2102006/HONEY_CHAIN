import React from "react";
import { formatDateTime } from "../utils/format.js";

export default function ProvenanceEventCard({ event }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4">
      <div className="flex justify-between flex-wrap gap-2">
        <div className="font-bold text-sm text-bc-deep-green">{event.eventType.replaceAll("_", " ")}</div>
        <div className="text-xs text-[#8A9086]">{event.eventId}</div>
      </div>
      <div className="text-xs text-[#8A9086] mt-1">
        Batch {event.batchId} · Actor {event.actorId}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
        <div><span className="text-[#8A9086]">Occurred: </span>{formatDateTime(event.occurredAt)}</div>
        <div><span className="text-[#8A9086]">Recorded: </span>{formatDateTime(event.recordedAt)}</div>
      </div>
      <div className="text-[11px] text-[#B08900] bg-bc-light-honey rounded-lg px-2.5 py-1.5 mt-3 inline-block">
        Hash &amp; signature: pending backend
      </div>
    </div>
  );
}
