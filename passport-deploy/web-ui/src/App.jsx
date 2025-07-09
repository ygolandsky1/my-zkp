import React, { useState, useEffect, useCallback } from 'react';
import AdminPanel from './components/AdminPanel.jsx';
import ActionSimulator from './components/ActionSimulator.jsx'; 

function App() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAgents = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await fetch('http://localhost:3002/api/agents');
          if (!response.ok) {
              throw new Error('Failed to fetch agents from API');
          }
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

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>LaGuardAI - PoC Dashboard</h1>
      </header>
      
      <main>
        {/* Work Package 3: Admin Panel for Agent Onboarding */}
        <AdminPanel agents={agents} fetchAgents={fetchAgents} />

        {/* Work Package 4: Action Simulator */}
        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />
        <ActionSimulator agents={agents} fetchAgents={fetchAgents} />
        
        {error && <p style={{color: 'red', marginTop: '20px'}}>App Level Error: {error}</p>}
      </main>
    </div>
  );
}

export default App;
