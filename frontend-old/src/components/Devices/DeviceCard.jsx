import React from 'react';
import { Trash2 } from 'lucide-react';
import useSensorStore from '../../store/useSensorStore';
import DeviceIcon from './DeviceIcon';
import DeviceControls from './DeviceControls'; // Assume this will be updated too

const DeviceCard = ({ deviceId, device }) => {
  const deleteDevice = useSensorStore((state) => state.deleteDevice);
  const displayName = device.name || deviceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${displayName}"? This cannot be undone.`)) {
      await deleteDevice(deviceId);
    }
  };

  return (
    // BEFORE: <div className="bg-white ... border-gray-100 ...">
    // AFTER: Use semantic colors that change with the theme
    <div className="bg-card text-card-foreground rounded-xl shadow-md p-4 border border-border flex flex-col justify-between group relative transition-colors">
      <button className="bg-card text-foreground hover:bg-secondary">Click me</button>

      {/* BEFORE: className="... bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600" */}
      {/* AFTER: Use destructive color for delete, which is also themed */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-background text-foreground/50 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
        aria-label={`Delete ${displayName}`}
      >
        <Trash2 size={14} />
      </button>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* BEFORE: className="... text-gray-500" */}
            {/* AFTER: Use a slightly dimmer foreground color */}
            <DeviceIcon type={device.type} className="w-5 h-5 text-foreground/60" />

            {/* BEFORE: className="... text-gray-800" */}
            {/* AFTER: This will now be light on dark mode, dark on light mode */}
            <h3 className="font-semibold text-card-foreground">{displayName}</h3>
          </div>
          {/* Status indicators are fine to keep as-is */}
          <div className={`w-2.5 h-2.5 rounded-full ${device.state === 'on' || device.state === 'locked' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>
        {/* Pass the theme props down if needed, or update DeviceControls to use semantic colors too */}
        <DeviceControls deviceId={deviceId} device={device} />
      </div>
    </div>
  );
};

export default DeviceCard;