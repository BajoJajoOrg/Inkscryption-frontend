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
import { getOcr } from "../../services/api";

type TCanvasMode = "draw" | "erase" | "select";

interface IResultDiv {
  text: string;
}
const ResultDiv = ({ text }: IResultDiv) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        right: 0,
        backgroundColor: "darkgray",
        color: "white",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
};

export const FabricCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [text, setText] = useState("");

  const [history, setHistory] = useState<string[]>([]);
  const [undoneHistory, setUndoneHistory] = useState<string[]>([]);

  const [mode, setMode] = useState<TCanvasMode>("draw");

  const { width, height } = useWindowSize();

  const isMouseDownRef = useRef(false);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      isDrawingMode: true,
      selection: true,
      backgroundColor: "#ffffff",
    });
    fabricRef.current = canvas;

    const handlePathCreated = () => {
      saveHistory();
    };

    const handleObjectModified = () => {
      saveHistory();
    };

    canvas.on("path:created", handlePathCreated);
    canvas.on("object:modified", handleObjectModified);

    return () => {
      canvas.off("path:created", handlePathCreated);
      canvas.off("object:modified", handleObjectModified);
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    const handlePointerDown = () => {
      isMouseDownRef.current = true;
    };
    const handlePointerUp = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    saveHistory();

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

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

      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const handleMouseMove = (options: any) => {
        if (isMouseDownRef.current && options.target) {
          canvas.remove(options.target);
          saveHistory();
        }
      };
      canvas.on("mouse:move", handleMouseMove);
    }
    const newHistory = history.slice(0);
    if (history.length > 0) loadJSON(newHistory[newHistory.length - 1]);
  }, [mode, width, height]);

  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => [...prev, json]);
    setUndoneHistory([]);
  }, []);

  const loadJSON = useCallback((jsonString: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.loadFromJSON(jsonString, () => {
      canvas.getObjects().forEach((obj) => obj.setCoords());
      setTimeout(() => {
        canvas.renderAll();
      }, 0);
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length <= 1) {
      return;
    }
    const currentJSON = history[history.length - 1];
    setUndoneHistory((prev) => [...prev, currentJSON]);
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    loadJSON(newHistory[newHistory.length - 1]);
  }, [history, loadJSON]);

  const handleRedo = useCallback(() => {
    if (undoneHistory.length === 0) {
      return;
    }
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

    const blob = await canvas.toBlob({
      format: "png",
      multiplier: 0.2,
    });

    if (!blob) return;

    const response = await getOcr(blob);
    setText(response.text);
  }, []);

  const toggleDrawingMode = () => {
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
      <ResultDiv text={text} />
    </div>
  );
};
