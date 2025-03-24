import { Input, DatePicker } from 'antd';
import styles from './styles.module.scss';

const { RangePicker } = DatePicker;

interface CanvasFilterProps {
    searchTitle: string;
    setSearchTitle: (value: string) => void;
    dateRange: [string | null, string | null];
    setDateRange: (range: [string | null, string | null]) => void;
}

const CanvasFilter: React.FC<CanvasFilterProps> = ({
    searchTitle,
    setSearchTitle,
    dateRange,
    setDateRange,
}) => {
    return (
        <div className={styles.searchContainer}>
            <Input
                placeholder="Поиск по названию"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={{ width: 200 }}
            />
            <RangePicker
                onChange={(dates, dateStrings) => setDateRange(dateStrings as [string | null, string | null])}
                format="DD.MM.YYYY"
                style={{ width: 300 }}
            />
        </div>
    );
};

export { CanvasFilter };