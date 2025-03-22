import * as fabric from "fabric";

export function saveCanvasState(canvas: fabric.Canvas): string {
  return JSON.stringify(canvas.toJSON());
}

export function loadCanvasState(canvas: fabric.Canvas, json: string) {
  canvas.loadFromJSON(json, () => {
    canvas.getObjects().forEach((obj) => obj.setCoords());
    setTimeout(() => canvas.renderAll(), 0);
  });
}
