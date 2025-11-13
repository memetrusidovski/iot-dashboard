// routes/manager.js - Device Management API Endpoints
// Provides REST API for managing IoT devices per user

const express = require('express');
const router = express.Router();
const db = require('../db');

// -----------START: Get All Devices-----------
/**
 * GET /api/users/:userId/devices
 * Retrieve all devices for a specific user
 * 
 * @route GET /api/users/:userId/devices
 * @param {string} userId - User identifier from URL
 * @returns {Object} JSON object containing userId and devices
 * @returns {404} If user not found
 */
router.get('/api/users/:userId/devices', (req, res) => {
  const { userId } = req.params;
  const devices = db.getUserDevices(userId);
  
  if (!devices) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ userId, devices });
});
// -----------END: Get All Devices-----------

// -----------START: Get Specific Device-----------
/**
 * GET /api/users/:userId/devices/:deviceId
 * Retrieve a specific device's current state
 * 
 * @route GET /api/users/:userId/devices/:deviceId
 * @param {string} userId - User identifier from URL
 * @param {string} deviceId - Device identifier from URL
 * @returns {Object} JSON object containing device details
 * @returns {404} If user or device not found
 */
router.get('/api/users/:userId/devices/:deviceId', (req, res) => {
  const { userId, deviceId } = req.params;
  const device = db.getUserDevice(userId, deviceId);
  
  if (!device) {
    return res.status(404).json({ error: 'User or device not found' });
  }
  
  res.json({ userId, deviceId, device });
});
// -----------END: Get Specific Device-----------

// -----------START: Update Device State-----------
/**
 * POST /api/users/:userId/devices/:deviceId/state
 * Update the state of a specific device
 * 
 * @route POST /api/users/:userId/devices/:deviceId/state
 * @param {string} userId - User identifier from URL
 * @param {string} deviceId - Device identifier from URL
 * @body {Object} updates - Device properties to update
 * @example
 * // Light update
 * { state: 'on', brightness: 80, color: '#FF0000' }
 * 
 * // Thermostat update
 * { state: 'on', targetTemp: 24, mode: 'cool' }
 * 
 * // Lock update
 * { state: 'unlocked' }
 * 
 * @returns {Object} Success status and updated device
 * @returns {404} If user or device not found
 */
router.post('/api/users/:userId/devices/:deviceId/state', (req, res) => {
  const { userId, deviceId } = req.params;
  const updates = req.body;
  
  console.log(`[Device State Update] User: ${userId}, Device: ${deviceId}`, updates);
  
  const result = db.updateDeviceState(userId, deviceId, updates);
  
  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }
  
  // Broadcast to all WebSocket connections for real-time UI updates
  const userData = req.app.get('userData');
  if (userData && userData[userId] && userData[userId].ws) {
    const userConnections = userData[userId].ws;
    // Send to all connected clients for this user
    userConnections.forEach(userConnection => {
      if (userConnection && userConnection.readyState === 1) { // WebSocket.OPEN
        userConnection.send(JSON.stringify({
          type: 'device_update',
          userId,
          deviceId,
          device: result.device
        }));
      }
    });
  }
  
  res.json({ 
    success: true, 
    userId, 
    deviceId, 
    device: result.device 
  });
});
// -----------END: Update Device State-----------

// -----------START: Toggle Device-----------
/**
 * POST /api/users/:userId/devices/:deviceId/toggle
 * Quick toggle for on/off state of a device
 * 
 * @route POST /api/users/:userId/devices/:deviceId/toggle
 * @param {string} userId - User identifier from URL
 * @param {string} deviceId - Device identifier from URL
 * @returns {Object} Success status and updated device
 * @returns {404} If user or device not found
 */
router.post('/api/users/:userId/devices/:deviceId/toggle', (req, res) => {
  const { userId, deviceId } = req.params;
  const device = db.getUserDevice(userId, deviceId);
  
  if (!device) {
    return res.status(404).json({ error: 'User or device not found' });
  }
  
  // Toggle the state between on/off
  var newState = device.state === 'on' ? 'off' : 'on';

  // if device.type === 'door' or device.type === 'lock' use 'locked'/'unlocked' instead
  if (device.type === 'lock') {
    newState = device.state === 'locked' ? 'unlocked' : 'locked';
  } else if (device.type === 'door') {
    newState = device.state === 'open' ? 'closed' : 'open';
  }

  const result = db.updateDeviceState(userId, deviceId, { state: newState });
  
  // Broadcast to all WebSocket connections for real-time UI updates
  const userData = req.app.get('userData');
  if (userData && userData[userId] && userData[userId].ws) {
    const userConnections = userData[userId].ws;
    // Send to all connected clients for this user
    userConnections.forEach(userConnection => {
      if (userConnection && userConnection.readyState === 1) {
        userConnection.send(JSON.stringify({
          type: 'device_update',
          userId,
          deviceId,
          device: result.device
        }));
      }
    });
  }
  
  res.json({ 
    success: true, 
    userId, 
    deviceId, 
    device: result.device 
  });
});
// -----------END: Toggle Device-----------

