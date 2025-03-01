export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeDir = "nw" | "ne" | "sw" | "se";

export interface ImageSize {
  width: number;
  height: number;
}

export interface ActionStart {
  startX: number;
  startY: number;
  initialCrop: Crop;
}
