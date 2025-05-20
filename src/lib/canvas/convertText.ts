import { getOcr, textToImage } from ':api';
import { saveHistoryExternal } from './canvasHistory';
import * as fabric from 'fabric';

const convertToPaths = (json) => {
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
};

const splitPathWhilePreservingPosition = (originalPath: fabric.Path) => {
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
};

const getRelativeSubpathCenter = (subpath: fabric.Path, original: fabric.Path) => {
	const subpathBounds = subpath.getBoundingRect();

	return new fabric.Point(
		subpathBounds.left + subpathBounds.width / 2 - original.width / 2,
		subpathBounds.top + subpathBounds.height / 2 - original.height / 2
	);
};

const splitIntoSubpaths = (originalPath: fabric.Path) => {
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
};

const createSubpath = (commands: any[], original: fabric.Path) => {
	return new fabric.Path(commands, {
		fill: original.fill,
		stroke: original.stroke,
		strokeWidth: original.strokeWidth,
	});
};

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

export const convertText = async (textbox: fabric.FabricObject) => {
	const canvas = textbox.canvas;
	const oldLeft = textbox.left;
	const oldTop = textbox.top;
	if (!canvas) return;
	canvas.discardActiveObject();
	canvas.remove(textbox);
	canvas.selection = true;
	canvas.skipTargetFind = false;
	canvas.selectionFullyContained = false;
	const cursorOldDef = canvas.defaultCursor;
	const cursorOldHov = canvas.hoverCursor;
	canvas.defaultCursor = 'progress';
	canvas.hoverCursor = 'progress';
	const json = await textToImage(textbox.text || '');
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
	canvas.defaultCursor = cursorOldDef;
	canvas.hoverCursor = cursorOldHov;
};

const fileFromImageObject = (image: fabric.Image, filename = 'image.png'): File | null => {
	const src = (image.getElement() as HTMLImageElement)?.src;

	if (!src?.startsWith('data:')) {
		console.error('Image src is not a valid dataURL');
		return null;
	}

	const arr = src.split(',');
	const mimeMatch = arr[0].match(/:(.*?);/);
	if (!mimeMatch) return null;

	const mime = mimeMatch[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type: mime });
};

export const convertImage = async (image: fabric.Image) => {
	const canvas = image.canvas;
	if (!canvas) return;

	const file = fileFromImageObject(image);
	if (!file) return;

	const oldLeft = image.left;
	const oldTop = image.top;

	const cursorOldDef = canvas.defaultCursor;
	const cursorOldHov = canvas.hoverCursor;
	canvas.defaultCursor = 'progress';
	canvas.hoverCursor = 'progress';
	image.set('opacity', 0.5);
	canvas.requestRenderAll();

	try {
		const result = await getOcr(file, '0');
		const text = result.text;

		const json = await textToImage(text || '');
		const pathObjects = convertToPaths(json);

		pathObjects.forEach((path) => {
			path.set({ left: oldLeft, top: oldTop });
			canvas.add(path);
		});

		const lastObject = canvas.getObjects().pop();
		if (lastObject && lastObject.type === 'path') {
			splitPathWhilePreservingPosition(lastObject as fabric.Path);
		}

		canvas.remove(image);
		canvas.requestRenderAll();
		saveHistoryExternal();
	} catch (err) {
		console.error('Image-to-text conversion failed:', err);
	} finally {
		image.set('opacity', 1);
		canvas.defaultCursor = cursorOldDef;
		canvas.hoverCursor = cursorOldHov;
	}
};
