import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCanvases, createCanvas, CanvasData } from '../../services/api';

const CanvasGrid: React.FC = () => {
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const navigate = useNavigate();

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

  const handleAddCanvas = async () => {
    try {
    //   const newCanvas = await createCanvas(`Canvas ${canvases.length + 1}`);
    //   setCanvases([...canvases, newCanvas]);
      navigate(`/canvas/${1}`);
    } catch (error) {
      console.error('Ошибка создания канваса:', error);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
      <div
        onClick={handleAddCanvas}
        style={{
          border: '2px dashed #ccc',
          height: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '24px' }}>+ Новый лист</span>
      </div>

      {canvases.map((canvas) => (
        <div
          key={canvas.id}
          onClick={() => navigate(`/canvas/${canvas.id}`)}
          style={{
            border: '1px solid #000',
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span>{canvas.title}</span>
        </div>
      ))}
    </div>
  );
};

export default CanvasGrid;