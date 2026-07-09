import React, { useEffect, useMemo, useState } from "react";
import {
  TRAIN_COLORS,
  canClaimRoute,
  canCurrentPlayerClaimRouteWithDefaultSpend,
  canDrawFaceUpCard,
  canDrawFromDeck,
  claimRoute,
  createInitialLocalGameState,
  drawTrainCardFromDeck,
  drawTrainCardFromFaceUp,
  getCardTypeCount,
  getDefaultClaimSpend,
  type ClaimCardSpend,
  type LocalGameState,
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
}: {
  counts: Record<TrainColor | "locomotive", number>;
}): React.JSX.Element {
  const cardTypes = [...TRAIN_COLORS, "locomotive" as const].filter(
    (cardType) => counts[cardType] > 0,
  );

  if (cardTypes.length === 0) {
    return (
      <p className="mt-2 text-sm text-rail-700">No train cards in hand.</p>
    );
  }

  return (
    <div className="mt-4 flex justify-center overflow-x-auto pb-2">
      <div className="relative h-48 w-full max-w-2xl">
        {cardTypes.map((cardType, index) => {
          const count = counts[cardType];
          const badge = count > 1 ? `x${count}` : null;
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
              <div className="transition-transform duration-300 ease-out hover:-translate-y-4 focus-visible:-translate-y-4">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md ring-1 ring-black/10 will-change-transform">
                  <TrainCardArt face="front" cardType={cardType} />

                  {badge ? (
                    <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                      {badge}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  const [claimSpend, setClaimSpend] = useState<ClaimCardSpend | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  const currentPlayer = gameState.playersById[gameState.turn.currentPlayerId];

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Pick Train Cards
        </h2>
        <p className="mt-2 text-sm text-rail-700">
          Current turn: <strong>{currentPlayer.displayName}</strong> (draws
          remaining: {gameState.turn.drawsRemaining})
        </p>

        {uiError ? (
          <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {uiError}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-start gap-8">
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
      </section>

      <section className="rounded-2xl border border-rail-300/70 bg-white/80 p-5 shadow-card sm:p-6">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          Board
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-rail-700 sm:text-base">
          Unclaimed links are invisible until claimed. Hover any unclaimed link:
          gold aura means you can claim it now, gray means you cannot.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-rail-700">
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-900">
            Gold aura = claimable now
          </span>
          <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-800">
            Gray aura = insufficient cards/trains
          </span>
          <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-900">
            Player 1 claimed
          </span>
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-900">
            Player 2 claimed
          </span>
        </div>

        <div
          className="relative mt-4 overflow-hidden rounded-xl border border-rail-300/70 bg-rail-paper/70"
          style={boardStyle}
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

              let visualClass = "opacity-0 bg-transparent";

              if (
                isClaimed &&
                (claimedBy === "player-1" || claimedBy === "player-2")
              ) {
                visualClass = `${CLAIMED_PIN_CLASS_BY_PLAYER[claimedBy]}`;
              } else if (isHoveredRoute || isSelectedRoute) {
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
                  className={`absolute rounded-sm shadow-sm ring-1 ring-white/70 transition ${visualClass}`}
                  style={{
                    left: `${pin.xPercent}%`,
                    top: `${pin.yPercent}%`,
                    width: "var(--pin-width)",
                    height: "var(--pin-height)",
                    transform: `translate(-50%, -50%) rotate(${pin.angleDeg}deg)`,
                  }}
                ></button>
              );
            })}
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
                onClick={() =>
                  applyTransition((previous) => {
                    if (!claimSpend) {
                      return previous;
                    }

                    const next = claimRoute(
                      previous,
                      selectedRoute.id,
                      claimSpend,
                      previous.turn.currentPlayerId,
                    );
                    setSelectedRouteId(null);
                    setClaimSpend(null);
                    return next;
                  })
                }
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
          <h3 className="text-base font-bold">Train Cards in Hand</h3>
          <TrainCardFan counts={currentHandCounts} />
        </div>

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
