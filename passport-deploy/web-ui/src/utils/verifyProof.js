import * as snarkjs from 'snarkjs';

export async function verifyProof(proof, publicSignals, vkey) {
  const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  if (!verified) throw new Error("Proof verification failed");
  return true;
}
