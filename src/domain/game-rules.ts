import {
  getParallelGroupKey,
  getRouteCardTypeRequirement,
  type BoardRouteState,
  type RouteCardRequirement,
} from './board-data';
import { createBoardStateInspector } from './board-state';
import { getCardTypeCount } from './game-init';
import type { ClaimCardSpend, ClaimLegalityResult, LocalGameState, PlayerId } from './game-types';
import type { TrainCardType, TrainColor } from './train-types';

const DESTINATION_TICKET_DRAW_COUNT = 3;
const DESTINATION_TICKET_MINIMUM_KEEP_COUNT = 1;

const SEGMENT_POINTS_BY_LENGTH: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
  6: 15,
};

function getSegmentPoints(slotCount: number): number {
  return SEGMENT_POINTS_BY_LENGTH[slotCount] ?? 0;
}

function getNextPlayerId(currentPlayerId: PlayerId): PlayerId {
  return currentPlayerId === 'player-1' ? 'player-2' : 'player-1';
}

function cloneState(state: LocalGameState): LocalGameState {
  return {
    ...state,
    board: {
      ...state.board,
      pinsById: { ...state.board.pinsById },
      routesById: { ...state.board.routesById },
    },
    playersById: {
      'player-1': { ...state.playersById['player-1'] },
      'player-2': { ...state.playersById['player-2'] },
    },
    destinationTicketsById: { ...state.destinationTicketsById },
    destinationTicketDeckIds: [...state.destinationTicketDeckIds],
    destinationTicketDiscardIds: [...state.destinationTicketDiscardIds],
    destinationTicketSelection: state.destinationTicketSelection
      ? {
          ...state.destinationTicketSelection,
          pendingTicketIds: [...state.destinationTicketSelection.pendingTicketIds],
        }
      : null,
    trainDeckCardIds: [...state.trainDeckCardIds],
    trainDiscardCardIds: [...state.trainDiscardCardIds],
    faceUpCardIds: [...state.faceUpCardIds],
    isDestinationScoreApplied: state.isDestinationScoreApplied,
    notifications: [...state.notifications],
  };
}

export function getDestinationTicketNetDelta(state: LocalGameState, playerId: PlayerId): number {
  return createBoardStateInspector(state).getDestinationTicketScoreBreakdownForPlayer(playerId).netDelta;
}

export function applyDestinationTicketScores(state: LocalGameState): LocalGameState {
  if (state.isDestinationScoreApplied) {
    throw new Error('Destination scores have already been applied.');
  }

  const next = cloneState(state);
  const boardInspector = createBoardStateInspector(next);

  next.playerOrder.forEach((playerId) => {
    const destinationDelta = boardInspector.getDestinationTicketScoreBreakdownForPlayer(playerId).netDelta;
    next.playersById[playerId].score += destinationDelta;
  });

  next.isDestinationScoreApplied = true;
  next.notifications.push('Destination ticket scoring has been applied.');

  return next;
}

export function canDrawDestinationTicket(state: LocalGameState): ClaimLegalityResult {
  if (state.destinationTicketSelection) {
    return {
      isLegal: false,
      reason: 'Resolve the current destination ticket selection first.',
    };
  }

  if (state.destinationTicketDeckIds.length <= 0) {
    return {
      isLegal: false,
      reason: 'No destination tickets remain in the deck.',
    };
  }

  return { isLegal: true, reason: null };
}

export function drawDestinationTicket(state: LocalGameState): LocalGameState {
  const legal = canDrawDestinationTicket(state);
  if (!legal.isLegal) {
    throw new Error(legal.reason ?? 'Draw destination ticket is not legal.');
  }

  const next = cloneState(state);
  const drawCount = Math.min(
    DESTINATION_TICKET_DRAW_COUNT,
    next.destinationTicketDeckIds.length,
  );
  const drawnTicketIds = next.destinationTicketDeckIds.splice(0, drawCount);

  if (drawnTicketIds.length <= 0) {
    throw new Error('Unable to draw destination ticket.');
  }

  next.destinationTicketSelection = {
    playerId: next.turn.currentPlayerId,
    pendingTicketIds: drawnTicketIds,
    minimumKeepCount: DESTINATION_TICKET_MINIMUM_KEEP_COUNT,
  };
  next.notifications.push(
    `${next.turn.currentPlayerId} drew ${drawnTicketIds.length} destination tickets and must keep at least ${DESTINATION_TICKET_MINIMUM_KEEP_COUNT}.`,
  );

  return next;
}

