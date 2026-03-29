const fs = require('fs');
const path = require('path');
const { Web3Storage, File } = require('web3.storage');

const token = process.env.WEB3_STORAGE_TOKEN || '';

async function uploadToIPFS(localFilePath, filename) {
  try {
    // If no token provided, use local path
    if (!token) {
      console.log("⚠️ No Web3.Storage token, using local file path only");
      return { cid: null, path: localFilePath };
    }

    const client = new Web3Storage({ token });
    const content = await fs.promises.readFile(localFilePath);
    const file = new File([content], filename);
    const cid = await client.put([file]);
    console.log("✅ Uploaded to Web3.Storage:", cid);
    return { cid, path: `ipfs://${cid}/${filename}` };

  } catch (err) {
    console.error("⚠️ IPFS upload failed, using local file fallback:", err.message);
    // Fallback: just return local path so rest of backend still works
    return { cid: null, path: localFilePath };
  }
}

module.exports = { uploadToIPFS };
