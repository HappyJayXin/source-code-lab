"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Crop, ResizeDir, ImageSize, ActionStart } from "./types";
import useKeyboard from "./useKeyboard";
import Overlay from "./overlay";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const DEFAULT_CROP: Crop = { x: 50, y: 50, width: 160, height: 90 };

const ImageCrop = () => {
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [resizeDir, setResizeDir] = useState<ResizeDir | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  useKeyboard(crop, setCrop, aspectRatio);

  const imgRef = useRef<HTMLImageElement>(null);
  const actionStartRef = useRef<ActionStart | null>(null);

  const handleImageLoad = (): void => {
    if (imgRef.current) {
      setImageSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      handleImageLoad();
    }
  }, []);

  const containCrop = (crop: Crop, imgWidth: number, imgHeight: number): Crop => {
    let newWidth = clamp(crop.width, 10, imgWidth);
    let newHeight = newWidth / aspectRatio;

    if (newHeight > imgHeight) {
      newHeight = clamp(newHeight, 10, imgHeight);
      newWidth = newHeight * aspectRatio;
    }

    return {
      x: clamp(crop.x, 0, imgWidth - newWidth),
      y: clamp(crop.y, 0, imgHeight - newHeight),
      width: newWidth,
      height: newHeight,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    actionStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, direction: ResizeDir) => {
    e.preventDefault();
    e.stopPropagation();
    actionStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };
    setResizeDir(direction);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if ((!isDragging && !resizeDir) || !actionStartRef.current || !imageSize) return;

      const { startX, startY, initialCrop } = actionStartRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      let newCrop: Crop = { ...initialCrop };

      if (isDragging) {
        newCrop.x = initialCrop.x + deltaX;
        newCrop.y = initialCrop.y + deltaY;
      } else if (resizeDir) {
        if (resizeDir.includes("e")) newCrop.width = initialCrop.width + deltaX;
        if (resizeDir.includes("w")) {
          newCrop.x = initialCrop.x + deltaX;
          newCrop.width = initialCrop.width - deltaX;
        }
        newCrop.height = newCrop.width / aspectRatio;
      }

      newCrop = containCrop(newCrop, imageSize.width, imageSize.height);
      setCrop(newCrop);
    },
    [isDragging, resizeDir, imageSize, aspectRatio]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging || resizeDir) {
      setIsDragging(false);
      setResizeDir(null);
      actionStartRef.current = null;
    }
  }, [isDragging, resizeDir]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <>
      <div style={{ position: "relative", display: "inline-block", overflow: "hidden" }}>
        <img
          ref={imgRef}
          src="https://fastly.picsum.photos/id/1062/800/600.jpg?hmac=gvqw06N1zijytxKxLzRgM7m-xp2v6wYSnj0LpBDvSI0"
          alt="demo"
          onLoad={handleImageLoad}
          style={{ display: "block", maxWidth: "100%" }}
        />

        {imageSize && (
          <Overlay
            crop={crop}
            handleMouseDown={handleMouseDown}
            handleResizeMouseDown={handleResizeMouseDown}
            isDragging={isDragging}
          />
        )}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setAspectRatio(1)}>1:1</button>
        <button onClick={() => setAspectRatio(4 / 3)}>4:3</button>
        <button onClick={() => setAspectRatio(16 / 9)}>16:9</button>
      </div>

      {imageSize && (
        <div style={{ marginTop: "10px", color: "#333" }}>
          <strong>Crop Info:</strong> x: {crop.x}, y: {crop.y}, width: {crop.width}, height:{" "}
          {crop.height}
          {isDragging && " Dragging..."}
          {resizeDir && ` Resizing: ${resizeDir}`}
        </div>
      )}
    </>
  );
};

export default ImageCrop;
