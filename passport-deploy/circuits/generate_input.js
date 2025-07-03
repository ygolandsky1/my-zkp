import { buildPoseidon } from 'circomlibjs';
import { MerkleTree } from 'fixed-merkle-tree';

/**
 * Generates a full ZK proof by first creating the valid inputs (including the Merkle path)
 * and then calling the backend proving service.
 * @param {string} agentId The ID of the agent to generate a proof for.
 * @returns {Promise<{proof: object, publicSignals: object}>} The generated proof and public signals.
 */
export async function generateProof(agentId) {
  // 1. Generate the complete and valid inputs on the client-side.
  // This logic is the same as our 'generate_input.js' script.
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  // In a real application, this list of authorized agents would come from a trusted source.
  const leaves = ["100", "101", "111", "103", "104", "105", "106", "107"];
  const leafIndex = leaves.indexOf(agentId);

  if (leafIndex === -1) {
    throw new Error("Agent ID is not in the allowlist and cannot generate a proof.");
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

  // 2. Call the backend API with the valid, complete inputs.
  console.log("Sending proof generation request with inputs:", fullInputs);

  const response = await fetch("http://localhost:3001/api/prove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fullInputs), // Use the dynamically generated inputs
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Backend error:", errorBody);
    throw new Error("Proof generation failed from backend");
  }

  const { proof, publicSignals } = await response.json();
  return { proof, publicSignals };
}
