/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fabric from 'fabric';
import { TCanvasMode } from './types';
import AIIcon from '../../assets/svg/icons/ai.svg';

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
		console.log('render called');
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
		mouseUpHandler: () => {
			console.log(AIIcon);
		},
		render: renderIcon(AIImg),
		cornerSize: 24,
	});
};
