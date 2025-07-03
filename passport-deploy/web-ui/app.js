async function verifyProof() {
  const resultEl = document.getElementById("result");

  // 👇 Use renamed proof file
  const proof = await (await fetch("proof/fresh_proof.json?v=" + Date.now())).json();
  const pubSignals = await (await fetch("proof/passport_merkle_public.json?v=" + Date.now())).json();


  if (typeof window.ethereum === 'undefined') {
    resultEl.textContent = "MetaMask not found.";
    return;
  }

  await ethereum.request({ method: 'eth_requestAccounts' });
  const web3 = new Web3(window.ethereum);

  const abi = await (await fetch("abi/PassportVerifier.json")).json();
  const contractAddress = "0xE85Ea21E1484261fF415615f08c5506d1B273e66";
  const contract = new web3.eth.Contract(abi, contractAddress);

  // ✅ Explicit destructure
  const a = proof.a;
  const b = proof.b;
  const c = proof.c;

  try {
    const isValid = await contract.methods.verifyProof(a, b, c, pubSignals).call();
    resultEl.textContent = isValid ? "✅ Access Granted" : "❌ Access Denied";
  } catch (err) {
    resultEl.textContent = "❌ Error verifying proof";
    console.error(err);
  }
}

