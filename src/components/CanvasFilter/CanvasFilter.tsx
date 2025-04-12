import { Input, DatePicker } from 'antd';
import styles from './styles.module.scss';
import { memo, useCallback, useState } from 'react';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface CanvasFilterProps {
	searchTitle: string;
	setSearchTitle: (value: string) => void;
	dateRange: [string | null, string | null];
	setDateRange: (range: [string | null, string | null]) => void;
}

const CanvasFilter: React.FC<CanvasFilterProps> = memo(
	({ searchTitle, setSearchTitle, dateRange, setDateRange }) => {
		const [inputValue, setInputValue] = useState(searchTitle);

		// Дебounced обновление searchTitle
		const debouncedSetSearchTitle = useCallback(
			debounce((value: string) => {
				console.log('Обновляем searchTitle:', value);
				setSearchTitle(value);
			}, 300),
			[setSearchTitle]
		);

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const value = e.target.value;
				setInputValue(value);
				debouncedSetSearchTitle(value);
			},
			[debouncedSetSearchTitle]
		);

		const handleDateChange = useCallback(
			(dates: any, dateStrings: [string, string]) => {
				console.log('Выбраны даты:', dateStrings);
				setDateRange(dateStrings as [string | null, string | null]);
			},
			[setDateRange]
		);

		console.log('CanvasFilter рендерится, inputValue:', inputValue);

		return (
			<div className={styles.searchContainer}>
				<Input
					placeholder="Поиск по названию"
					value={inputValue}
					onChange={handleInputChange}
					style={{ width: 200 }}
				/>
				<RangePicker
					value={
						dateRange[0] && dateRange[1]
							? [dayjs(dateRange[0], 'DD.MM.YYYY'), dayjs(dateRange[1], 'DD.MM.YYYY')]
							: [null, null]
					}
					onChange={handleDateChange}
					format="DD.MM.YYYY"
					style={{ width: 300 }}
				/>
			</div>
		);
	}
);

export { CanvasFilter };
