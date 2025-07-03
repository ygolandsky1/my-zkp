# LaGuardAI ZKP Passport – Monorepo

This project demonstrates a full-stack Zero-Knowledge Proof (ZKP) based passport verification system, where agents can prove authorization without revealing sensitive data.

---

## 🗂 Directory Structure

```
passport-deploy/
├── contracts/             # Hardhat smart contracts (Solidity)
├── circuits/              # Circom circuits + trusted setup + proof generation
├── web-ui/                # React frontend with Vite
│   ├── src/               # React components + ZK logic
│   ├── public/            # Contains .wasm and .zkey proof artifacts
│   ├── package.json       # Contains scripts to run UI
│   └── vite.config.js
├── README.md              # You're here
└── hardhat.config.js      # EVM config and deploy logic
```

---

## 🚀 Usage Instructions

### ✅ Setup

#### 1. Clone & Install

```bash
cd passport-deploy
nvm use 20  # Make sure Node.js 20+ is active
```

#### 2. Install front-end dependencies

```bash
cd web-ui
npm install
```

---

### 💻 Running the App

#### Start local Ethereum node (optional)

```bash
cd passport-deploy
npx hardhat node
```

#### Start frontend

```bash
cd web-ui
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🧪 ZKP Details

- Circuits defined in `circuits/` using `passport_merkle.circom`
- Uses `Poseidon` hash and `Groth16` proofs
- Input: `agent_id`, Merkle path, root
- Verifies inclusion in allowlist without leaking identity

---

## 📦 Proof Artifacts

Place these inside `web-ui/public/`:

- `passport_merkle.wasm`
- `passport_merkle.zkey`

These are generated using:
```bash
circom passport_merkle.circom --r1cs --wasm --sym
snarkjs groth16 setup passport_merkle.r1cs pot12_final.ptau passport_merkle.zkey
```

---

## 🔗 Contract Deployment

Verifier contract lives on Sepolia at:
```
0xE85Ea21E1484261fF415615f08c5506d1B273e66
```

Use Etherscan v2 for verification and `ethers.js` in UI to interact.

---

## 🧠 Next Steps

- Add dynamic Merkle tree tooling
- Enable real-time registry updates
- Add file-based proof uploads
- Integrate with Hyperledger audit trail

---

## 👤 Author

LaGuardAI | Yoram & team
