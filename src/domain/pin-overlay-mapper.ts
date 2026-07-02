import type { BoardPinSnapshot } from './board-pin-registry';
import type { MapPinSnapshot } from './map-pin';
import type { TrainColor } from './train-types';

export interface PinOverlayStyle {
  left: string;
  top: string;
  transform: string;
}

export interface PinOverlayRenderModel {
  id: string;
  routeLinkId: string;
  slotIndex: number;
  xPercent: number;
  yPercent: number;
  angleDeg: number;
  className: string;
  style: PinOverlayStyle;
}

export interface PinOverlayMapperOptions {
  baseClassName?: string;
  anyColorClassName?: string;
  colorClassNameByTrainColor?: Partial<Record<TrainColor, string>>;
}

const DEFAULT_BASE_CLASS_NAME = 'absolute h-3 w-8 rounded-sm shadow-sm ring-1 ring-white/70';

const DEFAULT_ANY_COLOR_CLASS_NAME = 'bg-slate-700/90';

const DEFAULT_COLOR_CLASS_NAME_BY_TRAIN_COLOR: Record<TrainColor, string> = {
  black: 'bg-black/90',
  blue: 'bg-blue-700/90',
  green: 'bg-green-700/90',
  orange: 'bg-orange-500/90',
  pink: 'bg-pink-500/90',
  red: 'bg-red-700/90',
  white: 'bg-white/95',
  yellow: 'bg-yellow-500/95',
};

export function mapPinSnapshotToOverlayRenderModel(
  pin: MapPinSnapshot,
  options: PinOverlayMapperOptions = {},
): PinOverlayRenderModel {
  const baseClassName = options.baseClassName ?? DEFAULT_BASE_CLASS_NAME;
  const colorClassName = resolvePinColorClassName(pin, options);

  return {
    id: pin.id,
    routeLinkId: pin.routeLinkId,
    slotIndex: pin.slotIndex,
    xPercent: pin.xPercent,
    yPercent: pin.yPercent,
    angleDeg: pin.angleDeg,
    className: `${baseClassName} ${colorClassName}`,
    style: {
      left: `${pin.xPercent}%`,
      top: `${pin.yPercent}%`,
      transform: `translate(-50%, -50%) rotate(${pin.angleDeg}deg)`,
    },
  };
}

export function mapBoardSnapshotToOverlayRenderModels(
  boardSnapshot: BoardPinSnapshot,
  options: PinOverlayMapperOptions = {},
): PinOverlayRenderModel[] {
  return [...boardSnapshot.pins]
    .sort((pinA, pinB) => {
      if (pinA.routeLinkId === pinB.routeLinkId) {
        return pinA.slotIndex - pinB.slotIndex;
      }

      return pinA.routeLinkId.localeCompare(pinB.routeLinkId);
    })
    .map((pin) => mapPinSnapshotToOverlayRenderModel(pin, options));
}

function resolvePinColorClassName(pin: MapPinSnapshot, options: PinOverlayMapperOptions): string {
  if (pin.trainRequirement.mode === 'any-color') {
    return options.anyColorClassName ?? DEFAULT_ANY_COLOR_CLASS_NAME;
  }

  const color = pin.trainRequirement.fixedColor;
  if (!color) {
    return options.anyColorClassName ?? DEFAULT_ANY_COLOR_CLASS_NAME;
  }

  const overrideClass = options.colorClassNameByTrainColor?.[color];
  if (overrideClass) {
    return overrideClass;
  }

  return DEFAULT_COLOR_CLASS_NAME_BY_TRAIN_COLOR[color];
}
