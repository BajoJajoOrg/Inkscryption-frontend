import { useState, memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	CanvasData,
	DirectoryData,
	ErrorResponse,
	MoveItemParams,
	createCanvas,
	createDirectory,
	deleteCanvas,
	deleteDirectory,
	moveItem,
	updateCanvas,
	updateDirectory,
} from ':api';
import styles from './styles.module.scss';
import NoteIcon from ':svg/note.svg?react';
import FolderIcon from ':svg/icons/folder.svg?react';
import { Button, Input, message, Modal, Dropdown, MenuProps, notification, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';

interface DirectoryContent {
	canvases: CanvasData[];
	directories: DirectoryData[];
}

interface CanvasGridProps {
	content: DirectoryContent;
	directoryId?: number;
}

interface Item {
	id: number;
	type: 'canvas' | 'folder';
	name: string;
}

const ItemTypes = {
	ITEM: 'item',
};

const itemVariants = {
	initial: { opacity: 0, scale: 0.8 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.8 },
};

const CanvasItem: React.FC<{
	item: CanvasData | DirectoryData;
	isDirectory: boolean;
	isSelected: boolean;
	isMoving: boolean;
	isRenaming: boolean;
	onSelect: (id: number, type: 'canvas' | 'folder', event: React.MouseEvent) => void;
	onNavigate: (path: string) => void;
	onDelete: (id: number, name: string, type: 'canvas' | 'folder') => void;
	onRename: (id: number, type: 'canvas' | 'folder', currentName: string) => void;
}> = ({ item, isDirectory, isSelected, isMoving, isRenaming, onSelect, onNavigate, onDelete, onRename }) => {
	const [{ isDragging }, drag] = useDrag(() => ({
		type: ItemTypes.ITEM,
		item: { id: item.id, type: isDirectory ? 'folder' : 'canvas' },
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	}));

	const contextMenuItems: MenuProps['items'] = [
		{
			key: 'rename',
			label: 'Переименовать',
			onClick: () => {
				onRename(item.id, isDirectory ? 'folder' : 'canvas', item.name);
			},
		},
		{
			key: 'delete',
			label: 'Удалить',
			onClick: () => {
				onDelete(item.id, item.name, isDirectory ? 'folder' : 'canvas');
			},
		},
	];

	return (
		<Dropdown menu={{ items: contextMenuItems }} trigger={['contextMenu']}>
			<div
				ref={drag}
				onContextMenu={(e) => e.stopPropagation()}
				className={`${styles.canavsContainer} ${isSelected ? styles.selected : ''} ${
					isDragging ? styles.dragging : ''
				} ${isMoving ? styles.moving : ''} ${isRenaming ? styles.moving : ''}`}
				data-type={isDirectory ? 'folder' : 'canvas'}
				onClick={(e) => {
					e.stopPropagation();
					onSelect(item.id, isDirectory ? 'folder' : 'canvas', e);
					if (!e.shiftKey) {
						onNavigate(isDirectory ? `/directory/${item.id}` : `/canvas/${item.id}`);
					}
				}}
			>
				{(isMoving || isRenaming) && <Spin size="small" className={styles.movingSpinner} />}
				{isDirectory ? <FolderIcon /> : <NoteIcon />}
				<span className={styles.title}>{item.name}</span>
				<span className={styles.date}>
					{dayjs(isDirectory ? item.updated_at : item.update_time).format('DD.MM.YYYY')}
				</span>
			</div>
		</Dropdown>
	);
};

const DirectoryDropZone: React.FC<{
	directory: DirectoryData;
	onDrop: (item: Item, targetDirectoryId: number) => void;
	children: React.ReactNode;
}> = ({ directory, onDrop, children }) => {
	const [{ isOver }, drop] = useDrop(() => ({
		accept: ItemTypes.ITEM,
		drop: (item: Item) => onDrop(item, directory.id),
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
		}),
	}));

	return (
		<Tooltip title={`Переместить в "${directory.name}"`} visible={isOver}>
			<div ref={drop} className={`${styles.dropZone} ${isOver ? styles.dropZoneActive : ''}`}>
				{children}
			</div>
		</Tooltip>
	);
};

