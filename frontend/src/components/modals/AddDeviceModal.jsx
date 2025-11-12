import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import useSensorStore from '../../store/useSensorStore';

// Helper to generate a device ID from a name
const generateDeviceId = (name) => {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
};

// Default state for different device types
const deviceTypeDefaults = {
  light: { state: 'off', brightness: 100, color: '#FFFFFF' },
  thermostat: { state: 'off', targetTemp: 22, mode: 'heat' },
  lock: { state: 'locked' },
  fan: { state: 'off', speed: 1 },
  plug: { state: 'off', powerUsage: 0 },
};

const AddDeviceModal = ({ isOpen, onClose }) => {
  const addDevice = useSensorStore((state) => state.addDevice);
  
  const [name, setName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [type, setType] = useState('light');
  const [error, setError] = useState('');

  // Auto-generate deviceId from name, but allow user to override
  useEffect(() => {
    setDeviceId(generateDeviceId(name));
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !deviceId || !type) {
      setError('Please fill in all required fields.');
      return;
    }

    const deviceData = {
      deviceId,
      name,
      type,
      ...deviceTypeDefaults[type], // Add default properties for the selected type
    };
    
    const result = await addDevice(deviceData);
    
    if (result.success) {
      onClose(); // Close modal on success
      setName(''); // Reset form
    } else {
      setError(result.error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Device">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Device Name */}
        <div>
          <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700">Device Name</label>
          <input
            type="text"
            id="deviceName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="e.g., Living Room Lamp"
            required
          />
        </div>

        {/* Device ID */}
        <div>
          <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">Device ID (auto-generated)</label>
          <input
            type="text"
            id="deviceId"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* Device Type */}
        <div>
          <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700">Device Type</label>
          <select
            id="deviceType"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
          >
            {Object.keys(deviceTypeDefaults).map(t => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Add Device
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDeviceModal;