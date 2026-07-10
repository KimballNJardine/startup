export const BOARD_CITY_IDS = [
  'atlanta',
  'boston',
  'calgary',
  'charleston',
  'chicago',
  'dallas',
  'denver',
  'duluth',
  'el-paso',
  'helena',
  'houston',
  'kansas-city',
  'las-vegas',
  'little-rock',
  'los-angeles',
  'miami',
  'montreal',
  'nashville',
  'new-orleans',
  'new-york',
  'oklahoma-city',
  'omaha',
  'phoenix',
  'pittsburgh',
  'portland',
  'raleigh',
  'saint-louis',
  'salt-lake-city',
  'san-francisco',
  'santa-fe',
  'sault-st-marie',
  'seattle',
  'toronto',
  'vancouver',
  'washington',
  'winnipeg',
] as const;

export type BoardCityId = (typeof BOARD_CITY_IDS)[number];

const BOARD_CITY_ID_SET = new Set<string>(BOARD_CITY_IDS);

const CITY_ID_ALIAS_MAP: Record<string, BoardCityId> = {
  montreal: 'montreal',
  'montral': 'montreal',
  'sante-fe': 'santa-fe',
  'st-louis': 'saint-louis',
  'st-louis-mo': 'saint-louis',
  'st-marie': 'sault-st-marie',
  'sault-ste-marie': 'sault-st-marie',
};

export function normalizeCityId(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\./g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');

  if (!normalized) {
    return '';
  }

  return CITY_ID_ALIAS_MAP[normalized] ?? normalized;
}

export function isCanonicalCityId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function normalizeAndValidateCityId(value: string, fieldName: string): string {
  const normalized = normalizeCityId(value);

  if (!normalized || !isCanonicalCityId(normalized)) {
    throw new Error(`${fieldName} has invalid city id ${value}.`);
  }

  return normalized;
}

export function toBoardCityId(value: string): BoardCityId | null {
  const normalized = normalizeCityId(value);

  if (!BOARD_CITY_ID_SET.has(normalized)) {
    return null;
  }

  return normalized as BoardCityId;
}

export function parseRouteEndpointsFromRouteId(routeId: string):
  | { cityA: BoardCityId; cityB: BoardCityId }
  | null {
  const match = /^route-(.+)-\d+$/.exec(routeId);
  if (!match) {
    return null;
  }

  const tokens = match[1].split('-').filter((token) => token.length > 0);
  if (tokens.length < 2) {
    return null;
  }

  for (let splitIndex = 1; splitIndex < tokens.length; splitIndex += 1) {
    const cityACandidate = toBoardCityId(tokens.slice(0, splitIndex).join('-'));
    const cityBCandidate = toBoardCityId(tokens.slice(splitIndex).join('-'));

    if (cityACandidate && cityBCandidate) {
      return {
        cityA: cityACandidate,
        cityB: cityBCandidate,
      };
    }
  }

  return null;
}
