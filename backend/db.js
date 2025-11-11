// db.js - Centralized In-Memory Data Storage
// This file contains all user data, sensor history, and device configurations

// -----------START: User Data Storage-----------
/**
 * Central user data structure containing:
 * - ws: WebSocket connection for real-time updates
 * - sensorDataHistory: Historical sensor readings
 * - sensorLimits: Alert thresholds for each sensor
 * - devices: Smart home devices and their states
 */
const userData = {
  alice: { 
    ws: null, 
    sensorDataHistory: { 
      temperature: [], 
      humidity: [] 
    },
    sensorLimits: {
      temperature: { min: 18, max: 28, enabled: true },
      humidity: { min: 30, max: 60, enabled: true }
    },
    devices: {
      living_room_light: {
        type: 'light',
        name: 'Living Room Light',
        state: 'off',
        brightness: 100,
        color: '#FFFFFF',
        lastUpdated: Date.now()
      },
      bedroom_light: {
        type: 'light',
        name: 'Bedroom Light',
        state: 'off',
        brightness: 75,
        color: '#FFE4B5',
        lastUpdated: Date.now()
      },
      thermostat: {
        type: 'thermostat',
        name: 'Main Thermostat',
        state: 'off',
        targetTemp: 22,
        mode: 'heat',
        lastUpdated: Date.now()
      },
      smart_lock: {
        type: 'lock',
        name: 'Front Door Lock',
        state: 'locked',
        lastUpdated: Date.now()
      },
      garage_door: {
        type: 'door',
        name: 'Garage Door',
        state: 'closed',
        lastUpdated: Date.now()
      }
    }
  },
  bob: { 
    ws: null, 
    sensorDataHistory: { 
      pressure: [], 
      light_level: [] 
    },
    sensorLimits: {
      pressure: { min: 1000, max: 1030, enabled: true },
      light_level: { min: 200, max: 1200, enabled: true }
    },
    devices: {
      kitchen_light: {
        type: 'light',
        name: 'Kitchen Light',
        state: 'on',
        brightness: 80,
        color: '#FFFFFF',
        lastUpdated: Date.now()
      },
      office_light: {
        type: 'light',
        name: 'Office Light',
        state: 'off',
        brightness: 100,
        color: '#FFFFFF',
        lastUpdated: Date.now()
      },
      ceiling_fan: {
        type: 'fan',
        name: 'Ceiling Fan',
        state: 'off',
        speed: 2,
        lastUpdated: Date.now()
      },
      smart_plug: {
        type: 'plug',
        name: 'Smart Plug',
        state: 'on',
        powerUsage: 45.3,
        lastUpdated: Date.now()
      }
    }
  },
  steve: { 
    ws: null, 
    sensorDataHistory: { 
      temperature: [], 
      co2: [] 
    },
    sensorLimits: {
      temperature: { min: 15, max: 25, enabled: true },
      co2: { min: 400, max: 800, enabled: true }
    },
    devices: {
      porch_light: {
        type: 'light',
        name: 'Porch Light',
        state: 'off',
        brightness: 100,
        color: '#FFFFFF',
        lastUpdated: Date.now()
      },
      security_camera: {
        type: 'camera',
        name: 'Security Camera',
        state: 'on',
        recording: true,
        motionDetection: true,
        lastUpdated: Date.now()
      },
      sprinkler: {
        type: 'sprinkler',
        name: 'Garden Sprinkler',
        state: 'off',
        zone: 1,
        duration: 15,
        lastUpdated: Date.now()
      },
      air_purifier: {
        type: 'purifier',
        name: 'Air Purifier',
        state: 'on',
        mode: 'auto',
        lastUpdated: Date.now()
      }
    }
  }
};
// -----------END: User Data Storage-----------

// -----------START: Device Helper Functions-----------
/**
 * Get all devices for a specific user
 * @param {string} userId - The user identifier
 * @returns {Object|null} User's devices object or null if user not found
 */
const getUserDevices = (userId) => {
  if (!userData[userId]) return null;
  return userData[userId].devices || null;
};

/**
 * Get a specific device for a user
 * @param {string} userId - The user identifier
 * @param {string} deviceId - The device identifier
 * @returns {Object|null} Device object or null if not found
 */
const getUserDevice = (userId, deviceId) => {
  if (!userData[userId] || !userData[userId].devices) return null;
  return userData[userId].devices[deviceId] || null;
};

/**
 * Update device state and timestamp
 * @param {string} userId - The user identifier
 * @param {string} deviceId - The device identifier
 * @param {Object} updates - Object containing fields to update
 * @returns {Object} Result object with success status and device data
 */
const updateDeviceState = (userId, deviceId, updates) => {
  if (!userData[userId] || !userData[userId].devices || !userData[userId].devices[deviceId]) {
    return { success: false, error: 'User or device not found' };
  }

  const device = userData[userId].devices[deviceId];
  
  // Update only the provided fields (protect type from being changed)
  Object.keys(updates).forEach(key => {
    if (key !== 'type' && key !== 'lastUpdated') {
      device[key] = updates[key];
    }
  });
  
  device.lastUpdated = Date.now();
  
  return { success: true, device };
};

