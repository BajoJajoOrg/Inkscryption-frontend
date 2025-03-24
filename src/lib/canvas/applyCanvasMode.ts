import * as fabric from "fabric";
import { TCanvasMode } from "./types";

export function applyCanvasMode(
  canvas: fabric.Canvas,
  mode: TCanvasMode,
  isMouseDownRef: React.MutableRefObject<boolean>,
  saveHistory: () => void,
  loadJSON: (json: string) => void,
  history: string[],
  setMode?: (mode: TCanvasMode) => void,
  modeRef?: React.MutableRefObject<TCanvasMode>
) {
  canvas.off("mouse:move");
  canvas.off("text:editing:exited");

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
  } else if (mode === "text") {
    canvas.isDrawingMode = false;
    canvas.on("text:editing:exited", () => {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      saveHistory();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let myx = true;
    const handleMouseDown = (event: any) => {
      if (mode !== "text" || !event.pointer) return;

      if (myx) {
        const { x, y } = event.pointer;

        const textbox = new fabric.Textbox("", {
          left: x,
          top: y,
          fontSize: 24,
          fill: "#000000",
          editable: true,
          fontFamily: "Verdana",
          width: 200,
        });

        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.requestRenderAll();
        textbox.enterEditing();
        textbox.selectAll();
        if (modeRef) modeRef.current = "select";
        setMode?.("select");
        myx = false;
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
    };
  }

  if (history.length > 0) {
    loadJSON(history[history.length - 1]);
  }
}
