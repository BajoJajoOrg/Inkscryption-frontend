import { ProtectedLayout } from ':components';
import { FabricCanvas } from '../components/FabricCanvas/FabricCanvas';
import { useParams } from 'react-router-dom';
import { CanvasTextDrawer } from ':components/CanvasTextDrawer/CanvasTextDrawer';
import { CanvasData, getAllCanvases } from ':services/api';
import { useQuery } from '@tanstack/react-query';
import { CanvasUploadDrawer } from ':components/CanvasUploadDrawer/CanvasUploadDrawer';

const CanvasPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	const { data, isLoading, error } = useQuery<CanvasData[]>({
		queryKey: ['canvasesAll', id],
		queryFn: () => getAllCanvases({}),
	});
	if (isLoading) return <div>Загрузка...</div>;
	if (error) return <div>Ошибка: {(error as Error).message}</div>;

	const canvas = data && data.find((c) => id && c.id === +id);

	if (!canvas) return <div>Лист не найден</div>;

	return (
		<ProtectedLayout canvases={data}>
			<h1>{canvas.canvas_name}</h1>
			<FabricCanvas />
			<CanvasTextDrawer />
			<CanvasUploadDrawer />
		</ProtectedLayout>
	);
};

export default CanvasPage;
