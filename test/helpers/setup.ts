import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export async function deployTestContracts() {
  const [owner, maker, taker] = await ethers.getSigners();

  // Deploy MockNFTs
  const MockNFT = await ethers.getContractFactory("MockNFT");
  const mockNFT1 = await MockNFT.deploy("MockNFT1", "MN1");
  const mockNFT2 = await MockNFT.deploy("MockNFT2", "MN2");

  // Deploy NFTSwap
  const NFTSwap = await ethers.getContractFactory("NFTSwap");
  const nftSwap = await NFTSwap.deploy();

  return {
    mockNFT1,
    mockNFT2,
    nftSwap,
    owner,
    maker,
    taker
  };
}

export async function setupTestNFTs(
  mockNFT1: Contract,
  mockNFT2: Contract,
  maker: SignerWithAddress,
  taker: SignerWithAddress
) {
  await mockNFT1.connect(maker).mint(maker.address);
  await mockNFT2.connect(taker).mint(taker.address);
}