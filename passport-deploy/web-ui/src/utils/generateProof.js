// src/utils/generateProof.js

/* global snarkjs */
import { buildPoseidon } from 'circomlibjs';
import { MerkleTree } from 'fixed-merkle-tree';

/**
 * Generates the ZK proof.
 * @param {string} agentId The ID of the agent to generate a proof for.
 * @returns {Promise<{proof: object, publicSignals: object}>} The generated proof and public signals.
 */
export async function generateProof(agentId) {
  // 1. Define the allowlist and build the Merkle Tree.
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  // This is your hardcoded allowlist of valid agent IDs.
  const leaves = ["100", "101", "111", "103", "104", "105", "106", "107"];
  const leafIndex = leaves.indexOf(agentId);

  if (leafIndex === -1) {
    throw new Error("Agent ID is not in the allowlist.");
  }

  const tree = new MerkleTree(3, leaves, {
    hashFunction: (left, right) => F.toObject(poseidon([left, right])),
    zeroElement: 0,
  });

  // 2. Generate the inputs for the ZK circuit with the correct signal names.
  const { pathElements, pathIndices } = tree.path(leafIndex);
  const fullInputs = {
    agent_id: agentId, // Corrected signal name to snake_case
    merkle_root: tree.root.toString(), // Corrected signal name to snake_case
    path_elements: pathElements.map(e => e.toString()),
    path_indices: pathIndices,
  };

  console.log("Generating proof with input:", fullInputs);

  // 3. Generate the proof using snarkjs and files from the /public folder.
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    fullInputs,
    '/passport_merkle.wasm',
    '/passport_merkle.zkey'
  );

  console.log("Proof generated:", proof);
  return { proof, publicSignals };
}

