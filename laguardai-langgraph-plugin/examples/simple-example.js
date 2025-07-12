const { LaGuardTrustWrapper } = require('../src/index');

/**
 * SIMPLE EXAMPLE: Basic LangGraph Agent with Trust
 * 
 * Minimal example showing the 3-line integration
 */

// Simple mock agent
class SimpleAgent {
  async invoke(input) {
    console.log(`[Agent] Processing: ${input}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Processed: ${input} at ${new Date().toISOString()}`;
  }
}

async function simpleDemo() {
  console.log('🔄 Simple LaGuard Integration Demo\n');
  
  // Regular agent
  const agent = new SimpleAgent();
  
  // Add trust (3 lines)
  const trustedAgent = new LaGuardTrustWrapper(agent, {
    passportEndpoint: 'http://localhost:3002',
    agentId: 'simple-demo-agent',
    missionScope: 'general-processing'
  });
  
  // Use normally - now with governance!
  const result = await trustedAgent.invoke('Hello, world!');
  console.log('Result:', result);
}

if (require.main === module) {
  simpleDemo().catch(console.error);
}

module.exports = { simpleDemo };
