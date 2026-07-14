import React from "react";
import type {
  DestinationTicket,
  DestinationTicketProgressStatus,
  LocalGameState,
  TrainCardType,
  TrainColor,
} from "../../../domain";
import {
  CLAIMED_PIN_CLASS_BY_PLAYER,
  boardStyle,
  feltSectionStyle,
  feltBoardWellStyle,
  overlayStyle,
  RAINBOW_RING_GRADIENT,
} from "../constants";
import DestinationTicketCard from "./DestinationTicketCard";
import TrainCardFan from "./TrainCardFan";

interface GameBoardProps {
  gameState: LocalGameState;
  cityLocationPins: Array<{ id: string; xPercent: number; yPercent: number }>;
  highlightedCityIdSet: Set<string>;
  hoveredRouteId: string | null;
  setHoveredRouteId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRouteId: string | null;
  defaultClaimLegalityByRoute: Record<
    string,
    { isLegal: boolean; reason: string | null }
  >;
  selectedTrainTypeHighlightByRoute: Record<
    string,
    { matches: boolean; minLocomotivesNeeded: number }
  >;
  onSelectRoute: (routeId: string) => void;
  currentPlayerDestinationTickets: DestinationTicket[];
  selectedDestinationTicketIds: string[];
  setSelectedDestinationTicketIds: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  setHoveredDestinationTicketId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  currentPlayerDestinationProgressById: Record<
    string,
    {
      status: DestinationTicketProgressStatus;
      isFulfilled: boolean;
    }
  >;
  currentHandCounts: Record<TrainColor | "locomotive", number>;
  selectedTrainType: TrainCardType | null;
  setSelectedTrainType: React.Dispatch<
    React.SetStateAction<TrainCardType | null>
  >;
}

