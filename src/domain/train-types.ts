export const TRAIN_COLORS = [
  'black',
  'blue',
  'green',
  'orange',
  'pink',
  'red',
  'white',
  'yellow',
] as const;

export type TrainColor = (typeof TRAIN_COLORS)[number];

export type TrainCardType = TrainColor | 'locomotive';

export type PlayerTrainColor = TrainColor;

export function isTrainColor(value: string): value is TrainColor {
  return (TRAIN_COLORS as readonly string[]).includes(value);
}

export function isTrainCardType(value: string): value is TrainCardType {
  return value === 'locomotive' || isTrainColor(value);
}
