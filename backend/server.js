// server.js - Main Backend Server
// Handles Express server, WebSocket connections, and MQTT integration

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const url = require('url');
const cors = require('cors');
const db = require('./db');

// -----------START: Server Configuration-----------
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const MAX_HISTORY_LENGTH = 250;
const MQTT_BROKER = 'mqtt://localhost:1883';
// -----------END: Server Configuration-----------

// -----------START: Middleware Setup-----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// -----------END: Middleware Setup-----------

// -----------START: Template Engine Setup-----------
app.set('view engine', 'ejs');
app.set('views', './templates');
app.set('userData', db.userData);
// -----------END: Template Engine Setup-----------

// -----------START: MQTT Client Setup-----------
/**
 * Connect to MQTT broker and subscribe to all user sensor topics
 */
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('[MQTT] Backend connected to MQTT broker');
  
  // Subscribe to all user sensor topics using wildcard
  mqttClient.subscribe('users/#', (err) => {
    if (err) {
      console.error('[MQTT] Failed to subscribe to topics:', err);
    } else {
      console.log('[MQTT] Successfully subscribed to users/#');
    }
  });
});

mqttClient.on('error', (err) => {
  console.error('[MQTT] Client error:', err);
});
// -----------END: MQTT Client Setup-----------

// -----------START: MQTT Message Handler-----------
/**
 * Handle incoming MQTT messages from IoT sensors
 * Topic format: users/{userId}/sensors/{sensorName}
 * 
 * @param {string} topic - MQTT topic path
 * @param {Buffer} message - Message payload as buffer
 */
mqttClient.on('message', (topic, message) => {
  try {
    const topicParts = topic.split('/');
    
    // Validate topic format: ['users', userId, 'sensors', sensorName]
    if (topicParts.length !== 4 || topicParts[0] !== 'users' || topicParts[2] !== 'sensors') {
      return;
    }

    const [, userId, , sensorName] = topicParts;
    const data = JSON.parse(message.toString());

    console.log(`[MQTT] Data received - User: ${userId}, Sensor: ${sensorName}`);

    // Verify user and sensor exist in database
    if (!db.userData[userId] || !db.userData[userId].sensorDataHistory[sensorName]) {
      console.log(`[MQTT] Unknown user or sensor: ${userId}/${sensorName}`);
      return;
    }

    // Store historical data with size limit
    const history = db.userData[userId].sensorDataHistory[sensorName];
    history.push(data);
    if (history.length > MAX_HISTORY_LENGTH) {
      history.shift();
    }

    // Check if sensor value exceeds configured limits
    const alert = db.checkSensorLimits(userId, sensorName, data.value);
    
    // Broadcast to user's WebSocket connection for real-time updates
    const userConnection = db.userData[userId].ws;
    if (userConnection && userConnection.readyState === WebSocket.OPEN) {
      // Send sensor data update
      userConnection.send(JSON.stringify({ topic, data }));
      
      // Send alert if limit exceeded
      if (alert) {
        console.log(`[ALERT] ${userId} - ${alert.message}`);
        userConnection.send(JSON.stringify({ 
          type: 'sensor_alert',
          userId,
          alert,
          timestamp: Date.now()
        }));
      }
    }
  } catch (err) {
    console.error('[MQTT] Error processing message:', err);
  }
});
// -----------END: MQTT Message Handler-----------

// -----------START: WebSocket Server-----------
/**
 * Handle WebSocket connections from frontend clients
 * Clients must provide userId as query parameter
 * URL format: ws://localhost:3001?userId=alice
 * 
 * @param {WebSocket} ws - WebSocket connection instance
 * @param {IncomingMessage} req - HTTP request object
 */
