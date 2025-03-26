import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CanvasData, createCanvas } from ':services/api';
import styles from './styles.module.scss';
import NoteIcon from ':svg/note.svg?react';
import { Input, message } from 'antd';
import dayjs from 'dayjs';

interface CanvasGridProps {
    canvases: CanvasData[];
}

const CanvasGrid: React.FC<CanvasGridProps> = ({ canvases }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const createMutation = useMutation({
        mutationFn: createCanvas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canvases'] });
            setNewTitle('');
            message.success('Лист успешно создан');
            setIsAdding(false);
        },
        onError: (error) => {
            console.error('Ошибка создания canvas:', error);
            message.error('Не удалось создать лист');
            setIsAdding(true); // Оставляем инпут для исправления
        },
    });

    const handleAddCanvas = () => {
        setIsAdding(true);
    };

    const handleCreateCanvas = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTitle.trim() && !createMutation.isPending) {
            createMutation.mutate(newTitle);
        }
    };

    return (
        <div className={styles.gridContainer}>
            {isAdding ? (
                <div className={styles.canavsContainer}>
                    <NoteIcon />
                    <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={handleCreateCanvas}
                        placeholder="Введите название"
                        className={styles.titleInput}
                        autoFocus
                        disabled={createMutation.isPending}
                    />
                    <span className={styles.date}>
                        {new Date().toLocaleDateString('ru-RU')}
                    </span>
                </div>
            ) : (
                <div onClick={handleAddCanvas} className={styles.newCanvasContainer}>
                    <span>+ Новый лист</span>
                </div>
            )}

            {canvases && canvases.map((canvas) => (
                <div
                    key={canvas.id}
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
};

export { CanvasGrid };