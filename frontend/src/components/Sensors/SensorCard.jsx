import React, { useState, useEffect } from 'react';
import { Settings, Save, XCircle, AlertTriangle } from 'lucide-react';
import useSensorStore from '../../store/useSensorStore';

const SensorCard = ({ sensorName, data }) => {
  // --- STATE AND STORE HOOKS ---
  const [isEditing, setIsEditing] = useState(false);
  const [localLimits, setLocalLimits] = useState({ min: '', max: '' });
  
  const limits = useSensorStore(state => state.sensorLimits[sensorName]);
  const updateSensorLimit = useSensorStore(state => state.updateSensorLimit);
  const fetchSensorLimit = useSensorStore(state => state.fetchSensorLimits);
  const activeAlert = useSensorStore(state => state.activeAlerts[sensorName]);

  // --- DERIVED STATE ---
  const isAlerting = !!activeAlert;

  // --- EFFECTS ---
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
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
        <div className="animate-pulse p-4">
          <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const cardClasses = `bg-card rounded-xl shadow-md border-2 border-border overflow-hidden group hover:shadow-xl transition-all ${
    isAlerting ? 'border-destructive animate-pulse' : ''
  }`;

  return (
    <div className={cardClasses}>
      {/* CARD HEADER */}
      <div className="bg-primary/5 border-b border-border p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {sensorName.replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isAlerting && <AlertTriangle size={18} className="text-destructive" title={activeAlert.message} />}
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="p-1.5 rounded-lg text-muted-foreground hover:text-card-foreground hover:bg-background/50 transition-all"
            >
              {isEditing ? <XCircle size={16} /> : <Settings size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* SENSOR VALUE DISPLAY */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className={`text-4xl font-bold ${isAlerting ? 'text-destructive' : 'text-card-foreground'}`}>
            {data.value}
          </span>
          <span className="text-xl text-muted-foreground">{data.unit}</span>
        </div>

        {/* LIMITS SECTION (DISPLAY OR EDIT) */}
        {isEditing ? (
          // EDIT MODE
          <div className="space-y-3 p-3 bg-background/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={localLimits.min} 
                onChange={e => setLocalLimits({...localLimits, min: e.target.value})} 
                className="w-full p-2 text-sm border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={localLimits.max} 
                onChange={e => setLocalLimits({...localLimits, max: e.target.value})} 
                className="w-full p-2 text-sm border border-border rounded-lg bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <button 
              onClick={handleSave} 
              className="w-full flex justify-center items-center gap-2 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save size={14} /><span>Save Limits</span>
            </button>
          </div>
        ) : (
          // DISPLAY MODE
          <div className="text-sm text-muted-foreground p-3 flex justify-between items-center bg-background/50 rounded-lg border border-border">
            <div>
              <span>Limits: </span>
              <span className="font-semibold text-card-foreground">{limits?.min ?? 'N/A'} - {limits?.max ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Alerts</span>
              <button 
                onClick={handleToggleEnabled} 
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  limits?.enabled ? 'bg-green-500' : 'bg-muted'
                }`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all ${
                  limits?.enabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorCard;