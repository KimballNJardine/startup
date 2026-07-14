import React from "react";
import type { TrainColor } from "../../../domain";

const TRAIN_CARD_IMAGE_BY_TYPE = {
  black: "img/split_trains/train_black.png",
  blue: "img/split_trains/train_blue.png",
  green: "img/split_trains/train_green.png",
  locomotive: "img/split_trains/train_rainbow.png",
  orange: "img/split_trains/train_orange.png",
  pink: "img/split_trains/train_purple.png",
  red: "img/split_trains/train_red.png",
  white: "img/split_trains/train_white.png",
  yellow: "img/split_trains/train_yellow.png",
} as const satisfies Record<TrainColor | "locomotive", string>;

const TRAIN_CARD_BACK_IMAGE = "img/split_trains/train_back.png";

interface TrainCardArtProps {
  cardType?: TrainColor | "locomotive";
  face: "front" | "back";
}

export default function TrainCardArt({
  cardType,
  face,
}: TrainCardArtProps): React.JSX.Element {
  const imageSrc =
    face === "back"
      ? TRAIN_CARD_BACK_IMAGE
      : cardType
        ? TRAIN_CARD_IMAGE_BY_TYPE[cardType]
        : TRAIN_CARD_BACK_IMAGE;

  const altText =
    face === "back"
      ? "Train card back"
      : `${cardType ? cardType : "train"} train card`;

  return (
    <img src={imageSrc} alt={altText} className="h-full w-full object-cover" />
  );
}
