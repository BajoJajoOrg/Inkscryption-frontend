import * as fabric from "fabric";
import { getOcr } from "../../api/api";

export async function extractTextFromCanvas(
  canvas: fabric.Canvas
): Promise<string> {
  const blob = await canvas.toBlob({ format: "png", multiplier: 0.2 });
  if (!blob) return "";
  const response = await getOcr(blob);
  return response.text;
}
