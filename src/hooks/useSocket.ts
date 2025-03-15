import { useEffect, useState } from 'react';
import socket from '../services/socket';
import { Socket } from 'socket.io-client';


interface CanvasUpdate {
    type: 'add' | 'remove' | 'modify'; 
    data: any; 
  }

interface SocketHook {
  socket: Socket;
  isConnected: boolean;
}

export default function useSocket(): SocketHook {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  return { socket, isConnected };
}