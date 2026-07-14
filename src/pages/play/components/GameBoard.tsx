import React from "react";
import type {
  DestinationTicket,
  DestinationTicketProgressStatus,
  LocalGameState,
  TrainCardType,
  TrainColor,
} from "../../../domain";
import {
  canCurrentPlayerClaimRouteWithDefaultSpend,
  createBoardStateInspector,
  getCardTypeCount,
  getCityLocationPins,
} from "../../../domain";
import {
  boardStyle,
  feltSectionStyle,
  feltBoardWellStyle,
  overlayStyle,
} from "../constants";
import DestinationTicketCard from "./DestinationTicketCard";
import MapPinButton from "./MapPinButton";
import TrainCardFan from "./TrainCardFan";

interface GameBoardProps {
  gameState: LocalGameState;
  hoveredRouteId: string | null;
  setHoveredRouteId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  selectedDestinationTicketIds: string[];
  selectedPendingDestinationTicketIds: string[];
  hoveredDestinationTicketId: string | null;
  setSelectedDestinationTicketIds: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  setHoveredDestinationTicketId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  selectedTrainType: TrainCardType | null;
  setSelectedTrainType: React.Dispatch<
    React.SetStateAction<TrainCardType | null>
  >;
}

export default function GameBoard({
  gameState,
  hoveredRouteId,
  setHoveredRouteId,
  selectedRouteId,
  onSelectRoute,
  selectedDestinationTicketIds,
  selectedPendingDestinationTicketIds,
  hoveredDestinationTicketId,
  setSelectedDestinationTicketIds,
  setHoveredDestinationTicketId,
  selectedTrainType,
  setSelectedTrainType,
}: GameBoardProps): React.JSX.Element {
  const boardInspector = React.useMemo(
    () => createBoardStateInspector(gameState),
    [gameState],
  );
  const cityLocationPins = React.useMemo(() => getCityLocationPins(), []);
  const currentPlayer = gameState.playersById[gameState.turn.currentPlayerId];
  const currentPlayerDestinationTickets = currentPlayer.destinationTicketIds
    .map((ticketId) => gameState.destinationTicketsById[ticketId])
    .filter((ticket): ticket is DestinationTicket => Boolean(ticket));
  const currentPlayerDestinationProgressById = React.useMemo(() => {
    return boardInspector
      .getDestinationTicketProgressForPlayer(currentPlayer.id)
      .reduce<
        Record<
          string,
          { status: DestinationTicketProgressStatus; isFulfilled: boolean }
        >
      >((acc: Record<string, { status: DestinationTicketProgressStatus; isFulfilled: boolean }>, progress) => {
        acc[progress.ticketId] = {
          status: progress.status,
          isFulfilled: progress.isFulfilled,
        };
        return acc;
      }, {});
  }, [boardInspector, currentPlayer.id]);
  const currentHandCounts = React.useMemo(
    () => getCardTypeCount(currentPlayer.handCardIds, gameState.trainCardsById),
    [currentPlayer.handCardIds, gameState.trainCardsById],
  );
  const highlightedDestinationTicketIds = React.useMemo(() => {
    const ids = new Set<string>(selectedDestinationTicketIds);

    selectedPendingDestinationTicketIds.forEach((ticketId) => {
      ids.add(ticketId);
    });

    if (hoveredDestinationTicketId) {
      ids.add(hoveredDestinationTicketId);
    }

    return Array.from(ids);
  }, [
    hoveredDestinationTicketId,
    selectedDestinationTicketIds,
    selectedPendingDestinationTicketIds,
  ]);
  const highlightedCityIdSet = React.useMemo(
    () =>
      new Set(
        boardInspector.getHighlightedCityIdsForTicketIds(
          highlightedDestinationTicketIds,
        ),
      ),
    [boardInspector, highlightedDestinationTicketIds],
  );
  const defaultClaimLegalityByRoute = React.useMemo(() => {
    return gameState.board.routeIds.reduce<
      Record<string, { isLegal: boolean; reason: string | null }>
    >((acc, routeId) => {
      acc[routeId] = canCurrentPlayerClaimRouteWithDefaultSpend(
        gameState,
        routeId,
      );
      return acc;
    }, {});
  }, [gameState]);
  const selectedTrainTypeHighlightByRoute = React.useMemo(() => {
    const highlightByRouteId: Record<
      string,
      { matches: boolean; minLocomotivesNeeded: number }
    > = {};

    if (!selectedTrainType) {
      return highlightByRouteId;
    }

    const selectedTypeCount = currentHandCounts[selectedTrainType] ?? 0;
    const locomotiveCount = currentHandCounts.locomotive ?? 0;

    gameState.board.routeIds.forEach((routeId) => {
      const route = gameState.board.routesById[routeId];

      if (route.claim.claimedByPlayerId !== null) {
        highlightByRouteId[routeId] = {
          matches: false,
          minLocomotivesNeeded: 0,
        };
        return;
      }

      if (selectedTrainType === "locomotive") {
        highlightByRouteId[routeId] = {
          matches: locomotiveCount >= route.slotCount,
          minLocomotivesNeeded: 0,
        };
        return;
      }

      const routeAllowsSelectedColor =
        route.trainRequirementMode === "any-color" ||
        route.fixedColor === selectedTrainType;

      if (!routeAllowsSelectedColor || selectedTypeCount <= 0) {
        highlightByRouteId[routeId] = {
          matches: false,
          minLocomotivesNeeded: 0,
        };
        return;
      }

      const selectedCardsUsable = Math.min(selectedTypeCount, route.slotCount);
      const minLocomotivesNeeded = Math.max(
        0,
        route.slotCount - selectedCardsUsable,
      );
      const hasEnoughLocomotives = minLocomotivesNeeded <= locomotiveCount;

      highlightByRouteId[routeId] = {
        matches: hasEnoughLocomotives,
        minLocomotivesNeeded: hasEnoughLocomotives ? minLocomotivesNeeded : 0,
      };
    });

    return highlightByRouteId;
  }, [
    currentHandCounts,
    gameState.board.routeIds,
    gameState.board.routesById,
    selectedTrainType,
  ]);

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
          {cityLocationPins.map(
            (cityPin: { id: string; xPercent: number; yPercent: number }) => {
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
            },
          )}

          {gameState.board.pinIds.map((pinId) => {
            const pin = gameState.board.pinsById[pinId];
            const route = gameState.board.routesById[pin.routeLinkId];
            const isHoveredRoute = hoveredRouteId === route.id;
            const isSelectedRoute = selectedRouteId === route.id;
            const defaultLegality = defaultClaimLegalityByRoute[route.id];
            const selectedTrainTypeHighlight =
              selectedTrainTypeHighlightByRoute[route.id];
            const isSelectedTrainTypeMatch =
              selectedTrainTypeHighlight?.matches ?? false;
            const minLocomotivesNeeded =
              selectedTrainTypeHighlight?.minLocomotivesNeeded ?? 0;

            return (
              <MapPinButton
                key={pin.id}
                pin={pin}
                route={route}
                isHoveredRoute={isHoveredRoute}
                isSelectedRoute={isSelectedRoute}
                defaultClaimIsLegal={defaultLegality.isLegal}
                selectedTrainTypeMatch={isSelectedTrainTypeMatch}
                minLocomotivesNeeded={minLocomotivesNeeded}
                onSelectRoute={onSelectRoute}
                setHoveredRouteId={setHoveredRouteId}
              />
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
