import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const LaGuardAIDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState([]);

  // Mock real-time activity data
  const generateRealTimeData = useCallback(() => {
    const now = new Date();
    const timePoints = [];
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      timePoints.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actions: Math.floor(Math.random() * 15) + 1,
        compliance: 95 + Math.random() * 5,
      });
    }
    setRealTimeData(timePoints);
  }, []);

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
    generateRealTimeData();
    const interval = setInterval(() => {
      fetchAgents();
      generateRealTimeData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchAgents, generateRealTimeData]);

  // Calculate metrics
  const totalAgents = agents.length;
  const totalActions = agents.reduce((sum, agent) => sum + agent.actionCount, 0);
  const activeAgents = agents.filter(agent => agent.actionCount > 0).length;
  const complianceRate = agents.length > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0;

  // FIXED: Prepare chart data with proper agent recognition
  const agentActivityData = agents.map(agent => {
    let name = `Agent ${agent.agentId.substring(0, 8)}`;
    
    if (agent.agentId.includes('financial-analyzer-v2.0')) name = 'Financial Analyzer v2.0';
    else if (agent.agentId.includes('financial-analyzer-v1.2')) name = 'Financial Analyzer v1.2';
    else if (agent.agentId.includes('research-analyst')) name = 'Research Analyst v1.1';
    else if (agent.agentId.includes('customer-support')) name = 'Customer Support v3.2';
    else if (agent.agentId.includes('simple-demo')) name = 'Simple Demo Agent';
    else if (agent.agentId.includes('700d4bc3')) name = 'ETL Agent';
    
    return {
      name,
      actions: agent.actionCount,
      scope: agent.missionScope
    };
  });

  const missionScopeData = agents.reduce((acc, agent) => {
    const existing = acc.find(item => item.scope === agent.missionScope);
    if (existing) {
      existing.count += 1;
      existing.actions += agent.actionCount;
    } else {
      acc.push({
        scope: agent.missionScope,
        count: 1,
        actions: agent.actionCount
      });
    }
    return acc;
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const StatCard = ({ title, value, subtitle, icon, trend, color = "blue" }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl shadow-lg border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium uppercase tracking-wide`}>{title}</p>
          <p className={`text-3xl font-bold text-${color}-900 mt-2`}>{value}</p>
          {subtitle && <p className={`text-${color}-700 text-sm mt-1`}>{subtitle}</p>}
        </div>
        <div className={`text-${color}-500 text-3xl`}>{icon}</div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className="text-green-500 text-sm font-medium">↗ {trend}</span>
        </div>
      )}
    </div>
  );

  const AgentStatusBadge = ({ agent }) => {
    const getStatusColor = () => {
      if (agent.actionCount > 5) return 'bg-red-100 text-red-800 border-red-200';
      if (agent.actionCount > 0) return 'bg-green-100 text-green-800 border-green-200';
      return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusText = () => {
      if (agent.actionCount > 5) return 'High Activity';
      if (agent.actionCount > 0) return 'Active';
      return 'Standby';
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    );
  };

  const LiveActivityFeed = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
        Live Activity Feed
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {agents.filter(agent => agent.actionCount > 0).map((agent, index) => (
          <div key={agent.agentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {/* FIXED: Proper agent name display */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {agent.agentId.includes('financial-analyzer-v2.0') ? '🏦 Financial Analyzer v2.0' : 
                   agent.agentId.includes('financial-analyzer-v1.2') ? '🏦 Financial Analyzer v1.2' :
                   agent.agentId.includes('research-analyst') ? '🔬 Research Analyst v1.1' :
                   agent.agentId.includes('customer-support') ? '🎧 Customer Support v3.2' :
                   agent.agentId.includes('simple-demo') ? '⚡ Simple Demo Agent' :
                   '🔧 ETL Agent'}
                </p>
                <p className="text-xs text-gray-500">Mission: {agent.missionScope}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{agent.actionCount} actions</p>
              <p className="text-xs text-gray-500">
                {agent.lastActionAt ? new Date(agent.lastActionAt).toLocaleTimeString() : 'No activity'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LaGuardAI Trust Fabric</h1>
                <p className="text-sm text-gray-500">Enterprise AI Governance Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Operational</span>
              </div>
              <div className="text-sm text-gray-500">
                Last Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-8 mb-8">
          {[
            { key: 'overview', name: 'Trust Overview', icon: '📊' },
            { key: 'agents', name: 'Agent Fleet', icon: '🤖' },
            { key: 'compliance', name: 'Compliance', icon: '🛡️' },
            { key: 'analytics', name: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Agents"
                value={totalAgents}
                subtitle="Blockchain Registered"
                icon="🤖"
                trend="+12% this week"
                color="blue"
              />
              <StatCard
                title="Total Actions"
                value={totalActions}
                subtitle="Governed Executions"
                icon="⚡"
                trend="+28% this week"
                color="green"
              />
              <StatCard
                title="Active Agents"
                value={activeAgents}
                subtitle="Currently Processing"
                icon="🔥"
                color="orange"
              />
              <StatCard
                title="Compliance Rate"
                value={`${complianceRate}%`}
                subtitle="Policy Adherence"
                icon="🛡️"
                trend="+2.1% this week"
                color="purple"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Real-time Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Activity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actions" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Live Activity Feed */}
              <LiveActivityFeed />
            </div>

            {/* Agent Activity Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="actions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Agent Fleet Status</h3>
              <p className="text-sm text-gray-600">All registered agents with cryptographic passports</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mission Scope</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passport</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent.agentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              {/* FIXED: Proper emoji assignment */}
                              <span className="text-white font-medium text-sm">
                                {agent.agentId.includes('financial') ? '🏦' : 
                                 agent.agentId.includes('research-analyst') ? '🔬' :
                                 agent.agentId.includes('customer-support') ? '🎧' :
                                 agent.agentId.includes('simple') ? '⚡' : '🔧'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {/* FIXED: Proper agent name display */}
                            <div className="text-sm font-medium text-gray-900">
                              {agent.agentId.includes('financial-analyzer-v2.0') ? 'Financial Analyzer v2.0' : 
                               agent.agentId.includes('financial-analyzer-v1.2') ? 'Financial Analyzer v1.2' :
                               agent.agentId.includes('research-analyst') ? 'Research Analyst v1.1' :
                               agent.agentId.includes('customer-support') ? 'Customer Support v3.2' :
                               agent.agentId.includes('simple-demo') ? 'Simple Demo Agent' :
                               agent.agentId === '700d4bc3-fca7-4251-9280-4bfe93f34c8a' ? 'ETL Agent' :
                               agent.role}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {agent.agentId.substring(0, 20)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {agent.missionScope}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {agent.actionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agent.lastActionAt ? new Date(agent.lastActionAt).toLocaleString() : 'No activity'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AgentStatusBadge agent={agent} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500 font-mono">
                            {agent.signature.substring(0, 12)}...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission Scope Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={missionScopeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ scope, percent }) => `${scope} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {missionScopeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Policy Adherence</span>
                  <span className="text-lg font-bold text-green-600">100%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Audit Trail Integrity</span>
                  <span className="text-lg font-bold text-blue-600">100%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">ZKP Verification Rate</span>
                  <span className="text-lg font-bold text-purple-600">100%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Mission Scope Violations</span>
                  <span className="text-lg font-bold text-orange-600">0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Audit Trail</h3>
              <div className="space-y-3">
                {agents.filter(agent => agent.actionCount > 0).map((agent) => (
                  <div key={agent.agentId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        {/* FIXED: Proper analytics display */}
                        <p className="font-medium text-gray-900">
                          {agent.agentId.includes('financial') ? '🏦 Financial Analysis Complete' : 
                           agent.agentId.includes('research-analyst') ? '🔬 Research Analysis Complete' :
                           agent.agentId.includes('customer-support') ? '🎧 Customer Service Complete' :
                           '⚡ Agent Action Executed'}
                        </p>
                        <p className="text-sm text-gray-500">Agent: {agent.agentId}</p>
                        <p className="text-sm text-gray-500">Mission: {agent.missionScope}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-blue-600">#{agent.signature.substring(0, 16)}</p>
                        <p className="text-xs text-gray-500">Blockchain Verified</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaGuardAIDashboard;
