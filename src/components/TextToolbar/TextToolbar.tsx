import { useEffect, useState } from "react";
import * as fabric from "fabric";

interface Props {
  canvas: fabric.Canvas | null;
  isEditingText: boolean;
}

export const EditableTextToolbar = ({ canvas, isEditingText }: Props) => {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const updatePosition = () => {
      const textbox = canvas.getActiveObject() as fabric.Textbox;
      const textarea = textbox?.hiddenTextarea;
      if (!textbox || !textarea) return;

      const rect = textarea.getBoundingClientRect();
      setPosition({
        left: rect.left + window.scrollX + textarea.offsetWidth,
        top: rect.top + window.scrollY,
      });
    };

    const handleEntered = () => {
      console.log("ENTERED EVENT HANDLER TOO");
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    };

    const handleExited = () => {
      setPosition(null);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };

    canvas.on("text:editing:entered", handleEntered);
    canvas.on("text:editing:exited", handleExited);
    canvas.on("after:render", updatePosition);

    return () => {
      canvas.off("text:editing:entered", handleEntered);
      canvas.off("text:editing:exited", handleExited);
      canvas.off("after:render", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [canvas]);

  if (!position) return null;

  return isEditingText ? (
    <button
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        zIndex: 300,
      }}
      onClick={() => {
        const textbox = canvas?.getActiveObject() as fabric.Textbox;
        if (textbox && textbox.type === "textbox") {
          textbox.set("fontFamily", "Courier New");
          canvas?.requestRenderAll();
        }
      }}
    >
      Change Font
    </button>
  ) : (
    <></>
  );
};
