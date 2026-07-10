import cityLocationPinsData from './data/city-location-pins.json';
import { normalizeAndValidateCityId } from './city-ids';

export interface CityLocationPin {
  id: string;
  xPercent: number;
  yPercent: number;
  label: string;
}

function parseCityLocationPin(value: unknown, index: number): CityLocationPin {
  if (!value || typeof value !== 'object') {
    throw new Error(`City location row ${index} must be an object.`);
  }

  const row = value as Partial<CityLocationPin>;

  if (typeof row.id !== 'string' || row.id.trim().length === 0) {
    throw new Error(`City location row ${index} has invalid id.`);
  }

  if (typeof row.xPercent !== 'number' || !Number.isFinite(row.xPercent)) {
    throw new Error(`City location ${row.id} has invalid xPercent.`);
  }

  if (typeof row.yPercent !== 'number' || !Number.isFinite(row.yPercent)) {
    throw new Error(`City location ${row.id} has invalid yPercent.`);
  }

  if (typeof row.label !== 'string' || row.label.trim().length === 0) {
    throw new Error(`City location ${row.id} has invalid label.`);
  }

  return {
    id: normalizeAndValidateCityId(row.id, `cityLocationPins.${row.id}.id`),
    xPercent: row.xPercent,
    yPercent: row.yPercent,
    label: row.label,
  };
}

export function getCityLocationPins(): CityLocationPin[] {
  return (cityLocationPinsData as unknown[]).map((row, index) =>
    parseCityLocationPin(row, index),
  );
}

export function getCityLocationPinsById(): Record<string, CityLocationPin> {
  return getCityLocationPins().reduce<Record<string, CityLocationPin>>((acc, cityPin) => {
    if (acc[cityPin.id]) {
      throw new Error(`Duplicate city location id ${cityPin.id}.`);
    }

    acc[cityPin.id] = cityPin;
    return acc;
  }, {});
}
