import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    Connected: { text: 'Live', color: 'text-green-500', Icon: Wifi },
    Connecting: { text: 'Connecting...', color: 'text-yellow-500', Icon: Wifi },
    Disconnected: { text: 'Offline', color: 'text-red-500', Icon: WifiOff },
    Error: { text: 'Error', color: 'text-red-600', Icon: AlertTriangle },
  };

  const { text, color, Icon } = statusConfig[status] || statusConfig.Disconnected;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 ${color}`}>
      <Icon size={16} />
      <span>{text}</span>
    </div>
  );
};

export default StatusIndicator;