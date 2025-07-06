const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const winston = require("winston");

const app = express();
const router = express.Router();
const PORT = 3002;

// Initialize logger
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

app.use(cors());
app.use(bodyParser.json());

const CHANNEL_NAME = "zkpchannel";
const CHAINCODE_NAME = "zkpLogger";

const fabricNetworkPath = path.resolve(process.env.HOME, 'fabric-samples', 'test-network');
const ccpPath = path.resolve(fabricNetworkPath, 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const walletPath = path.resolve(__dirname, "wallet");

// Cache variables
let cachedCCP = null;
let cachedWallet = null;

async function loadFabricConfig() {
  logger.debug('Loading Fabric configuration...');
  if (!cachedCCP) {
    if (!fs.existsSync(ccpPath)) {
      logger.error(`Missing CCP file at ${ccpPath}`);
      throw new Error(`Missing CCP file at ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, "utf8");
    cachedCCP = JSON.parse(contents);

    for (const section of ["peers", "orderers", "certificateAuthorities"]) {
      if (cachedCCP[section]) {
        for (const name in cachedCCP[section]) {
          const entry = cachedCCP[section][name];
          if (entry.tlsCACerts?.path) {
            entry.tlsCACerts.path = path.resolve(fabricNetworkPath, entry.tlsCACerts.path);
            logger.debug(`Resolved TLS path for ${section}.${name}: ${entry.tlsCACerts.path}`);
          }
        }
      }
    }
    logger.debug('Connection profile loaded and paths resolved');
  }

  if (!cachedWallet) {
    cachedWallet = await Wallets.newFileSystemWallet(walletPath);
    logger.debug(`Wallet initialized at ${walletPath}`);
  }

  return { ccp: cachedCCP, wallet: cachedWallet };
}

async function getGateway() {
  const { ccp, wallet } = await loadFabricConfig();
  const identityLabel = "admin";
  const identity = await wallet.get(identityLabel);
  if (!identity) {
    logger.error(`Identity '${identityLabel}' not found in wallet`);
    throw new Error(`❌ Identity '${identityLabel}' not found in wallet.`);
  }
  logger.debug(`Identity '${identityLabel}' found in wallet`);

  const gateway = new Gateway();
  try {
    await gateway.connect(ccp, {
      wallet,
      identity: identityLabel,
      discovery: { enabled: true },
    });
    logger.info('Gateway connected successfully');
    return gateway;
  } catch (error) {
    logger.error(`Failed to connect gateway: ${error.message}`, { stack: error.stack });
    throw error;
  }
}

router.post("/log-proof", async (req, res) => {
  const { logID, logData } = req.body;
  logger.debug('Received POST /api/log-proof request', { logID, logData });

  if (!logID || !logData || !logData.agentId || !logData.result || !logData.timestamp) {
    logger.warn('Missing required fields in request body', { logID, logData });
    return res.status(400).json({ error: "Missing required fields" });
  }

  let gateway;
  try {
    gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);
    logger.debug('Connected to chaincode', { chaincodeName: CHAINCODE_NAME });

    const tx = contract.createTransaction("CreateLog");
    // Test with single org to debug endorsement issue
   // tx.setEndorsingOrganizations("Org1MSP"); // Removed Org2MSP for testing
    logger.info('Submitting CreateLog transaction', { logID, logData, endorsingOrg: "Org1MSP" });

    const result = await tx.submit(logID, JSON.stringify(logData));
    logger.info('CreateLog transaction submitted successfully', { result: result.toString() });

    fs.appendFileSync("audit.log", `${JSON.stringify({ logID, logData })}\n`);
    logger.debug('Audit log written to file', { logID });

    res.status(200).json({ message: "✅ Proof logged to ledger", txId: logID });
  } catch (err) {
    logger.error('Error during log-proof transaction', {
      message: err.message,
      stack: err.stack,
      responses: err.responses || [],
      errors: err.errors || []
    });
    res.status(500).json({ error: "Blockchain logging failed", details: err.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
      logger.debug('Gateway disconnected');
    }
  }
});

router.get("/log/:id", async (req, res) => {
  const logID = req.params.id;
  logger.debug('Received GET /api/log/:id request', { logID });

  let gateway;
  try {
    gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);
    logger.debug('Connected to chaincode for query', { chaincodeName: CHAINCODE_NAME });

    logger.info('Querying GetLog transaction', { logID });
    const result = await contract.evaluateTransaction("GetLog", logID);
    const parsed = JSON.parse(result.toString());
    logger.info('GetLog query successful', { logID, result: parsed });

    res.status(200).json(parsed);
  } catch (err) {
    logger.error('Error retrieving log', {
      message: err.message,
      stack: err.stack
    });
    res.status(404).json({ error: "Log not found or error occurred", details: err.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
      logger.debug('Gateway disconnected');
    }
  }
});

app.use("/api", router);

app.listen(PORT, () => {
  logger.info(`🚀 ZKP Logger API running at http://localhost:${PORT}`);
});