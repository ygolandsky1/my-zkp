const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs/promises');

const API_URL = 'http://localhost:3002/api/admin/register-agent';

async function registerAgent(argv) {
  try {
    console.log(`Registering agent with missionScope: ${argv.missionScope}...`);
    const response = await axios.post(API_URL, {
      role: argv.role,
      purpose: argv.purpose,
      missionScope: argv.missionScope
    });

    if (response.status === 201) {
      const passport = response.data.passport;
      // --- THE FIX IS HERE ---
      // The agentId is inside the passport object itself.
      const agentId = passport.agentId; 
      
      if (!agentId) {
        console.error('❌ CRITICAL: Could not find agentId in the returned passport.');
        console.log('Raw Passport Data:', JSON.stringify(passport, null, 2));
        return;
      }
      
      const fileName = `passport-${agentId}.json`;
      await fs.writeFile(fileName, JSON.stringify(passport, null, 2));
      console.log(`✅ Success! Agent registered with ID: ${agentId}`);
      console.log(`   Passport saved to ./${fileName}`);
    } else {
      console.error(`❌ Failed to register agent. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error during registration:', error.message);
  }
}

yargs(hideBin(process.argv))
  .command(
    'register',
    'Register a new agent',
    (yargs) => {
      return yargs
        .option('role', { describe: 'Role of the agent', type: 'string', demandOption: true })
        .option('purpose', { describe: 'Purpose of the agent', type: 'string', demandOption: true })
        .option('missionScope', { describe: 'The agent\'s mission scope', type: 'string', demandOption: true });
    },
    (argv) => registerAgent(argv)
  )
  .demandCommand(1, 'You must provide the register command.')
  .help()
  .argv;
