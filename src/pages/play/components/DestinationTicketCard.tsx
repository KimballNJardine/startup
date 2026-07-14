import React from "react";
import type {
  DestinationTicket,
  DestinationTicketProgressStatus,
} from "../../../domain";

interface DestinationTicketCardProps {
  ticket: DestinationTicket;
  status?: DestinationTicketProgressStatus;
}

export default function DestinationTicketCard({
  ticket,
  status,
}: DestinationTicketCardProps): React.JSX.Element {
  const isFulfilled = status === "fulfilled";
  const isUnresolved = status === "unresolved";
  const connectorClass = isFulfilled
    ? "border-emerald-500/80"
    : isUnresolved
      ? "border-amber-500/75"
      : "border-red-400/70";
  const pointsClass = isFulfilled
    ? "bg-emerald-700 text-white"
    : isUnresolved
      ? "bg-amber-700 text-amber-50"
      : "bg-red-700 text-white";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-red-100/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-200/35 blur-xl transition group-hover:bg-red-300/45" />
      <div className="mt-1 flex items-center gap-3">
        <p className="text-base font-extrabold text-rail-900">
          {ticket.originCity}
        </p>
        <span
          className={`h-px flex-1 border-t-2 border-dashed ${connectorClass}`}
        />
        <div className="flex items-center gap-2">
          <p className="text-base font-extrabold text-rail-900">
            {ticket.destinationCity}
          </p>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ${pointsClass}`}
          >
            {ticket.points}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.2em] text-red-900/75">
        Destination Ticket
      </p>
    </article>
  );
}
