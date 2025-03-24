import { Layout, Breadcrumb } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { CanvasData } from ':services/api';
import styles from './styles.module.scss';

const { Content } = Layout;

interface ProtectedLayoutProps {
	children: (canvases: CanvasData[]) => React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
	const location = useLocation();
	const navigate = useNavigate();

	// TODO 
    // Временные моковые данные, пока нет бэкенда
	const canvases: CanvasData[] = [
		{ id: '1', title: 'Первый лист', createdAt: '23.03.2025' },
		{ id: '2', title: 'Второй лист', createdAt: '24.03.2025' },
	];

	const getBreadcrumbItems = () => {
		const pathSegments = location.pathname.split('/').filter(Boolean);
		const items = [
			{ title: 'Главная', href: '/', onClick: () => navigate('/') },
		];

		if (pathSegments[0] === 'canvas' && pathSegments[1]) {
			const canvasId = pathSegments[1];
			const currentCanvas = canvases.find((c) => c.id === canvasId);
			items.push({
				title: currentCanvas ? currentCanvas.title : `Лист ${canvasId}`,
				href: '',
				onClick: () => console.log(),
			});
		}

		return items;
	};

	console.log({ canvases });

	return (
		<Layout className={styles.root}>
			<Content style={{ padding: '0 50px' }}>
				<Breadcrumb
					style={{ margin: '16px 0' }}
					items={getBreadcrumbItems()}
					itemRender={(route, _, routes) => {
						const last = routes.indexOf(route) === routes.length - 1;
						return last ? (
							<span>{route.title}</span>
						) : (
							<a onClick={route.onClick}>{route.title}</a>
						);
					}}
				/>
				{children(canvases)}
			</Content>
		</Layout>
	);
};

export { ProtectedLayout };
