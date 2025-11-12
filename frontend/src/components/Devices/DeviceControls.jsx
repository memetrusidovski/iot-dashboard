import React from 'react';
import useSensorStore from '../../store/useSensorStore';
import { Power, Plus, Minus, Lock, Unlock } from 'lucide-react';

// --- Individual Control Components ---

const LightControls = ({ deviceId, device }) => {
  const setDeviceState = useSensorStore((state) => state.setDeviceState);
  
  return (
    <div className="space-y-3">
      {/* Brightness Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            Brightness
          </label>
          <span className="text-sm font-semibold text-foreground">
            {device.brightness}%
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={device.brightness}
            onChange={(e) => setDeviceState(deviceId, { brightness: parseInt(e.target.value, 10) })}
            disabled={device.state === 'off'}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: device.state === 'off' 
                ? undefined 
                : `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${device.brightness}%, hsl(var(--muted)) ${device.brightness}%, hsl(var(--muted)) 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ThermostatControls = ({ deviceId, device }) => {
  const setDeviceState = useSensorStore((state) => state.setDeviceState);
  
  return (
    <div className="space-y-3">
      {/* Temperature Display */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Target Temperature</p>
          <p className="text-3xl font-bold text-foreground">{device.targetTemp}°C</p>
        </div>
        
        {/* Temperature Controls */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setDeviceState(deviceId, { targetTemp: device.targetTemp + 1 })}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Increase temperature"
          >
            <Plus size={18} />
          </button>
          <button 
            onClick={() => setDeviceState(deviceId, { targetTemp: device.targetTemp - 1 })}
            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
            aria-label="Decrease temperature"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>
      
      {/* Current vs Target */}
      {device.currentTemp && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current</span>
          <span className="font-medium text-foreground">{device.currentTemp}°C</span>
        </div>
      )}
    </div>
  );
};

const LockControls = ({ deviceId, device }) => {
  const toggleDevice = useSensorStore((state) => state.toggleDevice);
  const isLocked = device.state === 'locked';
  
  return (
    <div className="space-y-3">
      {/* Lock Status Display */}
      <div className={`p-4 rounded-lg border-2 transition-colors ${
        isLocked 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-muted/50 border-border'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isLocked ? 'bg-primary/10' : 'bg-muted'
            }`}>
              {isLocked ? (
                <Lock size={20} className="text-primary" />
              ) : (
                <Unlock size={20} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isLocked ? 'Locked' : 'Unlocked'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isLocked ? 'Door is secure' : 'Door is accessible'}
              </p>
            </div>
          </div>
          
          {/* Lock/Unlock Toggle */}
          <button
            onClick={() => toggleDevice(deviceId)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isLocked
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {isLocked ? 'Unlock' : 'Lock'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FanControls = ({ deviceId, device }) => {
  const setDeviceState = useSensorStore((state) => state.setDeviceState);
  const speeds = ['low', 'medium', 'high'];
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">
        Fan Speed
      </label>
      <div className="grid grid-cols-3 gap-2">
        {speeds.map((speed) => (
          <button
            key={speed}
            onClick={() => setDeviceState(deviceId, { speed })}
            disabled={device.state === 'off'}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize ${
              device.speed === speed && device.state === 'on'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {speed}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main Control Switch ---

const DeviceControls = ({ deviceId, device }) => {
  const toggleDevice = useSensorStore((state) => state.toggleDevice);
  
  // Devices that support toggle (locks are handled differently)
  const hasToggle = ['light', 'thermostat', 'fan', 'plug', 'camera', 'sprinkler', 'purifier'].includes(device.type);
  const isOn = device.state === 'on';

  const renderSpecificControls = () => {
    switch (device.type) {
      case 'light':
        return <LightControls deviceId={deviceId} device={device} />;
      case 'thermostat':
        return <ThermostatControls deviceId={deviceId} device={device} />;
      case 'lock':
        return <LockControls deviceId={deviceId} device={device} />;
      case 'fan':
        return <FanControls deviceId={deviceId} device={device} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderSpecificControls()}
      
      {/* Power Toggle Button (for non-lock devices) */}
      {hasToggle && (
        <button
          onClick={() => toggleDevice(deviceId)}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            isOn
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          <Power size={16} />
          <span>{isOn ? 'Turn Off' : 'Turn On'}</span>
        </button>
      )}
    </div>
  );
};

export default DeviceControls;