export function canFinalizeDestinationTicketSelection(
  state: LocalGameState,
  keptTicketIds: string[],
): ClaimLegalityResult {
  const selection = state.destinationTicketSelection;

  if (!selection) {
    return {
      isLegal: false,
      reason: 'No destination ticket selection is pending.',
    };
  }

  if (selection.playerId !== state.turn.currentPlayerId) {
    return {
      isLegal: false,
      reason: 'Only the active player can finalize destination ticket selection.',
    };
  }

  const uniqueKeptIds = new Set(keptTicketIds);
  if (uniqueKeptIds.size !== keptTicketIds.length) {
    return {
      isLegal: false,
      reason: 'Duplicate destination ticket selections are not allowed.',
    };
  }

  if (keptTicketIds.length < selection.minimumKeepCount) {
    return {
      isLegal: false,
      reason: `Keep at least ${selection.minimumKeepCount} destination ticket(s).`,
    };
  }

  if (keptTicketIds.length > selection.pendingTicketIds.length) {
    return {
      isLegal: false,
      reason: 'Cannot keep more destination tickets than were drawn.',
    };
  }

  const pendingSet = new Set(selection.pendingTicketIds);
  const hasUnknownSelection = keptTicketIds.some((ticketId) => !pendingSet.has(ticketId));
  if (hasUnknownSelection) {
    return {
      isLegal: false,
      reason: 'Selected destination ticket is not part of the pending draw.',
    };
  }

  return { isLegal: true, reason: null };
}

export function finalizeDestinationTicketSelection(
  state: LocalGameState,
  keptTicketIds: string[],
): LocalGameState {
  const legal = canFinalizeDestinationTicketSelection(state, keptTicketIds);
  if (!legal.isLegal) {
    throw new Error(legal.reason ?? 'Destination ticket selection is not legal.');
  }

  const next = cloneState(state);
  const selection = next.destinationTicketSelection;

  if (!selection) {
    throw new Error('Destination ticket selection is missing.');
  }

  const player = next.playersById[selection.playerId];
  const keptSet = new Set(keptTicketIds);
  const discardedTicketIds = selection.pendingTicketIds.filter(
    (ticketId) => !keptSet.has(ticketId),
  );

  player.destinationTicketIds = [...player.destinationTicketIds, ...keptTicketIds];
  next.destinationTicketDiscardIds = [
    ...next.destinationTicketDiscardIds,
    ...discardedTicketIds,
  ];
  next.destinationTicketSelection = null;
  next.notifications.push(
    `${selection.playerId} kept ${keptTicketIds.length} destination ticket(s) and discarded ${discardedTicketIds.length}.`,
  );

  return next;
}

function reshuffleDiscardIntoDeck(state: LocalGameState): void {
  if (state.trainDeckCardIds.length > 0 || state.trainDiscardCardIds.length === 0) {
    return;
  }

  state.trainDeckCardIds = [...state.trainDiscardCardIds];
  state.trainDiscardCardIds = [];
}

function drawTopDeckCard(state: LocalGameState): string | null {
  reshuffleDiscardIntoDeck(state);

  const cardId = state.trainDeckCardIds.shift();
  return cardId ?? null;
}

function refillFaceUpCards(state: LocalGameState): void {
  while (state.faceUpCardIds.length < 5) {
    const nextCardId = drawTopDeckCard(state);
    if (!nextCardId) {
      break;
    }

    state.faceUpCardIds.push(nextCardId);
  }
}

