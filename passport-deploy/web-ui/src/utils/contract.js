import { ethers } from 'ethers';
import verifierAbi from './verifierAbi.json';

const CONTRACT_ADDRESS = '0xE85Ea21E1484261fF415615f08c5506d1B273e66';

export async function sendProofToContract(proof, publicSignals) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, verifierAbi, signer);

  return contract.verifyProof(
    proof.pi_a,
    proof.pi_b,
    proof.pi_c,
    publicSignals
  );
}
