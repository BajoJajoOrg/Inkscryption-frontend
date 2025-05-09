import { Layout, Breadcrumb } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { CanvasData } from ':api/api';
import styles from './styles.module.scss';
import { memo, useMemo } from 'react';

const { Content } = Layout;

interface ProtectedLayoutProps {
	children: React.ReactNode;
	canvases: CanvasData[];
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = memo(({ children, canvases }) => {
	const location = useLocation();
	const navigate = useNavigate();

	const getBreadcrumbItems = useMemo(() => {
		const pathSegments = location.pathname.split('/').filter(Boolean);
		const items = [{ title: 'Главная', href: '/', onClick: () => navigate('/') }];

		if (pathSegments[0] === 'canvas' && pathSegments[1]) {
			const canvasId = pathSegments[1];
			const currentCanvas = canvases.find((c) => c.id === +canvasId);
			items.push({
				title: currentCanvas ? currentCanvas.canvas_name : `Лист ${canvasId}`,
				href: '',
				onClick: () => console.log(),
			});
		}

		return items;
	}, [location.pathname, canvases, navigate]);

	console.log('ProtectedLayout рендерится');

	return (
		<Layout className={location.pathname.startsWith('/canvas/') ? styles.canvasRoot : styles.root}>
			<Content
				style={location.pathname.startsWith('/canvas/') ? { padding: 0 } : { padding: '0 50px' }}
			>
				{children}
			</Content>
		</Layout>
	);
});

export { ProtectedLayout };
