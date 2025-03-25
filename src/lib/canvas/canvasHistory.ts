import * as fabric from 'fabric';

export function saveCanvasState(canvas: fabric.Canvas): string {
	return JSON.stringify(canvas.toJSON());
}

export function loadCanvasState(canvas: fabric.Canvas, json: string) {
	console.log('CALLED CANVAS LOAD');
	canvas.loadFromJSON(json, () => {
		canvas.getObjects().forEach((obj) => {
			if (obj.type === 'textbox') {
				obj.set('objectCaching', false);
			}
			obj.setCoords();
		});
	});
	canvas.requestRenderAll();
}