export default function GameBoard({
  gameState,
  cityLocationPins,
  highlightedCityIdSet,
  hoveredRouteId,
  setHoveredRouteId,
  selectedRouteId,
  defaultClaimLegalityByRoute,
  selectedTrainTypeHighlightByRoute,
  onSelectRoute,
  currentPlayerDestinationTickets,
  selectedDestinationTicketIds,
  setSelectedDestinationTicketIds,
  setHoveredDestinationTicketId,
  currentPlayerDestinationProgressById,
  currentHandCounts,
  selectedTrainType,
  setSelectedTrainType,
}: GameBoardProps): React.JSX.Element {
  return (
    <section
      className="overflow-visible rounded-2xl border border-emerald-950/90 p-5 sm:p-6"
      style={feltSectionStyle}
    >
      <div
        className="relative mt-4 mb-56 overflow-visible rounded-xl border border-emerald-900/85"
        style={{ ...boardStyle, ...feltBoardWellStyle }}
      >
        <img
          src="img/USA_map.jpg"
          alt="Ticket to Ride USA board with cities and rail routes"
          className="h-full w-full object-contain"
        />

        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={overlayStyle}
        >
          {cityLocationPins.map((cityPin) => {
            const isHighlighted = highlightedCityIdSet.has(cityPin.id);

            return (
              <div
                key={cityPin.id}
                className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                  isHighlighted
                    ? "h-4 w-4 bg-yellow-300 ring-4 ring-yellow-400/80"
                    : "h-2.5 w-2.5 bg-slate-950/80 ring-1 ring-white/70"
                }`}
                style={{
                  left: `${cityPin.xPercent}%`,
                  top: `${cityPin.yPercent}%`,
                }}
              />
            );
          })}

          {gameState.board.pinIds.map((pinId) => {
            const pin = gameState.board.pinsById[pinId];
            const route = gameState.board.routesById[pin.routeLinkId];
            const isClaimed = route.claim.claimedByPlayerId !== null;
            const claimedBy = route.claim.claimedByPlayerId;
            const isHoveredRoute = hoveredRouteId === route.id;
            const isSelectedRoute = selectedRouteId === route.id;
            const defaultLegality = defaultClaimLegalityByRoute[route.id];
            const selectedTrainTypeHighlight =
              selectedTrainTypeHighlightByRoute[route.id];
            const isSelectedTrainTypeMatch =
              selectedTrainTypeHighlight?.matches ?? false;
            const minLocomotivesNeeded =
              selectedTrainTypeHighlight?.minLocomotivesNeeded ?? 0;
            const isRainbowPin =
              isSelectedTrainTypeMatch &&
              minLocomotivesNeeded > 0 &&
              pin.slotIndex >= route.slotCount - minLocomotivesNeeded;

            let visualClass = "opacity-0 bg-transparent";
            const pinStyle: React.CSSProperties = {
              left: `${pin.xPercent}%`,
              top: `${pin.yPercent}%`,
              width: "var(--pin-width)",
              height: "var(--pin-height)",
              transform: `translate(-50%, -50%) rotate(${pin.angleDeg}deg)`,
            };

            if (
              isClaimed &&
              (claimedBy === "player-1" || claimedBy === "player-2")
            ) {
              visualClass = `${CLAIMED_PIN_CLASS_BY_PLAYER[claimedBy]}`;
            } else if (isHoveredRoute) {
              visualClass = "opacity-100 bg-transparent ring-0";
              pinStyle.border = "2px solid transparent";
              pinStyle.backgroundImage = `linear-gradient(transparent, transparent), ${RAINBOW_RING_GRADIENT}`;
              pinStyle.backgroundOrigin = "border-box";
              pinStyle.backgroundClip = "padding-box, border-box";
            } else if (isRainbowPin) {
              visualClass = "opacity-100 bg-transparent ring-0";
              pinStyle.border = "2px solid transparent";
              pinStyle.backgroundImage = `linear-gradient(transparent, transparent), ${RAINBOW_RING_GRADIENT}`;
              pinStyle.backgroundOrigin = "border-box";
              pinStyle.backgroundClip = "padding-box, border-box";
            } else if (isSelectedTrainTypeMatch) {
              visualClass =
                "opacity-100 bg-yellow-300/45 ring-4 ring-yellow-300/95";
            } else if (isSelectedRoute) {
              visualClass = defaultLegality.isLegal
                ? "opacity-100 bg-yellow-300/35 ring-4 ring-yellow-300/95"
                : "opacity-100 bg-slate-300/35 ring-4 ring-slate-400/95";
            }

            return (
              <button
                key={pin.id}
                type="button"
                aria-label={`Route ${route.id}, segment ${pin.slotIndex + 1}`}
                onClick={() => onSelectRoute(route.id)}
                onMouseEnter={() => setHoveredRouteId(route.id)}
                onMouseLeave={() =>
                  setHoveredRouteId((existing) =>
                    existing === route.id ? null : existing,
                  )
                }
                onFocus={() => setHoveredRouteId(route.id)}
                onBlur={() =>
                  setHoveredRouteId((existing) =>
                    existing === route.id ? null : existing,
                  )
                }
                className={`absolute rounded-sm shadow-sm transition ${visualClass}`}
                style={pinStyle}
              ></button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-full px-3">
          <div className="pointer-events-auto mx-auto flex w-full max-w-5xl items-start gap-4 px-2">
            <aside className="w-72 shrink-0">
              {currentPlayerDestinationTickets.length === 0 ? (
                <p className="pt-6 text-xs font-semibold uppercase tracking-[0.16em] text-rail-paper/85">
                  Draw destination tickets to build routes.
                </p>
              ) : (
                <div className="pt-4">
                  {currentPlayerDestinationTickets.map((ticket, index) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() =>
                        setSelectedDestinationTicketIds((previous) =>
                          previous.includes(ticket.id)
                            ? previous.filter(
                                (ticketId) => ticketId !== ticket.id,
                              )
                            : [...previous, ticket.id],
                        )
                      }
                      onMouseEnter={() =>
                        setHoveredDestinationTicketId(ticket.id)
                      }
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
                      aria-pressed={selectedDestinationTicketIds.includes(
                        ticket.id,
                      )}
                      className={`relative w-full text-left transition ${
                        selectedDestinationTicketIds.includes(ticket.id)
                          ? "rounded-2xl ring-4 ring-yellow-300"
                          : ""
                      }`}
                      style={{
                        marginTop:
                          index === 0 ? 0 : "clamp(-2.4rem, -5vw, -1.75rem)",
                        zIndex: 20 + index,
                      }}
                    >
                      <DestinationTicketCard
                        ticket={ticket}
                        status={
                          currentPlayerDestinationProgressById[ticket.id]
                            ?.status
                        }
                      />
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <div className="min-w-0 flex-1 pl-8">
              <TrainCardFan
                counts={currentHandCounts}
                selectedType={selectedTrainType}
                onToggleType={(nextType) =>
                  setSelectedTrainType((previous) =>
                    previous === nextType ? null : nextType,
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
