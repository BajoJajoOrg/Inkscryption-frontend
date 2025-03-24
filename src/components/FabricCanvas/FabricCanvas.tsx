// components/FabricCanvas.tsx
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import * as fabric from "fabric";
import { useWindowSize } from "react-use";
import "./FabricCanvas.css";

import { initializeCanvas } from "../../lib/canvas/initCanvas";
import { applyCanvasMode } from "../../lib/canvas/applyCanvasMode";
import { registerPointerTracking } from "../../lib/canvas/pointerTracking";
import {
  saveCanvasState,
  loadCanvasState,
} from "../../lib/canvas/canvasHistory";
import { extractTextFromCanvas } from "../../lib/canvas/canvasExtractText";
import { Toolbar } from "../CanvasToolbar/CanvasToolbar";
import { EditableTextToolbar } from "../TextToolbar/TextToolbar";
import { TCanvasMode } from "../../lib/canvas/types";

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [undoneHistory, setUndoneHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<TCanvasMode>("draw");
  const [isEditingText, setIsEditingText] = useState(false);

  const currentObj = useRef<fabric.FabricObject>(undefined);

  const { width, height } = useWindowSize();
  const isMouseDownRef = useRef(false);
  const modeRef = useRef<TCanvasMode>("draw");

  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = saveCanvasState(canvas);
    setHistory((prev) => [...prev, json]);
    setUndoneHistory([]);
  }, []);

  const loadJSON = useCallback((json: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    loadCanvasState(canvas, json);
  }, []);

  const applyCurrentMode = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    applyCanvasMode(
      canvas,
      modeRef.current,
      isMouseDownRef,
      saveHistory,
      loadJSON,
      history,
      (mode) => {
        setMode(mode);
      },
      modeRef
    );
  }, [saveHistory, loadJSON, history]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return () => {};

    const canvas = initializeCanvas({
      canvasRef: canvasRef.current,
      width,
      height,
      saveHistory,
    });
    fabricRef.current = canvas;
    applyCurrentMode();
    canvas.on("text:editing:entered", () => {
      setIsEditingText(true);
      currentObj.current = canvas.getActiveObject();
      console.log("ENTERED EDIT MODE");
    });
    canvas.on("text:editing:exited", () => {
      setIsEditingText(false);
    });

    return () => canvas.dispose();
  }, [width, height, saveHistory, applyCurrentMode]);

  useEffect(() => {
    const cleanup = registerPointerTracking(isMouseDownRef);
    saveHistory();
    return cleanup;
  }, [saveHistory]);

  const handleUndo = useCallback(() => {
    if (history.length <= 1) return;
    const currentJSON = history[history.length - 1];
    setUndoneHistory((prev) => [...prev, currentJSON]);
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    loadJSON(newHistory[newHistory.length - 1]);
  }, [history, loadJSON]);

  const handleRedo = useCallback(() => {
    if (undoneHistory.length === 0) return;
    const redoneJSON = undoneHistory[undoneHistory.length - 1];
    setUndoneHistory((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, redoneJSON]);
    console.log(redoneJSON);
    loadJSON(redoneJSON);
  }, [undoneHistory, loadJSON]);

  const handleSaveCanvas = useCallback(() => {
    console.log(history[history.length - 1]);
  }, [history]);

  const handleGetText = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const extracted = await extractTextFromCanvas(canvas);
    console.log(extracted);
  }, []);

  const toggleDrawingMode = () => {
    setMode((prev) =>
      prev === "draw" || prev === "erase" ? "select" : "draw"
    );
    modeRef.current =
      modeRef.current === "draw" || modeRef.current === "erase"
        ? "select"
        : "draw";
  };

  const toggleEraseMode = () => {
    setMode((prev) => (prev === "erase" ? "draw" : "erase"));
    modeRef.current = modeRef.current === "erase" ? "draw" : "erase";
  };

  return (
    <div>
      <Toolbar
        isDrawing={mode === "draw" || mode === "erase"}
        isErasing={mode === "erase"}
        onToggleDrawing={() => {
          toggleDrawingMode();
          applyCurrentMode();
        }}
        onToggleErase={() => {
          toggleEraseMode();
          applyCurrentMode();
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSaveCanvas}
        onExtractText={handleGetText}
        onSetTextMode={() => {
          setMode("text");
          modeRef.current = "text";
          applyCurrentMode();
        }}
      />
      <EditableTextToolbar
        canvas={fabricRef.current ?? null}
        isEditingText={isEditingText}
      />
      <div className="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
