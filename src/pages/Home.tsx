import { CanvasFilter, CanvasGrid, ProtectedLayout } from ':components';
import { CanvasData, getAllCanvases } from ':services/api';
import { useEffect, useState } from 'react';

const Home: React.FC = () => {
	const [canvases, setCanvases] = useState<CanvasData[]>([
		{ id: '1', title: 'dsfgf', createdAt: '23.03.2025' },
	]);
	const [searchTitle, setSearchTitle] = useState('');
	const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

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

	const filteredCanvases = canvases.filter((canvas) => {
		const titleMatch = canvas.title.toLowerCase().includes(searchTitle.toLowerCase());
		const [day, month, year] = canvas.createdAt.split('.');
		const canvasDate = new Date(`${year}-${month}-${day}`);

		let dateMatch = true;
		if (dateRange[0]) {
			const start = new Date(dateRange[0]);
			dateMatch = dateMatch && canvasDate >= start;
		}
		if (dateRange[1]) {
			const end = new Date(dateRange[1]);
			dateMatch = dateMatch && canvasDate <= end;
		}

		return titleMatch && dateMatch;
	});

	return (
		<ProtectedLayout>
			{(canvases) => (
				<>
					<CanvasFilter
						searchTitle={searchTitle}
						setSearchTitle={setSearchTitle}
						dateRange={dateRange}
						setDateRange={setDateRange}
					/>
					<CanvasGrid canvases={filteredCanvases} />
				</>
			)}
		</ProtectedLayout>
	);
};

export default Home;
