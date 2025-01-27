import { ethers } from "hardhat";
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MockTestNFT = await ethers.getContractFactory("MockTestNFT");
  const mockTestNFT = await MockTestNFT.deploy();
  await mockTestNFT.waitForDeployment();

  const address = await mockTestNFT.getAddress();
  console.log("MockTestNFT deployed to:", address);

  // Save deployment address
  const deployment = {
    mockTestNFT: address
  };

  writeFileSync(
    join(__dirname, '../../deployments.json'),
    JSON.stringify(deployment, null, 2)
  );

  // Mint some test NFTs
  console.log("Minting test NFTs...");
  await mockTestNFT.mintBatch(5);

  console.log("Test NFTs minted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });