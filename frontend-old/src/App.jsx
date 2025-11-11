import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useSensorStore from './store/useSensorStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

/**
 * A wrapper for routes that should only be accessible when the user is logged in.
 * If not logged in, it redirects to the login page.
 */
function ProtectedRoute({ children }) {
  const currentUser = useSensorStore((state) => state.currentUser);
  return currentUser ? children : <Navigate to="/" />;
}

function App() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;