const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatchCertificateRegistry Smart Contract", function () {
  let contract;
  let owner;
  let issuer;
  let unauthorized;
  const batchId = "BATCH-2026-CSE-A";
  const merkleRoot = "0x8f3c2a1b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b";

  beforeEach(async function () {
    [owner, issuer, unauthorized] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BatchCertificateRegistry");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment & Role Access Control", function () {
    it("Should set the deployer as owner and authorized issuer", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.authorizedIssuers(owner.address)).to.be.true;
    });

    it("Should allow owner to authorize and deauthorize issuers", async function () {
      await expect(contract.authorizeIssuer(issuer.address))
        .to.emit(contract, "IssuerAuthorized")
        .withArgs(issuer.address);

      expect(await contract.authorizedIssuers(issuer.address)).to.be.true;

      await expect(contract.deauthorizeIssuer(issuer.address))
        .to.emit(contract, "IssuerDeauthorized")
        .withArgs(issuer.address);

      expect(await contract.authorizedIssuers(issuer.address)).to.be.false;
    });
  });

  describe("Batch Merkle Root Anchoring & Versioning", function () {
    it("Should anchor a batch Merkle Root successfully", async function () {
      await expect(contract.anchorBatchRoot(batchId, merkleRoot, 8000, 1))
        .to.emit(contract, "BatchRootAnchored")
        .withArgs(batchId, merkleRoot, 8000, 1, owner.address, (val) => val > 0);

      const res = await contract.getBatchAnchor(batchId, 1);
      expect(res.merkleRoot).to.equal(merkleRoot);
      expect(res.studentCount).to.equal(8000);
      expect(res.versionNumber).to.equal(1);
      expect(res.issuer).to.equal(owner.address);
      expect(res.isAnchored).to.be.true;
    });

    it("Should prevent duplicate anchoring of the same batch version", async function () {
      await contract.anchorBatchRoot(batchId, merkleRoot, 8000, 1);
      await expect(
        contract.anchorBatchRoot(batchId, merkleRoot, 8000, 1)
      ).to.be.revertedWith("Batch version already anchored on-chain");
    });

    it("Should allow anchoring new version (v2) for the same batch ID", async function () {
      const merkleRoot2 = "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff";
      await contract.anchorBatchRoot(batchId, merkleRoot, 8000, 1);
      await expect(contract.anchorBatchRoot(batchId, merkleRoot2, 8500, 2))
        .to.emit(contract, "BatchRootAnchored")
        .withArgs(batchId, merkleRoot2, 8500, 2, owner.address, (val) => val > 0);

      const res1 = await contract.getBatchAnchor(batchId, 1);
      const res2 = await contract.getBatchAnchor(batchId, 2);

      expect(res1.merkleRoot).to.equal(merkleRoot);
      expect(res2.merkleRoot).to.equal(merkleRoot2);
      expect(res2.studentCount).to.equal(8500);
    });

    it("Should revert if an unauthorized caller attempts to anchor a batch", async function () {
      await expect(
        contract.connect(unauthorized).anchorBatchRoot(batchId, merkleRoot, 8000, 1)
      ).to.be.revertedWith("Caller is not an authorized issuer");
    });
  });
});
