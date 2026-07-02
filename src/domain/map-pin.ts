import { TrainRequirement, type TrainRequirementSnapshot } from './train-requirement';

export interface MapPinInit {
  id: string;
  routeLinkId: string;
  slotIndex: number;
  xPercent: number;
  yPercent: number;
  angleDeg: number;
  trainRequirement: TrainRequirement;
}

export interface MapPinSnapshot {
  id: string;
  routeLinkId: string;
  slotIndex: number;
  xPercent: number;
  yPercent: number;
  angleDeg: number;
  linkedSlotPinIds: string[];
  neighborPinIds: string[];
  trainRequirement: TrainRequirementSnapshot;
}

export class MapPin {
  readonly id: string;

  readonly routeLinkId: string;

  readonly slotIndex: number;

  private _xPercent: number;

  private _yPercent: number;

  private _angleDeg: number;

  readonly trainRequirement: TrainRequirement;

  private linkedSlotPinIds = new Set<string>();

  private neighborPinIds = new Set<string>();

  constructor(init: MapPinInit) {
    this.id = init.id;
    this.routeLinkId = init.routeLinkId;
    this.slotIndex = init.slotIndex;
    this.trainRequirement = init.trainRequirement;

    this.assertId(this.id, 'pin id');
    this.assertId(this.routeLinkId, 'routeLinkId');

    if (!Number.isInteger(this.slotIndex) || this.slotIndex < 0) {
      throw new Error('slotIndex must be an integer >= 0.');
    }

    this._xPercent = this.assertPercent(init.xPercent, 'xPercent');
    this._yPercent = this.assertPercent(init.yPercent, 'yPercent');
    this._angleDeg = this.normalizeAngle(init.angleDeg);
  }

  get xPercent(): number {
    return this._xPercent;
  }

  get yPercent(): number {
    return this._yPercent;
  }

  get angleDeg(): number {
    return this._angleDeg;
  }

  setPlacement(xPercent: number, yPercent: number, angleDeg: number): void {
    this._xPercent = this.assertPercent(xPercent, 'xPercent');
    this._yPercent = this.assertPercent(yPercent, 'yPercent');
    this._angleDeg = this.normalizeAngle(angleDeg);
  }

  addLinkedSlotPin(pinId: string): void {
    this.assertRelationId(pinId, 'linked slot pin');
    this.linkedSlotPinIds.add(pinId);
  }

  removeLinkedSlotPin(pinId: string): void {
    this.linkedSlotPinIds.delete(pinId);
  }

  addNeighborPin(pinId: string): void {
    this.assertRelationId(pinId, 'neighbor pin');
    this.neighborPinIds.add(pinId);
  }

  removeNeighborPin(pinId: string): void {
    this.neighborPinIds.delete(pinId);
  }

  getLinkedSlotPinIds(): string[] {
    return Array.from(this.linkedSlotPinIds).sort();
  }

  getNeighborPinIds(): string[] {
    return Array.from(this.neighborPinIds).sort();
  }

  toSnapshot(): MapPinSnapshot {
    return {
      id: this.id,
      routeLinkId: this.routeLinkId,
      slotIndex: this.slotIndex,
      xPercent: this._xPercent,
      yPercent: this._yPercent,
      angleDeg: this._angleDeg,
      linkedSlotPinIds: this.getLinkedSlotPinIds(),
      neighborPinIds: this.getNeighborPinIds(),
      trainRequirement: this.trainRequirement.toSnapshot(),
    };
  }

  private assertPercent(value: number, fieldName: string): number {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error(`${fieldName} must be between 0 and 100.`);
    }

    return Number(value.toFixed(2));
  }

  private normalizeAngle(value: number): number {
    if (!Number.isFinite(value)) {
      throw new Error('angleDeg must be a finite number.');
    }

    let normalized = value % 360;
    if (normalized > 180) {
      normalized -= 360;
    }
    if (normalized <= -180) {
      normalized += 360;
    }

    return Number(normalized.toFixed(2));
  }

  private assertId(value: string, fieldName: string): void {
    if (value.trim().length === 0) {
      throw new Error(`${fieldName} cannot be empty.`);
    }
  }

  private assertRelationId(value: string, relationName: string): void {
    this.assertId(value, relationName);

    if (value === this.id) {
      throw new Error(`${relationName} cannot reference itself.`);
    }
  }
}
