
import React from 'react';
import { useState } from 'react';
import styles from './styles.module.scss';


interface DatePickerProps {
    onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ onDateRangeChange }) => {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        onDateRangeChange(newStartDate, endDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        onDateRangeChange(startDate, newEndDate);
    };

    return (
        <div className={styles.datePickerContainer}>
            <input
                type="date"
                value={startDate || ''}
                onChange={handleStartDateChange}
                className={styles.dateInput}
                placeholder="Начальная дата"
            />
            <span className={styles.separator}>—</span>
            <input
                type="date"
                value={endDate || ''}
                onChange={handleEndDateChange}
                className={styles.dateInput}
                placeholder="Конечная дата"
            />
        </div>
    );
};

export { DatePicker };