const { v4: uuidv4 } = require('uuid');
const { LaGuardAction } = require('./types');

/**
 * Client for communicating with LaGuardAI Trust Fabric
 */
class LaGuardAPIClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.passportEndpoint;
  }

  /**
   * Log an action to the Trust Fabric
   */
  async logAction(action, details, context = {}) {
    try {
      const payload = new LaGuardAction({
        agentId: this.config.agentId,
        action: action,
        details: details,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          missionScope: this.config.missionScope
        }
      });

      const response = await this._makeRequest('/api/log-action', 'POST', payload);
      
      console.log(`[LaGuardAI] ✅ Action logged: ${action}`);
      return response;
    } catch (error) {
      console.error(`[LaGuardAI] ❌ Failed to log action: ${error.message}`);
      
      // In learning mode, don't fail the agent execution
      if (this.config.complianceMode === 'learning') {
        return { success: false, error: error.message };
      }
      
      throw error;
    }
  }

  /**
   * Register agent if not already registered
   */
  async ensureAgentRegistered() {
    try {
      // Check if agent exists
      const response = await this._makeRequest(
        `/api/admin/agents/${this.config.agentId}`, 
        'GET'
      );
      
      console.log(`[LaGuardAI] ✅ Agent ${this.config.agentId} already registered`);
      return response;
    } catch (error) {
      if (error.message.includes('Agent not found')) {
        // Register the agent
        return await this.registerAgent();
      }
      throw error;
    }
  }

  /**
   * Register agent with Trust Fabric
   */
  async registerAgent() {
    try {
      const payload = {
        agentId: this.config.agentId,
        role: 'LangGraph Agent',
        purpose: 'Automated task execution',
        missionScope: this.config.missionScope
      };

      const response = await this._makeRequest('/api/admin/register-agent', 'POST', payload);
      console.log(`[LaGuardAI] ✅ Agent registered: ${this.config.agentId}`);
      return response;
    } catch (error) {
      console.error(`[LaGuardAI] ❌ Failed to register agent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make HTTP request to LaGuard API
   */
  async _makeRequest(path, method, body = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      timeout: this.config.timeout
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }
}

module.exports = { LaGuardAPIClient };
