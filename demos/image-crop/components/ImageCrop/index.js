'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DEFAULT_CROP = { x: 50, y: 50, width: 160, height: 90 };

const ImageCrop = () => {
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  const imgRef = useRef(null);
  const actionStartRef = useRef(null);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageSize({ width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight });
    }
  };

  const containCrop = (crop, imgWidth, imgHeight) => {
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

  const handleMouseDown = (e) => {
    e.preventDefault();
    actionStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };
    setIsDragging(true);
  };

  const handleResizeMouseDown = (e, direction) => {
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
    (e) => {
      if ((!isDragging && !resizeDir) || !actionStartRef.current || !imageSize) return;

      const { startX, startY, initialCrop } = actionStartRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      let newCrop = { ...initialCrop };

      if (isDragging) {
        newCrop.x = initialCrop.x + deltaX;
        newCrop.y = initialCrop.y + deltaY;
      } else if (resizeDir) {
        if (resizeDir.includes('e')) newCrop.width = initialCrop.width + deltaX;
        if (resizeDir.includes('w')) {
          newCrop.x = initialCrop.x + deltaX;
          newCrop.width = initialCrop.width - deltaX;
        }
        newCrop.height = newCrop.width / aspectRatio;
      }

      newCrop = containCrop(newCrop, imageSize.width, imageSize.height);
      setCrop(newCrop);
    },
    [isDragging, resizeDir, imageSize]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging || resizeDir) {
      setIsDragging(false);
      setResizeDir(null);
      actionStartRef.current = null;
    }
  }, [isDragging, resizeDir]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const KEY_ACTIONS = {
    ArrowLeft: (crop, step) => ({ ...crop, x: crop.x - step }),
    ArrowRight: (crop, step) => ({ ...crop, x: crop.x + step }),
    ArrowUp: (crop, step) => ({ ...crop, y: crop.y - step }),
    ArrowDown: (crop, step) => ({ ...crop, y: crop.y + step }),
    '+': (crop) => ({ ...crop, width: crop.width + 10, height: (crop.width + 10) / aspectRatio }),
    '-': (crop) => ({ ...crop, width: crop.width - 10, height: (crop.width - 10) / aspectRatio }),
    r: () => DEFAULT_CROP,
    R: () => DEFAULT_CROP,
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!imageSize) return;

      let step = 2;
      if (e.shiftKey) step = 10;
      if (e.ctrlKey) step = 50;

      if (KEY_ACTIONS[e.key]) {
        let newCrop = KEY_ACTIONS[e.key](crop, step);
        newCrop = containCrop(newCrop, imageSize.width, imageSize.height);
        setCrop(newCrop);
      }
    },
    [crop, imageSize]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div>
      <img
        ref={imgRef}
        src="https://fastly.picsum.photos/id/1062/800/600.jpg?hmac=gvqw06N1zijytxKxLzRgM7m-xp2v6wYSnj0LpBDvSI0"
        alt="demo"
        onLoad={handleImageLoad}
        style={{ display: 'block', maxWidth: '100%' }}
      />
      {imageSize && (
        <div
          style={{
            position: 'absolute',
            left: `${crop.x}px`,
            top: `${crop.y}px`,
            width: `${crop.width}px`,
            height: `${crop.height}px`,
            border: '2px dashed #fff',
            boxShadow: '0 0 0 10000px rgba(0,0,0,0.5)',
            cursor: isDragging ? 'move' : 'default',
          }}
          onMouseDown={handleMouseDown}
        >
          {['nw', 'ne', 'sw', 'se'].map((dir) => (
            <div
              key={dir}
              style={{
                position: 'absolute',
                [dir.includes('n') ? 'top' : 'bottom']: '-5px',
                [dir.includes('w') ? 'left' : 'right']: '-5px',
                width: '10px',
                height: '10px',
                background: '#fff',
                border: '1px solid #000',
                cursor: `${dir}-resize`,
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, dir)}
            />
          ))}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setAspectRatio(1)}>1:1</button>
        <button onClick={() => setAspectRatio(4 / 3)}>4:3</button>
        <button onClick={() => setAspectRatio(16 / 9)}>16:9</button>
      </div>

      {imageSize && (
        <div style={{ marginTop: '10px', color: '#333' }}>
          <strong>Crop Info:</strong> x: {crop.x}, y: {crop.y}, width: {crop.width}, height:{' '}
          {crop.height}
          {isDragging && ' Dragging...'}
          {resizeDir && ` Resizing: ${resizeDir}`}
        </div>
      )}
    </div>
  );
};

export default ImageCrop;
