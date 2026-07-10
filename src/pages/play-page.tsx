import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TRAIN_COLORS,
  canClaimRoute,
  canFinalizeDestinationTicketSelection,
  canCurrentPlayerClaimRouteWithDefaultSpend,
  canDrawDestinationTicket,
  canDrawFaceUpCard,
  canDrawFromDeck,
  claimRoute,
  createInitialLocalGameState,
  DESTINATION_TICKETS,
  drawDestinationTicket,
  drawTrainCardFromDeck,
  drawTrainCardFromFaceUp,
  finalizeDestinationTicketSelection,
  getCardTypeCount,
  getDefaultClaimSpend,
  type ClaimCardSpend,
  type DestinationTicket,
  type LocalGameState,
  type TrainCardType,
  type TrainColor,
} from "../domain";

const boardStyle = {
  aspectRatio: "1024 / 683",
};

const overlayStyle = {
  "--pin-width": "3.125%",
  "--pin-height": "1.5625%",
} as React.CSSProperties;

const CLAIMED_PIN_CLASS_BY_PLAYER = {
  "player-1": "bg-sky-700/95 ring-sky-300/80",
  "player-2": "bg-rose-700/95 ring-rose-300/80",
} as const;

const TRAIN_CARD_IMAGE_BY_TYPE = {
  black: "img/split_trains/train_black.png",
  blue: "img/split_trains/train_blue.png",
  green: "img/split_trains/train_green.png",
  locomotive: "img/split_trains/train_rainbow.png",
  orange: "img/split_trains/train_orange.png",
  pink: "img/split_trains/train_purple.png",
  red: "img/split_trains/train_red.png",
  white: "img/split_trains/train_white.png",
  yellow: "img/split_trains/train_yellow.png",
} as const satisfies Record<TrainColor | "locomotive", string>;

const TRAIN_CARD_BACK_IMAGE = "img/split_trains/train_back.png";

const RAINBOW_RING_GRADIENT =
  "linear-gradient(135deg, rgba(244,63,94,0.95), rgba(250,204,21,0.95), rgba(52,211,153,0.95), rgba(96,165,250,0.95))";

const FELT_TEXTURE_IMAGE =
  "repeating-radial-gradient(circle at 18% 22%, rgba(74,222,128,0.045) 0 1px, rgba(74,222,128,0) 1px 4px), repeating-radial-gradient(circle at 78% 68%, rgba(16,185,129,0.04) 0 1px, rgba(16,185,129,0) 1px 3px), radial-gradient(circle at 28% 18%, rgba(20,83,45,0.72), rgba(6,78,59,0.95) 58%, rgba(2,44,34,0.99))";

const feltSectionStyle: React.CSSProperties = {
  backgroundImage: FELT_TEXTURE_IMAGE,
  boxShadow: "inset 0 -18px 36px rgba(0,0,0,0.5), 0 16px 28px rgba(0,0,0,0.24)",
};

const feltBoardWellStyle: React.CSSProperties = {
  backgroundImage: FELT_TEXTURE_IMAGE,
  boxShadow:
    "inset 0 0 0 1px rgba(6,78,59,0.6), inset 0 -14px 24px rgba(0,0,0,0.42)",
};

const DISCARD_ANIMATION_STAGGER_MS = 85;
const DISCARD_ANIMATION_DURATION_MS = 560;
const DISCARD_ANIMATION_CLEAR_BUFFER_MS = 180;

interface DiscardAnimationCard {
  id: string;
  cardType: TrainCardType;
  delayMs: number;
  startXPercent: number;
  startYPercent: number;
  endXPercent: number;
  endYPercent: number;
  startRotationDeg: number;
  zIndex: number;
}

function TrainCardArt({
  cardType,
  face,
}: {
  cardType?: TrainColor | "locomotive";
  face: "front" | "back";
}): React.JSX.Element {
  const imageSrc =
    face === "back"
      ? TRAIN_CARD_BACK_IMAGE
      : cardType
        ? TRAIN_CARD_IMAGE_BY_TYPE[cardType]
        : TRAIN_CARD_BACK_IMAGE;

  const altText =
    face === "back"
      ? "Train card back"
      : `${cardType ? cardType : "train"} train card`;

  return (
    <img src={imageSrc} alt={altText} className="h-full w-full object-cover" />
  );
}

