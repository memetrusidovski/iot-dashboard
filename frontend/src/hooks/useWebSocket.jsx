import { useEffect } from 'react';
import useSensorStore from '../store/useSensorStore';

const useWebSocket = (userId) => {
  // Get all necessary actions from the store
  const { setConnectionStatus, updateSensorData, updateDeviceState, logout } = useSensorStore();

  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:3001?userId=${userId}`);

    socket.onopen = () => setConnectionStatus('Connected');
    socket.onclose = () => setConnectionStatus('Disconnected');
    socket.onerror = (err) => {
      console.error('WebSocket Error:', err);
      setConnectionStatus('Error');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // --- THIS IS THE KEY CHANGE ---
        // Check the message type to decide which store action to call
        if (message.type === 'device_update') {
          updateDeviceState(message.deviceId, message.device);
        } else {
          // Assume it's a sensor update for backward compatibility
          updateSensorData(message.topic, message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      if (socket) socket.close();
    };
  }, [userId, setConnectionStatus, updateSensorData, updateDeviceState]);
  
  // Renaming to handleLogout for clarity, as it triggers a full logout/cleanup
  const handleLogout = () => {
    // The store's logout action will reset all state
    logout();
  }

  return { handleLogout };
};

export default useWebSocket;