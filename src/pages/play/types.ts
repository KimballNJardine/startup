import type { TrainCardType } from "../../domain";

export interface DiscardAnimationCard {
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
