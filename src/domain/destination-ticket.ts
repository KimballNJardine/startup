import destinationTicketsData from "./data/destination-list.json";

export interface DestinationTicket {
  id: string;
  originCity: string;
  destinationCity: string;
  points: number;
}

export const DESTINATION_TICKETS =
  destinationTicketsData as DestinationTicket[];
