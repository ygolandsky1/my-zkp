import React, { useState, useEffect, useCallback } from 'react';
import AdminPanel from './components/AdminPanel.jsx';
import ActionSimulator from './components/ActionSimulator.jsx'; 
import BehavioralDashboard from './components/BehavioralDashboard.jsx';

function App() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'dashboard'

  const fetchAgents = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await fetch('http://localhost:3002/api/agents');
          if (!response.ok) throw new Error('Failed to fetch agents from API');
          const data = await response.json();
          setAgents(data || []);
      } catch (err) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchAgents();
  }, [fetchAgents]);

  const TABS = {
    admin: 'Admin & Simulator',
    dashboard: 'Behavioral Dashboard',
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="pb-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LaGuardAI - Trust Fabric Prototype</h1>
          <p className="mt-1 text-sm text-gray-600">A demonstration of on-chain agent onboarding, governed actions, and behavioral analysis.</p>
        </header>
        
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {Object.entries(TABS).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${
                  activeTab === key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {name}
              </button>
            ))}
          </nav>
        </div>

        <main>
          {activeTab === 'admin' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <AdminPanel agents={agents} fetchAgents={fetchAgents} isLoading={isLoading} />
              </div>
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <ActionSimulator agents={agents} fetchAgents={fetchAgents} />
              </div>
            </>
          )}

          {activeTab === 'dashboard' && (
            <BehavioralDashboard agents={agents} isLoading={isLoading} />
          )}
          
          {error && <p className="mt-4 text-center text-red-600">App Level Error: {error}</p>}
        </main>
      </div>
    </div>
  );
}

export default App;

