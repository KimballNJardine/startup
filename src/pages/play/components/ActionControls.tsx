import React from "react";
import {
  TRAIN_COLORS,
  type ClaimCardSpend,
  type TrainColor,
} from "../../../domain";

interface SelectedRouteView {
  id: string;
  slotCount: number;
  trainRequirementMode: "any-color" | "fixed-color";
  fixedColor: TrainColor | null;
}

interface ActionControlsProps {
  selectedRoute: SelectedRouteView | null;
  claimSpend: ClaimCardSpend | null;
  claimLegality: { isLegal: boolean; reason: string | null };
  onUpdateClaimSpend: (
    updater: (spend: ClaimCardSpend) => ClaimCardSpend,
  ) => void;
  onResetClaimSpend: () => void;
  onClaimSelectedRoute: () => void;
}

export default function ActionControls({
  selectedRoute,
  claimSpend,
  claimLegality,
  onUpdateClaimSpend,
  onResetClaimSpend,
  onClaimSelectedRoute,
}: ActionControlsProps): React.JSX.Element {
  return (
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
                disabled={selectedRoute.trainRequirementMode === "fixed-color"}
                onChange={(event) => {
                  const nextColorValue = event.target.value;
                  onUpdateClaimSpend((previous) => ({
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
                    onUpdateClaimSpend((previous) => ({
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
                    onUpdateClaimSpend((previous) => ({
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
                    onUpdateClaimSpend((previous) => ({
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
                    onUpdateClaimSpend((previous) => ({
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
              onClick={onResetClaimSpend}
              className="rounded-xl border border-rail-300 bg-white px-3 py-2 text-sm font-bold"
            >
              Reset to Default Max-Color Spend
            </button>

            <button
              type="button"
              onClick={onClaimSelectedRoute}
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
  );
}
