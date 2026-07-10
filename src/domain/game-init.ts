import { createInitialBoardState } from './board-data';
import { DESTINATION_TICKETS } from './destination-ticket';
import type { LocalGameState, PlayerId, PlayerState, TrainCard } from './game-types';
import { TRAIN_COLORS, type TrainCardType } from './train-types';

const DEFAULT_TRAINS_PER_PLAYER = 45;
const FACE_UP_CARD_COUNT = 5;
const PLAYER_STARTING_HAND_SIZE = 4;
const LOCOMOTIVE_CARD_COUNT = 14;
const COLOR_CARD_COUNT = 12;

function createRng(seed = Date.now()): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(rng() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex];
    next[randomIndex] = current;
  }

  return next;
}

export function createStandardTrainCards(): TrainCard[] {
  const cards: TrainCard[] = [];

  for (const color of TRAIN_COLORS) {
    for (let count = 0; count < COLOR_CARD_COUNT; count += 1) {
      cards.push({
        id: `${color}-${count + 1}`,
        type: color,
      });
    }
  }

  for (let count = 0; count < LOCOMOTIVE_CARD_COUNT; count += 1) {
    cards.push({
      id: `locomotive-${count + 1}`,
      type: 'locomotive',
    });
  }

  return cards;
}

function takeTop(deckCardIds: string[], count: number): { taken: string[]; remaining: string[] } {
  return {
    taken: deckCardIds.slice(0, count),
    remaining: deckCardIds.slice(count),
  };
}

function createPlayers(): Record<PlayerId, PlayerState> {
  return {
    'player-1': {
      id: 'player-1',
      displayName: 'Player 1',
      trainsLeft: DEFAULT_TRAINS_PER_PLAYER,
      handCardIds: [],
      destinationTicketIds: [],
      claimedRouteIds: [],
      score: 0,
    },
    'player-2': {
      id: 'player-2',
      displayName: 'Player 2',
      trainsLeft: DEFAULT_TRAINS_PER_PLAYER,
      handCardIds: [],
      destinationTicketIds: [],
      claimedRouteIds: [],
      score: 0,
    },
  };
}

export interface CreateLocalGameOptions {
  seed?: number;
  startingPlayerId?: PlayerId;
}

export function createInitialLocalGameState(options: CreateLocalGameOptions = {}): LocalGameState {
  const rng = createRng(options.seed);
  const cards = createStandardTrainCards();
  const shuffledCards = shuffle(cards, rng);
  const destinationTicketsById = DESTINATION_TICKETS.reduce<LocalGameState['destinationTicketsById']>((acc, ticket) => {
    acc[ticket.id] = ticket;
    return acc;
  }, {});
  const destinationTicketDeckIds = shuffle(
    DESTINATION_TICKETS.map((ticket) => ticket.id),
    rng,
  );
  const cardsById = shuffledCards.reduce<Record<string, TrainCard>>((acc, card) => {
    acc[card.id] = card;
    return acc;
  }, {});

  const playersById = createPlayers();
  const playerOrder: PlayerId[] = ['player-1', 'player-2'];
  const startingPlayerId = options.startingPlayerId ?? playerOrder[0];

  let deckCardIds = shuffledCards.map((card) => card.id);

  for (const playerId of playerOrder) {
    const handDraw = takeTop(deckCardIds, PLAYER_STARTING_HAND_SIZE);
    playersById[playerId].handCardIds = handDraw.taken;
    deckCardIds = handDraw.remaining;
  }

  const faceUpDraw = takeTop(deckCardIds, FACE_UP_CARD_COUNT);
  deckCardIds = faceUpDraw.remaining;

  return {
    board: createInitialBoardState(),
    playersById,
    playerOrder,
    turn: {
      turnNumber: 1,
      currentPlayerId: startingPlayerId,
      drawsRemaining: 2,
    },
    destinationTicketsById,
    destinationTicketDeckIds,
    destinationTicketDiscardIds: [],
    destinationTicketSelection: null,
    trainCardsById: cardsById,
    trainDeckCardIds: deckCardIds,
    trainDiscardCardIds: [],
    faceUpCardIds: faceUpDraw.taken,
    notifications: ['Local game initialized. Player 1 begins.'],
  };
}

export function getCardTypeCount(cardIds: string[], cardsById: Record<string, TrainCard>): Record<TrainCardType, number> {
  return cardIds.reduce<Record<TrainCardType, number>>(
    (acc, cardId) => {
      const card = cardsById[cardId];
      acc[card.type] += 1;
      return acc;
    },
    {
      black: 0,
      blue: 0,
      green: 0,
      orange: 0,
      pink: 0,
      red: 0,
      white: 0,
      yellow: 0,
      locomotive: 0,
    },
  );
}
