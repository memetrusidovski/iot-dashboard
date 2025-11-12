// mqtt-simulator.js - Multi-User IoT Sensor Simulator
// Simulates sensor data for multiple users and publishes to MQTT broker

const mqtt = require('mqtt');
const db = require('./db');

// -----------START: MQTT Configuration-----------
const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const PUBLISH_INTERVAL = 3000;

const MQTT_OPTIONS = {
    username: 'my_user',
    password: 'my_password',
    clientId: 'iot_simulator_' + Math.random().toString(16).substr(2, 8)
};

// const client = mqtt.connect(MQTT_BROKER, MQTT_OPTIONS);
const client = mqtt.connect(MQTT_BROKER);
// -----------END: MQTT Configuration-----------

// -----------START: User Sensor Configuration-----------
/**
 * Define sensor configurations for each user
 * Each sensor has initial value and unit of measurement
 */
const userSensors = {
  alice: {
    temperature: { value: 24.0, unit: '°C' },
    humidity: { value: 45.5, unit: '%' }
  },
  bob: {
    pressure: { value: 1015.2, unit: 'hPa' },
    light_level: { value: 800, unit: 'lux' }
  },
  steve: {
    temperature: { value: 18.5, unit: '°C' },
    co2: { value: 650, unit: 'ppm' }
  }
};
// -----------END: User Sensor Configuration-----------

// -----------START: Sensor Value Fluctuation-----------
/**
 * Simulates natural sensor value fluctuations
 * Adds random variation to current value within specified range
 * 
 * @param {number} currentValue - Current sensor reading
 * @param {number} maxFluctuation - Maximum change allowed (default: 1)
 * @returns {number} New sensor value with 2 decimal precision
 */
const fluctuate = (currentValue, maxFluctuation = 1) => {
  const fluctuation = (Math.random() - 0.5) * maxFluctuation;
  return parseFloat((currentValue + fluctuation).toFixed(2));
};
// -----------END: Sensor Value Fluctuation-----------

// -----------START: MQTT Connection Handler-----------
/**
 * Handle MQTT broker connection and start sensor simulation
 */
client.on('connect', () => {
  console.log('[Simulator] Connected to MQTT broker (Multi-User Mode)');
  console.log('[Simulator] Starting sensor data simulation...');

  // Publish sensor data at regular intervals
  setInterval(() => {
    let messageCount = 0;

    // Iterate through each user
    for (const [userId, sensors] of Object.entries(userSensors)) {
      // Iterate through each sensor for current user
      for (const [sensorName, data] of Object.entries(sensors)) {
        // Apply appropriate fluctuation based on sensor type
        const fluctuationAmount = sensorName === 'co2' ? 10 : 1;
        data.value = fluctuate(data.value, fluctuationAmount);

        // Construct MQTT topic: users/{userId}/sensors/{sensorName}
        const topic = `users/${userId}/sensors/${sensorName}`;
        
        // Prepare message payload
        const message = {
          value: data.value,
          unit: data.unit,
          timestamp: Date.now()
        };

        // Publish to MQTT broker
        client.publish(topic, JSON.stringify(message));
        messageCount++;
      }
    }

    console.log(`[Simulator] Published ${messageCount} sensor readings for all users`);
  }, PUBLISH_INTERVAL);
});
// -----------END: MQTT Connection Handler-----------

// -----------START: Error Handler-----------
/**
 * Handle MQTT client errors and cleanup
 */
client.on('error', (err) => {
  console.error('[Simulator] MQTT error:', err);
  client.end();
});
// -----------END: Error Handler-----------