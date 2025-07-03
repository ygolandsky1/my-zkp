const express = require('express');
const router = express.Router();
const { submitLogTransaction, queryLog } = require('../utils/fabricHelper');
const fs = require('fs');

router.post('/log-proof', async (req, res) => {
  try {
    const { logID, logData } = req.body;
    if (!logID || !logData || !logData.agentId || !logData.result || !logData.timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await submitLogTransaction(logID, logData);
    fs.appendFileSync('audit.log', `${JSON.stringify({ logID, logData })}\n`);
    res.status(200).json({ message: 'Log recorded' });
  } catch (error) {
    console.error('Error logging proof:', error);
    res.status(500).json({ error: 'Failed to log proof' });
  }
});

router.get('/log/:id', async (req, res) => {
  try {
    const log = await queryLog(req.params.id);
    res.status(200).json(log);
  } catch (error) {
    console.error('Error querying log:', error);
    res.status(404).json({ error: 'Log not found' });
  }
});

module.exports = router;
