import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployTestContracts, setupTestNFTs } from "./helpers/setup";

describe("NFTSwap", function () {
  let nftSwap: Contract;
  let mockNFT1: Contract;
  let mockNFT2: Contract;
  let owner: SignerWithAddress;
  let maker: SignerWithAddress;
  let taker: SignerWithAddress;

  beforeEach(async function () {
    // Deploy contracts
    const contracts = await deployTestContracts();
    nftSwap = contracts.nftSwap;
    mockNFT1 = contracts.mockNFT1;
    mockNFT2 = contracts.mockNFT2;
    owner = contracts.owner;
    maker = contracts.maker;
    taker = contracts.taker;

    // Setup test NFTs
    await setupTestNFTs(mockNFT1, mockNFT2, maker, taker);
  });

  describe("Creating swap orders", function () {
    it("Should create a swap order successfully", async function () {
      await mockNFT1.connect(maker).approve(nftSwap.target, 1);

      const makerNFTs = [{
        contractAddress: mockNFT1.target,
        tokenId: 1
      }];

      const takerNFTs = [{
        contractAddress: mockNFT2.target,
        tokenId: 1
      }];

      await expect(nftSwap.connect(maker).createSwapOrder(
        makerNFTs,
        takerNFTs,
        taker.address
      )).to.emit(nftSwap, "SwapOrderCreated");
    });

    it("Should fail if maker doesn't own the NFT", async function () {
      const makerNFTs = [{
        contractAddress: mockNFT2.target,
        tokenId: 1
      }];

      const takerNFTs = [{
        contractAddress: mockNFT1.target,
        tokenId: 1
      }];

      await expect(
        nftSwap.connect(maker).createSwapOrder(
          makerNFTs,
          takerNFTs,
          taker.address
        )
      ).to.be.revertedWith("Must own offered NFTs");
    });
  });

  describe("Executing swaps", function () {
    let orderId: string;

    beforeEach(async function () {
      await mockNFT1.connect(maker).approve(nftSwap.target, 1);
      
      const makerNFTs = [{
        contractAddress: mockNFT1.target,
        tokenId: 1
      }];

      const takerNFTs = [{
        contractAddress: mockNFT2.target,
        tokenId: 1
      }];

      const tx = await nftSwap.connect(maker).createSwapOrder(
        makerNFTs,
        takerNFTs,
        taker.address
      );

      const receipt = await tx.wait();
      orderId = receipt.logs[0].args[0];
    });

    it("Should execute swap successfully", async function () {
      await mockNFT2.connect(taker).approve(nftSwap.target, 1);

      await expect(
        nftSwap.connect(taker).executeSwap(orderId)
      ).to.emit(nftSwap, "SwapOrderExecuted");

      expect(await mockNFT1.ownerOf(1)).to.equal(taker.address);
      expect(await mockNFT2.ownerOf(1)).to.equal(maker.address);
    });

    it("Should fail if taker doesn't approve NFT", async function () {
      await expect(
        nftSwap.connect(taker).executeSwap(orderId)
      ).to.be.revertedWith("Contract must be approved");
    });
  });
});