const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialVerification Smart Contract", function () {
  let contract;
  let owner;
  let issuer;
  let unauthorized;
  const certId = "BCERT-2026-000001";
  const certHashHex = "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";
  const batchId = "BATCH-2026-CSE-A";
  const merkleRootHex = "0x8f3c2a1b9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b";

  beforeEach(async function () {
    [owner, issuer, unauthorized] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CredentialVerification");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment & Authorization", function () {
    it("Should set the correct owner and authorize owner", async function () {
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

  describe("Merkle Root Batch Anchoring", function () {
    it("Should anchor a Merkle Root batch successfully when called by authorized issuer", async function () {
      await expect(contract.registerBatch(batchId, merkleRootHex, 8000))
        .to.emit(contract, "BatchAnchored")
        .withArgs(batchId, merkleRootHex, owner.address, 8000, (val) => val > 0);

      expect(await contract.isBatchAnchored(batchId)).to.be.true;
      expect(await contract.getMerkleRoot(batchId)).to.equal(merkleRootHex);
      expect(await contract.totalBatches()).to.equal(1);
    });

    it("Should revert if unauthorized user attempts to anchor a batch", async function () {
      await expect(
        contract.connect(unauthorized).registerBatch(batchId, merkleRootHex, 8000)
      ).to.be.revertedWith("Caller is not authorized to issue or revoke credentials");
    });

    it("Should revert when anchoring duplicate batch ID", async function () {
      await contract.registerBatch(batchId, merkleRootHex, 8000);
      await expect(
        contract.registerBatch(batchId, merkleRootHex, 8000)
      ).to.be.revertedWith("Batch ID already anchored on-chain");
    });

    it("Should retrieve full batch struct", async function () {
      await contract.registerBatch(batchId, merkleRootHex, 8000);
      const res = await contract.getBatch(batchId);
      expect(res.batchId).to.equal(batchId);
      expect(res.merkleRoot).to.equal(merkleRootHex);
      expect(res.issuer).to.equal(owner.address);
      expect(res.totalCertificatesCount).to.equal(8000);
      expect(res.valid).to.be.true;
    });

    it("Should allow authorized issuer to revoke a batch", async function () {
      await contract.registerBatch(batchId, merkleRootHex, 8000);
      await expect(contract.revokeBatch(batchId))
        .to.emit(contract, "BatchRevoked")
        .withArgs(batchId, owner.address, (val) => val > 0);

      expect(await contract.isBatchAnchored(batchId)).to.be.false;
    });
  });

  describe("Individual Certificate Functions", function () {
    it("Should issue an individual certificate successfully", async function () {
      await expect(contract.issueCertificate(certId, certHashHex))
        .to.emit(contract, "CertificateIssued")
        .withArgs(certId, certHashHex, owner.address, (val) => val > 0);

      expect(await contract.certificateExists(certId)).to.be.true;
    });
  });
});
