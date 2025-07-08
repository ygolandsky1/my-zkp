import React from 'react';
import AdminPanel from './components/AdminPanel.jsx';
import ActionSimulator from './components/ActionSimulator.jsx'; 

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>LaGuardAI - PoC Dashboard</h1>
      </header>
      
      <main>
        {/* Work Package 3: Admin Panel for Agent Onboarding */}
        <AdminPanel />

        {/* Work Package 4: Action Simulator */}
        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #eee' }} />
        <ActionSimulator />
      </main>
    </div>
  );
}

export default App;

