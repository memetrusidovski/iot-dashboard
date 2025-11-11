import React from 'react';
import { Lightbulb, Thermometer, Lock, Fan, Plug, Video, Droplets, Wind, DoorClosed } from 'lucide-react';

const iconMap = {
  light: Lightbulb,
  thermostat: Thermometer,
  lock: Lock,
  fan: Fan,
  plug: Plug,
  camera: Video,
  sprinkler: Droplets,
  purifier: Wind,
  door: DoorClosed,
};

const DeviceIcon = ({ type, className }) => {
  const Icon = iconMap[type] || Plug; // Default to Plug icon
  return <Icon className={className} />;
};

export default DeviceIcon;