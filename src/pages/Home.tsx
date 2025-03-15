import { FabricCanvas } from "../components/fabric-canvas/fabric-canvas";
// import useSocket from "../hooks/useSocket";

const Home: React.FC = () => {
  // const { socket, isConnected } = useSocket();

  return (
    <div>
      <FabricCanvas />
    </div>
  );
};

export default Home;
