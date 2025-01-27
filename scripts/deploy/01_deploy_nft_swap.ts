import { ethers } from "hardhat";
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying NFTSwap contract with account:", deployer.address);

  // Deploy NFTSwap
  const NFTSwap = await ethers.getContractFactory("NFTSwap");
  const nftSwap = await NFTSwap.deploy();
  await nftSwap.waitForDeployment();

  const address = await nftSwap.getAddress();
  console.log("NFTSwap deployed to:", address);

  // Save deployment address
  const deployment = {
    nftSwap: address
  };

  writeFileSync(
    join(__dirname, '../../deployments.json'),
    JSON.stringify(deployment, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });