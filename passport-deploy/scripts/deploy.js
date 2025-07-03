const hre = require("hardhat");

async function main() {
  const Verifier = await hre.ethers.getContractFactory("PassportMerkleVerifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();

  console.log(`✅ Deployed to: ${verifier.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