function completeTurnIfDone(state: LocalGameState): void {
  if (state.turn.drawsRemaining > 0) {
    return;
  }

  const previousPlayerId = state.turn.currentPlayerId;
  const nextPlayerId = getNextPlayerId(previousPlayerId);

  state.turn = {
    turnNumber: state.turn.turnNumber + 1,
    currentPlayerId: nextPlayerId,
    drawsRemaining: 2,
  };

  state.notifications.push(`${nextPlayerId} turn started.`);
}

function hasParallelRestriction(state: LocalGameState): boolean {
  return state.playerOrder.length <= 3;
}

function isRouteBlockedByParallelClaim(state: LocalGameState, route: BoardRouteState): boolean {
  if (!hasParallelRestriction(state)) {
    return false;
  }

  return state.board.routeIds.some((routeId) => {
    if (routeId === route.id) {
      return false;
    }

    const candidateRoute = state.board.routesById[routeId];
    if (candidateRoute.parallelGroupKey !== route.parallelGroupKey) {
      return false;
    }

    return candidateRoute.claim.claimedByPlayerId !== null;
  });
}

function computeMaxColorCards(playerCardCounts: Record<TrainCardType, number>, color: TrainColor): number {
  return playerCardCounts[color] ?? 0;
}

export function getDefaultClaimSpend(state: LocalGameState, routeId: string, playerId?: PlayerId): ClaimCardSpend {
  const currentPlayerId = playerId ?? state.turn.currentPlayerId;
  const player = state.playersById[currentPlayerId];
  const route = state.board.routesById[routeId];

  if (!route) {
    throw new Error(`Route ${routeId} does not exist.`);
  }

  const requiredCount = route.slotCount;
  const cardCounts = getCardTypeCount(player.handCardIds, state.trainCardsById);
  const locomotiveCount = cardCounts.locomotive;
  const requirement: RouteCardRequirement = getRouteCardTypeRequirement(route);

  if (requirement !== 'any-color') {
    const colorCount = computeMaxColorCards(cardCounts, requirement);
    const usedColorCards = Math.min(colorCount, requiredCount);
    const neededLocomotives = Math.max(0, requiredCount - usedColorCards);

    return {
      color: requirement,
      colorCards: usedColorCards,
      locomotiveCards: Math.min(neededLocomotives, locomotiveCount),
    };
  }

  const bestColor = (Object.keys(cardCounts) as TrainCardType[])
    .filter((cardType): cardType is TrainColor => cardType !== 'locomotive')
    .sort((a, b) => cardCounts[b] - cardCounts[a])[0] ?? null;

  if (!bestColor) {
    return {
      color: null,
      colorCards: 0,
      locomotiveCards: Math.min(requiredCount, locomotiveCount),
    };
  }

  const bestColorCount = cardCounts[bestColor];
  const usedColorCards = Math.min(bestColorCount, requiredCount);
  const neededLocomotives = Math.max(0, requiredCount - usedColorCards);

  return {
    color: bestColor,
    colorCards: usedColorCards,
    locomotiveCards: Math.min(neededLocomotives, locomotiveCount),
  };
}

export function canDrawFromDeck(state: LocalGameState): ClaimLegalityResult {
  if (state.turn.drawsRemaining <= 0) {
    return { isLegal: false, reason: 'No train-card draws remaining this turn.' };
  }

  if (state.trainDeckCardIds.length === 0 && state.trainDiscardCardIds.length === 0) {
    return { isLegal: false, reason: 'No cards available in train deck or discard pile.' };
  }

  return { isLegal: true, reason: null };
}

