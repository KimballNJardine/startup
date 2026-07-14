import React from "react";
import {
  TRAIN_COLORS,
  type TrainCardType,
  type TrainColor,
} from "../../../domain";
import TrainCardArt from "./TrainCardArt";

interface TrainCardFanProps {
  counts: Record<TrainColor | "locomotive", number>;
  selectedType: TrainCardType | null;
  onToggleType: (cardType: TrainCardType) => void;
}

export default function TrainCardFan({
  counts,
  selectedType,
  onToggleType,
}: TrainCardFanProps): React.JSX.Element {
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
