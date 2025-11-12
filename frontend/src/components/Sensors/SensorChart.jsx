import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useSensorStore from '../../store/useSensorStore';

const SensorChart = ({ sensorName }) => {
  const history = useSensorStore(state => state.sensorHistory[sensorName] || []);
  const historyLoaded = useSensorStore(state => state.historyLoaded[sensorName]);
  const loadSensorHistory = useSensorStore(state => state.loadSensorHistory);

  // Load history when component mounts
  useEffect(() => {
    loadSensorHistory(sensorName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorName]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            {payload[0].payload.time}
          </p>
          <p className="text-lg font-bold text-indigo-600">
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show loading state while history is being fetched
  if (!historyLoaded) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 capitalize tracking-tight">
          {sensorName.replace('_', ' ')}
        </h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-gray-400 flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span>Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 capitalize tracking-tight">
          {sensorName.replace('_', ' ')}
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate tick interval to avoid cramming (show roughly 6-8 labels)
  const tickInterval = Math.ceil(history.length / 7);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 capitalize tracking-tight">
          {sensorName.replace('_', ' ')}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {history.length} readings
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`colorValue-${sensorName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            vertical={false}
            strokeOpacity={0.5}
          />
          
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontWeight: '500' }}
            interval={tickInterval}
            tick={{ fill: '#6b7280' }}
            tickLine={{ stroke: '#d1d5db' }}
          />
          
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px', fontWeight: '500' }}
            domain={['auto', 'auto']}
            tick={{ fill: '#6b7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Line 
            isAnimationActive={false}
            type="monotone" 
            dataKey="value" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            fill={`url(#colorValue-${sensorName})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;