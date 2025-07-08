import React, { useState, useEffect, useCallback } from 'react';

const AdminPanel = () => {
    const [agents, setAgents] = useState([]);
    const [role, setRole] = useState('ReadOnly');
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchAgents = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:3002/api/agents');
            if (!response.ok) {
                throw new Error('Failed to fetch agents');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:3002/api/admin/register-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, purpose }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || 'Failed to register agent');
            }

            setMessage(`✅ Agent registered successfully! New Agent ID: ${data.passport.agentId}`);
            setPurpose(''); // Clear form
            fetchAgents(); // Refresh the list
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '40px' }}>
            {/* Registration Form */}
            <div style={{ flex: 1 }}>
                <h2>Register New Agent</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label>Role:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                            <option value="ReadOnly">ReadOnly</option>
                            <option value="DataProcessor">DataProcessor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label>Purpose:</label>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="e.g., Nightly data aggregation"
                            required
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', cursor: 'pointer' }}>
                        {isLoading ? 'Registering...' : 'Register Agent'}
                    </button>
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            </div>

            {/* Agent List Table */}
            <div style={{ flex: 2 }}>
                <h2>Registered Agents</h2>
                {isLoading && <p>Loading agents...</p>}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Agent ID</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Role</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Action Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map((agent) => (
                            <tr key={agent.agentId} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>{agent.agentId}</td>
                                <td style={{ padding: '8px' }}>
                                    <span style={{ 
                                        backgroundColor: agent.role === 'Admin' ? '#dc3545' : agent.role === 'DataProcessor' ? '#ffc107' : '#007bff', 
                                        color: 'white', 
                                        padding: '4px 8px', 
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {agent.role}
                                    </span>
                                </td>
                                <td style={{ padding: '8px', color: agent.status === 'Active' ? 'green' : 'red' }}>{agent.status}</td>
                                <td style={{ padding: '8px' }}>{agent.actionCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;