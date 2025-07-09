import React, { useState } from 'react';

const AdminPanel = ({ agents, fetchAgents, isLoading: isLoadingAgents }) => {
    const [role, setRole] = useState('ReadOnly');
    const [purpose, setPurpose] = useState('');
    const [missionScope, setMissionScope] = useState(''); // New state for mission scope
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            // Include missionScope in the request body
            const response = await fetch('http://localhost:3002/api/admin/register-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, purpose, missionScope }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.details || 'Failed to register agent');
            
            setMessage(`✅ Agent registered! ID: ${data.passport.agentId}`);
            setPurpose('');
            setMissionScope(''); // Clear form
            fetchAgents();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const roleColor = {
        ReadOnly: 'bg-blue-500',
        DataProcessor: 'bg-yellow-500',
        Admin: 'bg-red-500',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Register New Agent</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option>ReadOnly</option>
                            <option>DataProcessor</option>
                            <option>Admin</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
                        <input type="text" id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Nightly data aggregation" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    {/* New Mission Scope Input */}
                    <div>
                        <label htmlFor="missionScope" className="block text-sm font-medium text-gray-700">Mission Scope</label>
                        <input type="text" id="missionScope" value={missionScope} onChange={(e) => setMissionScope(e.target.value)} placeholder="e.g., billing-reports" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                        {isLoading ? 'Registering...' : 'Register Agent'}
                    </button>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
            </div>
            <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Registered Agents</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission Scope</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Count</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoadingAgents && <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>}
                            {!isLoadingAgents && agents.map((agent) => (
                                <tr key={agent.agentId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{agent.agentId.substring(0, 18)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColor[agent.role]} text-white`}>{agent.role}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{agent.missionScope}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.actionCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
