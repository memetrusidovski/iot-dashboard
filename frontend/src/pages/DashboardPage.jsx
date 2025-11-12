import React, { useState, useEffect } from 'react';
import { Zap, Plus, ArrowRight  } from 'lucide-react';
import useSensorStore from '../store/useSensorStore';
import useWebSocket from '../hooks/useWebSocket';

// Component Imports
import SensorCard from '../components/Sensors/SensorCard';
import StatusIndicator from '../components/StatusIndicator';
import SensorChart from '../components/Sensors/SensorChart';
import DeviceCard from '../components/Devices/DeviceCard';
import AddDeviceModal from '../components/modals/AddDeviceModal';
import ThemeSwitcher from '../components/ThemeSwitcher';

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState('left');

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
  const deviceIds = Object.keys(useSensorStore(state => state.devices));
  
  const handleMoveButton = () => {
    setButtonPosition(prev => prev === 'left' ? 'right' : 'left');
  };

  return (
    <>
    <div className="min-h-screen bg-card/85">
      {/* ===== HEADER ===== */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Title and User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">IoT Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  User: <span className="font-medium capitalize">{currentUser}</span>
                </p>
              </div>
            </div>

            {/* Right side: Status and Logout */}
            <div className="flex items-center space-x-4">
                <ThemeSwitcher />
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
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Device Controls</h2>
          {/* Easter Egg: Moving Add Device Button */}
          <div className="mb-6 relative h-12">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`bg-primary text-primary-foreground hover:bg-primary/90 absolute flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-indigo-700 transition-all duration-500 ease-in-out ${
                buttonPosition === 'left' ? 'left-0' : 'right-0'
              }`}
            >
              <Plus size={16} />
              <span>Add Device</span>
            </button>
            
            <button
              onClick={handleMoveButton}
              className={`absolute flex items-center justify-center w-10 h-10 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-500 ease-in-out ${
                buttonPosition === 'left' ? 'left-36' : 'right-36'
              }`}
              title="Move button (Easter egg!)"
            >
              <ArrowRight size={16} className={`transition-transform duration-500 ${buttonPosition === 'right' ? 'rotate-180' : ''}`} />
            </button>
          </div>
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

    {/* ===== MODAL ===== */}
      {/* Render the modal outside the main layout */}
      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      </>
    
  );
};

export default DashboardPage;