import React from "react";
import type { TrainColor } from "../../../domain";
import {
  CLAIMED_PIN_CLASS_BY_PLAYER,
  RAINBOW_RING_GRADIENT,
} from "../constants";

interface MapPinButtonProps {
  pin: {
    id: string;
    slotIndex: number;
    xPercent: number;
    yPercent: number;
    angleDeg: number;
  };
  route: {
    id: string;
    slotCount: number;
    trainRequirementMode: "any-color" | "fixed-color";
    fixedColor: TrainColor | null;
    claim: { claimedByPlayerId: string | null };
  };
  isHoveredRoute: boolean;
  isSelectedRoute: boolean;
  defaultClaimIsLegal: boolean;
  selectedTrainTypeMatch: boolean;
  minLocomotivesNeeded: number;
  onSelectRoute: (routeId: string) => void;
  setHoveredRouteId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function MapPinButton({
  pin,
  route,
  isHoveredRoute,
  isSelectedRoute,
  defaultClaimIsLegal,
  selectedTrainTypeMatch,
  minLocomotivesNeeded,
  onSelectRoute,
  setHoveredRouteId,
}: MapPinButtonProps): React.JSX.Element {
  const isClaimed = route.claim.claimedByPlayerId !== null;
  const claimedBy = route.claim.claimedByPlayerId;
  const isRainbowPin =
    selectedTrainTypeMatch &&
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

  if (isClaimed && (claimedBy === "player-1" || claimedBy === "player-2")) {
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
  } else if (selectedTrainTypeMatch) {
    visualClass = "opacity-100 bg-yellow-300/45 ring-4 ring-yellow-300/95";
  } else if (isSelectedRoute) {
    visualClass = defaultClaimIsLegal
      ? "opacity-100 bg-yellow-300/35 ring-4 ring-yellow-300/95"
      : "opacity-100 bg-slate-300/35 ring-4 ring-slate-400/95";
  }

  return (
    <button
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
    />
  );
}
