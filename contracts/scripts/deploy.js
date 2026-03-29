import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Verification contract...");

  const Verification = await hre.ethers.getContractFactory("contracts/Verification.sol:Verification");
  const verification = await Verification.deploy();

  await verification.waitForDeployment();

  const address = await verification.getAddress();
  console.log("✅ Verification contract deployed to:", address);
  console.log("\n📝 Update your backend/.env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  
  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n👤 Deployed by:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
