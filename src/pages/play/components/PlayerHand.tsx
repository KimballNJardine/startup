import React from "react";
import type { LocalGameState, TrainColor } from "../../../domain";
import { canDrawFaceUpCard } from "../../../domain";
import { DISCARD_ANIMATION_DURATION_MS, feltSectionStyle } from "../constants";
import type { DiscardAnimationCard } from "../types";
import TrainCardArt from "./TrainCardArt";

interface PlayerHandProps {
  gameState: LocalGameState;
  currentPlayerDisplayName: string;
  destinationDrawLegality: { isLegal: boolean; reason: string | null };
  canDrawDeckIsLegal: boolean;
  uiError: string | null;
  onDrawDestinationTickets: () => void;
  onDrawFromDeck: () => void;
  onDrawFromFaceUp: (index: number) => void;
  lastDiscardedCardType?: TrainColor | "locomotive";
  discardAnimationCards: DiscardAnimationCard[];
}

export default function PlayerHand({
  gameState,
  currentPlayerDisplayName,
  destinationDrawLegality,
  canDrawDeckIsLegal,
  uiError,
  onDrawDestinationTickets,
  onDrawFromDeck,
  onDrawFromFaceUp,
  lastDiscardedCardType,
  discardAnimationCards,
}: PlayerHandProps): React.JSX.Element {
  return (
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
          onClick={onDrawDestinationTickets}
          disabled={!destinationDrawLegality.isLegal}
          className="rounded-xl bg-rail-700 px-4 py-2 text-sm font-extrabold text-rail-paper disabled:cursor-not-allowed disabled:opacity-45"
        >
          Draw 3 Destination Tickets
        </button>
      </div>
      <p className="mt-2 text-sm text-rail-700">
        Current turn: <strong>{currentPlayerDisplayName}</strong> (draws
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
            onClick={onDrawFromDeck}
            disabled={!canDrawDeckIsLegal}
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
                  onClick={() => onDrawFromFaceUp(index)}
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
                face={lastDiscardedCardType ? "front" : "back"}
                cardType={lastDiscardedCardType}
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
  );
}
