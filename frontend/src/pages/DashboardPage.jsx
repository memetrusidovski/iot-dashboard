import React, { useEffect } from 'react';
import { Zap } from 'lucide-react';
import useSensorStore from '../store/useSensorStore';
import useWebSocket from '../hooks/useWebSocket';

// Component Imports
import SensorCard from '../components/SensorCard';
import StatusIndicator from '../components/StatusIndicator';
import SensorChart from '../components/SensorChart';
import DeviceCard from '../components/Devices/DeviceCard';

const DashboardPage = () => {
  // Select all necessary state and actions from the Zustand store
  const {
    currentUser,
    connectionStatus,
    sensorData,
    sensorHistory,
    devices,
    fetchDevices,
    logout
  } = useSensorStore();

  // Initialize the WebSocket connection and get the logout handler
  const { handleLogout } = useWebSocket(currentUser);

  // Effect to fetch initial device data when the component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchDevices();
    }
  }, [currentUser, fetchDevices]);

  // Derive lists of keys for rendering, ensuring they are stable
  const sensorNames = Object.keys(sensorHistory);
  const deviceIds = Object.keys(devices);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Title and User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IoT Dashboard</h1>
                <p className="text-sm text-gray-600">
                  User: <span className="font-medium capitalize">{currentUser}</span>
                </p>
              </div>
            </div>

            {/* Right side: Status and Logout */}
            <div className="flex items-center space-x-4">
              <StatusIndicator status={connectionStatus} />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- Device Controls Section --- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Device Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deviceIds.length > 0 ? (
              deviceIds.map(deviceId => (
                <DeviceCard
                  key={deviceId}
                  deviceId={deviceId}
                  device={devices[deviceId]}
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                No controllable devices found for this user.
              </p>
            )}
          </div>
        </section>

        {/* --- Sensor Data Section --- */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Sensor Data</h2>
          
          {/* Sensor Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sensorNames.length > 0 ? (
              sensorNames.map(name => (
                <SensorCard key={name} sensorName={name} data={sensorData[name]} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">
                Waiting for sensor data...
              </p>
            )}
          </div>

          {/* Sensor History Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sensorNames.map(name => (
              <SensorChart
                key={name}
                sensorName={name}
                history={sensorHistory[name]}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;