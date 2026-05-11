const { keccak256, toUtf8Bytes, Wallet } = require("ethers");

function hashDataKeccak(data) {
  // Hash for normal JSON/text data
  return keccak256(toUtf8Bytes(data));
}

function hashFileKeccak(fileBuffer) {
  // Hash for file buffer (certificate)
  return keccak256(fileBuffer);
}

function createWallet() {
  // Create a new random wallet
  const wallet = Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

module.exports = { hashDataKeccak, hashFileKeccak, createWallet };
