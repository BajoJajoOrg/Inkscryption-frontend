import useSocket from '../hooks/useSocket';

const Home: React.FC = () => {
  const { socket, isConnected } = useSocket();

  return (
    <div>
      <h2>Рукописное приложение</h2>
      <p>Статус подключения: {isConnected ? 'Подключено' : 'Отключено'}</p>
      //canvas
    </div>
  );
};

export default Home;