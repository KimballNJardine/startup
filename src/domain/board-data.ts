import usaBoardPinsJson from './data/usa-board-pins.json';
import type { TrainColor } from './train-types';
import { isTrainColor } from './train-types';

export type BoardPinRequirementMode = 'fixed-color' | 'any-color';
export type RouteCardRequirement = TrainColor | 'any-color';

export interface RawBoardPinRecord {
  id: string;
  routeLinkId: string;
  slotIndex: number;
  xPercent: number;
  yPercent: number;
  angleDeg: number;
  trainRequirementMode: BoardPinRequirementMode;
  fixedColor: TrainColor | null;
  sourceTraincarId: string;
}

export interface BoardPinState {
  id: string;
  routeLinkId: string;
  slotIndex: number;
  xPercent: number;
  yPercent: number;
  angleDeg: number;
  sourceTraincarId: string;
  isVisible: boolean;
}

export interface BoardRouteClaimState {
  claimedByPlayerId: string | null;
  claimedAtTurn: number | null;
}

export interface BoardRouteState {
  id: string;
  parallelGroupKey: string;
  slotCount: number;
  trainRequirementMode: BoardPinRequirementMode;
  fixedColor: TrainColor | null;
  allowsLocomotive: boolean;
  pinIdsOrdered: string[];
  claim: BoardRouteClaimState;
}

export interface BoardState {
  pinsById: Record<string, BoardPinState>;
  pinIds: string[];
  routesById: Record<string, BoardRouteState>;
  routeIds: string[];
}

function parseRawBoardPinRecord(value: unknown, index: number): RawBoardPinRecord {
  if (!value || typeof value !== 'object') {
    throw new Error(`Pin row ${index} must be an object.`);
  }

  const row = value as Partial<RawBoardPinRecord>;

  if (typeof row.id !== 'string' || row.id.length === 0) {
    throw new Error(`Pin row ${index} has an invalid id.`);
  }

  if (typeof row.routeLinkId !== 'string' || row.routeLinkId.length === 0) {
    throw new Error(`Pin ${row.id} has an invalid routeLinkId.`);
  }

  const slotIndex = row.slotIndex;
  if (typeof slotIndex !== 'number' || !Number.isInteger(slotIndex) || slotIndex < 0) {
    throw new Error(`Pin ${row.id} has an invalid slotIndex.`);
  }

  const xPercent = row.xPercent;
  if (typeof xPercent !== 'number' || !Number.isFinite(xPercent)) {
    throw new Error(`Pin ${row.id} has invalid xPercent.`);
  }

  const yPercent = row.yPercent;
  if (typeof yPercent !== 'number' || !Number.isFinite(yPercent)) {
    throw new Error(`Pin ${row.id} has invalid yPercent.`);
  }

  const angleDeg = row.angleDeg;
  if (typeof angleDeg !== 'number' || !Number.isFinite(angleDeg)) {
    throw new Error(`Pin ${row.id} has invalid angleDeg.`);
  }

  if (typeof row.trainRequirementMode !== 'string') {
    throw new Error(`Pin ${row.id} has an invalid trainRequirementMode.`);
  }

  if (row.trainRequirementMode !== 'fixed-color' && row.trainRequirementMode !== 'any-color') {
    throw new Error(`Pin ${row.id} has unsupported trainRequirementMode ${row.trainRequirementMode}.`);
  }

  if (row.fixedColor !== null && typeof row.fixedColor !== 'string') {
    throw new Error(`Pin ${row.id} has invalid fixedColor.`);
  }

  if (typeof row.fixedColor === 'string' && !isTrainColor(row.fixedColor)) {
    throw new Error(`Pin ${row.id} has unsupported fixedColor ${row.fixedColor}.`);
  }

  if (typeof row.sourceTraincarId !== 'string' || row.sourceTraincarId.length === 0) {
    throw new Error(`Pin ${row.id} has invalid sourceTraincarId.`);
  }

  return {
    id: row.id,
    routeLinkId: row.routeLinkId,
    slotIndex,
    xPercent,
    yPercent,
    angleDeg,
    trainRequirementMode: row.trainRequirementMode,
    fixedColor: row.fixedColor ?? null,
    sourceTraincarId: row.sourceTraincarId,
  };
}

export function getUsaBoardPinRecords(): RawBoardPinRecord[] {
  const rows = usaBoardPinsJson as unknown[];
  return rows.map((row, index) => parseRawBoardPinRecord(row, index));
}

export function getParallelGroupKey(routeLinkId: string): string {
  return routeLinkId.replace(/-\d+$/, '');
}

export function buildBoardStateFromRawPins(rows: RawBoardPinRecord[]): BoardState {
  const pinsById: Record<string, BoardPinState> = {};
  const routesById: Record<string, BoardRouteState> = {};

  for (const row of rows) {
    if (pinsById[row.id]) {
      throw new Error(`Duplicate pin id ${row.id}.`);
    }

    pinsById[row.id] = {
      id: row.id,
      routeLinkId: row.routeLinkId,
      slotIndex: row.slotIndex,
      xPercent: row.xPercent,
      yPercent: row.yPercent,
      angleDeg: row.angleDeg,
      sourceTraincarId: row.sourceTraincarId,
      isVisible: false,
    };

    const existingRoute = routesById[row.routeLinkId];
    if (!existingRoute) {
      routesById[row.routeLinkId] = {
        id: row.routeLinkId,
        parallelGroupKey: getParallelGroupKey(row.routeLinkId),
        slotCount: 0,
        trainRequirementMode: row.trainRequirementMode,
        fixedColor: row.fixedColor,
        allowsLocomotive: true,
        pinIdsOrdered: [],
        claim: {
          claimedByPlayerId: null,
          claimedAtTurn: null,
        },
      };
    } else {
      if (existingRoute.trainRequirementMode !== row.trainRequirementMode) {
        throw new Error(`Route ${row.routeLinkId} has mixed requirement modes.`);
      }

      if (existingRoute.fixedColor !== row.fixedColor) {
        throw new Error(`Route ${row.routeLinkId} has mixed fixedColor values.`);
      }
    }
  }

  const pinsByRouteId = rows.reduce<Record<string, RawBoardPinRecord[]>>((acc, row) => {
    if (!acc[row.routeLinkId]) {
      acc[row.routeLinkId] = [];
    }

    acc[row.routeLinkId].push(row);
    return acc;
  }, {});

  Object.entries(pinsByRouteId).forEach(([routeId, routePins]) => {
    const ordered = [...routePins].sort((a, b) => a.slotIndex - b.slotIndex);
    const expectedIndices = ordered.map((pin, index) => pin.slotIndex === index);

    if (expectedIndices.some((isExpected) => !isExpected)) {
      throw new Error(`Route ${routeId} slotIndex values must be contiguous starting at 0.`);
    }

    routesById[routeId].pinIdsOrdered = ordered.map((pin) => pin.id);
    routesById[routeId].slotCount = ordered.length;
  });

  return {
    pinsById,
    pinIds: Object.keys(pinsById).sort(),
    routesById,
    routeIds: Object.keys(routesById).sort(),
  };
}

export function createInitialBoardState(): BoardState {
  return buildBoardStateFromRawPins(getUsaBoardPinRecords());
}

export function getRouteCardTypeRequirement(route: BoardRouteState): RouteCardRequirement {
  if (route.trainRequirementMode === 'any-color' || route.fixedColor === null) {
    return 'any-color';
  }

  return route.fixedColor;
}
