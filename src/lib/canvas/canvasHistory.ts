import * as fabric from 'fabric';

export function saveCanvasState(canvas: fabric.Canvas): string {
	return JSON.stringify(canvas.toJSON());
}

export function loadCanvasState(canvas: fabric.Canvas, json: string) {
	console.log(json);
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
