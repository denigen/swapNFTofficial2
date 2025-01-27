import { ethers } from "hardhat";

async function main() {
  const NFTSwap = await ethers.getContractFactory("NFTSwap");
  const nftSwap = await NFTSwap.deploy();
  await nftSwap.waitForDeployment();

  console.log("NFTSwap deployed to:", nftSwap.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });