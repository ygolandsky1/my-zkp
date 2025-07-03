const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function connectToFabric() {
  const ccpPath = path.resolve(__dirname, '..', 'fabric', 'connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const walletPath = path.resolve(__dirname, '..', 'fabric', 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const identity = await wallet.get('admin');
  if (!identity) {
    throw new Error('Admin identity not found in wallet. Run enrollment script.');
  }

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'admin',
    discovery: { enabled: false }
  });

  return gateway;
}

async function submitLogTransaction(logID, logData) {
  const gateway = await connectToFabric();
  try {
    const network = await gateway.getNetwork('zkpchannel');
    const contract = network.getContract('zkpLogger');
    await contract.submitTransaction('CreateLog', logID, JSON.stringify(logData));
  } finally {
    gateway.disconnect();
  }
}

async function queryLog(logID) {
  const gateway = await connectToFabric();
  try {
    const network = await gateway.getNetwork('zkpchannel');
    const contract = network.getContract('zkpLogger');
    const result = await contract.evaluateTransaction('GetLog', logID);
    return JSON.parse(result.toString());
  } finally {
    gateway.disconnect();
  }
}

module.exports = { submitLogTransaction, queryLog };
