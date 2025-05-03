import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CanvasData, DirectoryData, createCanvas, createDirectory } from './mock';
import styles from './styles.module.scss';
import NoteIcon from ':svg/note.svg?react';
import FolderIcon from ':svg/icons/folder.svg?react';
import { Input, message } from 'antd';
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
        <div
          key={`dir-${directory.id}`}
          onClick={() => navigate(`/directory/${directory.id}`)}
          className={styles.canavsContainer}
        >
          <FolderIcon />
          <span className={styles.title}>{directory.directory_name}</span>
          <span className={styles.date}>{dayjs(directory.update_time).format('DD.MM.YYYY')}</span>
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