function TrainCardFan({
  counts,
  selectedType,
  onToggleType,
}: {
  counts: Record<TrainColor | "locomotive", number>;
  selectedType: TrainCardType | null;
  onToggleType: (cardType: TrainCardType) => void;
}): React.JSX.Element {
  const cardTypes = [...TRAIN_COLORS, "locomotive" as const].filter(
    (cardType) => counts[cardType] > 0,
  );

  if (cardTypes.length === 0) {
    return <p className="text-sm text-rail-paper">No train cards in hand.</p>;
  }

  return (
    <div className="flex justify-center overflow-x-auto overflow-y-visible pt-4 pb-1">
      <div className="relative h-52 w-full max-w-2xl">
        {cardTypes.map((cardType, index) => {
          const count = counts[cardType];
          const badge = count > 1 ? `x${count}` : null;
          const isSelected = selectedType === cardType;
          const fanCenter = (cardTypes.length - 1) / 2;
          const offsetFromCenter = index - fanCenter;
          const rotation = offsetFromCenter * 13;
          const translateX = offsetFromCenter * 52;
          const translateY = Math.abs(offsetFromCenter) * 14;

          return (
            <div
              key={cardType}
              className="absolute left-1/2 top-0 w-24"
              style={{
                transform: `translateX(-50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                transformOrigin: "center bottom",
                zIndex: 100 + index,
              }}
            >
              <button
                type="button"
                onClick={() => onToggleType(cardType)}
                aria-pressed={isSelected}
                aria-label={`Toggle ${cardType} route highlight`}
                className={`transition-transform duration-300 ease-out hover:-translate-y-4 focus-visible:-translate-y-4 ${isSelected ? "-translate-y-4" : ""}`}
              >
                <div
                  className={`relative aspect-[2/3] overflow-hidden rounded-xl shadow-md will-change-transform ${
                    isSelected
                      ? "ring-4 ring-yellow-300"
                      : "ring-1 ring-black/10"
                  }`}
                >
                  <TrainCardArt face="front" cardType={cardType} />

                  {badge ? (
                    <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                      {badge}
                    </span>
                  ) : null}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DestinationTicketCard({
  ticket,
}: {
  ticket: DestinationTicket;
}): React.JSX.Element {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-red-100/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-200/35 blur-xl transition group-hover:bg-red-300/45" />
      <div className="mt-1 flex items-center gap-3">
        <p className="text-base font-extrabold text-rail-900">
          {ticket.originCity}
        </p>
        <span className="h-px flex-1 border-t-2 border-dashed border-red-400/70" />
        <div className="flex items-center gap-2">
          <p className="text-base font-extrabold text-rail-900">
            {ticket.destinationCity}
          </p>
          <span className="inline-flex rounded-full bg-red-700 px-2.5 py-1 text-xs font-extrabold text-white">
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeClaimSpend(
  routeSlotCount: number,
  candidate: ClaimCardSpend,
  fixedColor: TrainColor | null,
): ClaimCardSpend {
  const constrainedColor = fixedColor ?? candidate.color;
  const baseColorCards =
    constrainedColor === null
      ? 0
      : clamp(candidate.colorCards, 0, routeSlotCount);
  const baseLocomotives = clamp(candidate.locomotiveCards, 0, routeSlotCount);

  if (baseColorCards + baseLocomotives === routeSlotCount) {
    return {
      color: constrainedColor,
      colorCards: baseColorCards,
      locomotiveCards: baseLocomotives,
    };
  }

  return {
    color: constrainedColor,
    colorCards: baseColorCards,
    locomotiveCards: clamp(routeSlotCount - baseColorCards, 0, routeSlotCount),
  };
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<LocalGameState>(() =>
    createInitialLocalGameState({ seed: 260 }),
  );
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedTrainType, setSelectedTrainType] =
    useState<TrainCardType | null>(null);
  const [claimSpend, setClaimSpend] = useState<ClaimCardSpend | null>(null);
  const [discardAnimationCards, setDiscardAnimationCards] = useState<
    DiscardAnimationCard[]
  >([]);
  const [uiError, setUiError] = useState<string | null>(null);
  const [
    selectedPendingDestinationTicketIds,
    setSelectedPendingDestinationTicketIds,
  ] = useState<string[]>([]);
  const discardAnimationTimeoutRef = useRef<number | null>(null);

  const currentPlayer = gameState.playersById[gameState.turn.currentPlayerId];
  const pendingDestinationTicketSelection =
    gameState.destinationTicketSelection;
  const destinationTicketDeckCount = gameState.destinationTicketDeckIds.length;
  const destinationDrawLegality = canDrawDestinationTicket(gameState);
  const pendingDestinationTickets =
    pendingDestinationTicketSelection &&
    pendingDestinationTicketSelection.playerId ===
      gameState.turn.currentPlayerId
      ? pendingDestinationTicketSelection.pendingTicketIds
          .map((ticketId) => gameState.destinationTicketsById[ticketId])
          .filter((ticket): ticket is DestinationTicket => Boolean(ticket))
      : [];
  const destinationSelectionLegality = pendingDestinationTicketSelection
    ? canFinalizeDestinationTicketSelection(
        gameState,
        selectedPendingDestinationTicketIds,
      )
    : null;
  const currentPlayerDestinationTickets = currentPlayer.destinationTicketIds
    .map((ticketId) => gameState.destinationTicketsById[ticketId])
    .filter((ticket): ticket is DestinationTicket => Boolean(ticket));
  const lastDiscardedCardId =
    gameState.trainDiscardCardIds.length > 0
      ? gameState.trainDiscardCardIds[gameState.trainDiscardCardIds.length - 1]
      : null;
  const lastDiscardedCard = lastDiscardedCardId
    ? gameState.trainCardsById[lastDiscardedCardId]
    : null;

  const currentHandCounts = useMemo(
    () => getCardTypeCount(currentPlayer.handCardIds, gameState.trainCardsById),
    [currentPlayer.handCardIds, gameState.trainCardsById],
  );

  const defaultClaimLegalityByRoute = useMemo(() => {
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

  const selectedTrainTypeHighlightByRoute = useMemo(() => {
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

  useEffect(() => {
    if (!selectedRouteId) {
      setClaimSpend(null);
      return;
    }

    const route = gameState.board.routesById[selectedRouteId];
    if (!route || route.claim.claimedByPlayerId !== null) {
      setSelectedRouteId(null);
      setClaimSpend(null);
      return;
    }

    setClaimSpend((previous) => {
      if (!previous) {
        return getDefaultClaimSpend(gameState, selectedRouteId);
      }

      return normalizeClaimSpend(route.slotCount, previous, route.fixedColor);
    });
  }, [gameState, selectedRouteId]);

  const selectedRoute = selectedRouteId
    ? gameState.board.routesById[selectedRouteId]
    : null;

  const claimLegality = useMemo(() => {
    if (!selectedRoute || !claimSpend) {
      return { isLegal: false, reason: "Select a route to claim." };
    }

    return canClaimRoute(
      gameState,
      selectedRoute.id,
      claimSpend,
      gameState.turn.currentPlayerId,
    );
  }, [claimSpend, gameState, selectedRoute]);

  const applyTransition = (
    transition: (state: LocalGameState) => LocalGameState,
  ): void => {
    setUiError(null);

    try {
      setGameState((previous) => transition(previous));
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : "Unknown game transition failure.",
      );
    }
  };

  const selectRoute = (routeId: string): void => {
    const route = gameState.board.routesById[routeId];
    if (!route || route.claim.claimedByPlayerId !== null) {
      return;
    }

    setSelectedRouteId(routeId);
    setClaimSpend(getDefaultClaimSpend(gameState, routeId));
    setUiError(null);
  };

  const updateClaimSpend = (
    updater: (spend: ClaimCardSpend) => ClaimCardSpend,
  ): void => {
    if (!selectedRoute || !claimSpend) {
      return;
    }

    const nextSpend = updater(claimSpend);
    setClaimSpend(
      normalizeClaimSpend(
        selectedRoute.slotCount,
        nextSpend,
        selectedRoute.fixedColor,
      ),
    );
  };

  const queueDiscardAnimationFromSpend = (spend: ClaimCardSpend): void => {
    if (typeof window !== "undefined") {
      const reduceMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      if (reduceMotionQuery.matches) {
        return;
      }
    }

    const spentTypes: TrainCardType[] = [];

    if (spend.color && spend.colorCards > 0) {
      spentTypes.push(...Array(spend.colorCards).fill(spend.color));
    }

    if (spend.locomotiveCards > 0) {
      spentTypes.push(...Array(spend.locomotiveCards).fill("locomotive"));
    }

    if (spentTypes.length === 0) {
      return;
    }

    const cardTypeOrder: TrainCardType[] = [...TRAIN_COLORS, "locomotive"];
    const animatedCards = spentTypes.map((cardType, index) => {
      const typeIndex = cardTypeOrder.indexOf(cardType);
      const typeOffset = (typeIndex - (cardTypeOrder.length - 1) / 2) * 1.6;
      const laneOffset = (index % 3) * 1.2;
      const rowOffset = Math.floor(index / 3) * 0.9;

      return {
        id: `${cardType}-${Date.now()}-${index}`,
        cardType,
        delayMs: index * DISCARD_ANIMATION_STAGGER_MS,
        startXPercent: 28 + typeOffset + laneOffset,
        startYPercent: 56 + rowOffset,
        endXPercent: 86.5 + ((index % 2) * 0.9 - 0.45),
        endYPercent: 44 + ((index % 3) - 1) * 0.7,
        startRotationDeg: -16 + (index % 5) * 6,
        zIndex: 40 + index,
      } satisfies DiscardAnimationCard;
    });

    setDiscardAnimationCards(animatedCards);

    if (discardAnimationTimeoutRef.current !== null) {
      window.clearTimeout(discardAnimationTimeoutRef.current);
    }

    const animationRuntimeMs =
      (animatedCards.length - 1) * DISCARD_ANIMATION_STAGGER_MS +
      DISCARD_ANIMATION_DURATION_MS +
      DISCARD_ANIMATION_CLEAR_BUFFER_MS;

    discardAnimationTimeoutRef.current = window.setTimeout(() => {
      setDiscardAnimationCards([]);
      discardAnimationTimeoutRef.current = null;
    }, animationRuntimeMs);
  };

  const handleClaimSelectedRoute = (): void => {
    if (!selectedRoute || !claimSpend || !claimLegality.isLegal) {
      return;
    }

    const claimSpendSnapshot: ClaimCardSpend = {
      color: claimSpend.color,
      colorCards: claimSpend.colorCards,
      locomotiveCards: claimSpend.locomotiveCards,
    };

    queueDiscardAnimationFromSpend(claimSpendSnapshot);

    applyTransition((previous) => {
      const next = claimRoute(
        previous,
        selectedRoute.id,
        claimSpendSnapshot,
        previous.turn.currentPlayerId,
      );
      setSelectedRouteId(null);
      setClaimSpend(null);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (discardAnimationTimeoutRef.current !== null) {
        window.clearTimeout(discardAnimationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingDestinationTicketSelection) {
      setSelectedPendingDestinationTicketIds([]);
      return;
    }

    setSelectedPendingDestinationTicketIds([]);
  }, [pendingDestinationTicketSelection]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <section
        className="relative overflow-visible rounded-2xl border border-emerald-950/90 p-5 sm:p-6"
        style={feltSectionStyle}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Pick Train Cards
          </h2>
          <button
            type="button"
            onClick={() =>
              applyTransition((previous) => drawDestinationTicket(previous))
            }
            disabled={!destinationDrawLegality.isLegal}
            className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper disabled:cursor-not-allowed disabled:opacity-45"
          >
            Draw 3 Destination Tickets
          </button>
        </div>
        <p className="mt-2 text-sm text-rail-700">
          Current turn: <strong>{currentPlayer.displayName}</strong> (draws
          remaining: {gameState.turn.drawsRemaining})
        </p>
        {!destinationDrawLegality.isLegal ? (
          <p className="mt-2 text-sm text-red-700">
            {destinationDrawLegality.reason}
          </p>
        ) : null}

        {uiError ? (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {uiError}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-start gap-6 lg:flex-nowrap">
          <div className="flex min-w-0 flex-1 flex-wrap items-start gap-8">
            <button
              type="button"
              onClick={() =>
                applyTransition((previous) => drawTrainCardFromDeck(previous))
              }
              disabled={!canDrawFromDeck(gameState).isLegal}
              className="w-28 shrink-0 p-0 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <div className="aspect-[2/3] w-28 overflow-hidden rounded-xl">
                <TrainCardArt face="back" />
              </div>
              <p className="mt-2 text-xs text-rail-700">
                Cards left: {gameState.trainDeckCardIds.length}
              </p>
            </button>

            <div className="flex flex-wrap gap-2">
              {gameState.faceUpCardIds.map((cardId, index) => {
                const card = gameState.trainCardsById[cardId];
                const legal = canDrawFaceUpCard(gameState, index);

                return (
                  <button
                    key={cardId}
                    type="button"
                    onClick={() =>
                      applyTransition((previous) =>
                        drawTrainCardFromFaceUp(previous, index),
                      )
                    }
                    disabled={!legal.isLegal}
                    className="w-28 shrink-0 p-0 text-left text-xs font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="aspect-[2/3] w-28 overflow-hidden rounded-xl">
                      <TrainCardArt face="front" cardType={card.type} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="ml-auto flex shrink-0 flex-col items-center gap-2 border-l border-emerald-900/60 pl-5 lg:pl-6">
            <div className="flex h-44 w-32 items-center justify-center">
              <div className="aspect-[2/3] w-28 rotate-90 overflow-hidden rounded-xl shadow-md ring-1 ring-black/15">
                <TrainCardArt
                  face={lastDiscardedCard ? "front" : "back"}
                  cardType={lastDiscardedCard?.type}
                />
              </div>
            </div>
            <p className="text-xs text-rail-700">
              {gameState.trainDiscardCardIds.length} cards
            </p>
          </aside>
        </div>

        {discardAnimationCards.length > 0 ? (
          <div
            className="pointer-events-none absolute inset-0 z-30 overflow-visible"
            aria-hidden="true"
          >
            {discardAnimationCards.map((animatedCard) => (
              <div
                key={animatedCard.id}
                className="absolute aspect-[2/3] w-20 overflow-hidden rounded-xl shadow-xl ring-1 ring-black/20"
                style={{
                  zIndex: animatedCard.zIndex,
                  animationName: "discardFlyToPile",
                  animationDuration: `${DISCARD_ANIMATION_DURATION_MS}ms`,
                  animationTimingFunction: "cubic-bezier(0.2, 0.85, 0.28, 1)",
                  animationDelay: `${animatedCard.delayMs}ms`,
                  animationFillMode: "forwards",
                  ["--discard-start-x" as string]: `${animatedCard.startXPercent}%`,
                  ["--discard-start-y" as string]: `${animatedCard.startYPercent}%`,
                  ["--discard-end-x" as string]: `${animatedCard.endXPercent}%`,
                  ["--discard-end-y" as string]: `${animatedCard.endYPercent}%`,
                  ["--discard-start-rotation" as string]: `${animatedCard.startRotationDeg}deg`,
                }}
              >
                <TrainCardArt face="front" cardType={animatedCard.cardType} />
              </div>
            ))}
          </div>
        ) : null}

        <style>{`
          @keyframes discardFlyToPile {
            0% {
              left: var(--discard-start-x);
              top: var(--discard-start-y);
              transform: translate(-50%, -50%) rotate(var(--discard-start-rotation));
              opacity: 0;
            }

            12% {
              opacity: 1;
            }

            100% {
              left: var(--discard-end-x);
              top: var(--discard-end-y);
              transform: translate(-50%, -50%) rotate(90deg) scale(0.86);
              opacity: 0.2;
            }
          }
        `}</style>
      </section>

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
                  onClick={() => selectRoute(route.id)}
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
                      <div
                        key={ticket.id}
                        className="relative"
                        style={{
                          marginTop:
                            index === 0 ? 0 : "clamp(-2.4rem, -5vw, -1.75rem)",
                          zIndex: 20 + index,
                        }}
                      >
                        <DestinationTicketCard ticket={ticket} />
                      </div>
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

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Claim Route Controls
        </h2>

        {!selectedRoute || !claimSpend ? (
          <p className="mt-3 text-sm text-rail-700">
            Select a route on the board to configure and claim it.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="rounded-xl bg-rail-paper/70 p-3 text-sm">
              <p>
                Selected route: <strong>{selectedRoute.id}</strong>
              </p>
              <p>Length: {selectedRoute.slotCount}</p>
              <p>
                Requirement:{" "}
                {selectedRoute.trainRequirementMode === "any-color"
                  ? "Any color"
                  : selectedRoute.fixedColor}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Color to spend
                <select
                  value={claimSpend.color ?? "none"}
                  disabled={
                    selectedRoute.trainRequirementMode === "fixed-color"
                  }
                  onChange={(event) => {
                    const nextColorValue = event.target.value;
                    updateClaimSpend((previous) => ({
                      ...previous,
                      color:
                        nextColorValue === "none"
                          ? null
                          : (nextColorValue as TrainColor),
                      colorCards:
                        nextColorValue === "none" ? 0 : previous.colorCards,
                    }));
                  }}
                  className="rounded-md border border-rail-300 px-2 py-1"
                >
                  <option value="none">None</option>
                  {TRAIN_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-rail-200 p-3 text-sm">
                <p className="font-semibold">Color cards used</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateClaimSpend((previous) => ({
                        ...previous,
                        colorCards: previous.colorCards - 1,
                      }))
                    }
                    className="rounded-md bg-rail-200 px-2 py-1"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center font-bold">
                    {claimSpend.colorCards}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateClaimSpend((previous) => ({
                        ...previous,
                        colorCards: previous.colorCards + 1,
                      }))
                    }
                    className="rounded-md bg-rail-200 px-2 py-1"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-rail-200 p-3 text-sm">
                <p className="font-semibold">Locomotive cards used</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateClaimSpend((previous) => ({
                        ...previous,
                        locomotiveCards: previous.locomotiveCards - 1,
                        colorCards: previous.colorCards + 1,
                      }))
                    }
                    className="rounded-md bg-rail-200 px-2 py-1"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center font-bold">
                    {claimSpend.locomotiveCards}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateClaimSpend((previous) => ({
                        ...previous,
                        locomotiveCards: previous.locomotiveCards + 1,
                        colorCards: previous.colorCards - 1,
                      }))
                    }
                    className="rounded-md bg-rail-200 px-2 py-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setClaimSpend(
                    getDefaultClaimSpend(gameState, selectedRoute.id),
                  )
                }
                className="rounded-xl border border-rail-300 bg-white px-3 py-2 text-sm font-bold"
              >
                Reset to Default Max-Color Spend
              </button>

              <button
                type="button"
                onClick={handleClaimSelectedRoute}
                disabled={!claimLegality.isLegal}
                className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper disabled:cursor-not-allowed disabled:opacity-45"
              >
                Claim Selected Route
              </button>

              {!claimLegality.isLegal ? (
                <p className="text-sm text-red-700">{claimLegality.reason}</p>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Destination Tickets
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-rail-700">
            Deck remaining: <strong>{destinationTicketDeckCount}</strong> of{" "}
            {DESTINATION_TICKETS.length}
          </p>
          <p className="text-sm text-rail-700">
            Discard:{" "}
            <strong>{gameState.destinationTicketDiscardIds.length}</strong>
          </p>
        </div>
        <p className="mt-3 text-sm text-rail-700">
          Drawn destination tickets are shown beside the train card fan.
        </p>

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
                    onClick={() =>
                      setSelectedPendingDestinationTicketIds((previous) =>
                        previous.includes(ticket.id)
                          ? previous.filter(
                              (ticketId) => ticketId !== ticket.id,
                            )
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
                    <DestinationTicketCard ticket={ticket} />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  applyTransition((previous) =>
                    finalizeDestinationTicketSelection(
                      previous,
                      selectedPendingDestinationTicketIds,
                    ),
                  )
                }
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

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Player Public Status
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-rail-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-rail-200/70 text-rail-900">
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Turn
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Player
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Trains Left
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Hand Size
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Claimed Routes
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Segment Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 text-rail-900">
              {gameState.playerOrder.map((playerId) => {
                const player = gameState.playersById[playerId];

                return (
                  <tr key={player.id} className="odd:bg-rail-paper/45">
                    <td className="px-3 py-2">
                      {gameState.turn.currentPlayerId === player.id
                        ? "Current"
                        : "Waiting"}
                    </td>
                    <td className="px-3 py-2">{player.displayName}</td>
                    <td className="px-3 py-2">{player.trainsLeft}</td>
                    <td className="px-3 py-2">{player.handCardIds.length}</td>
                    <td className="px-3 py-2">
                      {player.claimedRouteIds.length}
                    </td>
                    <td className="px-3 py-2">{player.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Turn Notifications
        </h2>
        <ul
          id="turnNotifications"
          aria-live="polite"
          className="mt-3 space-y-2 rounded-xl bg-rail-paper/70 px-4 py-3 text-sm"
        >
          {gameState.notifications
            .slice(-6)
            .reverse()
            .map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Current Player Private Details
        </h2>

        <div className="mt-4">
          <h3 className="text-base font-bold">Claimed Routes</h3>
          {currentPlayer.claimedRouteIds.length === 0 ? (
            <p className="mt-2 text-sm text-rail-700">No claimed routes yet.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {currentPlayer.claimedRouteIds.map((routeId) => (
                <li key={routeId}>{routeId}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
