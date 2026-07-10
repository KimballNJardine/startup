import destinationTicketsData from "./data/destination-list.json";
import { normalizeAndValidateCityId } from './city-ids';

export interface DestinationTicket {
  id: string;
  idOriginCity: string;
  idDestinationCity: string;
  originCity: string;
  destinationCity: string;
  points: number;
}

function parseDestinationTicket(value: unknown, index: number): DestinationTicket {
  if (!value || typeof value !== 'object') {
    throw new Error(`Destination ticket row ${index} must be an object.`);
  }

  const row = value as Partial<DestinationTicket>;

  if (typeof row.id !== 'string' || row.id.trim().length === 0) {
    throw new Error(`Destination ticket row ${index} has invalid id.`);
  }

  if (typeof row.originCity !== 'string' || row.originCity.trim().length === 0) {
    throw new Error(`Destination ticket ${row.id} has invalid originCity.`);
  }

  if (typeof row.destinationCity !== 'string' || row.destinationCity.trim().length === 0) {
    throw new Error(`Destination ticket ${row.id} has invalid destinationCity.`);
  }

  if (typeof row.idOriginCity !== 'string' || row.idOriginCity.trim().length === 0) {
    throw new Error(`Destination ticket ${row.id} is missing idOriginCity.`);
  }

  if (typeof row.idDestinationCity !== 'string' || row.idDestinationCity.trim().length === 0) {
    throw new Error(`Destination ticket ${row.id} is missing idDestinationCity.`);
  }

  if (typeof row.points !== 'number' || !Number.isFinite(row.points) || row.points <= 0) {
    throw new Error(`Destination ticket ${row.id} has invalid points.`);
  }

  return {
    id: row.id,
    idOriginCity: normalizeAndValidateCityId(row.idOriginCity, `${row.id}.idOriginCity`),
    idDestinationCity: normalizeAndValidateCityId(
      row.idDestinationCity,
      `${row.id}.idDestinationCity`,
    ),
    originCity: row.originCity,
    destinationCity: row.destinationCity,
    points: row.points,
  };
}

function parseDestinationTickets(rows: unknown[]): DestinationTicket[] {
  const tickets = rows.map((row, index) => parseDestinationTicket(row, index));
  const seenIds = new Set<string>();

  for (const ticket of tickets) {
    if (seenIds.has(ticket.id)) {
      throw new Error(`Duplicate destination ticket id ${ticket.id}.`);
    }

    seenIds.add(ticket.id);
  }

  return tickets;
}

export const DESTINATION_TICKETS = parseDestinationTickets(destinationTicketsData as unknown[]);
