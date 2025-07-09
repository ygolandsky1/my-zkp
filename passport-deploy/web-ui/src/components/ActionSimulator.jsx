import React, { useState, useEffect } from 'react';

const ActionSimulator = ({ agents, fetchAgents }) => {
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [intentAction, setIntentAction] = useState('READ');
    const [intentTarget, setIntentTarget] = useState('BillingDB');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (agents.length > 0 && !selectedAgentId) {
            setSelectedAgentId(agents[0].agentId);
        }
    }, [agents, selectedAgentId]);

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
            const selectedAgentPassport = agents.find(agent => agent.agentId === selectedAgentId);
            if (!selectedAgentPassport) throw new Error("Could not find passport for the selected agent.");

            const payload = {
                passport: selectedAgentPassport,
                intent: { action: intentAction, target: intentTarget }
            };

            const response = await fetch('http://localhost:3002/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'API call failed');
            
            setMessage(`✅ Action logged! TxID: ${data.txId.substring(0, 24)}...`);
            fetchAgents();
        } catch (err) {
            setError(`❌ ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Agent Action Simulator</h2>
            <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="agent-select" className="block text-sm font-medium text-gray-700">Select Agent</label>
                        <select id="agent-select" value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="">-- Select --</option>
                            {agents.map(agent => (
                                <option key={agent.agentId} value={agent.agentId}>{agent.agentId.substring(0, 8)}... ({agent.role})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="intent-action" className="block text-sm font-medium text-gray-700">Intent Action</label>
                        <select id="intent-action" value={intentAction} onChange={(e) => setIntentAction(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option>READ</option>
                            <option>WRITE</option>
                            <option>DELETE</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="intent-target" className="block text-sm font-medium text-gray-700">Intent Target</label>
                        <input
                            type="text"
                            id="intent-target"
                            value={intentTarget}
                            onChange={(e) => setIntentTarget(e.target.value)}
                            placeholder="e.g., BillingDB, HR-API"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading || !selectedAgentId} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300">
                        {isLoading ? 'Executing...' : 'Execute Action'}
                    </button>
                </div>
                {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default ActionSimulator;