wss.on('connection', (ws, req) => {
  // Extract userId from query parameters
  const parameters = new url.URL(req.url, `http://${req.headers.host}`).searchParams;
  const userId = parameters.get('userId');
  
  console.log(`[WebSocket] Connection request for userId: ${userId}`);

  // Validate userId
  if (!userId || !db.userData[userId]) {
    console.log('[WebSocket] Connection rejected: Invalid or missing userId');
    ws.close();
    return;
  }

  console.log(`[WebSocket] Client connected for user: ${userId}`);
  
  // Associate WebSocket with user
  db.userData[userId].ws = ws;

  // Handle client disconnect
  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected for user: ${userId}`);
    db.userData[userId].ws = null;
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error(`[WebSocket] Error for user ${userId}:`, error);
  });
});
// -----------END: WebSocket Server-----------

// -----------START: Sensor API Endpoints-----------
/**
 * GET /api/users/:userId/sensors
 * Retrieve list of all sensors for a user
 * 
 * @route GET /api/users/:userId/sensors
 * @param {string} userId - User identifier from URL
 * @returns {Array} Array of sensor names
 * @returns {404} If user not found
 */
app.get('/api/users/:userId/sensors', (req, res) => {
  const { userId } = req.params;
  const sensors = db.getUserSensors(userId);
  
  if (!sensors) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(sensors);
});

/**
 * GET /api/users/:userId/sensors/:sensorName/history
 * Retrieve historical data for a specific sensor
 * 
 * @route GET /api/users/:userId/sensors/:sensorName/history
 * @param {string} userId - User identifier from URL
 * @param {string} sensorName - Sensor name from URL
 * @returns {Array} Array of sensor readings with timestamps
 * @returns {404} If user or sensor not found
 */
app.get('/api/users/:userId/sensors/:sensorName/history', (req, res) => {
  const { userId, sensorName } = req.params;
  const history = db.getSensorHistory(userId, sensorName);
  
  if (!history) {
    return res.status(404).json({ error: 'User or sensor not found' });
  }
  
  res.json(history);
});
// -----------END: Sensor API Endpoints-----------

// -----------START: Alert/Limit API Endpoints-----------
/**
 * GET /api/users/:userId/sensors/limits
 * Retrieve all sensor limits for a user
 * 
 * @route GET /api/users/:userId/sensors/limits
 * @param {string} userId - User identifier from URL
 * @returns {Object} Object containing all sensor limits
 * @returns {404} If user not found
 */
app.get('/api/users/:userId/sensors/limits', (req, res) => {
  const { userId } = req.params;
  const limits = db.getSensorLimits(userId);
  
  if (!limits) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ userId, limits });
});

/**
 * GET /api/users/:userId/sensors/:sensorName/limits
 * Retrieve limits for a specific sensor
 * 
 * @route GET /api/users/:userId/sensors/:sensorName/limits
 * @param {string} userId - User identifier from URL
 * @param {string} sensorName - Sensor name from URL
 * @returns {Object} Sensor limit configuration
 * @returns {404} If user or sensor limits not found
 */
app.get('/api/users/:userId/sensors/:sensorName/limits', (req, res) => {
  const { userId, sensorName } = req.params;
  const limits = db.getSensorLimit(userId, sensorName);
  
  if (!limits) {
    return res.status(404).json({ error: 'User or sensor limits not found' });
  }
  
  res.json({ userId, sensorName, limits });
});

/**
 * POST /api/users/:userId/sensors/:sensorName/limits
 * Update limits for a specific sensor
 * 
 * @route POST /api/users/:userId/sensors/:sensorName/limits
 * @param {string} userId - User identifier from URL
 * @param {string} sensorName - Sensor name from URL
 * @body {Object} limits - Limit configuration
 * @body {number} limits.min - Minimum threshold (optional)
 * @body {number} limits.max - Maximum threshold (optional)
 * @body {boolean} limits.enabled - Enable/disable alerts (optional)
 * 
 * @example
 * // Update temperature limits
 * { min: 18, max: 28, enabled: true }
 * 
 * // Disable alerts for a sensor
 * { enabled: false }
 * 
 * @returns {Object} Success status and updated limits
 * @returns {404} If user not found
 */
app.post('/api/users/:userId/sensors/:sensorName/limits', (req, res) => {
  const { userId, sensorName } = req.params;
  const limits = req.body;
  
  console.log(`[Limit Update] User: ${userId}, Sensor: ${sensorName}`, limits);
  
  const result = db.updateSensorLimit(userId, sensorName, limits);
  
  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }
  
  // Broadcast to WebSocket for real-time UI updates
  const userConnection = db.userData[userId].ws;
  if (userConnection && userConnection.readyState === WebSocket.OPEN) {
    userConnection.send(JSON.stringify({
      type: 'limits_updated',
      userId,
      sensorName,
      limits: result.limits
    }));
  }
  
  res.json({ 
    success: true, 
    userId, 
    sensorName, 
    limits: result.limits 
  });
});
// -----------END: Alert/Limit API Endpoints-----------

// -----------START: Route Imports-----------
const userRoutes = require('./routes/index');
const managerRoutes = require('./routes/manager');

app.use('/', userRoutes);
app.use('/', managerRoutes);
// -----------END: Route Imports-----------

// -----------START: Start Server-----------
/**
 * Start HTTP server (handles both Express and WebSocket)
 * IMPORTANT: Use http.Server.listen(), not app.listen()
 * This allows WebSocket and Express to share the same port
 */
server.listen(PORT, () => {
  console.log(`[Server] Backend server running on http://localhost:${PORT}`);
  console.log(`[Server] WebSocket server running on ws://localhost:${PORT}`);
});
// -----------END: Start Server-----------