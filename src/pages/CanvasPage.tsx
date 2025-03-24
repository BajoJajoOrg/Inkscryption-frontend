import { ProtectedLayout } from ':components';
import { FabricCanvas } from '../components/FabricCanvas/FabricCanvas';
import { useParams } from 'react-router-dom';

const CanvasPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	return (
		<ProtectedLayout>
			{(canvases) => {
				const canvas = canvases.find((c) => c.id === id);
				if (!canvas) return <div>Лист не найден</div>;

				return (
					<>
						<h1>{canvas.title}</h1>
						<FabricCanvas />
					</>
				);
			}}
		</ProtectedLayout>
	);
};

export default CanvasPage;
