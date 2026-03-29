const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

const abiPath = path.join(__dirname, '../../../contracts/artifacts/contracts/Verification.sol/Verification.json');
const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

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
