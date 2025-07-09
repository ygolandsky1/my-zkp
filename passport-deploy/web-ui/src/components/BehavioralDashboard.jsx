import React from 'react';

const BehavioralDashboard = ({ agents, isLoading }) => {
    const ANOMALY_THRESHOLD = 10; // Define the threshold for high activity

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Behavioral Anomaly Dashboard</h2>
            <p className="text-sm text-gray-600 mb-4">This dashboard provides a high-level overview of the AI workforce and flags agents with unusually high activity for review.</p>
            <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission Scope</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Count</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading && <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>}
                        {!isLoading && agents.map((agent) => {
                            const isAnomaly = agent.actionCount > ANOMALY_THRESHOLD;
                            return (
                                <tr key={agent.agentId} className={isAnomaly ? 'bg-red-100' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{agent.agentId.substring(0, 18)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{agent.missionScope}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{agent.actionCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {isAnomaly ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-600 text-white">High Activity</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Nominal</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BehavioralDashboard;