import { describe, expect, it } from 'vitest';

import {
  canClaimRoute,
  canDrawFaceUpCard,
  claimRoute,
  createInitialLocalGameState,
  drawTrainCardFromFaceUp,
  getDefaultClaimSpend,
  type ClaimCardSpend,
  type LocalGameState,
} from './index';

function findRouteIdByLength(state: LocalGameState, slotCount: number): string {
  const match = state.board.routeIds.find((routeId) => state.board.routesById[routeId].slotCount === slotCount);

  if (!match) {
    throw new Error(`Could not find route with slotCount=${slotCount}.`);
  }

  return match;
}

function firstFaceUpLocomotiveIndex(state: LocalGameState): number {
  return state.faceUpCardIds.findIndex((cardId) => state.trainCardsById[cardId].type === 'locomotive');
}

describe('game-rules', () => {
  it('face-up locomotive can only be drawn as first draw', () => {
    let state = createInitialLocalGameState({ seed: 260 });

    for (let attempt = 0; attempt < 20 && firstFaceUpLocomotiveIndex(state) < 0; attempt += 1) {
      state = drawTrainCardFromFaceUp(state, 0);
      state = drawTrainCardFromFaceUp(state, 0);
    }

    const locomotiveIndex = firstFaceUpLocomotiveIndex(state);
    expect(locomotiveIndex).toBeGreaterThanOrEqual(0);

    const legalFirstDraw = canDrawFaceUpCard(state, locomotiveIndex);
    expect(legalFirstDraw.isLegal).toBe(true);

    const stateAfterFirstColorDraw = drawTrainCardFromFaceUp(state, 0);

    stateAfterFirstColorDraw.faceUpCardIds.forEach((cardId, index) => {
      const cardType = stateAfterFirstColorDraw.trainCardsById[cardId].type;
      if (cardType === 'locomotive') {
        const legalSecondDrawLocomotive = canDrawFaceUpCard(stateAfterFirstColorDraw, index);
        expect(legalSecondDrawLocomotive.isLegal).toBe(false);
      }
    });
  });

  it('claiming a route decreases trains, increases score, and switches turns', () => {
    const initial = createInitialLocalGameState({ seed: 260 });
    const playerId = initial.turn.currentPlayerId;
    const routeId = findRouteIdByLength(initial, 1);

    // Ensure the active player can legally claim a short route by topping up hand cards in test setup.
    const topUpCardId = `${initial.board.routesById[routeId].fixedColor ?? 'blue'}-topup`;
    initial.trainCardsById[topUpCardId] = {
      id: topUpCardId,
      type: (initial.board.routesById[routeId].fixedColor ?? 'blue'),
    };
    initial.playersById[playerId].handCardIds.push(topUpCardId);

    const spend = getDefaultClaimSpend(initial, routeId, playerId);
    const canClaim = canClaimRoute(initial, routeId, spend, playerId);
    expect(canClaim.isLegal).toBe(true);

    const next = claimRoute(initial, routeId, spend, playerId);
    const nextPlayerId = next.turn.currentPlayerId;

    expect(nextPlayerId).not.toBe(playerId);
    expect(next.playersById[playerId].trainsLeft).toBe(initial.playersById[playerId].trainsLeft - 1);
    expect(next.playersById[playerId].score).toBe(initial.playersById[playerId].score + 1);
    expect(next.board.routesById[routeId].claim.claimedByPlayerId).toBe(playerId);
  });

  it('parallel route is blocked for second claim in 2-player game', () => {
    const initial = createInitialLocalGameState({ seed: 260 });

    const parallelGroup = initial.board.routeIds
      .map((routeId) => initial.board.routesById[routeId])
      .find((route, _, allRoutes) => {
        return allRoutes.filter((candidate) => candidate.parallelGroupKey === route.parallelGroupKey).length > 1;
      })?.parallelGroupKey;

    expect(parallelGroup).toBeDefined();

    const routesInGroup = initial.board.routeIds.filter(
      (routeId) => initial.board.routesById[routeId].parallelGroupKey === parallelGroup,
    );

    const firstRouteId = routesInGroup[0];
    const secondRouteId = routesInGroup[1];
    const firstPlayerId = initial.turn.currentPlayerId;

    const routeOneColor = initial.board.routesById[firstRouteId].fixedColor ?? 'blue';
    const routeOneSpend: ClaimCardSpend = {
      color: routeOneColor,
      colorCards: initial.board.routesById[firstRouteId].slotCount,
      locomotiveCards: 0,
    };

    for (let i = 0; i < routeOneSpend.colorCards; i += 1) {
      const cardId = `${routeOneColor}-parallel-a-${i}`;
      initial.trainCardsById[cardId] = { id: cardId, type: routeOneColor };
      initial.playersById[firstPlayerId].handCardIds.push(cardId);
    }

    const afterFirstClaim = claimRoute(initial, firstRouteId, routeOneSpend, firstPlayerId);
    const secondPlayerId = afterFirstClaim.turn.currentPlayerId;

    const routeTwoColor = afterFirstClaim.board.routesById[secondRouteId].fixedColor ?? 'blue';
    const routeTwoSpend: ClaimCardSpend = {
      color: routeTwoColor,
      colorCards: afterFirstClaim.board.routesById[secondRouteId].slotCount,
      locomotiveCards: 0,
    };

    for (let i = 0; i < routeTwoSpend.colorCards; i += 1) {
      const cardId = `${routeTwoColor}-parallel-b-${i}`;
      afterFirstClaim.trainCardsById[cardId] = { id: cardId, type: routeTwoColor };
      afterFirstClaim.playersById[secondPlayerId].handCardIds.push(cardId);
    }

    const canClaimParallel = canClaimRoute(afterFirstClaim, secondRouteId, routeTwoSpend, secondPlayerId);
    expect(canClaimParallel.isLegal).toBe(false);
    expect(canClaimParallel.reason).toContain('Parallel route is blocked');
  });
});
