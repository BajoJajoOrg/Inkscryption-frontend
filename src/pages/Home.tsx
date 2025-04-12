import { useQuery } from '@tanstack/react-query';
import { CanvasFilter, CanvasGrid, ProtectedLayout } from ':components';
import { getAllCanvases, CanvasData, ErrorResponse } from ':services/api';
import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';

const Home: React.FC = () => {
	const [searchTitle, setSearchTitleState] = useState('');
	const [dateRange, setDateRangeState] = useState<[string | null, string | null]>([null, null]);

	const setSearchTitle = useCallback((value: string) => {
		setSearchTitleState(value);
	}, []);

	const setDateRange = useCallback((range: [string | null, string | null]) => {
		setDateRangeState(range);
	}, []);

	// Форматируем дату в YYYYMMDD
	const formatDateForQuery = useCallback((date: string | null): string => {
		if (!date) return '';
		try {
			const parsedDate = dayjs(date, 'DD.MM.YYYY');
			if (!parsedDate.isValid()) {
				console.warn('Невалидная дата:', date);
				return '';
			}
			return parsedDate.format('YYYYMMDD');
		} catch (error) {
			console.error('Ошибка форматирования даты:', date, error);
			return '';
		}
	}, []);

	// Формируем created_at
	const createdAtQuery = useMemo(() => {
		const start = formatDateForQuery(dateRange[0]);
		const end = formatDateForQuery(dateRange[1]);
		if (start && end) {
			if (dayjs(start).isAfter(dayjs(end))) {
				console.warn('Начальная дата позже конечной');
				return '';
			}
			const query = `${start}:${end}`;
			console.log('Сформирован created_at:', query);
			return query;
		}
		return '';
	}, [dateRange[0], dateRange[1], formatDateForQuery]);

	const { data, isLoading, error } = useQuery<CanvasData[], ErrorResponse>({
		queryKey: ['canvases', searchTitle, createdAtQuery],
		queryFn: () => {
			console.log('Отправляем запрос с:', { name: searchTitle, created_at: createdAtQuery });
			return getAllCanvases({ name: searchTitle, created_at: createdAtQuery });
		},
		staleTime: 10 * 60 * 1000, // 10 минут кэширования
	});

	// Мемоизируем canvases
	const canvases = useMemo(() => data ?? [], [data]);

	// Рендеринг ошибки
	const renderError = useCallback(
		(error: ErrorResponse) => (
			<div>
				Ошибка: {error.message}
				{error.details && <div>Детали: {JSON.stringify(error.details)}</div>}
			</div>
		),
		[]
	);

	console.log('Home рендерится');

	return (
		<ProtectedLayout canvases={canvases}>
			{isLoading ? (
				<div>Загрузка...</div>
			) : error ? (
				renderError(error)
			) : (
				<>
					<CanvasFilter
						searchTitle={searchTitle}
						setSearchTitle={setSearchTitle}
						dateRange={dateRange}
						setDateRange={setDateRange}
					/>
					{canvases.length === 0 ? (
						<div>Нет канвасов, соответствующих фильтру</div>
					) : (
						<CanvasGrid canvases={canvases} />
					)}
				</>
			)}
		</ProtectedLayout>
	);
};

export default Home;
