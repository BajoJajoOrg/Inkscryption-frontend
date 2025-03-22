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

type TCanvasMode = "draw" | "erase" | "select";

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [history, setHistory] = useState<string[]>([]);
  const [undoneHistory, setUndoneHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<TCanvasMode>("draw");

  const { width, height } = useWindowSize();
  const isMouseDownRef = useRef(false);

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

  useLayoutEffect(() => {
    if (!canvasRef.current) return () => {};
    const canvas = initializeCanvas({
      canvasRef: canvasRef.current,
      width,
      height,
      saveHistory,
    });
    fabricRef.current = canvas;

    return () => canvas.dispose();
  }, [width, height, saveHistory]);

  useEffect(() => {
    const cleanup = registerPointerTracking(isMouseDownRef);
    saveHistory();
    return cleanup;
  }, [saveHistory]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    applyCanvasMode(
      canvas,
      mode,
      isMouseDownRef,
      saveHistory,
      loadJSON,
      history
    );
  }, [mode, width, height, saveHistory, loadJSON, history]);

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
  };

  const toggleEraseMode = () => {
    setMode((prev) => (prev === "erase" ? "draw" : "erase"));
  };

  const isDrawing = mode === "draw" || mode === "erase";
  const isErasing = mode === "erase";

  return (
    <div>
      <div
        style={{
          display: "grid",
          padding: "10px",
          height: "100px",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          position: "absolute",
          zIndex: 100,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <button onClick={toggleDrawingMode}>
          <span>Режим:</span> {isDrawing ? "Кисть" : "Перемещение"}
        </button>
        <button onClick={toggleEraseMode}>
          <span>Кисть:</span> {isErasing ? "Ластик" : "Обычная"}
        </button>
        <button onClick={handleUndo}>Отменить</button>
        <button onClick={handleRedo}>Повторить</button>
        <button onClick={handleSaveCanvas}>Сохранить</button>
        <button onClick={handleGetText}>В текст</button>
      </div>

      <div className="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
