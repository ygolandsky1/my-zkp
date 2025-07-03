// src/utils/generateProof.js
import { buildPoseidon } from 'circomlibjs';
import { MerkleTree } from 'fixed-merkle-tree';
import * as snarkjs from 'snarkjs';
import path from 'path'; // Note: path might not work in browser, see below

/**
 * Generates the ZK proof directly in the browser.
 * @param {string} agentId The ID of the agent to generate a proof for.
 * @returns {Promise<{proof: object, publicSignals: object}>} The generated proof and public signals.
 */
export async function generateProofInBrowser(agentId) {
  // 1. Generate the complete and valid inputs on the client-side.
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const leaves = ["100", "101", "111", "103", "104", "105", "106", "107"];
  const leafIndex = leaves.indexOf(agentId);

  if (leafIndex === -1) {
    throw new Error("Agent ID is not in the allowlist.");
  }

  const tree = new MerkleTree(3, leaves, {
    hashFunction: (left, right) => F.toObject(poseidon([left, right])),
    zeroElement: 0,
  });

  const { pathElements, pathIndices } = tree.path(leafIndex);

  const fullInputs = {
    agent_id: agentId,
    path_elements: pathElements.map(e => e.toString()),
    path_indices: pathIndices,
    root_from_registry: tree.root.toString(),
  };

  // 2. Generate the proof directly in the browser using snarkjs.
  // Make sure the .wasm and .zkey files are in your frontend's 'public' folder.
  console.log("Generating proof in browser...");
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    fullInputs,
    '/passport_merkle.wasm', // Path relative to public folder
    '/passport_tree.zkey'     // Path relative to public folder
  );

  console.log("Proof generated in browser:", { proof, publicSignals });
  return { proof, publicSignals };
}

