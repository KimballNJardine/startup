import { MapPin, type MapPinSnapshot } from './map-pin';
import { TrainRequirement, type TrainRequirementSnapshot } from './train-requirement';

export interface RouteLinkInit {
  id: string;
  cityA: string;
  cityB: string;
  slotCount: number;
  trainRequirement: TrainRequirement;
}

export interface RouteLinkSnapshot {
  id: string;
  cityA: string;
  cityB: string;
  slotCount: number;
  trainRequirement: TrainRequirementSnapshot;
  orderedPins: MapPinSnapshot[];
}

export class RouteLink {
  readonly id: string;

  readonly cityA: string;

  readonly cityB: string;

  readonly slotCount: number;

  readonly trainRequirement: TrainRequirement;

  private slots = new Map<number, MapPin>();

  constructor(init: RouteLinkInit) {
    this.id = init.id;
    this.cityA = init.cityA;
    this.cityB = init.cityB;
    this.slotCount = init.slotCount;
    this.trainRequirement = init.trainRequirement;

    this.assertId(this.id, 'route link id');
    this.assertId(this.cityA, 'cityA');
    this.assertId(this.cityB, 'cityB');

    if (!Number.isInteger(this.slotCount) || this.slotCount < 1) {
      throw new Error('slotCount must be an integer >= 1.');
    }
  }

  addSlotPin(pin: MapPin): void {
    if (pin.routeLinkId !== this.id) {
      throw new Error(`Pin ${pin.id} routeLinkId does not match RouteLink ${this.id}.`);
    }

    if (pin.slotIndex >= this.slotCount) {
      throw new Error(`Pin slotIndex ${pin.slotIndex} is outside slotCount ${this.slotCount}.`);
    }

    if (this.slots.has(pin.slotIndex)) {
      throw new Error(`slotIndex ${pin.slotIndex} already has a pin.`);
    }

    this.slots.set(pin.slotIndex, pin);
  }

  getSlotPin(slotIndex: number): MapPin | undefined {
    return this.slots.get(slotIndex);
  }

  getOrderedPins(): MapPin[] {
    return Array.from(this.slots.entries())
      .sort((a, b) => a[0] - b[0])
      .map((entry) => entry[1]);
  }

  connectSlotChain(): void {
    const orderedPins = this.getOrderedPins();

    for (let index = 0; index < orderedPins.length; index += 1) {
      const current = orderedPins[index];
      const previous = orderedPins[index - 1];
      const next = orderedPins[index + 1];

      if (previous) {
        current.addLinkedSlotPin(previous.id);
      }

      if (next) {
        current.addLinkedSlotPin(next.id);
      }
    }
  }

  toSnapshot(): RouteLinkSnapshot {
    return {
      id: this.id,
      cityA: this.cityA,
      cityB: this.cityB,
      slotCount: this.slotCount,
      trainRequirement: this.trainRequirement.toSnapshot(),
      orderedPins: this.getOrderedPins().map((pin) => pin.toSnapshot()),
    };
  }

  private assertId(value: string, fieldName: string): void {
    if (value.trim().length === 0) {
      throw new Error(`${fieldName} cannot be empty.`);
    }
  }
}
