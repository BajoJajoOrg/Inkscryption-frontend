import { useQuery } from '@tanstack/react-query';
import { CanvasFilter, CanvasGrid, ProtectedLayout } from ':components';
import { CanvasData, ErrorResponse, BreadcrumbItem, DirectoryData, getDirectoryContent } from ':api';
import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Flex } from 'antd';
import { useAuthStore } from ':store';

interface DirectoryContent {
	folder: DirectoryData;
	breadcrumbs: BreadcrumbItem[];
	canvases: CanvasData[];
	folders: DirectoryData[];
}

const Home: React.FC = () => {
	const { directoryId } = useParams<{ directoryId?: string }>();
	const [searchTitle, setSearchTitleState] = useState('');
	const [dateRange, setDateRangeState] = useState<[string | null, string | null]>([null, null]);
	const logout = useAuthStore((state) => state.logout);
	
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
			folder: data?.folder,
			breadcrumbs: data?.breadcrumbs ?? [],
			canvases: data?.canvases ?? [],
			directories: data?.folders ?? [],
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

	const navigate = useNavigate();

	const getBreadcrumbItems = useMemo(() => {
		const items = [{ title: 'Главная', href: '/', onClick: () => navigate('/') }];
		console.log(content.breadcrumbs);
		if (content.breadcrumbs.length > 0) {
			content.breadcrumbs
				.slice()
				.reverse()
				.forEach((breadcrumb) => {
					items.push({
						title: breadcrumb.name,
						href: `/directory/${breadcrumb.id}`,
						onClick: () => navigate(`/directory/${breadcrumb.id}`),
					});
				});
		}

		return items;
	}, [content.breadcrumbs, navigate]);

	const handleLogout = () => {
		logout();
		navigate('/login');
	  };

	return (
		<ProtectedLayout>
			<Flex justify="space-between" align="center">
				<Breadcrumb
					style={{ margin: '16px 0' }}
					items={getBreadcrumbItems}
					itemRender={(route, _, routes) => {
						const last = routes.indexOf(route) === routes.length - 1;
						return last ? (
							<span>{route.title}</span>
						) : (
							<a onClick={route.onClick}>{route.title}</a>
						);
					}}
				/>
				<Button size="large" onClick={handleLogout}>
					Выйти
				</Button>
			</Flex>
			{isLoading ? (
				<div>Загрузка...</div>
			) : error ? (
				<div>Не удалось загрузить папку</div>
			) : (
				<div>
					<h1>
						{content.folder ? content.folder.name && content.folder.name !== 'root' : 'Мои файлы'}
					</h1>
					<CanvasFilter
						searchTitle={searchTitle}
						setSearchTitle={setSearchTitle}
						dateRange={dateRange}
						setDateRange={setDateRange}
					/>
					<CanvasGrid
						content={{ canvases: content.canvases, directories: content.directories }}
						directoryId={directoryId ? +directoryId : undefined}
					/>
				</div>
			)}
		</ProtectedLayout>
	);
};

export default Home;
