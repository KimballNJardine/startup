import { describe, expect, it } from 'vitest';

import {
  applyDestinationTicketScores,
  createBoardStateInspector,
  createInitialLocalGameState,
  normalizeCityId,
  parseRouteEndpointsFromRouteId,
  type LocalGameState,
  type PlayerId,
} from './index';

function markRouteClaimed(state: LocalGameState, routeId: string, playerId: PlayerId): void {
  const route = state.board.routesById[routeId];
  if (!route) {
    throw new Error(`Missing route ${routeId} in test setup.`);
  }

  route.claim = {
    claimedByPlayerId: playerId,
    claimedAtTurn: 1,
  };
}

describe('board-state inspector', () => {
  it('normalizes city ids and handles route alias parsing', () => {
    expect(normalizeCityId('Montréal')).toBe('montreal');
    expect(normalizeCityId('Sault St. Marie')).toBe('sault-st-marie');

    const parsed = parseRouteEndpointsFromRouteId('route-denver-sante-fe-1');
    expect(parsed).toEqual({ cityA: 'denver', cityB: 'santa-fe' });
  });

  it('identifies fulfilled and unfulfilled destination tickets from claimed graph', () => {
    const state = createInitialLocalGameState({ seed: 260 });
    const playerId = state.turn.currentPlayerId;

    state.destinationTicketsById['test-atlanta-nashville'] = {
      id: 'test-atlanta-nashville',
      idOriginCity: 'atlanta',
      idDestinationCity: 'nashville',
      originCity: 'Atlanta',
      destinationCity: 'Nashville',
      points: 5,
    };

    state.destinationTicketsById['test-atlanta-seattle'] = {
      id: 'test-atlanta-seattle',
      idOriginCity: 'atlanta',
      idDestinationCity: 'seattle',
      originCity: 'Atlanta',
      destinationCity: 'Seattle',
      points: 8,
    };

    state.playersById[playerId].destinationTicketIds = [
      'test-atlanta-nashville',
      'test-atlanta-seattle',
    ];

    markRouteClaimed(state, 'route-atlanta-nashville-1', playerId);

    const inspector = createBoardStateInspector(state);
    const progress = inspector.getDestinationTicketProgressForPlayer(playerId);
    const byId = progress.reduce<Record<string, string>>((acc, ticket) => {
      acc[ticket.ticketId] = ticket.status;
      return acc;
    }, {});

    expect(byId['test-atlanta-nashville']).toBe('fulfilled');
    expect(byId['test-atlanta-seattle']).toBe('unfulfilled');
  });

  it('applies destination scores once at end game', () => {
    const state = createInitialLocalGameState({ seed: 260 });
    const playerId = state.turn.currentPlayerId;

    state.destinationTicketsById['test-atlanta-nashville'] = {
      id: 'test-atlanta-nashville',
      idOriginCity: 'atlanta',
      idDestinationCity: 'nashville',
      originCity: 'Atlanta',
      destinationCity: 'Nashville',
      points: 5,
    };

    state.destinationTicketsById['test-atlanta-seattle'] = {
      id: 'test-atlanta-seattle',
      idOriginCity: 'atlanta',
      idDestinationCity: 'seattle',
      originCity: 'Atlanta',
      destinationCity: 'Seattle',
      points: 8,
    };

    state.playersById[playerId].destinationTicketIds = [
      'test-atlanta-nashville',
      'test-atlanta-seattle',
    ];

    markRouteClaimed(state, 'route-atlanta-nashville-1', playerId);

    const initialScore = state.playersById[playerId].score;
    const scoredState = applyDestinationTicketScores(state);

    expect(scoredState.playersById[playerId].score).toBe(initialScore - 3);
    expect(scoredState.isDestinationScoreApplied).toBe(true);

    expect(() => applyDestinationTicketScores(scoredState)).toThrow(
      'Destination scores have already been applied.',
    );
  });
});
