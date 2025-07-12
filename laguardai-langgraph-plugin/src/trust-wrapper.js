const { v4: uuidv4 } = require('uuid');
const { LaGuardConfig } = require('./types');
const { LaGuardAPIClient } = require('./api-client');

/**
 * LaGuard Trust Wrapper for LangGraph Agents
 * 
 * Adds enterprise governance, compliance, and audit trails
 * to any LangGraph agent with minimal code changes.
 */
class LaGuardTrustWrapper {
  constructor(langGraphAgent, config) {
    this.agent = langGraphAgent;
    this.config = new LaGuardConfig(config);
    this.apiClient = new LaGuardAPIClient(this.config);
    this.initialized = false;
    
    console.log(`[LaGuardAI] 🔐 Trust Wrapper initialized for agent: ${this.config.agentId}`);
    console.log(`[LaGuardAI] 📋 Mission Scope: ${this.config.missionScope}`);
    console.log(`[LaGuardAI] ⚖️  Compliance Mode: ${this.config.complianceMode}`);
  }

  /**
   * Initialize the trust wrapper (register agent if needed)
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.apiClient.ensureAgentRegistered();
      this.initialized = true;
      console.log(`[LaGuardAI] ✅ Trust Wrapper ready for ${this.config.agentId}`);
    } catch (error) {
      console.error(`[LaGuardAI] ❌ Failed to initialize: ${error.message}`);
      if (this.config.complianceMode === 'enforcing') {
        throw error;
      }
    }
  }

  /**
   * Invoke the LangGraph agent with trust governance
   */
  async invoke(input, options = {}) {
    const actionId = uuidv4();
    const startTime = Date.now();
    
    console.log(`[LaGuardAI] 🚀 Starting governed execution: ${actionId}`);
    
    try {
      // Initialize if needed
      await this.initialize();
      
      // Pre-execution governance
      await this.preExecutionCheck(input, actionId);
      
      // Execute the original agent
      console.log(`[LaGuardAI] ⚡ Executing agent...`);
      const result = await this.agent.invoke(input, options);
      
      // Post-execution logging
      await this.postExecutionLog(input, result, actionId, startTime);
      
      console.log(`[LaGuardAI] ✅ Governed execution complete: ${actionId}`);
      return result;
      
    } catch (error) {
      // Log the error
      await this.logExecutionError(input, error, actionId, startTime);
      throw error;
    }
  }

  /**
   * Pre-execution governance checks
   */
  async preExecutionCheck(input, actionId) {
    try {
      const intent = this.extractIntent(input);
      
      // Log the intent declaration
      await this.apiClient.logAction(
        'intent-declared',
        `Agent declared intent to execute action`,
        {
          actionId,
          intent,
          inputPreview: this.sanitizeInput(input),
          phase: 'pre-execution'
        }
      );
      
    } catch (error) {
      console.warn(`[LaGuardAI] ⚠️  Pre-execution check failed: ${error.message}`);
      
      if (this.config.complianceMode === 'enforcing') {
        throw new Error(`Governance check failed: ${error.message}`);
      }
    }
  }

  /**
   * Post-execution audit logging
   */
  async postExecutionLog(input, result, actionId, startTime) {
    try {
      const executionTime = Date.now() - startTime;
      
      await this.apiClient.logAction(
        'execution-completed',
        `Agent completed execution successfully`,
        {
          actionId,
          executionTimeMs: executionTime,
          inputPreview: this.sanitizeInput(input),
          resultPreview: this.sanitizeOutput(result),
          phase: 'post-execution',
          success: true
        }
      );
      
    } catch (error) {
      console.warn(`[LaGuardAI] ⚠️  Post-execution logging failed: ${error.message}`);
    }
  }

  /**
   * Log execution errors
   */
  async logExecutionError(input, error, actionId, startTime) {
    try {
      const executionTime = Date.now() - startTime;
      
      await this.apiClient.logAction(
        'execution-failed',
        `Agent execution failed: ${error.message}`,
        {
          actionId,
          executionTimeMs: executionTime,
          inputPreview: this.sanitizeInput(input),
          error: error.message,
          phase: 'error',
          success: false
        }
      );
      
    } catch (logError) {
      console.error(`[LaGuardAI] ❌ Failed to log execution error: ${logError.message}`);
    }
  }

  /**
   * Extract intent from input (can be customized)
   */
  extractIntent(input) {
    if (typeof input === 'string') {
      return { target: this.config.missionScope, action: 'process-input', description: input.substring(0, 100) };
    }
    
    if (input && typeof input === 'object') {
      return {
        target: this.config.missionScope,
        action: input.action || 'execute-workflow',
        description: input.description || JSON.stringify(input).substring(0, 100)
      };
    }
    
    return { target: this.config.missionScope, action: 'unknown', description: 'No description available' };
  }

  /**
   * Sanitize input for logging (remove sensitive data)
   */
  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.length > 200 ? input.substring(0, 200) + '...' : input;
    }
    
    return JSON.stringify(input, null, 2).substring(0, 500);
  }

  /**
   * Sanitize output for logging
   */
  sanitizeOutput(output) {
    if (typeof output === 'string') {
      return output.length > 200 ? output.substring(0, 200) + '...' : output;
    }
    
    return JSON.stringify(output, null, 2).substring(0, 500);
  }

  /**
   * Stream invoke with trust governance (for streaming agents)
   */
  async *stream(input, options = {}) {
    const actionId = uuidv4();
    const startTime = Date.now();
    
    console.log(`[LaGuardAI] 🌊 Starting governed stream: ${actionId}`);
    
    try {
      await this.initialize();
      await this.preExecutionCheck(input, actionId);
      
      let fullResult = '';
      
      // Stream from the original agent
      for await (const chunk of this.agent.stream(input, options)) {
        fullResult += chunk;
        yield chunk;
      }
      
      await this.postExecutionLog(input, fullResult, actionId, startTime);
      
    } catch (error) {
      await this.logExecutionError(input, error, actionId, startTime);
      throw error;
    }
  }
}

module.exports = { LaGuardTrustWrapper };
