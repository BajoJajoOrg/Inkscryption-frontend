import * as fabric from 'fabric';
import { addCustomControl } from './applyCanvasMode';
import { addConvertImageControl } from './customControls';
export const addImage = async (file: File, canvas: fabric.Canvas | null) => {
	const reader = new FileReader();
	reader.onload = async () => {
		const base64 = reader.result as string;
		if (!canvas) return;

		const img = await fabric.FabricImage.fromURL(base64);
		if (!img) return;

		// Prevent interaction
		canvas.selection = false;
		canvas.skipTargetFind = true;
		canvas.getObjects().forEach((obj) => {
			obj.selectable = false;
			obj.evented = false;
		});

		img.set({
			left: 0,
			top: 0,
			selectable: false,
			evented: false,
			opacity: 0.5,
		});

		canvas.add(img);
		addConvertImageControl(img);
		canvas.renderAll();

		const moveHandler = (opt: fabric.IEvent) => {
			const pointer = canvas.getPointer(opt.e);
			img.set({ left: pointer.x, top: pointer.y });
			canvas.renderAll();
		};

		const placeHandler = () => {
			img.set({
				selectable: false,
				evented: false,
				opacity: 1,
			});

			canvas.off('mouse:move', moveHandler);
			canvas.off('mouse:down', placeHandler);

			// Re-enable interaction
			canvas.selection = true;
			canvas.skipTargetFind = false;
			canvas.getObjects().forEach((obj) => {
				obj.selectable = true;
				obj.evented = true;
			});

			canvas.renderAll();
		};

		canvas.on('mouse:move', moveHandler);
		canvas.on('mouse:down', placeHandler);
	};
	reader.readAsDataURL(file);
};