const CanvasGrid: React.FC<CanvasGridProps> = memo(({ content, directoryId }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
	const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
	const [newCanvasTitle, setNewCanvasTitle] = useState('');
	const [newDirectoryTitle, setNewDirectoryTitle] = useState('');
	const [selectedItems, setSelectedItems] = useState<Item[]>([]);
	const [isRenaming, setIsRenaming] = useState<{
		id: number;
		type: 'canvas' | 'folder';
		currentName: string;
	} | null>(null);
	const [deleteModal, setDeleteModal] = useState<{
		open: boolean;
		id: number;
		name: string;
		type: 'canvas' | 'folder';
	} | null>(null);
	const [massDeleteModal, setMassDeleteModal] = useState<boolean>(false);

	const validateTitle = (title: string): boolean => {
		if (!title.trim()) {
			message.error('Название не может быть пустым');
			return false;
		}
		if (title.length > 100) {
			message.error('Название слишком длинное (максимум 100 символов)');
			return false;
		}
		if (/[<>\\/:*?"|]/.test(title)) {
			message.error('Название содержит недопустимые символы');
			return false;
		}
		const isDuplicate = [
			...content.canvases.map((c) => c.name.toLowerCase()),
			...content.directories.map((d) => d.name.toLowerCase()),
		].includes(title.toLowerCase());
		if (isDuplicate) {
			message.error('Элемент с таким названием уже существует');
			return false;
		}
		return true;
	};

	const canvasMutation = useMutation({
		mutationFn: (title: string) => createCanvas(title, directoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			setNewCanvasTitle('');
			notification.success({
				message: 'Лист создан',
				description: 'Новый лист успешно добавлен.',
				placement: 'topRight',
			});
			setIsCanvasModalOpen(false);
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Create canvas error:', error);
			notification.error({
				message: 'Ошибка',
				description: `Не удалось создать лист: ${error.message}`,
				placement: 'topRight',
			});
		},
	});

	const directoryMutation = useMutation({
		mutationFn: (title: string) => createDirectory(title, directoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			setNewDirectoryTitle('');
			notification.success({
				message: 'Директория создана',
				description: 'Новая директория успешно добавлена.',
				placement: 'topRight',
			});
			setIsDirectoryModalOpen(false);
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Create directory error:', error);
			notification.error({
				message: 'Ошибка',
				description: `Не удалось создать директорию: ${error.message}`,
				placement: 'topRight',
			});
		},
	});

	const deleteCanvasMutation = useMutation({
		mutationFn: (canvasId: number) => deleteCanvas(canvasId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			notification.success({
				message: 'Лист удалён',
				description: 'Лист успешно удалён.',
				placement: 'topRight',
			});
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Delete canvas error:', error);
			notification.error({
				message: 'Ошибка',
				description: `Не удалось удалить лист: ${error.message}`,
				placement: 'topRight',
			});
		},
	});

	const deleteDirectoryMutation = useMutation({
		mutationFn: (directoryId: number) => deleteDirectory(directoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			notification.success({
				message: 'Директория удалена',
				description: 'Директория успешно удалена.',
				placement: 'topRight',
			});
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Delete directory error:', error);
			notification.error({
				message: 'Ошибка',
				description: `Не удалось удалить директорию: ${error.message}`,
				placement: 'topRight',
			});
		},
	});

	const renameCanvasMutation = useMutation({
		mutationFn: ({ id, name }: { id: string; name: string }) => updateCanvas(id, undefined, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			queryClient.refetchQueries({ queryKey: ['directory'] });
			queryClient.setQueryData(['directory', directoryId], (oldData: DirectoryContent | undefined) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					canvases: oldData.canvases.map((canvas) =>
						canvas.id === Number(id) ? { ...canvas, name } : canvas
					),
				};
			});
			notification.success({
				message: 'Лист переименован',
				description: 'Название листа успешно обновлено.',
				placement: 'topRight',
			});
			setIsRenaming(null);
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Rename canvas error:', error);
			notification.error({
				message: 'Ошибка',
				description: `Не удалось переименовать лист: ${error.message}`,
				placement: 'topRight',
			});
			setIsRenaming(null);
		},
	});

	const renameDirectoryMutation = useMutation({
		mutationFn: ({ id, name }: { id: number; name: string }) => updateDirectory(id, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			queryClient.refetchQueries({ queryKey: ['directory'] });
			queryClient.setQueryData(['directory', directoryId], (oldData: DirectoryContent | undefined) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					directories: oldData.directories.map((directory) =>
						directory.id === id ? { ...directory, name } : directory
					),
				};
			});
			notification.success({
				message: 'Директория переименована',
				description: 'Название директории успешно обновлено.',
				placement: 'topRight',
			});
			setIsRenaming(null);
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Rename directory error:', error);
			notification.error({
				message: 'Ошибка',
				description: `Не удалось переименовать директорию: ${error.message}`,
				placement: 'topRight',
			});
			setIsRenaming(null);
		},
	});

	const moveItemMutation = useMutation({
		mutationFn: ({ id, identity, parent_id }: MoveItemParams) => moveItem({ id, identity, parent_id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['directory'] });
			queryClient.refetchQueries({ queryKey: ['directory'] });
			notification.success({
				message: 'Перемещение успешно',
				description: 'Элемент успешно перемещён в новую папку.',
				placement: 'topRight',
			});
			setSelectedItems([]);
		},
		onError: (error: ErrorResponse) => {
			console.error('[DEBUG] Move item error:', error);
			notification.error({
				message: 'Ошибка перемещения',
				description: `Не удалось переместить элемент: ${error.message}`,
				placement: 'topRight',
			});
		},
	});

	const handleAddCanvas = () => {
		setIsCanvasModalOpen(true);
	};

	const handleAddDirectory = () => {
		setIsDirectoryModalOpen(true);
	};

	const handleCreateCanvas = () => {
		if (validateTitle(newCanvasTitle)) {
			canvasMutation.mutate(newCanvasTitle);
		}
	};

	const handleCreateDirectory = () => {
		if (validateTitle(newDirectoryTitle)) {
			directoryMutation.mutate(newDirectoryTitle);
		}
	};

	const handleCanvasInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && validateTitle(newCanvasTitle)) {
			canvasMutation.mutate(newCanvasTitle);
		}
	};

	const handleDirectoryInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && validateTitle(newDirectoryTitle)) {
			directoryMutation.mutate(newDirectoryTitle);
		}
	};

	const handleDeleteItem = (id: number, name: string, type: 'canvas' | 'folder') => {
		setDeleteModal({ open: true, id, name, type });
	};

	const handleConfirmDelete = () => {
		if (!deleteModal) return;
		if (deleteModal.type === 'folder') {
			deleteDirectoryMutation.mutate(deleteModal.id);
		} else {
			deleteCanvasMutation.mutate(deleteModal.id);
		}
		setDeleteModal(null);
	};

	const handleCancelDelete = () => {
		setDeleteModal(null);
	};

	const handleSelectItem = (id: number, type: 'canvas' | 'folder', event: React.MouseEvent) => {
		if (event.shiftKey) {
			setSelectedItems((prev) => {
				const exists = prev.find((item) => item.id === id && item.type === type);
				if (exists) {
					return prev.filter((item) => !(item.id === id && item.type === type));
				}
				return [...prev, { id, type, name: '' }];
			});
		} else {
			setSelectedItems([{ id, type, name: '' }]);
		}
	};

	const handleDrop = (item: Item, targetDirectoryId: number) => {
		if (item.id === targetDirectoryId) {
			message.error('Нельзя переместить папку в саму себя');
			return;
		}
		moveItemMutation.mutate({ id: item.id, identity: item.type, parent_id: targetDirectoryId });
	};

	const handleRename = (id: number, type: 'canvas' | 'folder', currentName: string) => {
		setIsRenaming({ id, type, currentName });
	};

	const handleRenameSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && isRenaming && validateTitle(e.currentTarget.value)) {
			if (isRenaming.type === 'canvas') {
				renameCanvasMutation.mutate({ id: isRenaming.id.toString(), name: e.currentTarget.value });
			} else {
				renameDirectoryMutation.mutate({ id: isRenaming.id, name: e.currentTarget.value });
			}
		}
	};

	const handleCancelRename = () => {
		setIsRenaming(null);
	};

	const handleMassDelete = () => {
		if (selectedItems.length === 0) return;
		setMassDeleteModal(true);
	};

	const handleConfirmMassDelete = () => {
		selectedItems.forEach((item) => {
			if (item.type === 'folder') {
				deleteDirectoryMutation.mutate(item.id);
			} else {
				deleteCanvasMutation.mutate(item.id);
			}
		});
		setSelectedItems([]);
		setMassDeleteModal(false);
	};

	const handleCancelMassDelete = () => {
		setMassDeleteModal(false);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
				e.preventDefault();
				setIsCanvasModalOpen(true);
			}
			if (e.ctrlKey && e.shiftKey && e.key === 'N') {
				e.preventDefault();
				setIsDirectoryModalOpen(true);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<DndProvider backend={HTML5Backend}>
			<div className={styles.gridContainer}>

				<div onClick={handleAddCanvas} className={styles.newCanvasContainer}>
					<span>+ Новый лист</span>
				</div>
				<div onClick={handleAddDirectory} className={styles.newCanvasContainer}>
					<span>+ Новая директория</span>
				</div>

				<Modal
					title="Создать новый лист"
					open={isCanvasModalOpen}
					onOk={handleCreateCanvas}
					onCancel={() => {
						setIsCanvasModalOpen(false);
						setNewCanvasTitle('');
					}}
					okText="Создать"
					cancelText="Отмена"
					okButtonProps={{ disabled: canvasMutation.isPending || !newCanvasTitle.trim() }}
				>
					<Input
						value={newCanvasTitle}
						onChange={(e) => setNewCanvasTitle(e.target.value)}
						onKeyDown={handleCanvasInputKeyDown}
						placeholder="Введите название листа"
						autoFocus
						disabled={canvasMutation.isPending}
					/>
				</Modal>

				<Modal
					title="Создать новую директорию"
					open={isDirectoryModalOpen}
					onOk={handleCreateDirectory}
					onCancel={() => {
						setIsDirectoryModalOpen(false);
						setNewDirectoryTitle('');
					}}
					okText="Создать"
					cancelText="Отмена"
					okButtonProps={{ disabled: directoryMutation.isPending || !newDirectoryTitle.trim() }}
				>
					<Input
						value={newDirectoryTitle}
						onChange={(e) => setNewDirectoryTitle(e.target.value)}
						onKeyDown={handleDirectoryInputKeyDown}
						placeholder="Введите название директории"
						autoFocus
						disabled={directoryMutation.isPending}
					/>
				</Modal>

				<Modal
					title="Подтверждение удаления"
					open={deleteModal?.open}
					onOk={handleConfirmDelete}
					onCancel={handleCancelDelete}
					okText="Удалить"
					cancelText="Отмена"
					okButtonProps={{ danger: true }}
					key={deleteModal ? `delete-${deleteModal.id}-${deleteModal.type}` : undefined}
				>
					<p>
						Вы уверены, что хотите удалить{' '}
						{deleteModal?.type === 'folder' ? 'директорию' : 'лист'} "{deleteModal?.name}"?
					</p>
				</Modal>

				<Modal
					title="Подтверждение удаления"
					open={massDeleteModal}
					onOk={handleConfirmMassDelete}
					onCancel={handleCancelMassDelete}
					okText="Удалить"
					cancelText="Отмена"
					okButtonProps={{ danger: true }}
					key={`mass-delete-${Date.now()}`}
				>
					<p>Вы уверены, что хотите удалить {selectedItems.length} элемент(ов)?</p>
				</Modal>

				{isRenaming && (
					<motion.div
						key={`rename-${isRenaming.id}-${isRenaming.type}`}
						variants={itemVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.2 }}
					>
						<div className={styles.canavsContainer}>
							{isRenaming.type === 'folder' ? <FolderIcon /> : <NoteIcon />}
							<Input
								defaultValue={isRenaming.currentName}
								onKeyDown={handleRenameSubmit}
								placeholder="Введите новое название"
								className={styles.titleInput}
								autoFocus
								disabled={
									isRenaming.type === 'canvas'
										? renameCanvasMutation.isPending
										: renameDirectoryMutation.isPending
								}
								suffix={
									<Button type="text" size="small" onClick={handleCancelRename}>
										Отмена
									</Button>
								}
							/>
							<span className={styles.date}>{new Date().toLocaleDateString('ru-RU')}</span>
						</div>
					</motion.div>
				)}

				<AnimatePresence>
					{content.directories
						.filter(
							(directory) =>
								!isRenaming || isRenaming.id !== directory.id || isRenaming.type !== 'folder'
						)
						.map((directory) => (
							<motion.div
								key={`dir-${directory.id}`}
								variants={itemVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={{ duration: 0.2 }}
							>
								<DirectoryDropZone directory={directory} onDrop={handleDrop}>
									<CanvasItem
										item={directory}
										isDirectory={true}
										isSelected={selectedItems.some(
											(item) => item.id === directory.id && item.type === 'folder'
										)}
										isMoving={
											moveItemMutation.isPending &&
											moveItemMutation.variables?.id === directory.id
										}
										isRenaming={
											renameDirectoryMutation.isPending &&
											renameDirectoryMutation.variables?.id === directory.id
										}
										onSelect={handleSelectItem}
										onNavigate={navigate}
										onDelete={handleDeleteItem}
										onRename={handleRename}
									/>
								</DirectoryDropZone>
							</motion.div>
						))}
					{content.canvases
						.filter(
							(canvas) =>
								!isRenaming || isRenaming.id !== canvas.id || isRenaming.type !== 'canvas'
						)
						.map((canvas) => (
							<motion.div
								key={`canvas-${canvas.id}`}
								variants={itemVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={{ duration: 0.2 }}
							>
								<CanvasItem
									item={canvas}
									isDirectory={false}
									isSelected={selectedItems.some(
										(item) => item.id === canvas.id && item.type === 'canvas'
									)}
									isMoving={
										moveItemMutation.isPending &&
										moveItemMutation.variables?.id === canvas.id
									}
									isRenaming={
										renameCanvasMutation.isPending &&
										renameCanvasMutation.variables?.id === canvas.id.toString()
									}
									onSelect={handleSelectItem}
									onNavigate={navigate}
									onDelete={handleDeleteItem}
									onRename={handleRename}
								/>
							</motion.div>
						))}
				</AnimatePresence>
			</div>
		</DndProvider>
	);
});

export { CanvasGrid };
