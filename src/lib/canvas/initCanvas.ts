import * as fabric from "fabric";

type InitCanvasOptions = {
  canvasRef: HTMLCanvasElement;
  width: number;
  height: number;
  saveHistory: () => void;
};

export function initializeCanvas({
  canvasRef,
  width,
  height,
  saveHistory,
}: InitCanvasOptions): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasRef, {
    width,
    height,
    isDrawingMode: true,
    selection: true,
    backgroundColor: "#ffffff",
  });

  const handlePathCreated = () => saveHistory();
  const handleObjectModified = () => saveHistory();

  canvas.on("path:created", handlePathCreated);
  canvas.on("object:modified", handleObjectModified);

  return canvas;
}
