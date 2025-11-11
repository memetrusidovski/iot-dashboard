# Full Stack Developer - Home Assignment
## IoT Sensor Dashboard with MQTT & Real-Time Updates

**Stack: React + Node.js + MQTT**

---

## 🎨 Creative Freedom & Modern Development

**We want to see YOUR approach to solving this problem.**

- ✅ **Use AI tools** (GitHub Copilot, ChatGPT, etc.) - this reflects real-world development
- ✅ **Make your own technical decisions** - many requirements are intentionally open-ended
- ✅ **Choose your own tools and libraries**
- ✅ **Add creative features** - surprise us with something interesting
- ✅ **Experiment** - we value innovative solutions

**What we care about:**
- Can you make good technical decisions with reasoning?
- Can you use modern tools effectively (including AI)?
- Can you explain WHY you made certain choices?
- Can you build something that works and demonstrates good judgment?

---

## 📋 Overview

Build a real-time IoT sensor monitoring dashboard that displays live data from simulated sensors using MQTT protocol and real-time browser updates with interactive charts.

---

## 🎯 Assignment Tasks

### Part 1: Backend Setup

#### Task 1.1: Fix & Enhance the MQTT Simulator

**We've provided MQTT code with 2-3 bugs. Your job:**
1. Identify the bugs
2. Fix them
3. Write a brief comment explaining what was wrong

**Code with bugs:**

```javascript
// mqtt-simulator.js - THIS CODE HAS BUGS!
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');

let temperature = 25;

client.on('connect', function () {
  setInterval(() => {
    // Bug 1: Values keep growing indefinitely
    temperature += Math.random() * 5;
    
    const message = {
      value: temperature,
      timestamp: Date.now()
    };
    
    client.publish('sensors/temperature', JSON.stringify(message));
  }, 2000);
});

// Bug 2: Error not being logged properly
client.on('error', (err) => {
  console.log('Error occurred');
});
```

**After fixing the bugs:**
- Add at least 2 more sensors (you choose what they measure!)
- Make sensor data realistic - values should vary naturally
- Feel free to add creative features (sensor failures? anomalies? patterns?)

**Be creative!** We want to see your approach to simulating realistic IoT data.

#### Task 1.2: Real-Time Communication Layer

**YOUR ARCHITECTURAL DECISION:** How will you push real-time sensor data from backend to frontend?

**Some options (but not limited to):**
- WebSockets (ws, socket.io, etc.)
- Server-Sent Events (SSE)
- Long polling
- Or something else entirely?

**Your choice!** Just be ready to explain:
- Why you chose this approach
- What trade-offs you considered
- When you'd choose differently

**Implement:**
- Server-side: Get MQTT data to the browser somehow
- Client-side: Receive and display updates
- Basic error handling

**Tip:** Use AI tools if helpful, but understand what code they generate!

#### Task 1.3: REST API

**Build an API that makes sense for your dashboard.**

**Suggested endpoints (but you decide!):**
- Get list of sensors
- Get historical data for a sensor
- Maybe some control endpoints?

**Your choice on:**
- Exact API structure
- What data to store
- How to organize it
- Error handling approach

**Note:** No database needed - in-memory storage is fine.

---

### Part 2: Frontend Development

#### Task 2.1: Real-Time Data Display

**Build a React app that shows live sensor data.**

**Requirements:**
- Connect to your backend (however you implemented it)
- Display sensor values in real-time
- Show connection status

**Your choices:**
- State management approach (Context? Redux? Zustand? Plain useState?)
- Component structure
- How you handle updates
- Error handling strategy

#### Task 2.2: Data Visualization

**Make the data visual and interesting!**

**Requirements:**
- Some form of charts/graphs showing sensor data over time
- Should update in real-time

**Your choices:**
- Which charting library? (Chart.js, Recharts, D3, Victory, Plotly, or build your own?)
- What type of visualization? (Line charts? Gauges? Something creative?)
- How much history to show?
- Update frequency?

**Get creative!** Surprise us with something interesting.

#### Task 2.3: Dashboard UI

**Design the overall user experience.**

**Core features:**
- Display current sensor values
- Show connection status
- Include your visualizations

**Optional ideas (add what interests you!):**
- Controls to pause/resume updates
- Filters or sensor selection
- Alerts or notifications
- Dark mode?
- Responsive design?
- Animations?
- Your own creative feature?

**Make it yours!** We want to see your approach to UI/UX.



### Part 3: Add Something Interesting

**This is your chance to be creative and show your problem-solving skills.**

**Here are some ideas, but feel free to do something completely different:**

#### Option A: Smart Anomaly Detection
- Detect when sensor readings are unusual
- Alert the user somehow
- Your approach - simple threshold? Pattern detection? ML?

#### Option B: Data Analytics
- Calculate interesting statistics (min, max, average, trends, etc.)
- Display insights about the sensor data
- Make it useful for understanding the data

#### Option C: Advanced Visualization
- Create an innovative way to display the data
- 3D visualization? Heat maps? Custom graphics?
- Make it visually impressive

#### Option D: Control Features
- Add ability to control or configure sensors
- Threshold alerts that user can set
- Export data functionality

#### Option E: Your Own Idea!
- Anything that demonstrates your technical creativity
- Could be performance optimization
- Could be a unique feature
- Could be exceptional UX

**The goal:** Show us something that demonstrates your technical skills and creativity beyond basic requirements.

**Use AI tools if they help!** We want to see how you use modern development tools effectively.



## 📦 Deliverables

### Required Files Structure:
```
project/
├── backend/
│   ├── server.js
│   ├── mqtt-simulator.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── ... (organize as you prefer)
│   └── package.json
└── README.md
└── Assignment.md
```

### README.md Must Include:

1. **Setup Instructions**
   - Exact commands to install and run
   - Any environment variables or configuration


2. **Bugs Fixed**
   - What bugs you found in the provided code
   - How you fixed them





## 🎯 Preperation for the Presentation

### Demo the Application
- Show the app running
- Demonstrate real-time sensor updates
- Highlight your creative feature(s)

Items we may discuss:
- **Technical choices:** Why did you choose your real-time approach? Charting library? State management?
- **Trade-offs:** What alternatives did you consider? Why did you reject them?
- **Creative feature:** What did you build and why? How does it work?
- **AI usage:** How did you use AI tools effectively? What did you learn?
- **Scalability:** How would this handle more users/sensors?
- **Production:** What would you change for real-world use?

### Code Review
- Walk through interesting parts of your code
- Explain your architecture
- Discuss any challenges you overcame

---

## 📤 Submission Instructions

1. **Push to GitHub** (public repo or grant us access)
2. **Include README.md** 
3. **Test that it runs** with simple `npm install` && `npm start`
4. **Email us the repository link**

### Quick Pre-Submission Checklist:
- [ ] App runs without errors on fresh install
- [ ] README to run the application
- [ ] Bugs in provided code are fixed
- [ ] Real-time updates work
- [ ] At least one creative/interesting feature implemented


---

## 💡 Final Tips

**Encouraged:**
- ✅ Using AI tools (ChatGPT, Copilot, etc.) to code faster
- ✅ Trying new libraries or approaches
- ✅ Adding features that interest YOU
- ✅ Making technical decisions and owning them
- ✅ Asking "what if..." and experimenting
- ✅ Being creative and innovative

**Not necessary:**
- ❌ Building everything from scratch
- ❌ Perfect code or comprehensive tests
- ❌ Finishing every single task
- ❌ Avoiding AI tools (use them!)
- ❌ Following our suggestions exactly
