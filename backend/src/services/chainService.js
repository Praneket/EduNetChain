const { ethers } = require('ethers');

const abi = [
  "function issueCredential(address student, bytes32 dataHash, bytes32 nameHash, bytes32 emailHash, bytes32 degreeHash, bytes32 institutionHash, bytes32 resumeHash) external",
  "function storeVerification(address user, bytes32 hash) external",
  "function storePostHash(bytes32 postHash) external",
  "function getVerifications(address user) external view returns (bytes32[])",
  "function verifyHash(address user, bytes32 hash) external view returns (bool)",
  "function verifyPostHash(bytes32 postHash) external view returns (bool)",
  "function hasCredential(address student) external view returns (bool)",
  "function getCredential(address student) external view returns (bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,uint256,bool)"
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// 🧩 Issue full immutable credential on chain
async function issueCredential(studentAddress, hashes) {
  try {
    const tx = await contract.issueCredential(
      studentAddress,
      hashes.dataHash,
      hashes.nameHash,
      hashes.emailHash,
      hashes.degreeHash,
      hashes.institutionHash,
      hashes.resumeHash
    );
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (err) {
    console.error('❌ issueCredential error:', err.message);
    throw err;
  }
}

// 🧩 Store verification on chain
async function storeOnChain(studentAddress, hash) {
  try {
    const tx = await contract.storeVerification(studentAddress, hash);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (err) {
    console.error('❌ storeOnChain error:', err.message);
    throw err;
  }
}

// 🧩 Store post hash on chain for tamper-proof integrity
async function storePostHashOnChain(postHash) {
  try {
    const tx = await contract.storePostHash(postHash);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (err) {
    console.error('❌ storePostHash error:', err.message);
    throw err;
  }
}

async function getVerifications(address) {
  return await contract.getVerifications(address);
}

async function verifyHash(address, hash) {
  return await contract.verifyHash(address, hash);
}

async function verifyPostHash(postHash) {
  return await contract.verifyPostHash(postHash);
}

module.exports = { issueCredential, storeOnChain, storePostHashOnChain, getVerifications, verifyHash, verifyPostHash };