export function drawTrainCardFromDeck(state: LocalGameState): LocalGameState {
  const legal = canDrawFromDeck(state);
  if (!legal.isLegal) {
    throw new Error(legal.reason ?? 'Draw from deck is not legal.');
  }

  const next = cloneState(state);
  const player = next.playersById[next.turn.currentPlayerId];
  const drawnCardId = drawTopDeckCard(next);

  if (!drawnCardId) {
    throw new Error('Unable to draw from deck.');
  }

  player.handCardIds = [...player.handCardIds, drawnCardId];
  next.turn = {
    ...next.turn,
    drawsRemaining: next.turn.drawsRemaining - 1,
  };

  next.notifications.push(`${player.id} drew 1 train card from deck.`);
  completeTurnIfDone(next);

  return next;
}

export function canDrawFaceUpCard(state: LocalGameState, faceUpIndex: number): ClaimLegalityResult {
  if (faceUpIndex < 0 || faceUpIndex >= state.faceUpCardIds.length) {
    return { isLegal: false, reason: 'Selected face-up card index is out of range.' };
  }

  if (state.turn.drawsRemaining <= 0) {
    return { isLegal: false, reason: 'No train-card draws remaining this turn.' };
  }

  const cardId = state.faceUpCardIds[faceUpIndex];
  const card = state.trainCardsById[cardId];

  if (card.type === 'locomotive' && state.turn.drawsRemaining !== 2) {
    return {
      isLegal: false,
      reason: 'Face-up locomotive can only be drawn as the first and only draw this turn.',
    };
  }

  return { isLegal: true, reason: null };
}

export function drawTrainCardFromFaceUp(state: LocalGameState, faceUpIndex: number): LocalGameState {
  const legal = canDrawFaceUpCard(state, faceUpIndex);
  if (!legal.isLegal) {
    throw new Error(legal.reason ?? 'Draw from face-up row is not legal.');
  }

  const next = cloneState(state);
  const player = next.playersById[next.turn.currentPlayerId];
  const selectedCardId = next.faceUpCardIds[faceUpIndex];
  const selectedCard = next.trainCardsById[selectedCardId];
  const replacementCardId = drawTopDeckCard(next);

  if (replacementCardId) {
    next.faceUpCardIds[faceUpIndex] = replacementCardId;
  } else {
    next.faceUpCardIds.splice(faceUpIndex, 1);
  }

  player.handCardIds = [...player.handCardIds, selectedCardId];

  next.turn = {
    ...next.turn,
    drawsRemaining: selectedCard.type === 'locomotive' ? 0 : next.turn.drawsRemaining - 1,
  };

  next.notifications.push(`${player.id} drew 1 ${selectedCard.type} card from face-up row.`);
  completeTurnIfDone(next);

  return next;
}

export function canClaimRoute(
  state: LocalGameState,
  routeId: string,
  spend: ClaimCardSpend,
  playerId?: PlayerId,
): ClaimLegalityResult {
  const actingPlayerId = playerId ?? state.turn.currentPlayerId;
  const player = state.playersById[actingPlayerId];
  const route = state.board.routesById[routeId];

  if (!route) {
    return { isLegal: false, reason: `Route ${routeId} does not exist.` };
  }

  if (route.claim.claimedByPlayerId !== null) {
    return { isLegal: false, reason: 'Route has already been claimed.' };
  }

  if (isRouteBlockedByParallelClaim(state, route)) {
    return {
      isLegal: false,
      reason: 'Parallel route is blocked at this player count after one route is claimed.',
    };
  }

  if (player.trainsLeft < route.slotCount) {
    return { isLegal: false, reason: 'Player does not have enough trains remaining.' };
  }

  if (spend.colorCards < 0 || spend.locomotiveCards < 0) {
    return { isLegal: false, reason: 'Card counts cannot be negative.' };
  }

  if (spend.colorCards + spend.locomotiveCards !== route.slotCount) {
    return { isLegal: false, reason: 'Spend must exactly match route length.' };
  }

  const cardCounts = getCardTypeCount(player.handCardIds, state.trainCardsById);

  if (spend.locomotiveCards > cardCounts.locomotive) {
    return { isLegal: false, reason: 'Not enough locomotive cards in hand.' };
  }

  if (route.trainRequirementMode === 'fixed-color') {
    if (!route.fixedColor) {
      return { isLegal: false, reason: 'Route fixed-color requirement is invalid.' };
    }

    if (spend.color !== route.fixedColor) {
      return { isLegal: false, reason: `Route requires ${route.fixedColor} cards.` };
    }

    if (spend.colorCards > cardCounts[route.fixedColor]) {
      return { isLegal: false, reason: `Not enough ${route.fixedColor} cards in hand.` };
    }
  } else {
    if (spend.color !== null) {
      if (spend.colorCards > cardCounts[spend.color]) {
        return { isLegal: false, reason: `Not enough ${spend.color} cards in hand.` };
      }
    } else if (spend.colorCards > 0) {
      return { isLegal: false, reason: 'A color must be selected when color cards are used.' };
    }
  }

  return { isLegal: true, reason: null };
}

