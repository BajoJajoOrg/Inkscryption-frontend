import * as fabric from 'fabric';
import { addConvertTextControl } from './applyCanvasMode';

export function saveCanvasState(canvas: fabric.Canvas): string {
	return JSON.stringify(canvas.toJSON());
}

export let saveHistoryExternal = () => {};
export const setSaveHistoryExternal = (fn: () => void) => {
	saveHistoryExternal = fn;
};

export let saveCanvasExternal = async () => {};
export const setSaveCanvasExternal = (fn: () => Promise<void>) => {
	saveCanvasExternal = fn;
};

export function loadCanvasState(canvas: fabric.Canvas, json: string) {
	if (!json) {
		return;
	}
	try {
		canvas.loadFromJSON(json).then(() => {
			canvas.getObjects().forEach((obj) => {
				addConvertTextControl(obj);
				obj.setCoords();
			});
		});
	} catch {
		console.error('Ошибка при восстановлении канваса.');
	}

	canvas.requestRenderAll();
}
