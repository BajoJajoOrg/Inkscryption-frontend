import { FC, useEffect, useRef, useState } from 'react';
import BrushIcon from ':svg/icons/pen.svg';
import EraserIcon from ':svg/icons/eraser.svg';
import TextIcon from ':svg/icons/text.svg';
import MoveIcon from ':svg/icons/pointer.svg';
import UndoIcon from ':svg/icons/undo.svg';
import RedoIcon from ':svg/icons/redo.svg';
import AIIcon from ':svg/icons/ai_b.svg';
import UploadIcon from ':svg/icons/upload.svg';
import ExportIcon from ':svg/icons/export.svg';
import TourIcon from ':svg/icons/tour.svg';
import PanIcon from ':svg/icons/pan_b.svg';
// Временная замена для MicrophoneIcon, замените на :svg/icons/microphone.svg
import MicrophoneIcon from ':svg/icons/pen.svg';
import { Modal, Tour, Tooltip, Popover, Button } from 'antd';
import clsx from 'clsx';

import PencilTour from ':gif/pencilTour.gif';
import EraserTour from ':gif/eraserTour.gif';
import CursorTour from ':gif/cursorTour.gif';
import TextTour from ':gif/textTour.gif';
// Временная замена для MicrophoneTour, замените на :gif/microphoneTour.gif
import MicrophoneTour from ':gif/pencilTour.gif';

import { TourProps } from 'antd';
import styles from './styles.module.scss';
import { CanvasBrushMenu } from ':components/CanvasBrushMenu/CanvasBrushMenu';
import { CanvasFileUpload } from ':components/CanvasFileUpload/CanvasFileUpload';
import { CanvasExportPopover } from ':components/CanvasExport/CanvasExport';

interface ToolbarProps {
	isDrawing: boolean;
	isErasing: boolean;
	isSelecting: boolean;
	isTextMode: boolean;
	isDragging: boolean;
	onToggleDraw: () => void;
	onToggleErase: () => void;
	onToggleSelect: () => void;
	onToggleText: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onToggleDrag: () => void;
	onUpload: (file: File) => void;
	onExportPng: () => void;
	onExportJpeg: () => void;
	onExportSvg: () => void;
	onExportPdf: () => void;
	onShowAIDrawer: () => void;
	onRecordAudio: (file: File) => Promise<void>;
}

