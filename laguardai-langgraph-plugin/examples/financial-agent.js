const { LaGuardTrustWrapper } = require('../src/index');

/**
 * DEMO: Financial Analysis Agent with LaGuard Trust Fabric
 * 
 * This example shows how to add enterprise governance to any LangGraph-style agent
 * with just 3 lines of code. Perfect for VC demos!
 */

// Simulate a LangGraph Financial Analysis Agent
class MockFinancialAgent {
  constructor() {
    this.name = "Financial Analysis Agent";
  }

  async invoke(input) {
    console.log(`\n🏦 [Financial Agent] Processing: "${input}"`);
    
    // Simulate some analysis work
    await this.delay(1500);
    
    if (typeof input === 'string' && input.toLowerCase().includes('tsla')) {
      return {
        ticker: 'TSLA',
        analysis: 'Tesla shows strong Q3 performance with 20% revenue growth. Recommendation: BUY',
        confidence: 0.85,
        dataPoints: ['Revenue +20%', 'EPS Beat', 'Strong Guidance'],
        timestamp: new Date().toISOString()
      };
    }
    
    if (typeof input === 'string' && input.toLowerCase().includes('portfolio')) {
      return {
        analysis: 'Portfolio diversification analysis complete. Risk level: MEDIUM',
        recommendations: ['Increase bond allocation by 5%', 'Consider emerging markets'],
        riskScore: 6.2,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      analysis: `Processed financial query: ${input}`,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  }

  async *stream(input) {
    const chunks = [
      '📊 Starting financial analysis...\n',
      '📈 Fetching market data...\n', 
      '🔍 Analyzing trends...\n',
      '💡 Generating insights...\n',
      '✅ Analysis complete!\n'
    ];
    
    for (const chunk of chunks) {
      await this.delay(500);
      yield chunk;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * MAIN DEMO FUNCTION
 */
async function runFinancialAgentDemo() {
  console.log('\n🚀 LaGuardAI LangGraph Integration Demo');
  console.log('=====================================\n');

  // Step 1: Create a regular LangGraph-style agent
  console.log('📋 Step 1: Create Financial Analysis Agent');
  const financialAgent = new MockFinancialAgent();
  
  // Step 2: Add LaGuard Trust Wrapper (THE MAGIC - 3 LINES!)
  console.log('🔐 Step 2: Add LaGuard Trust Wrapper (3 lines of code)');
  const trustedAgent = new LaGuardTrustWrapper(financialAgent, {
    passportEndpoint: 'http://localhost:3002',  // Your Trust Fabric API
    agentId: 'financial-analyzer-v1.2',
    missionScope: 'financial-analysis',
    complianceMode: 'learning'  // Options: 'learning', 'enforcing', 'audit-only'
  });
  
  console.log('\n✨ TRANSFORMATION COMPLETE!');
  console.log('   → Agent now has blockchain-backed identity');
  console.log('   → All actions logged to immutable audit trail');
  console.log('   → Mission scope governance enabled');
  console.log('   → Zero changes to existing LangGraph code!\n');

  // Step 3: Demo Various Financial Tasks
  console.log('🎯 Step 3: Execute Governed Financial Tasks\n');
  
  try {
    // Demo 1: Stock Analysis
    console.log('💼 DEMO 1: Stock Analysis');
    console.log('─'.repeat(50));
    const tslaResult = await trustedAgent.invoke('Analyze TSLA earnings for Q3 2024');
    console.log('📊 Result:', JSON.stringify(tslaResult, null, 2));
    
    await delay(2000);
    
    // Demo 2: Portfolio Analysis
    console.log('\n💼 DEMO 2: Portfolio Risk Analysis');
    console.log('─'.repeat(50));
    const portfolioResult = await trustedAgent.invoke('Analyze my portfolio risk and provide rebalancing recommendations');
    console.log('📊 Result:', JSON.stringify(portfolioResult, null, 2));
    
    await delay(2000);
    
    // Demo 3: Streaming Analysis
    console.log('\n💼 DEMO 3: Real-time Streaming Analysis');
    console.log('─'.repeat(50));
    console.log('🌊 Streaming result:');
    for await (const chunk of trustedAgent.stream('Generate market summary report')) {
      process.stdout.write(chunk);
    }
    
    console.log('\n\n🎉 ALL DEMOS COMPLETED SUCCESSFULLY!');
    console.log('\n📋 What just happened:');
    console.log('   ✅ Every action was logged to blockchain');
    console.log('   ✅ Intent validated against mission scope');
    console.log('   ✅ Immutable audit trail created');
    console.log('   ✅ Compliance requirements satisfied');
    console.log('   ✅ Zero impact on agent performance');
    
    console.log('\n🔍 Check your LaGuard dashboard at http://localhost:3002/api/admin/agents');
    console.log('   → View complete audit trail');
    console.log('   → See behavioral analytics');
    console.log('   → Export compliance reports\n');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure LaGuard Trust Fabric is running: cd ../zkp-api-server && node index.js');
    console.log('   2. Verify API endpoint: curl http://localhost:3002/api/admin/agents');
    console.log('   3. Check network connectivity\n');
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-run if called directly
if (require.main === module) {
  runFinancialAgentDemo().catch(console.error);
}

module.exports = { runFinancialAgentDemo, MockFinancialAgent };
