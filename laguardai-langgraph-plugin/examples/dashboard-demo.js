const { LaGuardTrustWrapper } = require('../src/index');

// Multiple agent types for demo
class FinancialAgent {
  async invoke(input) {
    console.log(`🏦 [Financial Agent] Processing: "${input}"`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { analysis: `Financial analysis: ${input}`, timestamp: new Date().toISOString() };
  }
}

class ResearchAgent {
  async invoke(input) {
    console.log(`🔬 [Research Agent] Processing: "${input}"`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { research: `Research results: ${input}`, confidence: 0.92 };
  }
}

class CustomerServiceAgent {
  async invoke(input) {
    console.log(`🎧 [Customer Service] Processing: "${input}"`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { response: `Customer inquiry handled: ${input}`, satisfaction: 4.8 };
  }
}

async function runMultiAgentDemo() {
  console.log('\n🎬 MULTI-AGENT DASHBOARD DEMO');
  console.log('===============================\n');

  const scenarios = [
    {
      agent: new FinancialAgent(),
      config: {
        passportEndpoint: 'http://localhost:3002',
        agentId: 'financial-analyzer-v2.0',
        missionScope: 'financial-analysis'
      },
      tasks: [
        'Analyze NVDA Q4 earnings report',
        'Calculate portfolio risk metrics',
        'Generate investment recommendations'
      ]
    },
    {
      agent: new ResearchAgent(),
      config: {
        passportEndpoint: 'http://localhost:3002',
        agentId: 'research-analyst-v1.1',
        missionScope: 'market-research'
      },
      tasks: [
        'Research AI governance trends',
        'Analyze competitor landscape',
        'Study regulatory requirements'
      ]
    },
    {
      agent: new CustomerServiceAgent(),
      config: {
        passportEndpoint: 'http://localhost:3002',
        agentId: 'customer-support-v3.2',
        missionScope: 'customer-support'
      },
      tasks: [
        'Handle billing inquiry',
        'Process refund request',
        'Provide product information'
      ]
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n🤖 Starting ${scenario.config.agentId}`);
    
    const trustedAgent = new LaGuardTrustWrapper(scenario.agent, scenario.config);
    
    for (const task of scenario.tasks) {
      try {
        const result = await trustedAgent.invoke(task);
        console.log(`✅ Completed: ${task}`);
        
        // Brief pause between tasks
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n🎉 MULTI-AGENT DEMO COMPLETE!');
  console.log('Check your dashboard for all the new activity! 📊');
}

if (require.main === module) {
  runMultiAgentDemo().catch(console.error);
}

module.exports = { runMultiAgentDemo };