function removeCardsFromHand(
  handCardIds: string[],
  cardsById: LocalGameState['trainCardsById'],
  color: TrainColor | null,
  colorCount: number,
  locomotiveCount: number,
): { nextHand: string[]; discardedCardIds: string[] } {
  const discardedCardIds: string[] = [];
  const nextHand = [...handCardIds];

  const removeCardType = (cardType: TrainCardType, count: number): void => {
    for (let removed = 0; removed < count; removed += 1) {
      const index = nextHand.findIndex((cardId) => cardsById[cardId].type === cardType);
      if (index < 0) {
        throw new Error(`Could not remove ${cardType} from hand.`);
      }

      const [removedCardId] = nextHand.splice(index, 1);
      discardedCardIds.push(removedCardId);
    }
  };

  if (color && colorCount > 0) {
    removeCardType(color, colorCount);
  }

  if (locomotiveCount > 0) {
    removeCardType('locomotive', locomotiveCount);
  }

  return { nextHand, discardedCardIds };
}

export function claimRoute(
  state: LocalGameState,
  routeId: string,
  spend: ClaimCardSpend,
  playerId?: PlayerId,
): LocalGameState {
  const actingPlayerId = playerId ?? state.turn.currentPlayerId;
  const legal = canClaimRoute(state, routeId, spend, actingPlayerId);

  if (!legal.isLegal) {
    throw new Error(legal.reason ?? 'Route claim is not legal.');
  }

  const next = cloneState(state);
  const route = next.board.routesById[routeId];
  const player = next.playersById[actingPlayerId];

  const removal = removeCardsFromHand(
    player.handCardIds,
    next.trainCardsById,
    spend.color,
    spend.colorCards,
    spend.locomotiveCards,
  );

  player.handCardIds = removal.nextHand;
  player.claimedRouteIds = [...player.claimedRouteIds, routeId];
  player.trainsLeft -= route.slotCount;
  player.score += getSegmentPoints(route.slotCount);

  next.trainDiscardCardIds = [...next.trainDiscardCardIds, ...removal.discardedCardIds];

  route.claim = {
    claimedByPlayerId: actingPlayerId,
    claimedAtTurn: next.turn.turnNumber,
  };

  for (const pinId of route.pinIdsOrdered) {
    const pin = next.board.pinsById[pinId];
    next.board.pinsById[pinId] = {
      ...pin,
      isVisible: true,
    };
  }

  const nextPlayerId = getNextPlayerId(actingPlayerId);
  next.turn = {
    turnNumber: next.turn.turnNumber + 1,
    currentPlayerId: nextPlayerId,
    drawsRemaining: 2,
  };

  next.notifications.push(`${actingPlayerId} claimed ${routeId} for ${getSegmentPoints(route.slotCount)} points.`);
  next.notifications.push(`${nextPlayerId} turn started.`);

  return next;
}

export function canCurrentPlayerClaimRouteWithDefaultSpend(
  state: LocalGameState,
  routeId: string,
): ClaimLegalityResult {
  const defaultSpend = getDefaultClaimSpend(state, routeId, state.turn.currentPlayerId);
  return canClaimRoute(state, routeId, defaultSpend, state.turn.currentPlayerId);
}
