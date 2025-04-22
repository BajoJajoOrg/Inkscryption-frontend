import * as fabric from 'fabric';
import { getOcr } from '../../services/api';

export async function extractTextFromCanvas(canvas: fabric.Canvas, id: string): Promise<string> {
	const blob = await canvas.toBlob({ format: 'png', multiplier: 0.2 });
	if (!blob) return '';
	const response = await getOcr(blob, id);
	return response.text;
}
