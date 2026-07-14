import type { ClaimCardSpend, TrainColor } from "../../../domain";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeClaimSpend(
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
