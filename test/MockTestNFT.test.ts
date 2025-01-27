import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MockTestNFT", function () {
  let mockNFT: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const MockTestNFT = await ethers.getContractFactory("MockTestNFT");
    mockNFT = await MockTestNFT.deploy();
  });

  describe("Minting", function () {
    it("Should mint a single NFT", async function () {
      await mockNFT.mint();
      expect(await mockNFT.balanceOf(owner.address)).to.equal(1);
    });

    it("Should mint multiple NFTs", async function () {
      await mockNFT.mintBatch(5);
      expect(await mockNFT.balanceOf(owner.address)).to.equal(5);
    });

    it("Should increment token IDs correctly", async function () {
      await mockNFT.mint();
      await mockNFT.mint();
      expect(await mockNFT.ownerOf(1)).to.equal(owner.address);
      expect(await mockNFT.ownerOf(2)).to.equal(owner.address);
    });
  });

  describe("Base URI", function () {
    it("Should set base URI correctly", async function () {
      const baseURI = "https://api.example.com/token/";
      await mockNFT.setBaseURI(baseURI);
      await mockNFT.mint();
      expect(await mockNFT.tokenURI(1)).to.equal(baseURI + "1");
    });

    it("Should only allow owner to set base URI", async function () {
      await expect(
        mockNFT.connect(addr1).setBaseURI("https://example.com/")
      ).to.be.revertedWithCustomError(mockNFT, "OwnableUnauthorizedAccount");
    });
  });
});