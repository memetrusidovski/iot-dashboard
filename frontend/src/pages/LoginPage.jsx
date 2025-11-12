import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import useSensorStore from '../store/useSensorStore';

const LoginPage = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const login = useSensorStore((state) => state.login);
  const navigate = useNavigate(); // Hook for navigation
  
  const users = ['alice', 'bob', 'steve'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      login(selectedUser);
      navigate('/dashboard'); // Redirect to dashboard on successful login
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">IoT Dashboard</h1>
          <p className="text-gray-600">Real-time sensor monitoring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select User Profile
            </label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="" disabled>-- Please choose a user --</option>
              {users.map(user => (
                <option key={user} value={user} className="capitalize">
                  {user}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedUser}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;