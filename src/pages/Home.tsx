import { useQuery } from '@tanstack/react-query';
import { CanvasFilter, CanvasGrid, ProtectedLayout } from ':components';
import { getAllCanvases, CanvasData } from ':services/api';
import { useState } from 'react';

const Home: React.FC = () => {
	const [searchTitle, setSearchTitle] = useState('');
	const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

	// Форматируем дату в YYYYMMDD:YYYYMMDD
	const formatDateForQuery = (date: string | null): string => {
		if (!date) return '';
		const d = new Date(date);
		return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(
			2,
			'0'
		)}`;
	};

	const createdAtQuery =
		dateRange[0] || dateRange[1]
			? `${formatDateForQuery(dateRange[0])}:${formatDateForQuery(dateRange[1])}`
			: '';

	const { data, isLoading, error } = useQuery<CanvasData[]>({
		queryKey: ['canvases', searchTitle, createdAtQuery],
		queryFn: () => getAllCanvases({ name: searchTitle, created_at: createdAtQuery }),
	});

	if (isLoading) return <div>Загрузка...</div>;
	if (error) return <div>Ошибка: {(error as Error).message}</div>;

	return (
		<ProtectedLayout canvases={data ? data : []}>
			<CanvasFilter
				searchTitle={searchTitle}
				setSearchTitle={setSearchTitle}
				dateRange={dateRange}
				setDateRange={setDateRange}
			/>
			<CanvasGrid canvases={data ? data : []} />
		</ProtectedLayout>
	);
};

export default Home;
