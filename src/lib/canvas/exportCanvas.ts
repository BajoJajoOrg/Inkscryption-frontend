import * as fabric from 'fabric';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export const exportCanvasAsPNG = (canvas: fabric.Canvas, name: string) => {
	const originalTransform = canvas.viewportTransform;
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
	const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
	canvas.setViewportTransform(originalTransform);
	downloadDataURL(dataUrl, `${name}.png`);
};

export const exportCanvasAsJPEG = (canvas: fabric.Canvas, name: string) => {
	const originalTransform = canvas.viewportTransform;
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
	const dataUrl = canvas.toDataURL({ format: 'jpeg', multiplier: 1 });
	canvas.setViewportTransform(originalTransform);
	downloadDataURL(dataUrl, `${name}.jpeg`);
};

export const exportCanvasAsSVG = (canvas: fabric.Canvas, name: string) => {
	const svg = canvas.toSVG();
	const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
	saveAs(blob, `${name}.svg`);
};

export const exportCanvasAsPDF = (canvas: fabric.Canvas, name: string) => {
	const originalTransform = canvas.viewportTransform;
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

	const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });

	canvas.setViewportTransform(originalTransform);

	const pdf = new jsPDF();
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();

	const canvasWidth = canvas.getWidth();
	const canvasHeight = canvas.getHeight();

	const scaleX = pageWidth / canvasWidth;
	const scaleY = pageHeight / canvasHeight;
	const scale = Math.min(scaleX, scaleY);

	const imgWidth = canvasWidth * scale;
	const imgHeight = canvasHeight * scale;

	const offsetX = (pageWidth - imgWidth) / 2;
	const offsetY = (pageHeight - imgHeight) / 2;

	pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
	pdf.save(`${name}.pdf`);
};

const downloadDataURL = (dataUrl: string, filename: string) => {
	const link = document.createElement('a');
	link.href = dataUrl;
	link.download = filename;
	link.click();
};
