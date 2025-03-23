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
        if (endDate && newStartDate > endDate) {
            setEndDate(null);
            onDateRangeChange(newStartDate, null);
        } else {
            onDateRangeChange(newStartDate, endDate);
        }
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        if (startDate && newEndDate < startDate) {
            return;
        }
        setEndDate(newEndDate);
        onDateRangeChange(startDate, newEndDate);
    };

    return (
        <div className={styles.datePickerContainer}>
            <input
                type="date"
                value={startDate || ''}
                onChange={handleStartDateChange}
                max={endDate || undefined}
                className={styles.dateInput}
                placeholder="Начальная дата"
            />
            <span className={styles.separator}>—</span>
            <input
                type="date"
                value={endDate || ''}
                onChange={handleEndDateChange}
                min={startDate || undefined} 
                className={styles.dateInput}
                placeholder="Конечная дата"
            />
        </div>
    );
};

export { DatePicker };