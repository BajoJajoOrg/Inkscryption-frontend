import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import * as fabric from 'fabric';
import styles from './styles.module.scss';

import { Toolbar } from '../CanvasToolbar/CanvasToolbar';
import {
	JSONtoBlob,
	TCanvasMode,
	saveCanvasState,
	loadCanvasState,
	extractTextFromCanvas,
	registerPointerTracking,
	applyCanvasMode,
	initializeCanvas,
	setSaveHistoryExternal,
	setCanvasRef,
	setSaveCanvasExternal,
	setExtractTextExternal,
	exportCanvasAsJPEG,
	exportCanvasAsPDF,
	exportCanvasAsPNG,
	exportCanvasAsSVG,
	addConvertTextControl,
} from ':lib/canvas';
import { useParams } from 'react-router-dom';
import { getCanvasById, updateCanvas } from ':api';
import { CanvasTextDrawer } from ':components/CanvasTextDrawer/CanvasTextDrawer';
import { addImage } from ':lib/canvas/uploadImage';

type FabricCanvasProps = {
	name?: string;
};

export const FabricCanvas = ({ name }: FabricCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const initializedRef = useRef(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { id } = useParams<{ id: string }>();

	const [history, setHistory] = useState<string[]>([]);
	const [undoneHistory, setUndoneHistory] = useState<string[]>([]);
	const [mode, setMode] = useState<TCanvasMode>('draw');

	const isMouseDownRef = useRef(false);
	const modeRef = useRef<TCanvasMode>('draw');

	const forceReloadCanvas = () => {
		setTimeout(() => {
			if (fabricRef.current) {
				fabricRef.current.setWidth(containerRef.current!.clientWidth);
				fabricRef.current.setHeight(containerRef.current!.clientHeight);
				fabricRef.current.requestRenderAll();
			}
		}, 0);
	};

	const saveHistory = useCallback(() => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		const json = saveCanvasState(canvas);
		setHistory((prev) => [...prev, json]);
		setUndoneHistory([]);
	}, []);

	const loadJSON = useCallback((json: string) => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		loadCanvasState(canvas, json);
		forceReloadCanvas();
	}, []);

	const applyCurrentMode = useCallback(() => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		applyCanvasMode(canvas, modeRef.current, isMouseDownRef, saveHistory, loadJSON, history);
		forceReloadCanvas();
	}, [history, loadJSON, saveHistory]);

	useLayoutEffect(() => {
		if (!containerRef.current || initializedRef.current) return;

		const bounds = containerRef.current.getBoundingClientRect();

		const canvas = initializeCanvas({
			canvasRef: canvasRef.current!,
			width: bounds.width,
			height: bounds.height,
			saveHistory,
		});
		canvas.on('text:editing:entered', () => {
			toggleMode('select');
			applyCurrentMode();
		});

		fabricRef.current = canvas;
		initializedRef.current = true;
		applyCurrentMode();

		getCanvasById(id || '0').then(async (res) => {
			try {
				console.log(res.text);
				localStorage.setItem('aitext', res.text);
				const jsonCanvas = JSON.parse(atob(res.data));
				loadJSON(jsonCanvas);
				setHistory([jsonCanvas]);
			} catch {
				console.error('Не получилось загрузить канвас.');
			}
		});
		forceReloadCanvas();
	}, [applyCurrentMode, saveHistory, id, loadJSON]);

	useEffect(() => {
		const cleanup = registerPointerTracking(isMouseDownRef);
		if (fabricRef.current) saveHistory();
		return cleanup;
	}, [saveHistory]);

	useEffect(() => {
		setSaveHistoryExternal(saveHistory);
	}, [saveHistory]);

	useEffect(() => {
		setCanvasRef(fabricRef.current);
	}, [fabricRef]);

	useEffect(() => {
		if (!containerRef.current || !fabricRef.current) return;

		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			const canvas = fabricRef.current!;
			canvas.setWidth(width);
			canvas.setHeight(height);
			canvas.renderAll();
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, []);

	const handleUndo = useCallback(() => {
		if (history.length <= 1) return;
		const currentJSON = history[history.length - 1];
		setUndoneHistory((prev) => [...prev, currentJSON]);
		const newHistory = history.slice(0, -1);
		setHistory(newHistory);
		loadJSON(newHistory[newHistory.length - 1]);
	}, [history, loadJSON]);

	const handleRedo = useCallback(() => {
		if (undoneHistory.length === 0) return;
		const redoneJSON = undoneHistory[undoneHistory.length - 1];
		setUndoneHistory((prev) => prev.slice(0, -1));
		setHistory((prev) => [...prev, redoneJSON]);
		loadJSON(redoneJSON);
	}, [undoneHistory, loadJSON]);

	const handleSaveCanvas = useCallback(async () => {
		const saveData = history[history.length - 1];
		const blob = JSONtoBlob(saveData);
		await updateCanvas(id || '0', blob);
	}, [history, id]);

	const handleGetText = useCallback(async () => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		localStorage.setItem('aitext', 'Обработка...');
		handleSaveCanvas();
		const extracted = await extractTextFromCanvas(canvas, id || '0');
		localStorage.setItem('aitext', extracted);
	}, [id, handleSaveCanvas]);

	const handleRecordAudio = useCallback(
		async (file: File, text: string) => {
			const canvas = fabricRef.current;
			if (!canvas) return;

			// Переключаем в режим text
			toggleMode('text');
			applyCurrentMode();

			// Создаем Textbox с текстом
			const textbox = new fabric.Textbox(text, {
				left: 100, // Фиксированные координаты, можно настроить
				top: 100,
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
			canvas.requestRenderAll();
			saveHistory();
		},
		[applyCurrentMode, saveHistory]
	);

	const toggleMode = (mode: TCanvasMode) => {
		setMode(mode);
		modeRef.current = mode;
	};

	useEffect(() => {
		setSaveCanvasExternal(handleSaveCanvas);
	}, [handleSaveCanvas]);

	useEffect(() => {
		setExtractTextExternal(handleGetText);
	}, [handleGetText]);

	const [TextDrawer, showTD] = CanvasTextDrawer();

	return (
		<div>
			<Toolbar
				isDrawing={mode === 'draw'}
				isSelecting={mode === 'select'}
				isErasing={mode === 'erase'}
				isTextMode={mode === 'text'}
				isDragging={mode === 'drag'}
				onToggleDraw={() => {
					toggleMode('draw');
					applyCurrentMode();
				}}
				onToggleErase={() => {
					toggleMode('erase');
					applyCurrentMode();
				}}
				onToggleText={() => {
					toggleMode('text');
					applyCurrentMode();
				}}
				onToggleSelect={() => {
					toggleMode('select');
					applyCurrentMode();
				}}
				onUndo={handleUndo}
				onRedo={handleRedo}
				onToggleDrag={() => {
					toggleMode('drag');
					applyCurrentMode();
				}}
				onExportPng={() => exportCanvasAsPNG(fabricRef.current!, name!)}
				onExportJpeg={() => exportCanvasAsJPEG(fabricRef.current!, name!)}
				onExportSvg={() => exportCanvasAsSVG(fabricRef.current!, name!)}
				onExportPdf={() => exportCanvasAsPDF(fabricRef.current!, name!)}
				onUpload={(file: File) => {
					toggleMode('select');
					applyCurrentMode();
					addImage(file, fabricRef.current);
				}}
				onShowAIDrawer={showTD}
				onRecordAudio={handleRecordAudio}
			/>
			{TextDrawer}
			<div ref={containerRef} className={styles.canvasWrap}>
				<canvas ref={canvasRef} />
			</div>
		</div>
	);
};
