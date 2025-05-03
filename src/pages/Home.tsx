import { useQuery } from '@tanstack/react-query';
import { CanvasFilter, CanvasGrid, ProtectedLayout } from ':components';
import { ErrorResponse } from ':services/api';
import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { DirectoryContent, getDirectoryContent } from ':components/CanvasGrid/mock';

const Home: React.FC = () => {
	const { directoryId } = useParams<{ directoryId?: string }>();
	const [searchTitle, setSearchTitleState] = useState('');
	const [dateRange, setDateRangeState] = useState<[string | null, string | null]>([null, null]);

	const setSearchTitle = useCallback((value: string) => {
		setSearchTitleState(value);
	}, []);

	const setDateRange = useCallback((range: [string | null, string | null]) => {
		setDateRangeState(range);
	}, []);

	const formatDateForQuery = useCallback((date: string | null): string => {
		return date ? dayjs(date, 'DD.MM.YYYY').format('YYYYMMDD') : '';
	}, []);

	const createdAtQuery = useMemo(() => {
		const start = formatDateForQuery(dateRange[0]);
		const end = formatDateForQuery(dateRange[1]);
		if (start && end) {
			return `${start}:${end}`;
		}
		return '';
	}, [dateRange[0], dateRange[1], formatDateForQuery]);

	const { data, isLoading, error } = useQuery<DirectoryContent, ErrorResponse>({
		queryKey: ['directory', directoryId || 'root', searchTitle, createdAtQuery],
		queryFn: () =>
			getDirectoryContent({
				directoryId: directoryId ? +directoryId : undefined,
				name: searchTitle,
				created_at: createdAtQuery,
			}),
		staleTime: 10 * 60 * 1000,
	});

	const content = useMemo(
		() => ({
			canvases: data?.canvases ?? [],
			directories: data?.directories ?? [],
		}),
		[data]
	);

	const renderError = useCallback(
		(error: ErrorResponse) => (
			<div>
				Ошибка: {error.message}
				{error.details && <div>Детали: {JSON.stringify(error.details)}</div>}
			</div>
		),
		[]
	);

	const location = useLocation();
	const navigate = useNavigate();

	const getBreadcrumbItems = useMemo(() => {
		const items = [{ title: 'Главная', href: '/', onClick: () => navigate('/') }];

		if (directoryId && content.directories.length > 0) {
			const currentDir = content.directories.find((d) => d.id === +directoryId);
			items.push({
				title: currentDir ? currentDir.directory_name : `Директория ${directoryId}`,
				href: `/directory/${directoryId}`,
				onClick: () => navigate(`/directory/${directoryId}`),
			});
		}

		return items;
	}, [location.pathname, content.directories, directoryId, navigate]);

	return (
		<ProtectedLayout canvases={content.canvases}>
			<Breadcrumb
				style={{ margin: '16px 0' }}
				items={getBreadcrumbItems}
				itemRender={(route, _, routes) => {
					const last = routes.indexOf(route) === routes.length - 1;
					return last ? <span>{route.title}</span> : <a onClick={route.onClick}>{route.title}</a>;
				}}
			/>
			{isLoading ? (
				<div>Загрузка...</div>
			) : error ? (
				renderError(error)
			) : (
				<div>
					<h1>{directoryId ? 'Директория' : 'Мои файлы'}</h1>
					<CanvasFilter
						searchTitle={searchTitle}
						setSearchTitle={setSearchTitle}
						dateRange={dateRange}
						setDateRange={setDateRange}
					/>
					<CanvasGrid content={content} directoryId={directoryId ? +directoryId : undefined} />
				</div>
			)}
		</ProtectedLayout>
	);
};

export default Home;
