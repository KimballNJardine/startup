import { MapPin, type MapPinSnapshot } from './map-pin';
import { RouteLink, type RouteLinkSnapshot } from './route-link';

export interface BoardPinSnapshot {
  pins: MapPinSnapshot[];
  routeLinks: RouteLinkSnapshot[];
}

export class BoardPinRegistry {
  private pins = new Map<string, MapPin>();

  private routeLinks = new Map<string, RouteLink>();

  addRouteLink(routeLink: RouteLink): void {
    if (this.routeLinks.has(routeLink.id)) {
      throw new Error(`RouteLink ${routeLink.id} already exists.`);
    }

    this.routeLinks.set(routeLink.id, routeLink);
  }

  addPin(pin: MapPin): void {
    if (this.pins.has(pin.id)) {
      throw new Error(`Pin ${pin.id} already exists.`);
    }

    const routeLink = this.routeLinks.get(pin.routeLinkId);
    if (!routeLink) {
      throw new Error(`RouteLink ${pin.routeLinkId} does not exist.`);
    }

    routeLink.addSlotPin(pin);
    this.pins.set(pin.id, pin);
  }

  connectNeighborPins(pinAId: string, pinBId: string): void {
    const pinA = this.pins.get(pinAId);
    const pinB = this.pins.get(pinBId);

    if (!pinA || !pinB) {
      throw new Error('Both neighbor pins must exist before connecting.');
    }

    pinA.addNeighborPin(pinBId);
    pinB.addNeighborPin(pinAId);
  }

  connectAllRouteSlotChains(): void {
    for (const routeLink of this.routeLinks.values()) {
      routeLink.connectSlotChain();
    }
  }

  getPin(pinId: string): MapPin | undefined {
    return this.pins.get(pinId);
  }

  toSnapshot(): BoardPinSnapshot {
    const pins = Array.from(this.pins.values())
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((pin) => pin.toSnapshot());

    const routeLinks = Array.from(this.routeLinks.values())
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((routeLink) => routeLink.toSnapshot());

    return { pins, routeLinks };
  }
}
