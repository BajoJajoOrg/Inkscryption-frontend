import * as fabric from 'fabric';

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
		canvas.loadFromJSON(json, () => {
			canvas.getObjects().forEach((obj) => {
				if (obj.type === 'textbox') {
					obj.set('objectCaching', false);
				}
				obj.setCoords();
			});
		});
	} catch {
		console.error('Ошибка при восстановлении канваса.');
	}

	canvas.requestRenderAll();
}
