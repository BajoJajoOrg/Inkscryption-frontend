/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fabric from 'fabric';
import { TCanvasMode } from './types';
import AIIcon from '../../assets/svg/icons/ai.svg';
import { textToImage } from ':services/api';
import { saveHistoryExternal } from './canvasHistory';

const AIImg = document.createElement('img');
AIImg.src = AIIcon;

export function applyCanvasMode(
	canvas: fabric.Canvas,
	mode: TCanvasMode,
	isMouseDownRef: React.MutableRefObject<boolean>,
	saveHistory: () => void,
	loadJSON: (json: string) => void,
	history: string[]
) {
	canvas.off('mouse:move');
	canvas.off('text:editing:exited');

	if (mode === 'select') {
		canvas.isDrawingMode = false;
		canvas.selection = true;
		canvas.skipTargetFind = false;
		canvas.getObjects().forEach((obj) => (obj.selectable = true));
	} else if (mode === 'draw') {
		canvas.isDrawingMode = true;
		canvas.selection = false;
		canvas.skipTargetFind = false;
		canvas.getObjects().forEach((obj) => (obj.selectable = false));
		const brush = new fabric.PencilBrush(canvas);
		brush.width = 3;
		brush.color = '#000000';
		canvas.freeDrawingBrush = brush;
	} else if (mode === 'erase') {
		canvas.isDrawingMode = false;
		canvas.selection = false;
		canvas.skipTargetFind = false;
		canvas.getObjects().forEach((obj) => (obj.selectable = false));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleMouseMove = (options: any) => {
			if (isMouseDownRef.current && options.target) {
				canvas.remove(options.target);
				saveHistory();
			}
		};
		canvas.on('mouse:move', handleMouseMove);
	} else if (mode === 'text') {
		canvas.isDrawingMode = false;
		canvas.on('text:editing:exited', () => {
			canvas.discardActiveObject();
			canvas.requestRenderAll();
			saveHistory();
		});

		let myx = true;
		const handleMouseDown = (event: any) => {
			if (mode !== 'text' || !event.pointer) return;

			if (myx) {
				const { x, y } = event.pointer;

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

function renderIcon(icon: any) {
	return function (ctx: any, left: any, top: any, _styleOverride: any, fabricObject: any) {
		const size = this.cornerSize;
		ctx.save();
		ctx.translate(left, top);
		ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
		ctx.drawImage(icon, -size / 2, -size / 2, size, size);
		ctx.restore();
	};
}

export const addConvertTextControl = (textbox: any) => {
	textbox.controls.convertControl = new fabric.Control({
		x: 0.5,
		y: -0.5,
		offsetY: -16,
		offsetX: 16,
		cursorStyle: 'pointer',
		mouseUpHandler: async () => {
			const canvas = textbox.canvas;
			const oldLeft = textbox.left;
			const oldTop = textbox.top;
			canvas.discardActiveObject();
			canvas.remove(textbox);
			canvas.selection = true;
			canvas.skipTargetFind = false;
			canvas.selectionFullyContained = false;

			const json = await textToImage(textbox.text || '');
			console.log(JSON.stringify(json));

			const pathObjects = convertToPaths(json);

			pathObjects.forEach((path) => {
				path.set({ left: oldLeft, top: oldTop });
				canvas.add(path);
			});

			const lastObject = canvas.getObjects().pop();

			if (lastObject && lastObject.type === 'path') {
				splitPathWhilePreservingPosition(lastObject as fabric.Path);
			}

			canvas.renderAll();

			canvas.requestRenderAll();
			saveHistoryExternal();
		},
		render: renderIcon(AIImg),
		cornerSize: 24,
	});
};

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
	console.log(JSON.stringify(json));

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

export let canvasRef;
export const setCanvasRef = (ref) => {
	canvasRef = ref;
};
