import React from 'react';
import useSensorStore from '../../store/useSensorStore';
import { Power } from 'lucide-react';

// --- Individual Control Components ---

const LightControls = ({ deviceId, device }) => {
  const setDeviceState = useSensorStore((state) => state.setDeviceState);
  return (
    <div className="flex items-center space-x-2 mt-2">
      <label className="text-xs text-gray-500">Bright:</label>
      <input
        type="range"
        min="0"
        max="100"
        value={device.brightness}
        onChange={(e) => setDeviceState(deviceId, { brightness: parseInt(e.target.value, 10) })}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        disabled={device.state === 'off'}
      />
    </div>
  );
};

const ThermostatControls = ({ deviceId, device }) => {
  const setDeviceState = useSensorStore((state) => state.setDeviceState);
  return (
    <div className="flex items-center justify-between mt-2">
       <span className="text-xl font-bold">{device.targetTemp}°C</span>
       <div className="flex space-x-1">
            <button onClick={() => setDeviceState(deviceId, { targetTemp: device.targetTemp - 1 })} className="p-1 bg-gray-200 rounded-full">-</button>
            <button onClick={() => setDeviceState(deviceId, { targetTemp: device.targetTemp + 1 })} className="p-1 bg-gray-200 rounded-full">+</button>
       </div>
    </div>
  );
};

const LockControls = ({ deviceId, device }) => {
  return <div className="text-sm font-semibold mt-2">{device.state === 'locked' ? 'Locked' : 'Unlocked'}</div>;
};

// --- Main Control Switch ---

const DeviceControls = ({ deviceId, device }) => {
  const toggleDevice = useSensorStore((state) => state.toggleDevice);
  
  // A simple on/off button for devices that support it
  const hasToggle = ['light', 'thermostat', 'fan', 'plug', 'camera', 'sprinkler', 'purifier'].includes(device.type);

  const renderSpecificControls = () => {
    switch (device.type) {
      case 'light':
        return <LightControls deviceId={deviceId} device={device} />;
      case 'thermostat':
        return <ThermostatControls deviceId={deviceId} device={device} />;
      case 'lock':
        return <LockControls deviceId={deviceId} device={device} />;
      // Add cases for 'fan', 'plug', etc. as you build them
      default:
        return null; // No extra controls for this device type
    }
  };

  return (
    <div className="mt-4">
      {renderSpecificControls()}
      {hasToggle && (
        <button
          onClick={() => toggleDevice(deviceId)}
          className={`w-full mt-4 py-2 text-sm font-semibold rounded-lg transition ${
            device.state === 'on' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Power size={14} />
            <span>{device.state === 'on' ? 'Turn Off' : 'Turn On'}</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default DeviceControls;