import AIIcon from ':svg/icons/ai_b.svg';
import * as fabric from 'fabric';
const AIImg = document.createElement('img');
AIImg.src = AIIcon;

function renderIcon(
	icon: HTMLImageElement,
	backgroundColor = 'rgba(0, 0, 0, 0.85)',
	padding = 5,
	borderRadius = 8
) {
	return function (
		ctx: CanvasRenderingContext2D,
		left: number,
		top: number,
		_styleOverride: any,
		fabricObject: fabric.Object
	) {
		const size = this.cornerSize;
		const totalSize = size + padding * 2;

		ctx.save();
		ctx.translate(left, top);
		ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));

		ctx.fillStyle = backgroundColor;
		ctx.beginPath();

		if (ctx.roundRect) {
			ctx.roundRect(-totalSize / 2, -totalSize / 2, totalSize, totalSize, borderRadius);
		} else {
			const x = -totalSize / 2;
			const y = -totalSize / 2;
			const r = borderRadius;
			const w = totalSize;
			const h = totalSize;

			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
		}

		ctx.fill();

		// Draw icon image centered with padding
		ctx.drawImage(icon, -size / 2, -size / 2, size, size);

		ctx.restore();
	};
}

export const addCustomControl = (object: any, onClick: () => void, image: HTMLImageElement) => {
	object.controls.convertControl = new fabric.Control({
		x: 0.5,
		y: -0.5,
		offsetY: -16,
		offsetX: 16,
		cursorStyle: 'pointer',
		mouseUpHandler: onClick,
		render: renderIcon(image),
		cornerSize: 24,
	});
};

export const addConvertTextControl = (object: fabric.FabricObject) => {
	addCustomControl(object, () => console.log('text convert'), AIImg);
};

export const addConvertImageControl = (object: fabric.FabricObject) => {
	addCustomControl(object, () => console.log('image convert'), AIImg);
};