export const Toolbar: FC<ToolbarProps> = ({
	isDrawing,
	isErasing,
	isSelecting,
	isTextMode,
	isDragging,
	onToggleDraw,
	onToggleErase,
	onToggleSelect,
	onToggleText,
	onUndo,
	onRedo,
	onToggleDrag,
	onUpload,
	onExportPng,
	onExportJpeg,
	onExportSvg,
	onExportPdf,
	onShowAIDrawer,
	onRecordAudio,
}) => {
	const refPen = useRef(null);
	const refEraser = useRef(null);
	const refCursor = useRef(null);
	const refUndo = useRef(null);
	const refRedo = useRef(null);
	const refUpload = useRef(null);
	const refAI = useRef(null);
	const refText = useRef(null);
	const refTour = useRef(null);
	const refGrab = useRef(null);
	const refExport = useRef(null);
	const refMicrophone = useRef(null);

	const [tourOpen, setTourOpen] = useState<boolean>(false);
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	const steps: TourProps['steps'] = [
		{
			title: 'Карандаш',
			description: 'Выберите его чтобы начать рисовать на канвасе.',
			target: () => refPen.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
			cover: <img alt="Карандаш.gif" src={PencilTour} />,
		},
		{
			title: 'Ластик',
			description: 'Выберите его чтобы начать стирать с канваса.',
			target: () => refEraser.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
			cover: <img alt="Ластик.gif" src={EraserTour} />,
		},
		{
			title: 'Курсор',
			description: 'Выберите его, чтобы перемещать элементы канваса.',
			target: () => refCursor.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
			cover: <img alt="Курсор.gif" src={CursorTour} />,
		},
		{
			title: 'Текст',
			description:
				'Выберите его, чтобы добавить печатный текст на канвас. Чтобы преобразовать его в рукописный, нажмите на кнопку в верхнем правом углу текст-бокса.',
			target: () => refText.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
			cover: <img alt="Текст.gif" src={TextTour} />,
		},
		{
			title: 'Ладонь',
			description: 'Выберите, чтобы перемещаться по канвасу.',
			target: () => refGrab.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
		{
			title: 'Кнопка отмена',
			description: 'Нажмите, чтобы отменить последнее действие.',
			target: () => refUndo.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
		{
			title: 'Кнопка повторить',
			description: 'Нажмите, чтобы повторить отмененное действие.',
			target: () => refRedo.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
		{
			title: 'Загрузка файла',
			description: 'Нажмите, чтобы загрузить файл и преобразовать содержимое в рукописный текст.',
			target: () => refUpload.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
		{
			title: 'Экспорт канваса',
			description: 'Нажмите и выберите нужный тип файла для экспорта.',
			target: () => refExport.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
		{
			title: 'Работа с текстом',
			description: 'Нажмите, чтобы начать работу с текстом (преобразование в печатный и поиск).',
			target: () => refAI.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
		{
			title: 'Запись голоса',
			description: 'Нажмите, чтобы открыть окно записи голоса и отправить аудио.',
			target: () => refMicrophone.current,
			nextButtonProps: { children: 'Продолжить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
			cover: <img alt="Микрофон.gif" src={MicrophoneTour} />,
		},
		{
			title: 'Обучение',
			description: 'Если вдруг что-то забудете, нажмите на эту кнопку, чтобы снова включить обучение.',
			target: () => refTour.current,
			nextButtonProps: { children: 'Завершить', className: styles.tourBtn },
			prevButtonProps: { children: 'Назад' },
		},
	];

	useEffect(() => {
		const tourStatus = localStorage.getItem('tourOpened');
		if (!tourStatus) {
			setTourOpen(true);
			localStorage.setItem('tourOpened', 'true');
		}
	}, []);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mimeType = MediaRecorder.isTypeSupported('audio/wav') ? 'audio/wav' : 'audio/webm';
			mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
			chunksRef.current = [];

			mediaRecorderRef.current.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			mediaRecorderRef.current.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: mimeType });
				const file = new File([blob], 'recording.wav', {
					type: 'audio/wav',
					lastModified: Date.now(),
				});
				setAudioUrl(URL.createObjectURL(blob));
				setAudioFile(file);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorderRef.current.start();
			setIsRecording(true);
		} catch (error) {
			console.error('Ошибка доступа к микрофону:', error);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	const deleteRecording = () => {
		setAudioUrl(null);
		setAudioFile(null);
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	const handleAudioUpload = async () => {
		if (audioFile) {
			const formData = new FormData();
			formData.append('audio_file', audioFile);
			try {
				const response = await fetch('https://sound.hooli-pishem.ru/predict/', {
					method: 'POST',
					body: formData,
				});
				const result = await response.json();
				console.log('Ответ сервера:', result);
				await onRecordAudio(audioFile);
				setModalOpen(false);
				setAudioUrl(null);
				setAudioFile(null);
			} catch (error) {
				console.error('Ошибка при загрузке:', error);
			}
		}
	};

	return (
		<>
			<div className={styles.toolbar}>
				<div className={styles.toolbarContentWrap}>
					<div className={styles.toolbarContentBorder}>
						<div className={styles.toolbarContent}>
							<Popover
								content={<CanvasBrushMenu onToggleDraw={onToggleDraw} />}
								trigger={'click'}
							>
								<Tooltip placement="bottom" title={'Карандаш'}>
									<button
										ref={refPen}
										className={clsx(styles.toolbar__button, isDrawing && styles.selected)}
										onClick={onToggleDraw}
										title="Карандаш"
									>
										<img className={styles.toolbar__icon} src={BrushIcon} />
									</button>
								</Tooltip>
							</Popover>
							<Tooltip placement="bottom" title={'Ластик'}>
								<button
									ref={refEraser}
									className={clsx(styles.toolbar__button, isErasing && styles.selected)}
									onClick={onToggleErase}
									title="Ластик"
								>
									<img className={styles.toolbar__icon} src={EraserIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Курсор'}>
								<button
									ref={refCursor}
									className={clsx(styles.toolbar__button, isSelecting && styles.selected)}
									onClick={onToggleSelect}
									title="Курсор"
								>
									<img className={styles.toolbar__icon} src={MoveIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Текст'}>
								<button
									ref={refText}
									className={clsx(styles.toolbar__button, isTextMode && styles.selected)}
									onClick={onToggleText}
									title="Текст"
								>
									<img className={styles.toolbar__icon} src={TextIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Перемещение'}>
								<button
									ref={refGrab}
									className={clsx(styles.toolbar__button, isDragging && styles.selected)}
									onClick={onToggleDrag}
									title="Ладонь"
								>
									<img className={styles.toolbar__icon} src={PanIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Отменить'}>
								<button
									ref={refUndo}
									className={styles.toolbar__button}
									onClick={onUndo}
									title="Отменить"
								>
									<img className={styles.toolbar__icon} src={UndoIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Повторить'}>
								<button
									ref={refRedo}
									className={styles.toolbar__button}
									onClick={onRedo}
									title="Повторить"
								>
									<img className={styles.toolbar__icon} src={RedoIcon} />
								</button>
							</Tooltip>
							<Popover
								content={<CanvasFileUpload onImageUpload={onUpload} />}
								trigger={'hover'}
							>
								<Tooltip placement="bottom" title={'Импорт'}>
									<button
										ref={refUpload}
										className={styles.toolbar__button}
										title="Загрузить файл"
									>
										<img className={styles.toolbar__icon} src={UploadIcon} />
									</button>
								</Tooltip>
							</Popover>
							<Popover
								content={
									<CanvasExportPopover
										onExportPNG={onExportPng}
										onExportJPEG={onExportJpeg}
										onExportSVG={onExportSvg}
										onExportPDF={onExportPdf}
									/>
								}
								trigger={'hover'}
							>
								<Tooltip placement="bottom" title={'Экспорт'}>
									<button
										ref={refExport}
										className={styles.toolbar__button}
										title="Экспортировать"
									>
										<img className={styles.toolbar__icon} src={ExportIcon} />
									</button>
								</Tooltip>
							</Popover>
							<Tooltip placement="bottom" title={'Извлечь текст'}>
								<button
									ref={refAI}
									className={styles.toolbar__button}
									onClick={onShowAIDrawer}
									title="Извлечение текста"
								>
									<img className={styles.toolbar__icon} src={AIIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Запись голоса'}>
								<button
									ref={refMicrophone}
									className={styles.toolbar__button}
									onClick={() => setModalOpen(true)}
									title="Запись голоса"
								>
									<img className={styles.toolbar__icon} src={MicrophoneIcon} />
								</button>
							</Tooltip>
							<Tooltip placement="bottom" title={'Обучение'}>
								<button
									ref={refTour}
									className={styles.toolbar__button}
									onClick={() => setTourOpen(true)}
									title="Обучение"
								>
									<img className={styles.toolbar__icon} src={TourIcon} />
								</button>
							</Tooltip>
						</div>
					</div>
				</div>
			</div>
			<Tour open={tourOpen} onClose={() => setTourOpen(false)} steps={steps} />
			<Modal
				title="Запись голоса"
				open={modalOpen}
				onCancel={() => {
					stopRecording();
					setModalOpen(false);
					setAudioUrl(null);
					setAudioFile(null);
				}}
				footer={[
					<Button
						key="cancel"
						onClick={() => {
							stopRecording();
							setModalOpen(false);
							setAudioUrl(null);
							setAudioFile(null);
						}}
					>
						Отмена
					</Button>,
					<Button key="delete" onClick={deleteRecording} disabled={!audioFile}>
						Удалить запись
					</Button>,
					<Button key="upload" type="primary" onClick={handleAudioUpload} disabled={!audioFile}>
						Отправить
					</Button>,
				]}
				className={styles.audioModal}
			>
				<div className={styles.audioRecorder}>
					<Button type="primary" onClick={isRecording ? stopRecording : startRecording}>
						{isRecording ? 'Остановить запись' : 'Начать запись'}
					</Button>
					{audioUrl && (
						<div className={styles.audioPreview}>
							<h3>Прослушать запись:</h3>
							<audio src={audioUrl} controls />
						</div>
					)}
				</div>
			</Modal>
		</>
	);
};