/**
 * Add a new device to a user's device collection
 * @param {string} userId - The user identifier
 * @param {string} deviceId - The new device identifier (must be unique for user)
 * @param {Object} deviceData - Device configuration object
 * @returns {Object} Result object with success status and device data
 */
const addUserDevice = (userId, deviceId, deviceData) => {
  if (!userData[userId]) {
    return { success: false, error: 'User not found' };
  }
  
  if (!userData[userId].devices) {
    userData[userId].devices = {};
  }
  
  if (userData[userId].devices[deviceId]) {
    return { success: false, error: 'Device ID already exists for this user' };
  }
  
  // Create new device with required fields
  userData[userId].devices[deviceId] = {
    ...deviceData,
    lastUpdated: Date.now()
  };
  
  return { success: true, device: userData[userId].devices[deviceId] };
};

/**
 * Delete a device from a user's device collection
 * @param {string} userId - The user identifier
 * @param {string} deviceId - The device identifier to delete
 * @returns {Object} Result object with success status
 */
const deleteUserDevice = (userId, deviceId) => {
  if (!userData[userId] || !userData[userId].devices || !userData[userId].devices[deviceId]) {
    return { success: false, error: 'User or device not found' };
  }
  
  delete userData[userId].devices[deviceId];
  return { success: true };
};
// -----------END: Device Helper Functions-----------

// -----------START: Sensor Helper Functions-----------
/**
 * Get sensor history for a specific user and sensor
 * @param {string} userId - The user identifier
 * @param {string} sensorName - The sensor name
 * @returns {Array|null} Sensor data history or null if not found
 */
const getSensorHistory = (userId, sensorName) => {
  if (!userData[userId] || !userData[userId].sensorDataHistory) return null;
  return userData[userId].sensorDataHistory[sensorName] || null;
};

/**
 * Get all sensor names for a user
 * @param {string} userId - The user identifier
 * @returns {Array|null} Array of sensor names or null if user not found
 */
const getUserSensors = (userId) => {
  if (!userData[userId] || !userData[userId].sensorDataHistory) return null;
  return Object.keys(userData[userId].sensorDataHistory);
};
// -----------END: Sensor Helper Functions-----------

// -----------START: Alert/Limit Helper Functions-----------
/**
 * Get all sensor limits for a user
 * @param {string} userId - The user identifier
 * @returns {Object|null} Sensor limits object or null if user not found
 */
const getSensorLimits = (userId) => {
  if (!userData[userId] || !userData[userId].sensorLimits) return null;
  return userData[userId].sensorLimits;
};

/**
 * Get limits for a specific sensor
 * @param {string} userId - The user identifier
 * @param {string} sensorName - The sensor name
 * @returns {Object|null} Sensor limit configuration or null if not found
 */
const getSensorLimit = (userId, sensorName) => {
  if (!userData[userId] || !userData[userId].sensorLimits) return null;
  return userData[userId].sensorLimits[sensorName] || null;
};

/**
 * Update limits for a specific sensor
 * @param {string} userId - The user identifier
 * @param {string} sensorName - The sensor name
 * @param {Object} limits - Limit configuration { min, max, enabled }
 * @returns {Object} Result object with success status and updated limits
 */
const updateSensorLimit = (userId, sensorName, limits) => {
  if (!userData[userId]) {
    return { success: false, error: 'User not found' };
  }
  
  if (!userData[userId].sensorLimits) {
    userData[userId].sensorLimits = {};
  }
  
  if (!userData[userId].sensorLimits[sensorName]) {
    userData[userId].sensorLimits[sensorName] = { enabled: true };
  }
  
  // Update limit fields
  const currentLimits = userData[userId].sensorLimits[sensorName];
  if (limits.min !== undefined) currentLimits.min = limits.min;
  if (limits.max !== undefined) currentLimits.max = limits.max;
  if (limits.enabled !== undefined) currentLimits.enabled = limits.enabled;
  
  return { success: true, limits: currentLimits };
};

/**
 * Check if sensor value exceeds configured limits
 * @param {string} userId - The user identifier
 * @param {string} sensorName - The sensor name
 * @param {number} value - Sensor value to check
 * @returns {Object|null} Alert object if limit exceeded, null otherwise
 */
const checkSensorLimits = (userId, sensorName, value) => {
  const limits = getSensorLimit(userId, sensorName);
  
  if (!limits || !limits.enabled) return null;
  
  if (limits.min !== undefined && value < limits.min) {
    return {
      type: 'below_minimum',
      sensorName,
      value,
      limit: limits.min,
      message: `${sensorName} is below minimum threshold (${value} < ${limits.min})`
    };
  }
  
  if (limits.max !== undefined && value > limits.max) {
    return {
      type: 'above_maximum',
      sensorName,
      value,
      limit: limits.max,
      message: `${sensorName} is above maximum threshold (${value} > ${limits.max})`
    };
  }
  
  return null;
};
// -----------END: Alert/Limit Helper Functions-----------

// -----------START: Module Exports-----------
module.exports = {
  userData,
  getUserDevices,
  getUserDevice,
  updateDeviceState,
  addUserDevice,
  deleteUserDevice,
  getSensorHistory,
  getUserSensors,
  getSensorLimits,
  getSensorLimit,
  updateSensorLimit,
  checkSensorLimits
};
// -----------END: Module Exports-----------