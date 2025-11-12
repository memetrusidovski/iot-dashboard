import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themes, setTheme, toggleDarkMode, getCurrentTheme, isDarkMode } from '../utils/theme';

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(getCurrentTheme());
  const [darkMode, setDarkMode] = useState(isDarkMode());

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    setActiveTheme(themeName);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = toggleDarkMode();
    setDarkMode(newDarkMode);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border shadow-sm">
      {/* Color Theme Buttons */}
      <div className="flex items-center gap-1.5">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => handleThemeChange(theme.name)}
            className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${
              activeTheme === theme.name 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' 
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: theme.color }}
            title={theme.label}
            aria-label={`Set ${theme.label} theme`}
          />
        ))}
      </div>
      
      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Dark Mode Toggle */}
      <button
        onClick={handleDarkModeToggle}
        className="p-2 rounded-lg text-foreground bg-secondary hover:bg-accent transition-colors"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}