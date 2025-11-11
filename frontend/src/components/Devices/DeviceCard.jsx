import React from 'react';
import DeviceIcon from './DeviceIcon';
import DeviceControls from './DeviceControls';

const DeviceCard = ({ deviceId, device }) => {
  // Prettify the device ID for display, e.g., "living_room_light" -> "Living Room Light"
  const displayName = deviceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DeviceIcon type={device.type} className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">{displayName}</h3>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${device.state === 'on' || device.state === 'locked' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>
        <DeviceControls deviceId={deviceId} device={device} />
      </div>
    </div>
  );
};

export default DeviceCard;