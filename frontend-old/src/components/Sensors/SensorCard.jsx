import React, { useState, useEffect } from 'react';
import { Settings, Save, XCircle, AlertTriangle } from 'lucide-react';
import useSensorStore from '../../store/useSensorStore';

const SensorCard = ({ sensorName, data }) => {
  // --- STATE AND STORE HOOKS ---
  const [isEditing, setIsEditing] = useState(false);
  const [localLimits, setLocalLimits] = useState({ min: '', max: '' });
  
  // *** FIX APPLIED HERE ***
  // We select each piece of state individually to prevent infinite loops.
  const limits = useSensorStore(state => state.sensorLimits[sensorName]);
  const updateSensorLimit = useSensorStore(state => state.updateSensorLimit);
  const fetchSensorLimit = useSensorStore(state => state.fetchSensorLimits);
  const activeAlert = useSensorStore(state => state.activeAlerts[sensorName]);

  // --- DERIVED STATE ---
  // The card is in an alerting state if an alert for it exists in our central store.
  // This is more reliable than calculating it on the client side again.
  const isAlerting = !!activeAlert;

  // --- EFFECTS ---
  // When edit mode is activated, populate the local form state with current limits
  useEffect(() => {
    if (isEditing) {
      setLocalLimits({
        min: limits?.min ?? '',
        max: limits?.max ?? '',
      });
    }
  }, [isEditing, limits]);
  useEffect(() => {
    // Fetch limits for this specific sensor when the component mounts
    fetchSensorLimit(sensorName);
  }, [fetchSensorLimit, sensorName]);


  // --- HANDLERS ---
  const handleSave = () => {
    const newLimits = {
      min: parseFloat(localLimits.min),
      max: parseFloat(localLimits.max),
    };
    if (isNaN(newLimits.min) || isNaN(newLimits.max)) {
      alert("Please enter valid numbers for limits.");
      return;
    }
    updateSensorLimit(sensorName, newLimits);
    setIsEditing(false);
  };

  const handleToggleEnabled = () => {
    updateSensorLimit(sensorName, { enabled: !limits?.enabled });
  };
  
  // --- RENDER LOGIC ---
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const cardClasses = `bg-white rounded-xl shadow-md p-4 border-2 transition-colors ${
    isAlerting ? 'border-red-500 animate-pulse' : 'border-gray-100'
  } hover:shadow-lg`;

  return (
    <div className={cardClasses}>
      {/* CARD HEADER */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {sensorName.replace('_', ' ')}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isAlerting && <AlertTriangle size={18} className="text-red-500" titleAccess={activeAlert.message} />}
          <button onClick={() => setIsEditing(!isEditing)} className="p-1 text-gray-400 hover:text-indigo-600">
            {isEditing ? <XCircle size={18} /> : <Settings size={18} />}
          </button>
        </div>
      </div>

      {/* SENSOR VALUE DISPLAY */}
      <div className="flex items-baseline space-x-2 mb-4">
        <span className={`text-4xl font-bold ${isAlerting ? 'text-red-600' : 'text-gray-900'}`}>
          {data.value}
        </span>
        <span className="text-xl text-gray-500">{data.unit}</span>
      </div>

      {/* LIMITS SECTION (DISPLAY OR EDIT) */}
      {isEditing ? (
        // EDIT MODE
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input type="number" placeholder="Min" value={localLimits.min} onChange={e => setLocalLimits({...localLimits, min: e.target.value})} className="w-full p-1 border rounded" />
            <span className="text-gray-400">-</span>
            <input type="number" placeholder="Max" value={localLimits.max} onChange={e => setLocalLimits({...localLimits, max: e.target.value})} className="w-full p-1 border rounded" />
          </div>
          <button onClick={handleSave} className="w-full flex justify-center items-center space-x-2 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            <Save size={14} /><span>Save Limits</span>
          </button>
        </div>
      ) : (
        // DISPLAY MODE
        <div className="text-xs text-gray-500 p-3 flex justify-between items-center">
          <div>
            <span>Limits: </span>
            <span className="font-semibold text-gray-700">{limits?.min ?? 'N/A'} - {limits?.max ?? 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Alerts</span>
            <button onClick={handleToggleEnabled} className={`relative inline-flex h-4 w-8 items-center rounded-full transition ${limits?.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${limits?.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorCard;