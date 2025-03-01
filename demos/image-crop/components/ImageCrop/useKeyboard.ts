import { useEffect, useCallback } from "react";

interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const useKeyboard = (crop: Crop, setCrop: (crop: Crop) => void, aspectRatio: number) => {
  const KEY_ACTIONS: { [key: string]: (crop: Crop, step: number) => Crop } = {
    ArrowLeft: (crop, step) => ({ ...crop, x: crop.x - step }),
    ArrowRight: (crop, step) => ({ ...crop, x: crop.x + step }),
    ArrowUp: (crop, step) => ({ ...crop, y: crop.y - step }),
    ArrowDown: (crop, step) => ({ ...crop, y: crop.y + step }),
    "+": (crop) => ({
      ...crop,
      width: crop.width + 10,
      height: (crop.width + 10) / aspectRatio,
    }),
    "-": (crop) => ({
      ...crop,
      width: crop.width - 10,
      height: (crop.width - 10) / aspectRatio,
    }),
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let step = e.shiftKey ? 10 : e.ctrlKey ? 50 : 2;
      if (KEY_ACTIONS[e.key]) {
        setCrop(KEY_ACTIONS[e.key](crop, step));
      }
    },
    [crop, setCrop, aspectRatio]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboard;