import { ProtectedLayout } from ':components';
import { FabricCanvas } from '../components/FabricCanvas/FabricCanvas';
import { useParams } from 'react-router-dom';
import { CanvasDataFull, getCanvasById } from ':api/api';
import { CanvasHeader } from ':components/CanvasHeader/CanvasHeader';
import { message } from 'antd';
import { saveCanvasExternal } from ':lib';
import { useEffect, useState } from 'react';

const CanvasPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [canvas, setCanvas] = useState<CanvasDataFull | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [messageApi, contextHolder] = message.useMessage();

	useEffect(() => {
		const fetchCanvas = async () => {
			if (!id) return;

			setIsLoading(true);
			try {
				const canvasData = await getCanvasById(id);
				setCanvas(canvasData);
				setError(null);
			} catch (err: any) {
				setError(err.message || 'Ошибка при загрузке канваса');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCanvas();
	}, [id]);

	useEffect(() => {
		if (!canvas || !id) return;

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
	}, [canvas, id, messageApi]);

	useEffect(() => {
		const handleLeave = async () => {
			await saveCanvasExternal();
		};
		window.addEventListener('beforeunload', handleLeave);
		return () => window.removeEventListener('beforeunload', handleLeave);
	}, []);

	if (isLoading) return <div>Загрузка...</div>;
	if (error) return <div>Ошибка: {error}</div>;
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
