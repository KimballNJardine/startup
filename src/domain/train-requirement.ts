import type { TrainCardType, TrainColor } from './train-types';

export type TrainRequirementMode = 'fixed-color' | 'any-color';

export interface TrainRequirementSnapshot {
  mode: TrainRequirementMode;
  fixedColor: TrainColor | null;
  allowsLocomotive: boolean;
}

interface TrainRequirementInit {
  mode: TrainRequirementMode;
  fixedColor?: TrainColor;
  allowsLocomotive?: boolean;
}

export class TrainRequirement {
  readonly mode: TrainRequirementMode;

  readonly fixedColor: TrainColor | null;

  readonly allowsLocomotive: boolean;

  constructor(init: TrainRequirementInit) {
    this.mode = init.mode;
    this.fixedColor = init.fixedColor ?? null;
    this.allowsLocomotive = init.allowsLocomotive ?? true;

    if (this.mode === 'fixed-color' && this.fixedColor === null) {
      throw new Error('fixed-color routes must provide a fixedColor value.');
    }

    if (this.mode === 'any-color' && this.fixedColor !== null) {
      throw new Error('any-color routes cannot define fixedColor.');
    }
  }

  static fixedColor(color: TrainColor, allowsLocomotive = true): TrainRequirement {
    return new TrainRequirement({
      mode: 'fixed-color',
      fixedColor: color,
      allowsLocomotive,
    });
  }

  static anyColor(allowsLocomotive = true): TrainRequirement {
    return new TrainRequirement({
      mode: 'any-color',
      allowsLocomotive,
    });
  }

  accepts(cardType: TrainCardType): boolean {
    if (cardType === 'locomotive') {
      return this.allowsLocomotive;
    }

    if (this.mode === 'any-color') {
      return true;
    }

    return cardType === this.fixedColor;
  }

  toSnapshot(): TrainRequirementSnapshot {
    return {
      mode: this.mode,
      fixedColor: this.fixedColor,
      allowsLocomotive: this.allowsLocomotive,
    };
  }
}
