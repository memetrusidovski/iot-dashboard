import React from 'react';

const SensorCard = ({ sensorName, data }) => {
  // Loading state skeleton
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
  
  const isError = !!data.error;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {sensorName.replace('_', ' ')}
        </h3>
        <span className={`text-xs font-bold ${isError ? 'text-red-500' : 'text-green-500'}`}>
          {isError ? 'ERROR' : 'LIVE'}
        </span>
      </div>
      
      {isError ? (
        <>
          <span className="text-4xl font-bold text-red-500">Failed</span>
          <p className="text-sm text-red-400 mt-2">{data.error}</p>
        </>
      ) : (
        <>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-gray-900">{data.value}</span>
            <span className="text-xl text-gray-500">{data.unit}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Updated: {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </>
      )}
    </div>
  );
};

export default SensorCard;