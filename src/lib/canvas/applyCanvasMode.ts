/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fabric from 'fabric';
import { TCanvasMode } from './types';
import AIIcon from '../../assets/svg/icons/ai.svg';
import { textToImage } from ':api/api';
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

			const { svg, width, height } = convertToSVG(json);
			const loadedSVG = await fabric.loadSVGFromString(svg);

			const tt = fabric.util.groupSVGElements(loadedSVG.objects, loadedSVG.options);

			tt.set({
				scaleY: 1,
				scaleX: 1,
				originX: 'center',
				originY: 'center',
				visible: true,
				centeredScaling: true,
				selectable: true,
				fill: '#000000',
			});

			tt.setPositionByOrigin(new fabric.Point(oldLeft, oldTop), 'center', 'center');
			canvas.add(tt);

			canvas.renderAll();

			canvas.requestRenderAll();
			saveHistoryExternal();
		},
		render: renderIcon(AIImg),
		cornerSize: 24,
	});
};

function convertToSVG(json) {
	const { paths, background } = json;

	let maxX = 0;
	let maxY = 0;

	const dStrings = paths.map((pathArray) => {
		return pathArray
			.map((cmd) => {
				// Пропускаем первую строку (буква команды)
				const coords = cmd.slice(1);
				for (let i = 0; i < coords.length; i += 2) {
					const x = coords[i];
					const y = coords[i + 1];
					if (typeof x === 'number' && typeof y === 'number') {
						if (x > maxX) maxX = x;
						if (y > maxY) maxY = y;
					}
				}
				return cmd.join(' ');
			})
			.join(' ');
	});

	console.log(maxX, maxY);

	const width = 100;
	const height = 100;

	const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<rect width="100%" height="100%" fill="${'none'}" />
	${dStrings.map((d) => `<path d="${d}" stroke="black" fill="none" />`).join('\n  ')}
  </svg>
	`.trim();

	return { svg, width, height };
}
