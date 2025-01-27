const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy NFTSwap
  const NFTSwap = await ethers.getContractFactory("NFTSwap");
  const nftSwap = await NFTSwap.deploy();
  await nftSwap.waitForDeployment();

  console.log("NFTSwap deployed to:", nftSwap.target);

  // Read existing deployment addresses
  const deploymentPath = path.join(__dirname, '../../deployments.json');
  const existingDeployment = JSON.parse(
    fs.readFileSync(deploymentPath, 'utf8')
  );

  // Update deployment addresses
  const deployment = {
    ...existingDeployment,
    nftSwap: nftSwap.target
  };

  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deployment, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });