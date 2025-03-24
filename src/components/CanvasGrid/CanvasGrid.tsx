import { useNavigate } from 'react-router-dom';
import { CanvasData } from ':services/api';
import styles from './styles.module.scss';
import NoteIcon from ':svg/note.svg?react';

interface CanvasGridProps {
    canvases: CanvasData[];
}

const CanvasGrid: React.FC<CanvasGridProps> = ({ canvases }) => {
    const navigate = useNavigate();

    const handleAddCanvas = () => {
        navigate(`/canvas/${1}`); // Здесь можно будет добавить логику создания
    };

    return (
        <div className={styles.gridContainer}>
            <div onClick={handleAddCanvas} className={styles.newCanvasContainer}>
                <span>+ Новый лист</span>
            </div>

            {canvases.map((canvas) => (
                <div
                    key={canvas.id}
                    onClick={() => navigate(`/canvas/${canvas.id}`)}
                    className={styles.canavsContainer}
                >
                    <NoteIcon />
                    <span className={styles.title}>{canvas.title}</span>
                    <span className={styles.date}>{canvas.createdAt}</span>
                </div>
            ))}
        </div>
    );
};

export { CanvasGrid };