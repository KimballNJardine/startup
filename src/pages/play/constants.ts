import React from "react";

export const boardStyle = {
  aspectRatio: "1024 / 683",
};

export const overlayStyle = {
  "--pin-width": "3.125%",
  "--pin-height": "1.5625%",
} as React.CSSProperties;

export const CLAIMED_PIN_CLASS_BY_PLAYER = {
  "player-1": "bg-sky-700/95 ring-sky-300/80",
  "player-2": "bg-rose-700/95 ring-rose-300/80",
} as const;

export const RAINBOW_RING_GRADIENT =
  "linear-gradient(135deg, rgba(244,63,94,0.95), rgba(250,204,21,0.95), rgba(52,211,153,0.95), rgba(96,165,250,0.95))";

const FELT_TEXTURE_IMAGE =
  "repeating-radial-gradient(circle at 18% 22%, rgba(74,222,128,0.045) 0 1px, rgba(74,222,128,0) 1px 4px), repeating-radial-gradient(circle at 78% 68%, rgba(16,185,129,0.04) 0 1px, rgba(16,185,129,0) 1px 3px), radial-gradient(circle at 28% 18%, rgba(20,83,45,0.72), rgba(6,78,59,0.95) 58%, rgba(2,44,34,0.99))";

export const feltSectionStyle: React.CSSProperties = {
  backgroundImage: FELT_TEXTURE_IMAGE,
  boxShadow: "inset 0 -18px 36px rgba(0,0,0,0.5), 0 16px 28px rgba(0,0,0,0.24)",
};

export const feltBoardWellStyle: React.CSSProperties = {
  backgroundImage: FELT_TEXTURE_IMAGE,
  boxShadow:
    "inset 0 0 0 1px rgba(6,78,59,0.6), inset 0 -14px 24px rgba(0,0,0,0.42)",
};

export const DISCARD_ANIMATION_STAGGER_MS = 85;
export const DISCARD_ANIMATION_DURATION_MS = 560;
export const DISCARD_ANIMATION_CLEAR_BUFFER_MS = 180;
