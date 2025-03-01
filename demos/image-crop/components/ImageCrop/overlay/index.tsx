import { Crop, ResizeDir } from "../types";

interface Props {
  crop: Crop;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, direction: ResizeDir) => void;
  isDragging: boolean;
}

const Overlay: React.FC<Props> = ({ crop, handleMouseDown, handleResizeMouseDown, isDragging }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${crop.x}px`,
        top: `${crop.y}px`,
        width: `${crop.width}px`,
        height: `${crop.height}px`,
        border: "2px dashed #fff",
        boxShadow: "0 0 0 10000px rgba(0,0,0,0.5)",
        cursor: isDragging ? "move" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      {(["nw", "ne", "sw", "se"] as ResizeDir[]).map((dir) => (
        <div
          key={dir}
          style={{
            position: "absolute",
            [dir.includes("n") ? "top" : "bottom"]: "-5px",
            [dir.includes("w") ? "left" : "right"]: "-5px",
            width: "10px",
            height: "10px",
            background: "#fff",
            border: "1px solid #000",
            cursor: `${dir}-resize`,
          }}
          onMouseDown={(e) => handleResizeMouseDown(e, dir)}
        />
      ))}
    </div>
  );
};

export default Overlay;
