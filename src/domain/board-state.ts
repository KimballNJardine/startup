import type { DestinationTicket } from './destination-ticket';
import type { LocalGameState, PlayerId } from './game-types';
import { normalizeAndValidateCityId, parseRouteEndpointsFromRouteId, toBoardCityId } from './city-ids';

export type DestinationTicketProgressStatus = 'fulfilled' | 'unfulfilled' | 'unresolved';

export interface DestinationTicketProgress {
  ticketId: string;
  idOriginCity: string;
  idDestinationCity: string;
  originCityLabel: string;
  destinationCityLabel: string;
  points: number;
  status: DestinationTicketProgressStatus;
  isFulfilled: boolean;
  reason: string | null;
}

export interface DestinationTicketScoreBreakdown {
  fulfilledPoints: number;
  unfulfilledPoints: number;
  unresolvedPoints: number;
  netDelta: number;
  fulfilledTicketIds: string[];
  unfulfilledTicketIds: string[];
  unresolvedTicketIds: string[];
}

function addGraphEdge(graph: Map<string, Set<string>>, cityA: string, cityB: string): void {
  if (!graph.has(cityA)) {
    graph.set(cityA, new Set<string>());
  }
  if (!graph.has(cityB)) {
    graph.set(cityB, new Set<string>());
  }

  graph.get(cityA)?.add(cityB);
  graph.get(cityB)?.add(cityA);
}

function isConnected(graph: Map<string, Set<string>>, start: string, goal: string): boolean {
  if (start === goal) {
    return true;
  }

  if (!graph.has(start) || !graph.has(goal)) {
    return false;
  }

  const queue: string[] = [start];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const cityId = queue.shift();
    if (!cityId) {
      continue;
    }

    const neighbors = graph.get(cityId);
    if (!neighbors) {
      continue;
    }

    for (const neighbor of neighbors) {
      if (neighbor === goal) {
        return true;
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

export class BoardStateInspector {
  private claimedGraphByPlayer = new Map<PlayerId, Map<string, Set<string>>>();

  constructor(private readonly state: LocalGameState) {}

  getDestinationTicketProgressForPlayer(
    playerId: PlayerId,
    ticketIds: string[] = this.state.playersById[playerId].destinationTicketIds,
  ): DestinationTicketProgress[] {
    return ticketIds
      .map((ticketId) => this.getDestinationTicketProgress(playerId, ticketId))
      .filter((progress): progress is DestinationTicketProgress => progress !== null);
  }

  getDestinationTicketProgress(
    playerId: PlayerId,
    ticketId: string,
  ): DestinationTicketProgress | null {
    const ticket = this.state.destinationTicketsById[ticketId];
    if (!ticket) {
      return null;
    }

    return this.getDestinationTicketProgressForTicket(playerId, ticket);
  }

  getAccomplishedDestinationTicketIdsForPlayer(playerId: PlayerId): string[] {
    return this.getDestinationTicketProgressForPlayer(playerId)
      .filter((progress) => progress.status === 'fulfilled')
      .map((progress) => progress.ticketId);
  }

  getDestinationTicketScoreBreakdownForPlayer(
    playerId: PlayerId,
    ticketIds: string[] = this.state.playersById[playerId].destinationTicketIds,
  ): DestinationTicketScoreBreakdown {
    const progress = this.getDestinationTicketProgressForPlayer(playerId, ticketIds);

    const fulfilledPoints = progress
      .filter((ticket) => ticket.status === 'fulfilled')
      .reduce((total, ticket) => total + ticket.points, 0);

    const unfulfilledPoints = progress
      .filter((ticket) => ticket.status === 'unfulfilled')
      .reduce((total, ticket) => total + ticket.points, 0);

    const unresolvedPoints = progress
      .filter((ticket) => ticket.status === 'unresolved')
      .reduce((total, ticket) => total + ticket.points, 0);

    return {
      fulfilledPoints,
      unfulfilledPoints,
      unresolvedPoints,
      netDelta: fulfilledPoints - unfulfilledPoints,
      fulfilledTicketIds: progress
        .filter((ticket) => ticket.status === 'fulfilled')
        .map((ticket) => ticket.ticketId),
      unfulfilledTicketIds: progress
        .filter((ticket) => ticket.status === 'unfulfilled')
        .map((ticket) => ticket.ticketId),
      unresolvedTicketIds: progress
        .filter((ticket) => ticket.status === 'unresolved')
        .map((ticket) => ticket.ticketId),
    };
  }

  getProjectedTotalScoreForPlayer(playerId: PlayerId): number {
    const segmentScore = this.state.playersById[playerId].score;
    const destinationDelta = this.getDestinationTicketScoreBreakdownForPlayer(playerId).netDelta;
    return segmentScore + destinationDelta;
  }

  getHighlightedCityIdsForTicketIds(ticketIds: string[]): string[] {
    const highlighted = new Set<string>();

    ticketIds.forEach((ticketId) => {
      const ticket = this.state.destinationTicketsById[ticketId];
      if (!ticket) {
        return;
      }

      highlighted.add(normalizeAndValidateCityId(ticket.idOriginCity, `${ticket.id}.idOriginCity`));
      highlighted.add(
        normalizeAndValidateCityId(ticket.idDestinationCity, `${ticket.id}.idDestinationCity`),
      );
    });

    return Array.from(highlighted).sort();
  }

  private getDestinationTicketProgressForTicket(
    playerId: PlayerId,
    ticket: DestinationTicket,
  ): DestinationTicketProgress {
    const originBoardCityId = toBoardCityId(ticket.idOriginCity);
    const destinationBoardCityId = toBoardCityId(ticket.idDestinationCity);

    if (!originBoardCityId || !destinationBoardCityId) {
      return {
        ticketId: ticket.id,
        idOriginCity: ticket.idOriginCity,
        idDestinationCity: ticket.idDestinationCity,
        originCityLabel: ticket.originCity,
        destinationCityLabel: ticket.destinationCity,
        points: ticket.points,
        status: 'unresolved',
        isFulfilled: false,
        reason: 'Ticket endpoint city id is not recognized on the board graph.',
      };
    }

    const graph = this.getClaimedGraph(playerId);
    const connected = isConnected(graph, originBoardCityId, destinationBoardCityId);

    return {
      ticketId: ticket.id,
      idOriginCity: ticket.idOriginCity,
      idDestinationCity: ticket.idDestinationCity,
      originCityLabel: ticket.originCity,
      destinationCityLabel: ticket.destinationCity,
      points: ticket.points,
      status: connected ? 'fulfilled' : 'unfulfilled',
      isFulfilled: connected,
      reason: connected ? null : 'Cities are not connected by claimed routes.',
    };
  }

  private getClaimedGraph(playerId: PlayerId): Map<string, Set<string>> {
    const existing = this.claimedGraphByPlayer.get(playerId);
    if (existing) {
      return existing;
    }

    const graph = new Map<string, Set<string>>();

    this.state.board.routeIds.forEach((routeId) => {
      const route = this.state.board.routesById[routeId];
      if (route.claim.claimedByPlayerId !== playerId) {
        return;
      }

      const parsed = parseRouteEndpointsFromRouteId(route.id);
      if (!parsed) {
        return;
      }

      addGraphEdge(graph, parsed.cityA, parsed.cityB);
    });

    this.claimedGraphByPlayer.set(playerId, graph);
    return graph;
  }
}

export function createBoardStateInspector(state: LocalGameState): BoardStateInspector {
  return new BoardStateInspector(state);
}
