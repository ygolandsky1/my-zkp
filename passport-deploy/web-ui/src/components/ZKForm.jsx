import React, { useState } from 'react';
import { generateProof } from '../utils/generateProof';

// We can assume you have a similar utility for verification
// that uses snarkjs on the client-side.
import { verifyProof } from '../utils/verifyProof';

const ZKForm = () => {
  const [agentId, setAgentId] = useState('111'); // Default to a valid ID for easy testing
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Initializing...');
    setError('');

    try {
      // Step 1: Generate the full inputs and call the backend to get the proof
      setStatus('Generating proof... (this may take a moment)');
      const { proof, publicSignals } = await generateProof(agentId);

      // Step 2: Fetch the verification key from the public folder
      setStatus('Proof received. Verifying on client-side...');
      const vkey = await fetch('/passport_merkle_verification_key.json').then((res) => res.json());

      // Step 3: Verify the proof on the client-side using snarkjs
      const isVerified = await verifyProof(vkey, publicSignals, proof);

      if (isVerified) {
        setStatus('✅ Proof Verified Successfully!');
      } else {
        throw new Error("Proof could not be verified.");
      }

    } catch (err) {
      console.error("❌ An error occurred during the process.", err);
      setError(err.message);
      setStatus('❌ Process failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>LaGuardAI Agent Passport Demo</h2>
      <p>Enter an Agent ID from the allowlist (e.g., 100, 101, 111) to generate and verify a ZK proof.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Agent ID:
          <input
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Generate & Verify Proof'}
        </button>
      </form>
      {status && <p><strong>Status:</strong> {status}</p>}
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
    </div>
  );
};

export default ZKForm;
