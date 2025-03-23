import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCanvases, createCanvas, CanvasData } from ':services/api';
import styles from './styles.module.scss';
import NoteIcon from ':svg/note.svg?react';
import { DatePicker } from ':shared';

const CanvasGrid: React.FC = () => {
    const [canvases, setCanvases] = useState<CanvasData[]>([
        {
            id: '1',
            title: 'dsfgf',
            createdAt: '23.03.2025',
        },
    ]);
    const [searchTitle, setSearchTitle] = useState('');
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCanvases = async () => {
            try {
                const data = await getAllCanvases();
                setCanvases(data);
            } catch (error) {
                console.error('Ошибка загрузки канвасов:', error);
            }
        };
        fetchCanvases();
    }, []);

    const handleAddCanvas = async () => {
        try {
            navigate(`/canvas/${1}`);
        } catch (error) {
            console.error('Ошибка создания канваса:', error);
        }
    };

    const handleDateRangeChange = (newStartDate: string | null, newEndDate: string | null) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const filteredCanvases = canvases.filter(canvas => {
        const titleMatch = canvas.title.toLowerCase().includes(searchTitle.toLowerCase());
        
        // Преобразуем дату из формата дд.мм.гггг в объект Date для сравнения
        const [day, month, year] = canvas.createdAt.split('.');
        const canvasDate = new Date(`${year}-${month}-${day}`);
        
        let dateMatch = true;
        if (startDate) {
            const start = new Date(startDate);
            dateMatch = dateMatch && canvasDate >= start;
        }
        if (endDate) {
            const end = new Date(endDate);
            dateMatch = dateMatch && canvasDate <= end;
        }
        
        return titleMatch && dateMatch;
    });

    return (
        <div className={styles.root}>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Поиск по названию"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className={styles.searchInput}
                />
                <DatePicker onDateRangeChange={handleDateRangeChange} />
            </div>

            <div className={styles.gridContainer}>
                <div onClick={handleAddCanvas} className={styles.newCanvasContainer}>
                    <span>+ Новый лист</span>
                </div>

                {filteredCanvases.map((canvas) => (
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
        </div>
    );
};

export { CanvasGrid };