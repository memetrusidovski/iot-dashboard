import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const lightThemes = [
  { name: 'blue', color: 'bg-blue-600' },
  { name: 'green', color: 'bg-green-600' },
  { name: 'red', color: 'bg-red-600' },
  { name: 'yellow', color: 'bg-yellow-500' },
  { name: 'pink', color: 'bg-pink-500' },
];

export default function ThemeSwitcher() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Set the light theme by updating the data-theme attribute
  const setLightTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Toggle dark mode by adding/removing the 'dark' class
  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    document.documentElement.classList.toggle('dark', newDarkModeState);
    localStorage.setItem('darkMode', JSON.stringify(newDarkModeState));
  };

  // On initial load, apply the saved themes from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'blue';
    setLightTheme(savedTheme);

    const savedDarkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
    setIsDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, []);

  return (
    <div className="flex items-center p-2 rounded-full bg-background border border-border space-x-2">
      {/* Light Theme Color Pickers */}
      {lightThemes.map((theme) => (
        <button
          key={theme.name}
          title={`Set ${theme.name} theme`}
          onClick={() => setLightTheme(theme.name)}
          className={`w-5 h-5 rounded-full ${theme.color} border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary`}
        />
      ))}
      
      <div className="w-px h-5 bg-border mx-1"></div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-1 rounded-full text-foreground hover:bg-primary/10"
        title="Toggle Dark Mode"
      >
        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}