import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import * as fabric from "fabric";
import { useWindowSize } from "react-use";
import "./fabric-canvas.css";

type TCanvasMode = "draw" | "erase" | "select";

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [history, setHistory] = useState<fabric.Object[][]>([]);

  // Keep the mode in state so the UI can re-render if needed
  const [mode, setMode] = useState<TCanvasMode>("draw");

  // Use the window size from react-use, to set up canvas dimensions
  const { width, height } = useWindowSize();

  // Instead of a boolean state for mouse down/up, keep it in a ref
  // (so we don’t trigger re-renders on pointerdown/pointerup).
  const isMouseDownRef = useRef(false);

  // -------------------------
  // 1) SETUP & DISPOSE FABRIC (once)
  // -------------------------
  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true, // default
      width: width,
      height: height,
      selection: true,
    });

    fabricRef.current = canvas;

    // Attach creation/modification handlers only once
    const handleObjectCreated = () => saveHistory();
    const handleObjectModified = () => saveHistory();

    canvas.on("path:created", handleObjectCreated);
    canvas.on("object:modified", handleObjectModified);

    return () => {
      canvas.off("path:created", handleObjectCreated);
      canvas.off("object:modified", handleObjectModified);
      canvas.dispose();
    };
    // We only want this effect to run if the width/height changes
    // Or if the actual ref changes. Usually once at mount, or on resize
  }, [width, height]);

  // -------------------------
  // 2) MOUSE DOWN / UP EVENTS (avoid state => use ref)
  // -------------------------
  useEffect(() => {
    const handlePointerDown = () => {
      isMouseDownRef.current = true;
    };
    const handlePointerUp = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // -------------------------
  // 3) MODE & BRUSH SETTINGS
  // -------------------------
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // First, remove any leftover "mouse:move" handlers from erase mode.
    canvas.off("mouse:move");

    // The default is that objects are selectable, so let's explicitly
    // handle that depending on the mode:

    if (mode === "select") {
      // SELECT mode:
      canvas.isDrawingMode = false;
      canvas.selection = true; // allow group selection
      canvas.skipTargetFind = false; // let mouse events find the target
      canvas.getObjects().forEach((obj) => (obj.selectable = true));
    } else if (mode === "draw") {
      // DRAW mode:
      canvas.isDrawingMode = true;
      canvas.selection = false; // no group selection
      canvas.skipTargetFind = false; // allow picking up objects if needed (optional)
      canvas.getObjects().forEach((obj) => (obj.selectable = false));

      // Pencil brush
      const brush = new fabric.PencilBrush(canvas);
      brush.width = 3;
      brush.color = "#000000";
      canvas.freeDrawingBrush = brush;
    } else if (mode === "erase") {
      // ERASE mode:
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.skipTargetFind = false;
      canvas.getObjects().forEach((obj) => (obj.selectable = false));

      // Attach erase handler
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const handleMouseMove = (options: any) => {
        // Only erase if pointer is down & there's a target
        if (isMouseDownRef.current && options.target) {
          canvas.remove(options.target);
          saveHistory();
        }
      };
      canvas.on("mouse:move", handleMouseMove);
    }
  }, [mode]);

  // -------------------------
  // 4) HISTORY
  // -------------------------
  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Clone each object on the canvas so we can revert to it later
    const objects = canvas.getObjects().map((obj) => obj.clone());
    Promise.all(objects).then((clones) => {
      setHistory((prev) => [...prev, clones as fabric.Object[]]);
    });
  }, []);

  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || history.length === 0) return;

    // We want to revert to the previous state
    const previousIndex = history.length - 2;
    const previousState = history[previousIndex];

    // If there's a previous state, revert to it
    if (previousState) {
      canvas.clear();
      previousState.forEach((obj) => canvas.add(obj));
      canvas.renderAll();

      // Trim off the last state
      setHistory((prev) => prev.slice(0, -1));
    } else {
      canvas.clear();
      setHistory([]);
    }
  }, [history]);

  // -------------------------
  // 5) TOGGLE MODES
  // -------------------------
  const toggleDrawingMode = () => {
    // If we're currently "draw" or "erase", switch to "select"; else switch to "draw"
    setMode((prev) => {
      if (prev === "draw" || prev === "erase") {
        return "select";
      } else {
        return "draw";
      }
    });
  };

  const toggleEraseMode = () => {
    setMode((prev) => (prev === "erase" ? "draw" : "erase"));
  };

  // Handy helpers for UI labels
  const isDrawing = mode === "draw" || mode === "erase";
  const isErasing = mode === "erase";

  return (
    <div>
      <div>
        {/* Tools */}
        <button onClick={toggleDrawingMode}>
          <span>Mode:</span> {isDrawing ? "Draw" : "Select"}
        </button>
        <button onClick={toggleEraseMode}>
          <span>Brush:</span> {isErasing ? "Erase" : "Draw"}
        </button>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleUndo}>Redo</button>
        <button onClick={handleUndo}>Save</button>
        <button
          onClick={() => {
            const canvas = fabricRef.current;
            if (!canvas) return;

            // remove active object
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              canvas.remove(activeObject);
            }
          }}
        >
          To text
        </button>
      </div>

      <div className="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
