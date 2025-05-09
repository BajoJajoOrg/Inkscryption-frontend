import { Layout, Breadcrumb } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { CanvasData } from ':api/api';
import styles from './styles.module.scss';
import { memo, useMemo } from 'react';

const { Content } = Layout;

interface ProtectedLayoutProps {
	children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = memo(({ children }) => {

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
