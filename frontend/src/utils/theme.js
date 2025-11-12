// Simple theme utility - no context, no providers, just pure functions

const THEME_KEY = 'app-theme';
const DARK_MODE_KEY = 'app-dark-mode';

export const themes = [
  { name: 'blue', label: 'Blue', color: '#3b82f6' },
  { name: 'green', label: 'Green', color: '#22c55e' },
  { name: 'red', label: 'Red', color: '#ef4444' },
  { name: 'yellow', label: 'Yellow', color: '#eab308' },
  { name: 'purple', label: 'Purple', color: '#a855f7' },
  { name: 'orange', label: 'Orange', color: '#f97316' },
];

// Initialize theme on app load - call this once in main.jsx
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'blue';
  const savedDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedDarkMode) {
    document.documentElement.classList.add('dark');
  }
}

// Set color theme
export function setTheme(themeName) {
  // Add transitioning class to prevent flickering
  document.documentElement.classList.add('theme-transitioning');
  
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(THEME_KEY, themeName);
  
  // Remove transitioning class after a tick
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 0);
}

// Toggle dark mode
export function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(DARK_MODE_KEY, isDark);
  return isDark;
}

// Get current theme
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'blue';
}

// Get current dark mode state
export function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}