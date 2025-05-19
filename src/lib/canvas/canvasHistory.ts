import * as fabric from 'fabric';
import { addCustomControl } from './applyCanvasMode';
import { addConvertImageControl, addConvertTextControl } from './customControls';

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
				if (obj instanceof fabric.FabricText || obj instanceof fabric.Textbox) {
					addConvertTextControl(obj);
				}

				if (obj instanceof fabric.FabricImage) {
					addConvertImageControl(obj);
				}
				obj.setCoords();
			});
		});
	} catch {
		console.error('Ошибка при восстановлении канваса.');
	}

	canvas.requestRenderAll();
}
