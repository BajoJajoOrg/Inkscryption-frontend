import { CanvasGrid } from ":components";

const Home: React.FC = () => {
  return (
    <div style={{'width': '100%'}}>
      <h2>Мои канвасы</h2>
      <CanvasGrid />
    </div>
  );
};

export default Home;