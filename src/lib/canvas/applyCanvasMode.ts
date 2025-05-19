/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fabric from 'fabric';
import { TCanvasMode } from './types';
import EraserIcon from ':svg/icons/eraser_b.svg?raw';
import PenIcon from ':svg/icons/pen_b.svg?raw';
import TextIcon from ':svg/icons/text_b.svg?raw';
import { textToImage } from ':api';
import { saveHistoryExternal } from './canvasHistory';
import { addConvertTextControl } from './customControls';

function svgCursorStringify(svg: string, hotspotX = 0, hotspotY = 16): string {
	const cleaned = svg.replace(/\n/g, '').replace(/"/g, "'").trim();
	return `url("data:image/svg+xml;utf8,${cleaned}") ${hotspotX} ${hotspotY}, auto`;
}

export const BRUSH_SETTINGS = {
	BRUSH_WIDTH: 3,
	BRUSH_COLOR: '#000000',
};

let virtualHeight: number | null = null;
let virtualWidth: number | null = null;

export function applyCanvasMode(
	canvas: fabric.Canvas,
	mode: TCanvasMode,
	isMouseDownRef: React.MutableRefObject<boolean>,
	saveHistory: () => void,
	loadJSON: (json: string) => void,
	history: string[]
) {
	canvas.off('mouse:move');
	canvas.off('mouse:down');
	canvas.off('mouse:up');
	canvas.off('text:editing:exited');
	canvas.forEachObject(function (o) {
		o.selectable = true;
	});
	if (!virtualHeight || !virtualWidth) {
		virtualWidth = canvas.getWidth();
		virtualHeight = canvas.getHeight();
	}

	canvas.on('mouse:wheel', function (opt) {
		const delta = opt.e.deltaY;
		let zoom = canvas.getZoom();
		zoom *= 0.999 ** delta;
		if (zoom > 20) zoom = 20;
		if (zoom < 1) zoom = 1;
		canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
		opt.e.preventDefault();
		opt.e.stopPropagation();
	});

	if (mode === 'select') {
		canvas.isDrawingMode = false;
		canvas.selection = true;
		canvas.skipTargetFind = false;
		canvas.getObjects().forEach((obj) => {
			obj.selectable = true;
		});
		canvas.defaultCursor = 'default';
		canvas.hoverCursor = 'move';
	} else if (mode === 'drag') {
		canvas.isDrawingMode = false;
		canvas.skipTargetFind = true;
		canvas.selection = false;
		canvas.defaultCursor = 'grab';
		canvas.hoverCursor = 'grab';
		canvas.upperCanvasEl.style.cursor = 'grab';
		canvas.on('mouse:down', function (opt) {
			const evt = opt.e;
			canvas.isDrawingMode = false;
			canvas.skipTargetFind = true;
			canvas.selection = false;
			canvas.getObjects().forEach((obj) => (obj.selectable = false));
			canvas.defaultCursor = 'grabbing';
			canvas.hoverCursor = 'grabbing';
			canvas.upperCanvasEl.style.cursor = 'grabbing';
			this.isDragging = true;
			this.selection = false;
			this.lastPosX = evt.clientX;
			this.lastPosY = evt.clientY;
		});
		canvas.on('mouse:move', function (opt) {
			if (this.isDragging) {
				canvas.defaultCursor = 'grabbing';
				canvas.hoverCursor = 'grabbing';
				canvas.upperCanvasEl.style.cursor = 'grabbing';
				const e = opt.e;
				const vpt = this.viewportTransform;
				const zoom = canvas.getZoom();

				const dx = e.clientX - this.lastPosX;
				const dy = e.clientY - this.lastPosY;

				vpt[4] += dx;
				vpt[5] += dy;

				// Get visible canvas dimensions
				const canvasWidth = canvas.getWidth();
				const canvasHeight = canvas.getHeight();

				// Calculate limits in transformed (screen) coordinates
				const minX = canvasWidth - virtualWidth * zoom;
				const minY = canvasHeight - virtualHeight * zoom;
				const maxX = 0;
				const maxY = 0;

				// Clamp translation
				vpt[4] = Math.min(maxX, Math.max(minX, vpt[4]));
				vpt[5] = Math.min(maxY, Math.max(minY, vpt[5]));
				this.requestRenderAll();
				this.lastPosX = e.clientX;
				this.lastPosY = e.clientY;
			}
		});
		canvas.on('mouse:up', function (opt) {
			this.setViewportTransform(this.viewportTransform);
			this.isDragging = false;
			this.selection = true;
			canvas.defaultCursor = 'grab';
			canvas.hoverCursor = 'grab';
			canvas.upperCanvasEl.style.cursor = 'grab';
		});
	} else if (mode === 'draw') {
		canvas.isDrawingMode = true;
		canvas.selection = false;
		canvas.skipTargetFind = true;
		canvas.getObjects().forEach((obj) => (obj.selectable = false));
		const brush = new fabric.PencilBrush(canvas);
		canvas.freeDrawingCursor = `${svgCursorStringify(PenIcon)}`;
		canvas.defaultCursor = `${svgCursorStringify(PenIcon)}`;
		brush.width = BRUSH_SETTINGS.BRUSH_WIDTH;
		brush.color = BRUSH_SETTINGS.BRUSH_COLOR;
		canvas.freeDrawingBrush = brush;
	} else if (mode === 'erase') {
		canvas.defaultCursor = `${svgCursorStringify(EraserIcon)}`;
		canvas.isDrawingMode = false;
		canvas.skipTargetFind = false;
		canvas.selection = false;
		canvas.getObjects().forEach((obj) => {
			obj.selectable = false;
			obj.hasControls = false;
			obj.hasBorders = false;
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleMouseMove = (options: any) => {
			canvas.hoverCursor = `${svgCursorStringify(EraserIcon)}`;
			canvas.getObjects().forEach((obj) => {
				obj.selectable = false;
				obj.hasControls = false;
				obj.hasBorders = false;
			});
			canvas.selection = false;
			if (isMouseDownRef.current && options.target) {
				canvas.remove(options.target);
				saveHistory();
			}
		};
		canvas.on('mouse:move', handleMouseMove);
	} else if (mode === 'text') {
		canvas.isDrawingMode = false;
		canvas.defaultCursor = `${svgCursorStringify(TextIcon)}`;
		canvas.on('text:editing:exited', () => {
			canvas.discardActiveObject();
			canvas.requestRenderAll();
			saveHistory();
		});

		let myx = true;
		const handleMouseDown = (event: any) => {
			if (mode !== 'text' || !event.pointer) return;

			if (myx) {
				const { x, y } = canvas.getPointer(event.e);

				const textbox = new fabric.Textbox('', {
					left: x,
					top: y,
					fontSize: 24,
					fill: '#000000',
					editable: true,
					fontFamily: 'Verdana',
					width: 200,
				});
				addConvertTextControl(textbox);

				canvas.add(textbox);
				canvas.setActiveObject(textbox);
				textbox.enterEditing();

				myx = false;
				canvas.requestRenderAll();
			}
		};

		canvas.on('mouse:down', handleMouseDown);
		return () => {
			canvas.off('mouse:down', handleMouseDown);
		};
	}

	if (history.length > 0) {
		loadJSON(history[history.length - 1]);
	}
}

function convertToPaths(json) {
	const { paths } = json;
	const fabricPaths = [];

	for (const pathArray of paths) {
		const d = pathArray.map((cmd) => cmd.join(' ')).join(' ');
		const path = new fabric.Path(d, {
			fill: null,
			stroke: 'black',
			selectable: true,
			originX: 'center',
			originY: 'center',
			centeredScaling: true,
		});
		fabricPaths.push(path);
	}

	return fabricPaths;
}

function splitPathWhilePreservingPosition(originalPath: fabric.Path) {
	const canvas = originalPath.canvas;
	if (!canvas) return;

	const originalTransform = {
		matrix: originalPath.calcTransformMatrix(),
		left: originalPath.left,
		top: originalPath.top,
		scaleX: originalPath.scaleX,
		scaleY: originalPath.scaleY,
		angle: originalPath.angle,
		originX: originalPath.originX,
		originY: originalPath.originY,
	};

	const subpaths = splitIntoSubpaths(originalPath);

	canvas.remove(originalPath);

	subpaths.forEach((subpath) => {
		const relativeCenter = getRelativeSubpathCenter(subpath, originalPath);

		const absolutePosition = fabric.util.transformPoint(relativeCenter, originalTransform.matrix);

		subpath.set({
			left: absolutePosition.x,
			top: absolutePosition.y,
			originX: 'center',
			originY: 'center',
			scaleX: 1,
			scaleY: 1,
			angle: 0,
			flipX: false,
			flipY: false,
		});

		canvas.add(subpath);
	});

	canvas.requestRenderAll();
	saveHistoryExternal();
}

function getRelativeSubpathCenter(subpath: fabric.Path, original: fabric.Path) {
	const subpathBounds = subpath.getBoundingRect();

	return new fabric.Point(
		subpathBounds.left + subpathBounds.width / 2 - original.width / 2,
		subpathBounds.top + subpathBounds.height / 2 - original.height / 2
	);
}

function splitIntoSubpaths(originalPath: fabric.Path) {
	const subpaths: fabric.Path[] = [];
	let currentSubpath: any[] = [];
	const pathData = originalPath.path;

	pathData.forEach((command, index) => {
		if (command[0] === 'M' && index !== 0) {
			subpaths.push(createSubpath(currentSubpath, originalPath));
			currentSubpath = [];
		}
		currentSubpath.push(command);
	});

	if (currentSubpath.length > 0) {
		subpaths.push(createSubpath(currentSubpath, originalPath));
	}

	return subpaths;
}

function createSubpath(commands: any[], original: fabric.Path) {
	return new fabric.Path(commands, {
		fill: original.fill,
		stroke: original.stroke,
		strokeWidth: original.strokeWidth,
	});
}

export const fromTextToObject = async (canvas, text, top, left) => {
	canvas.discardActiveObject();
	canvas.selection = true;
	canvas.skipTargetFind = false;
	canvas.selectionFullyContained = false;

	const json = await textToImage(text || '');
	// console.log(JSON.stringify(json));

	const pathObjects = convertToPaths(json);

	pathObjects.forEach((path) => {
		path.set({ left: left, top: top });
		canvas.add(path);
	});

	const lastObject = canvas.getObjects().pop();

	if (lastObject && lastObject.type === 'path') {
		splitPathWhilePreservingPosition(lastObject as fabric.Path);
	}

	canvas.renderAll();

	canvas.requestRenderAll();
	saveHistoryExternal();
};

export let canvasRef: any;
export const setCanvasRef = (ref) => {
	canvasRef = ref;
};
