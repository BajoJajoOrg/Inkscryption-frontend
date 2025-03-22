import * as fabric from "fabric";
type TCanvasMode = "draw" | "erase" | "select";

export function applyCanvasMode(
  canvas: fabric.Canvas,
  mode: TCanvasMode,
  isMouseDownRef: React.MutableRefObject<boolean>,
  saveHistory: () => void,
  loadJSON: (json: string) => void,
  history: string[]
) {
  canvas.off("mouse:move");

  if (mode === "select") {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.skipTargetFind = false;
    canvas.getObjects().forEach((obj) => (obj.selectable = true));
  } else if (mode === "draw") {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.skipTargetFind = false;
    canvas.getObjects().forEach((obj) => (obj.selectable = false));
    const brush = new fabric.PencilBrush(canvas);
    brush.width = 3;
    brush.color = "#000000";
    canvas.freeDrawingBrush = brush;
  } else if (mode === "erase") {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.skipTargetFind = false;
    canvas.getObjects().forEach((obj) => (obj.selectable = false));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseMove = (options: any) => {
      if (isMouseDownRef.current && options.target) {
        canvas.remove(options.target);
        saveHistory();
      }
    };
    canvas.on("mouse:move", handleMouseMove);
  }

  if (history.length > 0) {
    loadJSON(history[history.length - 1]);
  }
}
