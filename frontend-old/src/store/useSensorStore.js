import { create } from 'zustand';

// Assuming you have this helper file for environment-specific URLs
import { getApiUrl } from '../config/index';

// --- API Helper ---
// A centralized place for all backend communication
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

    getSensorLimits: (userId) =>
        fetch(getApiUrl(`/api/users/${userId}/sensors/limits`))
    .then(res => res.json()),
    
    updateSensorLimit: (userId, sensorName, limits) =>
        fetch(getApiUrl(`/api/users/${userId}/sensors/${sensorName}/limits`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limits),
    }),


  getSensorHistory: (userId, sensorName) =>
    fetch(getApiUrl(`/api/users/${userId}/sensors/${sensorName}/history`))
      .then(res => res.json()),

  addDevice: (userId, deviceData) =>
    fetch(getApiUrl(`/api/users/${userId}/devices`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    }),

deleteDevice: (userId, deviceId) =>
    fetch(getApiUrl(`/api/users/${userId}/devices/${deviceId}`), {
      method: 'DELETE',
    }),
};


// --- Zustand Store Definition ---
const useSensorStore = create((set, get) => ({
  /**
   * =================================================================
   * STATE
   * =================================================================
   */
  currentUser: null,
  connectionStatus: 'Disconnected',
  sensorData: {},       // Holds the LATEST data point for each sensor
  sensorHistory: {},    // Holds an array of recent data points for charts
  devices: {},          // Holds the state of all controllable devices
  historyLoaded: {},    // Tracks which sensors have their history loaded to prevent re-fetching
  sensorLimits: {}, // Holds limit configuration { min, max, enabled } for each sensor
  activeAlerts: {}, // Holds active server-sent alerts for each sensor

  /**
   * =================================================================
   * ACTIONS
   * =================================================================
   */

  // --- User and Connection Actions ---

  login: (userId) => set({ currentUser: userId }),
  logout: () => set({
    currentUser: null,
    connectionStatus: 'Disconnected',
    sensorData: {},
    sensorHistory: {},
    devices: {},
    historyLoaded: {},
  }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),


  // --- Sensor and History Actions ---

  /**
   * This action is called by the WebSocket hook whenever new sensor data arrives.
   * It updates the latest value, appends to the history, and checks if an alert should be cleared.
   */
  updateSensorData: (topic, data) => set((state) => {
    const sensorName = topic.split('/').pop();
    const currentHistory = state.sensorHistory[sensorName] || [];

    // Create the new data point for the history array
    const newPoint = {
      ...data,
      time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // This is a robust way to add a point and cap the array size
    const newHistory = [...currentHistory.slice(-249), newPoint];
    const newSensorData = { ...state.sensorData, [sensorName]: data };
    const newSensorHistory = { ...state.sensorHistory, [sensorName]: newHistory };

    // Alert clearing logic: check if the new value is back within limits
    const limits = state.sensorLimits[sensorName];
    const currentAlert = state.activeAlerts[sensorName];
    if (currentAlert && limits && limits.enabled) {
      const isWithinLimits = data.value >= limits.min && data.value <= limits.max;
      if (isWithinLimits) {
        // Value is back to normal, clear the alert for this sensor
        const newAlerts = { ...state.activeAlerts };
        delete newAlerts[sensorName];
        return {
          sensorData: newSensorData,
          sensorHistory: newSensorHistory,
          activeAlerts: newAlerts, // Return the updated alerts object
        };
      }
    }

    // Default return if no alert logic is triggered
    return {
      sensorData: newSensorData,
      sensorHistory: newSensorHistory,
    };
  }),

  // --- Limit and Alert Actions ---

  fetchSensorLimits: async () => {
    const userId = get().currentUser;
    if (!userId) return;
    try {
      const { limits } = await api.getSensorLimits(userId);
      if (limits) set({ sensorLimits: limits });
    } catch (error) {
      console.error("Failed to fetch sensor limits:", error);
    }
  },

  updateSensorLimit: async (sensorName, newLimits) => {
    const userId = get().currentUser;
    if (!userId) return;
    set(state => ({
      sensorLimits: { ...state.sensorLimits, [sensorName]: { ...state.sensorLimits[sensorName], ...newLimits } }
    }));
    await api.updateSensorLimit(userId, sensorName, newLimits);
  },

  setSensorLimit: (sensorName, limits) => set(state => ({
    sensorLimits: { ...state.sensorLimits, [sensorName]: limits }
  })),

  setActiveAlert: (alert) => set(state => ({
    activeAlerts: { ...state.activeAlerts, [alert.sensorName]: alert }
  })),
  /**
   * BUG FIX & GUIDANCE: "Out of Memory" Error
   * This error happens when `loadSensorHistory` is called in an infinite loop from a component.
   * To prevent this, ALWAYS call it from a `useEffect` hook with a proper dependency array.
   *
   * Correct Component Usage:
   * useEffect(() => {
   *   // This check prevents re-fetching if data is already present
   *   if (!historyLoaded[sensorName]) {
   *     loadSensorHistory(sensorName);
   *   }
   * }, [sensorName, historyLoaded, loadSensorHistory]);
   */
  loadSensorHistory: async (sensorName) => {
    const { currentUser, historyLoaded } = get();
    if (!currentUser || historyLoaded[sensorName]) return;

    try {
      const history = await api.getSensorHistory(currentUser, sensorName);

      const formattedHistory = history.slice(-250).map(point => ({
        ...point,
        time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      set((state) => ({
        sensorHistory: {
          ...state.sensorHistory,
          [sensorName]: formattedHistory,
        },
        historyLoaded: {
          ...state.historyLoaded,
          [sensorName]: true,
        },
      }));
    } catch (error) {
      console.error(`Failed to load history for ${sensorName}:`, error);
    }
  },

//   updateSensorData: (topic, data) => set((state) => {
//     if (!topic) return state;
//     const sensorName = topic.split('/').pop();
//     const currentHistory = state.sensorHistory[sensorName] || [];

//     const newPoint = {
//       ...data,
//       time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//     };

//     // This is a robust way to add a point and cap the array size
//     const newHistory = [...currentHistory.slice(-249), newPoint];

//     return {
//       sensorData: { ...state.sensorData, [sensorName]: data },
//       sensorHistory: { ...state.sensorHistory, [sensorName]: newHistory },
//     };
//   }),


  // --- Device Actions ---

  fetchDevices: async () => {
    const userId = get().currentUser;
    if (!userId) return;
    try {
      const { devices } = await api.getDevices(userId);
      if (devices) {
        set({ devices });
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  },

  // This single action handles state updates from WebSockets for both existing and new devices
  updateDeviceState: (deviceId, device) => set((state) => ({
    devices: {
      ...state.devices,
      [deviceId]: device,
    }
  })),

  toggleDevice: (deviceId) => {
    const userId = get().currentUser;
    if (userId) api.toggleDevice(userId, deviceId);
  },

  setDeviceState: (deviceId, newState) => {
    const userId = get().currentUser;
    if (userId) api.updateDeviceState(userId, deviceId, newState);
  },

  addDevice: async (deviceData) => {
    const userId = get().currentUser;
    if (!userId) return { success: false, error: "No user logged in" };

    try {
      const response = await api.addDevice(userId, deviceData);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || `Server error: ${response.status}` };
      }
      // If needed, you can fetch devices again to update the store
        await get().fetchDevices();

      // Success! The WebSocket message will update the state.
      return { success: true };
    } catch (error) {
      console.error("Failed to add device:", error);
      return { success: false, error: "Network error. Could not add device." };
    }
  },

removeDevice: (deviceId) => set((state) => {
    const newDevices = { ...state.devices };
    delete newDevices[deviceId];
    return { devices: newDevices };
  }),

  // NEW: Action that components call to initiate a device deletion
  deleteDevice: async (deviceId) => {
    const userId = get().currentUser;
    if (!userId) return { success: false, error: "No user logged in" };

    try {
      const response = await api.deleteDevice(userId, deviceId);
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || `Server error: ${response.status}` };
      }
      // Success! The WebSocket message will handle removing the device from the UI.
      return { success: true };
    } catch (error) {
      console.error("Failed to delete device:", error);
      return { success: false, error: "Network error. Could not delete device." };
    }},

}));

export default useSensorStore;