// -----------START: Get Devices by Type-----------
/**
 * GET /api/users/:userId/devices/type/:deviceType
 * Retrieve all devices of a specific type for a user
 * 
 * @route GET /api/users/:userId/devices/type/:deviceType
 * @param {string} userId - User identifier from URL
 * @param {string} deviceType - Device type (light, thermostat, lock, etc.)
 * @returns {Object} Filtered devices of specified type
 * @returns {404} If user not found
 */
router.get('/api/users/:userId/devices/type/:deviceType', (req, res) => {
  const { userId, deviceType } = req.params;
  const devices = db.getUserDevices(userId);
  
  if (!devices) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const filteredDevices = Object.entries(devices)
    .filter(([_, device]) => device.type === deviceType)
    .reduce((acc, [deviceId, device]) => {
      acc[deviceId] = device;
      return acc;
    }, {});
  
  res.json({ userId, deviceType, devices: filteredDevices });
});
// -----------END: Get Devices by Type-----------

// -----------START: Add New Device-----------
/**
 * POST /api/users/:userId/devices
 * Add a new device to a user's collection
 * 
 * @route POST /api/users/:userId/devices
 * @param {string} userId - User identifier from URL
 * @body {Object} deviceData - New device configuration
 * @body {string} deviceData.deviceId - Unique identifier for the device
 * @body {string} deviceData.type - Device type (light, thermostat, lock, etc.)
 * @body {string} deviceData.name - Human-readable device name
 * @body {string} deviceData.state - Initial state (on/off/locked/etc.)
 * @body {Object} deviceData.* - Additional device-specific properties
 * 
 * @example
 * // Add a light
 * {
 *   deviceId: 'bathroom_light',
 *   type: 'light',
 *   name: 'Bathroom Light',
 *   state: 'off',
 *   brightness: 100,
 *   color: '#FFFFFF'
 * }
 * 
 * @returns {Object} Success status and created device
 * @returns {400} If required fields are missing
 * @returns {404} If user not found
 * @returns {409} If device ID already exists
 */
router.post('/api/users/:userId/devices', (req, res) => {
  const { userId } = req.params;
  const { deviceId, ...deviceData } = req.body;
  
  // Validate required fields
  if (!deviceId || !deviceData.type || !deviceData.name) {
    return res.status(400).json({ 
      error: 'Missing required fields: deviceId, type, and name are required' 
    });
  }
  
  console.log(`[Add Device] User: ${userId}, DeviceId: ${deviceId}`, deviceData);
  
  const result = db.addUserDevice(userId, deviceId, deviceData);
  
  if (!result.success) {
    const statusCode = result.error === 'User not found' ? 404 : 409;
    return res.status(statusCode).json({ error: result.error });
  }
  
  // Broadcast to all WebSocket connections for real-time UI updates
  const userData = req.app.get('userData');
  if (userData && userData[userId] && userData[userId].ws) {
    const userConnections = userData[userId].ws;
    // Send to all connected clients for this user
    userConnections.forEach(userConnection => {
      if (userConnection && userConnection.readyState === 1) {
        userConnection.send(JSON.stringify({
          type: 'device_added',
          userId,
          deviceId,
          device: result.device
        }));
      }
    });
  }
  
  res.status(201).json({ 
    success: true, 
    userId, 
    deviceId, 
    device: result.device 
  });
});
// -----------END: Add New Device-----------

// -----------START: Delete Device-----------
/**
 * DELETE /api/users/:userId/devices/:deviceId
 * Remove a device from a user's collection
 * 
 * @route DELETE /api/users/:userId/devices/:deviceId
 * @param {string} userId - User identifier from URL
 * @param {string} deviceId - Device identifier from URL
 * @returns {Object} Success status
 * @returns {404} If user or device not found
 */
router.delete('/api/users/:userId/devices/:deviceId', (req, res) => {
  const { userId, deviceId } = req.params;
  
  console.log(`[Delete Device] User: ${userId}, Device: ${deviceId}`);
  
  const result = db.deleteUserDevice(userId, deviceId);
  
  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }
  
  // Broadcast to all WebSocket connections for real-time UI updates
  const userData = req.app.get('userData');
  if (userData && userData[userId] && userData[userId].ws) {
    const userConnections = userData[userId].ws;
    // Send to all connected clients for this user
    userConnections.forEach(userConnection => {
      if (userConnection && userConnection.readyState === 1) {
        userConnection.send(JSON.stringify({
          type: 'device_deleted',
          userId,
          deviceId
        }));
      }
    });
  }
  
  res.json({ 
    success: true, 
    userId, 
    deviceId 
  });
});
// -----------END: Delete Device-----------

// -----------START: Module Exports-----------
module.exports = router;
// -----------END: Module Exports-----------