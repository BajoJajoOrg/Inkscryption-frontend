// components/FabricCanvas.tsx
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
} from ':lib/canvas';
import { useParams } from 'react-router-dom';
import { getCanvasById, updateCanvas } from ':api/api';
import { CanvasUploadDrawer } from ':components/CanvasUploadDrawer/CanvasUploadDrawer';
import { CanvasTextDrawer } from ':components/CanvasTextDrawer/CanvasTextDrawer';

export const FabricCanvas = () => {
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
	}, []);

	const applyCurrentMode = useCallback(() => {
		const canvas = fabricRef.current;
		if (!canvas) return;
		applyCanvasMode(canvas, modeRef.current, isMouseDownRef, saveHistory, loadJSON, history);
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

	const [UploadDrawer, showUD] = CanvasUploadDrawer();
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
				onShowFileDrawer={showUD}
				onShowAIDrawer={showTD}
			/>
			{UploadDrawer}
			{TextDrawer}
			<div ref={containerRef} className={styles.canvasWrap}>
				<canvas ref={canvasRef} />
			</div>
		</div>
	);
};
