import React from 'react';
import { Trash2 } from 'lucide-react';
import useSensorStore from '../../store/useSensorStore';
import DeviceIcon from './DeviceIcon';
import DeviceControls from './DeviceControls';

const DeviceCard = ({ deviceId, device }) => {
  const deleteDevice = useSensorStore((state) => state.deleteDevice);
  const displayName = device.name || deviceId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${displayName}"? This cannot be undone.`)) {
      await deleteDevice(deviceId);
    }
  };

  const isActive = device.state === 'on' || device.state === 'locked';

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden group hover:shadow-xl transition-all">
      {/* Header with colored accent */}
      <div className="relative bg-primary/5 border-b border-border p-4">
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
          aria-label={`Delete ${displayName}`}
        >
          <Trash2 size={14} />
        </button>

        <div className="flex items-center gap-3 pr-8">
          {/* Icon */}
          <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
            <DeviceIcon type={device.type} className="w-5 h-5" />
          </div>

          {/* Title and Type */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground capitalize">
                {device.type}
              </span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5">
                <div 
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-green-500 animate-pulse' : 'bg-muted'
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {isActive ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="p-4 bg-card">
        <DeviceControls deviceId={deviceId} device={device} />
      </div>
    </div>
  );
};

export default DeviceCard;