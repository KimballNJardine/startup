import type { ClaimCardSpend, LocalGameState } from '../domain';

const SERVICE_ORIGIN = import.meta.env.VITE_SERVICE_ORIGIN ?? 'http://localhost:4000';

async function requestGameState<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(new URL(path, SERVICE_ORIGIN), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed with status ${response.status}.`);
  }

  return (await response.json()) as TResponse;
}

export async function getGameState(): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game');
}

export async function resetGame(seed?: number): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/reset', {
    method: 'POST',
    body: JSON.stringify(seed === undefined ? {} : { seed }),
  });
}

export async function drawDestinationTickets(): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/draw/destination-tickets', {
    method: 'POST',
  });
}

export async function drawTrainCardFromDeck(): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/draw/train/deck', {
    method: 'POST',
  });
}

export async function drawTrainCardFromFaceUp(faceUpIndex: number): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/draw/train/face-up', {
    method: 'POST',
    body: JSON.stringify({ faceUpIndex }),
  });
}

export async function claimRoute(
  routeId: string,
  spend: ClaimCardSpend,
): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/claim-route', {
    method: 'POST',
    body: JSON.stringify({
      routeId,
      spend,
    }),
  });
}

export async function applyDestinationTicketScores(): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/destination-scores/apply', {
    method: 'POST',
  });
}

export async function confirmDestinationTicketSelection(
  selectedTicketIds: string[],
): Promise<LocalGameState> {
  return requestGameState<LocalGameState>('/api/game/destination-tickets/confirm', {
    method: 'POST',
    body: JSON.stringify({
      selectedTicketIds,
    }),
  });
}
