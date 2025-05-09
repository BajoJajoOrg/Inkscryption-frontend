import { ProtectedLayout } from ':components';
import { FabricCanvas } from '../components/FabricCanvas/FabricCanvas';
import { useParams } from 'react-router-dom';
import { CanvasData, getAllCanvases } from ':api/api';
import { useQuery } from '@tanstack/react-query';
import { CanvasHeader } from ':components/CanvasHeader/CanvasHeader';
import { message } from 'antd';
import { saveCanvasExternal } from ':lib';
import { useEffect } from 'react';

const CanvasPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	const [messageApi, contextHolder] = message.useMessage();

	const { data, isLoading, error } = useQuery<CanvasData[]>({
		queryKey: ['canvasesAll', id],
		queryFn: () => getAllCanvases({}),
	});

	useEffect(() => {
		if (!data || !id) return;

		const intervalId = setInterval(async () => {
			const key = 'canvas-save-status';

			messageApi.open({
				key,
				type: 'loading',
				content: 'Сохраняем канвас...',
				duration: 0,
			});

			try {
				await saveCanvasExternal();
				messageApi.open({
					key,
					type: 'success',
					content: 'Канвас успешно сохранен',
					duration: 2,
				});
			} catch {
				messageApi.open({
					key,
					type: 'warning',
					content: 'Не получилось сохранить канвас.',
					duration: 2,
				});
			}
		}, 60000);

		return () => clearInterval(intervalId);
	}, [data, id, messageApi]);

	useEffect(() => {
		const handleLeave = async () => {
			await saveCanvasExternal();
		};
		window.addEventListener('beforeunload', handleLeave);
		return () => window.removeEventListener('beforeunload', handleLeave);
	}, []);

	if (isLoading) return <div>Загрузка...</div>;
	if (error) return <div>Ошибка: {(error as Error).message}</div>;
	const canvas = data && data.find((c) => id && c.id === +id);

	if (!canvas) return <div>Лист не найден</div>;

	return (
		<ProtectedLayout>
			<CanvasHeader title={canvas.name} />
			<FabricCanvas />
			{contextHolder}
		</ProtectedLayout>
	);
};

export default CanvasPage;
