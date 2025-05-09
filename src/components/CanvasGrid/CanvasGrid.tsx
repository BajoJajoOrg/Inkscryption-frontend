import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CanvasData, DirectoryData, createCanvas, createDirectory, deleteDirectory } from ':api';
import styles from './styles.module.scss';
import NoteIcon from ':svg/note.svg?react';
import FolderIcon from ':svg/icons/folder.svg?react';
import { Input, message, Modal } from 'antd';
import dayjs from 'dayjs';

interface DirectoryContent {
	canvases: CanvasData[];
	directories: DirectoryData[];
}

interface CanvasGridProps {
	content: DirectoryContent;
	directoryId?: number;
}

const CanvasGrid: React.FC<CanvasGridProps> = memo(({ content, directoryId }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isAddingCanvas, setIsAddingCanvas] = useState(false);
	const [isAddingDirectory, setIsAddingDirectory] = useState(false);
	const [newCanvasTitle, setNewCanvasTitle] = useState('');
	const [newDirectoryTitle, setNewDirectoryTitle] = useState('');

	const canvasMutation = useMutation({
		mutationFn: (title: string) => createCanvas(title, directoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			setNewCanvasTitle('');
			message.success('Лист успешно создан');
			setIsAddingCanvas(false);
		},
		onError: (error) => {
			message.error('Не удалось создать лист');
			setIsAddingCanvas(false);
		},
	});

	const directoryMutation = useMutation({
		mutationFn: (title: string) => createDirectory(title, directoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			setNewDirectoryTitle('');
			message.success('Директория успешно создана');
			setIsAddingDirectory(false);
		},
		onError: (error) => {
			message.error('Не удалось создать директорию');
			setIsAddingDirectory(false);
		},
	});

	const deleteDirectoryMutation = useMutation({
		mutationFn: (directoryId: number) => deleteDirectory(directoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			message.success('Директория успешно удалена');
		},
		onError: (error) => {
			message.error('Не удалось удалить директорию');
		},
	});

	const handleAddCanvas = () => {
		setIsAddingCanvas(true);
	};

	const handleAddDirectory = () => {
		setIsAddingDirectory(true);
	};

	const handleCreateCanvas = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && newCanvasTitle.trim() && !canvasMutation.isPending) {
			canvasMutation.mutate(newCanvasTitle);
		}
	};

	const handleCreateDirectory = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && newDirectoryTitle.trim() && !directoryMutation.isPending) {
			directoryMutation.mutate(newDirectoryTitle);
		}
	};

	const handleDeleteDirectory = (directoryId: number, directoryName: string) => {
		Modal.confirm({
			title: 'Подтверждение удаления',
			content: `Вы уверены, что хотите удалить директорию "${directoryName}"?`,
			okText: 'Удалить',
			cancelText: 'Отмена passada',
			onOk: () => {
				deleteDirectoryMutation.mutate(directoryId);
			},
		});
	};

	return (
		<div className={styles.gridContainer}>
			{!isAddingCanvas && !isAddingDirectory && (
				<>
					<div onClick={handleAddCanvas} className={styles.newCanvasContainer}>
						<span>+ Новый лист</span>
					</div>
					<div onClick={handleAddDirectory} className={styles.newCanvasContainer}>
						<span>+ Новая директория</span>
					</div>
				</>
			)}

			{isAddingCanvas && (
				<div className={styles.canavsContainer}>
					<NoteIcon />
					<Input
						value={newCanvasTitle}
						onChange={(e) => setNewCanvasTitle(e.target.value)}
						onKeyDown={handleCreateCanvas}
						placeholder="Введите название листа"
						className={styles.titleInput}
						autoFocus
						disabled={canvasMutation.isPending}
					/>
					<span className={styles.date}>{new Date().toLocaleDateString('ru-RU')}</span>
				</div>
			)}

			{isAddingDirectory && (
				<div className={styles.canavsContainer}>
					<FolderIcon />
					<Input
						value={newDirectoryTitle}
						onChange={(e) => setNewDirectoryTitle(e.target.value)}
						onKeyDown={handleCreateDirectory}
						placeholder="Введите название директории"
						className={styles.titleInput}
						autoFocus
						disabled={directoryMutation.isPending}
					/>
					<span className={styles.date}>{new Date().toLocaleDateString('ru-RU')}</span>
				</div>
			)}

			{content.directories.map((directory) => (
				<div key={`dir-${directory.id}`} className={styles.canavsContainer}>
					<div onClick={() => navigate(`/directory/${directory.id}`)}>
						<FolderIcon />
						<span className={styles.title}>{directory.name}</span>
						<span className={styles.date}>
							{dayjs(directory.updated_at).format('DD.MM.YYYY')}
						</span>
					</div>
					<button
						onClick={() => handleDeleteDirectory(directory.id, directory.name)}
						className={styles.deleteButton}
						aria-label={`Удалить директорию ${directory.name}`}
					>
						🗑️
					</button>
				</div>
			))}

			{content.canvases.map((canvas) => (
				<div
					key={`canvas-${canvas.id}`}
					onClick={() => navigate(`/canvas/${canvas.id}`)}
					className={styles.canavsContainer}
				>
					<NoteIcon />
					<span className={styles.title}>{canvas.canvas_name}</span>
					<span className={styles.date}>{dayjs(canvas.update_time).format('DD.MM.YYYY')}</span>
				</div>
			))}
		</div>
	);
});

export { CanvasGrid };
