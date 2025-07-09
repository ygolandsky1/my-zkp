const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs
const { generateSignature, verifyPassport } = require('./utils/verifyPassport');

const app = express();
const router = express.Router();
const PORT = 3002;

// --- Logger Setup ---
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

// --- Constants ---
const CHANNEL_NAME = "zkpchannel";
const CHAINCODE_NAME = "zkpLogger";
const ccpPath = path.resolve(process.env.HOME, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const walletPath = path.resolve(__dirname, "wallet");

// --- Extensible Policy Engine ---
const POLICY = {
    ReadOnly: ["GET", "READ"],
    DataProcessor: ["GET", "READ", "POST", "WRITE"],
    Admin: ["GET", "READ", "POST", "WRITE", "DELETE"],
};

// --- Fabric Connection Helper ---
async function getGateway() {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get("appUser"); // Use the appUser identity

    if (!identity) {
        throw new Error("Application user 'appUser' not found in wallet. Please run enrollAdmin.js and registerUser.js first.");
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: "appUser",
        discovery: { enabled: true, asLocalhost: true },
    });
    return gateway;
}

// --- API Endpoints ---

// [NEW] Endpoint to register a new agent
router.post("/admin/register-agent", async (req, res) => {
    const { role, purpose } = req.body;
    logger.debug('Received POST /api/admin/register-agent request', { role, purpose });

    if (!role || !purpose) {
        return res.status(400).json({ error: "Missing required fields: role and purpose are required." });
    }

    const agentId = uuidv4();
    const issuedAt = new Date().toISOString();
    
    const passport = {
        agentId,
        role,
        purpose,
        issuedAt,
        signature: generateSignature(agentId, issuedAt),
        status: "Active",
        actionCount: 0,
        lastActionAt: "",
    };

    let gateway;
    try {
        gateway = await getGateway();
        const network = await gateway.getNetwork(CHANNEL_NAME);
        const contract = network.getContract(CHAINCODE_NAME);

        logger.info(`Submitting RegisterAgent transaction for Agent ID: ${agentId}`);
        await contract.submitTransaction("RegisterAgent", agentId, JSON.stringify(passport));

        res.status(201).json({ message: "✅ Agent registered successfully", passport });
    } catch (err) {
        logger.error('Error during agent registration', { message: err.message });
        res.status(500).json({ error: "Blockchain registration failed", details: err.message });
    } finally {
        gateway?.disconnect();
    }
});

// [UPDATED] Endpoint with more robust validation logic
router.post("/execute", async (req, res) => {
    const { passport: submittedPassport, intent } = req.body;
    logger.debug('Received POST /api/execute request', { agentId: submittedPassport?.agentId, intent });

    if (!submittedPassport || !submittedPassport.agentId || !intent) {
        return res.status(400).json({ error: "Invalid request: passport and intent are required." });
    }

    let gateway;
    try {
        gateway = await getGateway();
        const network = await gateway.getNetwork(CHANNEL_NAME);
        const contract = network.getContract(CHAINCODE_NAME);

        // 1. Fetch the official passport from the ledger
        logger.debug(`Fetching official passport for agent: ${submittedPassport.agentId}`);
        const officialPassportBytes = await contract.evaluateTransaction('GetPassport', submittedPassport.agentId);
        const officialPassport = JSON.parse(officialPassportBytes.toString());

        // 2. Identity Check: Validate the submitted passport against the on-chain version
        if (officialPassport.signature !== submittedPassport.signature) {
             logger.warn(`Execution denied for ${submittedPassport.agentId}: Submitted passport does not match on-chain record.`);
             return res.status(403).json({ error: "Access Denied: Invalid passport." });
        }
        logger.info(`Passport for ${submittedPassport.agentId} is valid.`);

        // 3. Governance Check: Validate intent against the policy
        const allowedActions = POLICY[officialPassport.role] || [];
        if (!allowedActions.includes(intent?.action)) {
            logger.warn(`Execution denied for ${officialPassport.agentId}: Role '${officialPassport.role}' cannot perform action '${intent?.action}'.`);
            return res.status(403).json({ error: `Access Denied: Role '${officialPassport.role}' is not authorized for action '${intent?.action}'.` });
        }
        logger.info(`Intent validated for Agent ID: ${officialPassport.agentId}`);

        // 4. Log the validated action to the ledger
        const logId = `log_${officialPassport.agentId}_${Date.now()}`;
        const actionDetails = {
            logId,
            agentId: officialPassport.agentId,
            intent: intent.action,
            target: intent.target,
            result: "Success (Allowed)",
            timestamp: new Date().toISOString(),
            passportValid: true,
        };

        logger.info(`Submitting LogAction transaction for Log ID: ${logId}`);
        const tx = contract.createTransaction("LogAction");
        await tx.submit(logId, JSON.stringify(actionDetails));

        res.status(200).json({ message: "✅ Action executed and logged successfully", txId: tx.getTransactionId() });
    } catch (err) {
        logger.error('Error during action execution', { message: err.message });
        res.status(500).json({ error: "Blockchain execution failed", details: err.message });
    } finally {
        gateway?.disconnect();
    }
});

// [NEW] Endpoint to get all registered agents
router.get("/agents", async (req, res) => {
    logger.debug('Received GET /api/agents request');
    let gateway;
    try {
        gateway = await getGateway();
        const network = await gateway.getNetwork(CHANNEL_NAME);
        const contract = network.getContract(CHAINCODE_NAME);

        const resultBytes = await contract.evaluateTransaction("GetAllAgents");
        const resultJson = JSON.parse(resultBytes.toString());
        
        res.status(200).json(resultJson);
    } catch (err) {
        logger.error('Error querying all agents', { message: err.message });
        res.status(500).json({ error: "Failed to retrieve agents", details: err.message });
    } finally {
        gateway?.disconnect();
    }
});

app.use("/api", router);

app.listen(PORT, () => {
    logger.info(`🚀 ZKP Logger API running at http://localhost:${PORT}`);
});

