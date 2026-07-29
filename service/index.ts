import express from 'express';
import path from 'node:path';

import {
  applyDestinationTicketScores,
  canFinalizeDestinationTicketSelection,
  claimRoute,
  createInitialLocalGameState,
  drawDestinationTicket,
  drawTrainCardFromDeck,
  drawTrainCardFromFaceUp,
  finalizeDestinationTicketSelection,
  type ClaimCardSpend,
  type LocalGameState,
} from '../src/domain/index.js';
import { isTrainColor } from '../src/domain/index.js';

const DEFAULT_GAME_SEED = 260;
const DEFAULT_PORT = 4000;

const app = express();
const publicDirectory = path.resolve(process.cwd(), '..', 'public');

let gameState: LocalGameState = createInitialLocalGameState({ seed: DEFAULT_GAME_SEED });

function createOpenApiDocument() {
  return {
    openapi: '3.2.0',
    info: {
      title: 'Startup Game API',
      version: '1.0.0',
      description: 'Express endpoints for the Ticket-to-Ride startup game.',
    },
    paths: {
      '/api/game': {
        get: {
          summary: 'Get the current game state',
        },
      },
      '/api/game/reset': {
        post: {
          summary: 'Reset the shared in-memory game',
        },
      },
      '/api/game/draw/destination-tickets': {
        post: {
          summary: 'Draw destination tickets for the active player',
        },
      },
      '/api/game/draw/train/deck': {
        post: {
          summary: 'Draw a train card from the deck',
        },
      },
      '/api/game/draw/train/face-up': {
        post: {
          summary: 'Draw a train card from the face-up row',
        },
      },
      '/api/game/claim-route': {
        post: {
          summary: 'Claim a route with the active player',
        },
      },
      '/api/game/destination-scores/apply': {
        post: {
          summary: 'Apply destination ticket scores once',
        },
      },
      '/api/game/destination-tickets/confirm': {
        post: {
          summary: 'Confirm kept destination tickets',
        },
      },
    },
  };
}

function sendError(res: express.Response, error: unknown): void {
  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: 'Unknown server error.' });
}

function isFiniteInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && Number.isFinite(value);
}

function isClaimCardSpend(value: unknown): value is ClaimCardSpend {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const spend = value as Partial<ClaimCardSpend>;
  const hasValidColor =
    spend.color === null ||
    (typeof spend.color === 'string' && isTrainColor(spend.color));

  return (
    hasValidColor &&
    isFiniteInteger(spend.colorCards) &&
    spend.colorCards >= 0 &&
    isFiniteInteger(spend.locomotiveCards) &&
    spend.locomotiveCards >= 0
  );
}

function parseResetSeed(body: unknown): number {
  if (!body || typeof body !== 'object') {
    return DEFAULT_GAME_SEED;
  }

  const value = (body as { seed?: unknown }).seed;
  if (value === undefined) {
    return DEFAULT_GAME_SEED;
  }

  if (!isFiniteInteger(value) || value < 0) {
    throw new Error('Seed must be a non-negative integer.');
  }

  return value;
}

function parseRouteClaimBody(body: unknown): { routeId: string; spend: ClaimCardSpend } {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object.');
  }

  const routeId = (body as { routeId?: unknown }).routeId;
  const spend = (body as { spend?: unknown }).spend;

  if (typeof routeId !== 'string' || routeId.length === 0) {
    throw new Error('routeId must be a non-empty string.');
  }

  if (!isClaimCardSpend(spend)) {
    throw new Error('spend must include a valid color, colorCards, and locomotiveCards.');
  }

  return {
    routeId,
    spend,
  };
}

function parseFaceUpDrawBody(body: unknown): number {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object.');
  }

  const faceUpIndex = (body as { faceUpIndex?: unknown }).faceUpIndex;

  if (!isFiniteInteger(faceUpIndex) || faceUpIndex < 0) {
    throw new Error('faceUpIndex must be a non-negative integer.');
  }

  return faceUpIndex;
}

function parseTicketSelectionBody(body: unknown): string[] {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object.');
  }

  const selectedTicketIds = (body as { selectedTicketIds?: unknown }).selectedTicketIds;
  if (!Array.isArray(selectedTicketIds)) {
    throw new Error('selectedTicketIds must be an array of strings.');
  }

  if (selectedTicketIds.some((ticketId) => typeof ticketId !== 'string' || ticketId.length === 0)) {
    throw new Error('selectedTicketIds must contain only non-empty strings.');
  }

  return selectedTicketIds;
}

function resetGame(seed = DEFAULT_GAME_SEED): LocalGameState {
  gameState = createInitialLocalGameState({ seed });
  return gameState;
}

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/openapi.json', (_req, res) => {
  res.json(createOpenApiDocument());
});

app.get('/api/game', (_req, res) => {
  res.json(gameState);
});

app.post('/api/game/reset', (req, res) => {
  try {
    const seed = parseResetSeed(req.body);
    res.json(resetGame(seed));
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/game/draw/destination-tickets', (_req, res) => {
  try {
    gameState = drawDestinationTicket(gameState);
    res.json(gameState);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/game/draw/train/deck', (_req, res) => {
  try {
    gameState = drawTrainCardFromDeck(gameState);
    res.json(gameState);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/game/draw/train/face-up', (req, res) => {
  try {
    const faceUpIndex = parseFaceUpDrawBody(req.body);
    gameState = drawTrainCardFromFaceUp(gameState, faceUpIndex);
    res.json(gameState);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/game/claim-route', (req, res) => {
  try {
    const { routeId, spend } = parseRouteClaimBody(req.body);
    gameState = claimRoute(gameState, routeId, spend);
    res.json(gameState);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/game/destination-scores/apply', (_req, res) => {
  try {
    gameState = applyDestinationTicketScores(gameState);
    res.json(gameState);
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/game/destination-tickets/confirm', (req, res) => {
  try {
    const selectedTicketIds = parseTicketSelectionBody(req.body);
    const legality = canFinalizeDestinationTicketSelection(gameState, selectedTicketIds);

    if (!legality.isLegal) {
      throw new Error(legality.reason ?? 'Destination ticket selection is not legal.');
    }

    gameState = finalizeDestinationTicketSelection(gameState, selectedTicketIds);
    res.json(gameState);
  } catch (error) {
    sendError(res, error);
  }
});

app.use(express.static(publicDirectory));

const portArgument = Number(process.argv[2]);
const port = Number.isFinite(portArgument) ? portArgument : Number(process.env.PORT ?? DEFAULT_PORT);

app.listen(port, () => {
  console.log(`Service listening on port ${port}`);
});
