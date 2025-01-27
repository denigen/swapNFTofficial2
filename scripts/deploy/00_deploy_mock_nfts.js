const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockNFT1
  const MockNFT = await ethers.getContractFactory("MockNFT");
  const mockNFT1 = await MockNFT.deploy("TestNFT", "TEST");
  await mockNFT1.waitForDeployment();

  console.log("MockNFT deployed to:", mockNFT1.target);

  // Save deployment address
  const deployment = {
    mockNFT1: mockNFT1.target
  };

  fs.writeFileSync(
    path.join(__dirname, '../../deployments.json'),
    JSON.stringify(deployment, null, 2)
  );

  // Mint some test NFTs
  console.log("Minting test NFTs...");
  await mockNFT1.mint(deployer.address);
  await mockNFT1.mint(deployer.address);
  await mockNFT1.mint(deployer.address);

  console.log("Test NFTs minted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });