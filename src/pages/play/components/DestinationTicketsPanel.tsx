import React from "react";
import type {
  DestinationTicket,
  DestinationTicketProgressStatus,
} from "../../../domain";
import DestinationTicketCard from "./DestinationTicketCard";

interface DestinationTicketsPanelProps {
  destinationTicketDeckCount: number;
  destinationTicketTotalCount: number;
  destinationTicketDiscardCount: number;
  destinationPreviewNetDelta: number;
  isDestinationScoreApplied: boolean;
  onApplyDestinationScores: () => void;
  pendingDestinationTickets: DestinationTicket[];
  selectedPendingDestinationTicketIds: string[];
  setSelectedPendingDestinationTicketIds: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  setHoveredDestinationTicketId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  getPendingTicketStatus: (
    ticketId: string,
  ) => DestinationTicketProgressStatus | undefined;
  onConfirmKeptTickets: () => void;
  destinationSelectionLegality: {
    isLegal: boolean;
    reason: string | null;
  } | null;
}

export default function DestinationTicketsPanel({
  destinationTicketDeckCount,
  destinationTicketTotalCount,
  destinationTicketDiscardCount,
  destinationPreviewNetDelta,
  isDestinationScoreApplied,
  onApplyDestinationScores,
  pendingDestinationTickets,
  selectedPendingDestinationTicketIds,
  setSelectedPendingDestinationTicketIds,
  setHoveredDestinationTicketId,
  getPendingTicketStatus,
  onConfirmKeptTickets,
  destinationSelectionLegality,
}: DestinationTicketsPanelProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
        Destination Tickets
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-rail-700">
          Deck remaining: <strong>{destinationTicketDeckCount}</strong> of{" "}
          {destinationTicketTotalCount}
        </p>
        <p className="text-sm text-rail-700">
          Discard: <strong>{destinationTicketDiscardCount}</strong>
        </p>
        <p className="text-sm text-rail-700">
          Destination preview:{" "}
          <strong>
            {destinationPreviewNetDelta >= 0
              ? `+${destinationPreviewNetDelta}`
              : destinationPreviewNetDelta}
          </strong>
        </p>
      </div>
      <p className="mt-3 text-sm text-rail-700">
        Hover or select destination tickets to light up mapped destination
        cities.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onApplyDestinationScores}
          disabled={isDestinationScoreApplied}
          className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper disabled:cursor-not-allowed disabled:opacity-45"
        >
          Apply Destination Scores (End Game)
        </button>
        <p className="text-xs text-rail-700">
          {isDestinationScoreApplied
            ? "Destination scores already applied."
            : "Use once when the game ends."}
        </p>
      </div>

      {pendingDestinationTickets.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-amber-900">
            Choose Destination Tickets to Keep
          </h3>
          <p className="mt-2 text-sm text-amber-900/80">
            Keep at least 1 ticket from this draw. Unselected tickets are
            discarded.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingDestinationTickets.map((ticket) => {
              const isSelected = selectedPendingDestinationTicketIds.includes(
                ticket.id,
              );

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onMouseEnter={() => setHoveredDestinationTicketId(ticket.id)}
                  onMouseLeave={() =>
                    setHoveredDestinationTicketId((previous) =>
                      previous === ticket.id ? null : previous,
                    )
                  }
                  onFocus={() => setHoveredDestinationTicketId(ticket.id)}
                  onBlur={() =>
                    setHoveredDestinationTicketId((previous) =>
                      previous === ticket.id ? null : previous,
                    )
                  }
                  onClick={() =>
                    setSelectedPendingDestinationTicketIds((previous) =>
                      previous.includes(ticket.id)
                        ? previous.filter((ticketId) => ticketId !== ticket.id)
                        : [...previous, ticket.id],
                    )
                  }
                  aria-pressed={isSelected}
                  className={`rounded-2xl text-left transition ${
                    isSelected
                      ? "ring-4 ring-amber-400"
                      : "ring-1 ring-transparent"
                  }`}
                >
                  <DestinationTicketCard
                    ticket={ticket}
                    status={getPendingTicketStatus(ticket.id)}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onConfirmKeptTickets}
              disabled={!destinationSelectionLegality?.isLegal}
              className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-extrabold text-amber-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Confirm Kept Tickets
            </button>
            {!destinationSelectionLegality?.isLegal ? (
              <p className="text-sm text-red-700">
                {destinationSelectionLegality?.reason}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
