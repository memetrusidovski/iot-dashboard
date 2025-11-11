import { create } from 'zustand';
import { getApiUrl } from '../config/index';

// API helper with consistent URL construction
const api = {
  getDevices: (userId) => 
    fetch(getApiUrl(`/api/users/${userId}/devices`))
      .then(res => res.json()),
  
  toggleDevice: (userId, deviceId) => 
    fetch(getApiUrl(`/api/users/${userId}/devices/${deviceId}/toggle`), { 
      method: 'POST' 
    }),
  
  updateDeviceState: (userId, deviceId, state) => 
    fetch(getApiUrl(`/api/users/${userId}/devices/${deviceId}/state`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).then(res => res.json()),
};

const useSensorStore = create((set, get) => ({
  // STATE
  currentUser: null,
  connectionStatus: 'Disconnected',
  sensorData: {},
  sensorHistory: {},
  devices: {}, // New state slice for devices

  // ACTIONS
  login: (userId) => set({ currentUser: userId }),
  logout: () => set({
    currentUser: null,
    connectionStatus: 'Disconnected',
    sensorData: {},
    sensorHistory: {},
    devices: {}, // Clear devices on logout
  }),
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  updateSensorData: (topic, data) => set((state) => {
    const sensorName = topic.split('/').pop();
    const currentHistory = state.sensorHistory[sensorName] || [];
    const newHistory = [
      ...currentHistory.slice(-29),
      { ...data, time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    ];
    return {
      sensorData: { ...state.sensorData, [sensorName]: data },
      sensorHistory: { ...state.sensorHistory, [sensorName]: newHistory },
    };
  }),

  // --- NEW DEVICE ACTIONS ---
  
  // Action to fetch initial device states from the API
  fetchDevices: async () => {
    const userId = get().currentUser;
    if (!userId) return;
    try {
      const data = await api.getDevices(userId);
      if (data.devices) {
        set({ devices: data.devices });
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  },

  // Action to update a single device's state (used by WebSocket)
  updateDeviceState: (deviceId, device) => set((state) => ({
    devices: {
      ...state.devices,
      [deviceId]: device,
    }
  })),

  // Actions that components will call to control devices
  // These call the API but don't update state directly.
  // The WebSocket message from the server will trigger the state update.
  // This ensures the UI is always in sync with the backend's "source of truth".
  toggleDevice: (deviceId) => {
    const userId = get().currentUser;
    if (!userId) return;
    api.toggleDevice(userId, deviceId);
  },

  setDeviceState: (deviceId, newState) => {
    const userId = get().currentUser;
    if (!userId) return;
    api.updateDeviceState(userId, deviceId, newState);
  },
}));

export default useSensorStore;