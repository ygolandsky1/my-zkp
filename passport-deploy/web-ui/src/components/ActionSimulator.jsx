import React, { useState, useEffect, useCallback } from 'react';

const ActionSimulator = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [intentAction, setIntentAction] = useState('READ');
    const [intentTarget, setIntentTarget] = useState('BillingDB');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchAgents = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3002/api/agents');
            if (!response.ok) throw new Error('Failed to fetch agents');
            const data = await response.json();
            setAgents(data || []);
            if (data && data.length > 0) {
                setSelectedAgentId(data[0].agentId); // Default to the first agent
            }
        } catch (err) {
            setError(err.message);
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

        if (!selectedAgentId) {
            setError("Please select an agent.");
            setIsLoading(false);
            return;
        }

        try {
            // Find the full passport object for the selected agent
            const selectedAgentPassport = agents.find(agent => agent.agentId === selectedAgentId);
            if (!selectedAgentPassport) {
                throw new Error("Could not find passport for the selected agent.");
            }

            const payload = {
                passport: selectedAgentPassport,
                intent: {
                    action: intentAction,
                    target: intentTarget,
                }
            };

            const response = await fetch('http://localhost:3002/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API call failed');
            }

            setMessage(`✅ Action logged successfully! Transaction ID: ${data.txId}`);
            // Refresh agent list to show updated action count
            fetchAgents(); 
        } catch (err) {
            setError(`❌ ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Agent Action Simulator</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Select Agent:</label>
                    <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                        <option value="">-- Select an Agent --</option>
                        {agents.map(agent => (
                            <option key={agent.agentId} value={agent.agentId}>{agent.agentId} ({agent.role})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Intent Action:</label>
                    <select value={intentAction} onChange={(e) => setIntentAction(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                        <option value="READ">READ</option>
                        <option value="WRITE">WRITE</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <div>
                    <label>Intent Target:</label>
                    <input
                        type="text"
                        value={intentTarget}
                        onChange={(e) => setIntentTarget(e.target.value)}
                        placeholder="e.g., BillingDB, HR-API"
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" disabled={isLoading || !selectedAgentId} style={{ padding: '10px 15px', cursor: 'pointer' }}>
                    {isLoading ? 'Executing...' : 'Execute Action'}
                </button>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default ActionSimulator;

