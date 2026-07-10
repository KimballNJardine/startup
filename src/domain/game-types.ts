import type { BoardState } from './board-data';
import type { DestinationTicket } from './destination-ticket';
import type { TrainCardType, TrainColor } from './train-types';

export type PlayerId = 'player-1' | 'player-2';

export interface TrainCard {
  id: string;
  type: TrainCardType;
}

export interface PlayerState {
  id: PlayerId;
  displayName: string;
  trainsLeft: number;
  handCardIds: string[];
  destinationTicketIds: string[];
  claimedRouteIds: string[];
  score: number;
}

export interface TurnState {
  turnNumber: number;
  currentPlayerId: PlayerId;
  drawsRemaining: number;
}

export interface ClaimCardSpend {
  color: TrainColor | null;
  colorCards: number;
  locomotiveCards: number;
}

export interface ClaimLegalityResult {
  isLegal: boolean;
  reason: string | null;
}

export interface DestinationTicketSelectionState {
  playerId: PlayerId;
  pendingTicketIds: string[];
  minimumKeepCount: number;
}

export interface LocalGameState {
  board: BoardState;
  playersById: Record<PlayerId, PlayerState>;
  playerOrder: PlayerId[];
  turn: TurnState;
  destinationTicketsById: Record<string, DestinationTicket>;
  destinationTicketDeckIds: string[];
  destinationTicketDiscardIds: string[];
  destinationTicketSelection: DestinationTicketSelectionState | null;
  trainCardsById: Record<string, TrainCard>;
  trainDeckCardIds: string[];
  trainDiscardCardIds: string[];
  faceUpCardIds: string[];
  isDestinationScoreApplied: boolean;
  notifications: string[];
}
