// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialVerification
 * @dev Cryptographic certificate hash & Merkle Root batch verification platform contract for BlockCert.
 * Supports Merkle Root Batch Anchoring (1 transaction for 8,000+ certificates)
 * as well as individual certificate verification.
 */
contract CredentialVerification {
    // Individual Certificate Struct
    struct Certificate {
        string certificateId;
        bytes32 certificateHash;
        address issuer;
        uint256 issuedAt;
        bool valid;
    }

    // Merkle Root Batch Struct
    struct Batch {
        string batchId;
        bytes32 merkleRoot;
        address issuer;
        uint256 anchoredAt;
        uint256 totalCertificates;
        bool valid;
    }

    address public owner;

    // Authorized issuers map
    mapping(address => bool) public authorizedIssuers;

    // Storage for individual certificates indexed by Certificate ID
    mapping(string => Certificate) private certificates;
    mapping(string => bool) private exists;
    uint256 public totalCertificates;

    // Storage for Merkle Batches indexed by Batch ID
    mapping(string => Batch) private batches;
    mapping(string => bool) private batchExistsMap;
    uint256 public totalBatches;

    // Events
    event CertificateIssued(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        address indexed issuer,
        uint256 timestamp
    );

    event CertificateRevoked(
        string indexed certificateId,
        address indexed revoker,
        uint256 timestamp
    );

    event BatchAnchored(
        string indexed batchId,
        bytes32 indexed merkleRoot,
        address indexed issuer,
        uint256 totalCertificates,
        uint256 timestamp
    );

    event BatchRevoked(
        string indexed batchId,
        address indexed revoker,
        uint256 timestamp
    );

    event IssuerAuthorized(address indexed issuer);
    event IssuerDeauthorized(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            msg.sender == owner || authorizedIssuers[msg.sender],
            "Caller is not authorized to issue or revoke credentials"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }

    /**
     * @dev Authorize a new institution wallet address to issue certificates / anchor batches
     */
    function authorizeIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Issuer already authorized");
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    /**
     * @dev Deauthorize an institution wallet address
     */
    function deauthorizeIssuer(address _issuer) external onlyOwner {
        require(_issuer != owner, "Cannot deauthorize contract owner");
        require(authorizedIssuers[_issuer], "Issuer is not authorized");
        authorizedIssuers[_issuer] = false;
        emit IssuerDeauthorized(_issuer);
    }

    // =========================================================================
    // MERKLE BATCH ANCHORING FUNCTIONS (Scaling: 1 Tx per 8,000+ Certificates)
    // =========================================================================

    /**
     * @dev Register & anchor a Merkle Root for a batch of certificates on-chain
     * @param _batchId Unique batch string identifier (e.g. BATCH-2026-CSE-A)
     * @param _merkleRoot SHA-256 Merkle Root calculated from batch certificates
     * @param _totalCertificates Count of certificates represented by this Merkle Root
     */
    function registerBatch(
        string memory _batchId,
        bytes32 _merkleRoot,
        uint256 _totalCertificates
    ) external onlyAuthorizedIssuer {
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(_merkleRoot != bytes32(0), "Merkle root cannot be empty");
        require(!batchExistsMap[_batchId], "Batch ID already anchored on-chain");

        batches[_batchId] = Batch({
            batchId: _batchId,
            merkleRoot: _merkleRoot,
            issuer: msg.sender,
            anchoredAt: block.timestamp,
            totalCertificates: _totalCertificates,
            valid: true
        });

        batchExistsMap[_batchId] = true;
        totalBatches++;

        emit BatchAnchored(_batchId, _merkleRoot, msg.sender, _totalCertificates, block.timestamp);
    }

    /**
     * @dev Fetch Merkle Root for a given Batch ID
     */
    function getMerkleRoot(string memory _batchId) external view returns (bytes32) {
        require(batchExistsMap[_batchId], "Batch does not exist");
        return batches[_batchId].merkleRoot;
    }

    /**
     * @dev Check if a batch is anchored and valid
     */
    function isBatchAnchored(string memory _batchId) external view returns (bool) {
        return batchExistsMap[_batchId] && batches[_batchId].valid;
    }

    /**
     * @dev Get complete Batch record
     */
    function getBatch(string memory _batchId)
        external
        view
        returns (
            string memory batchId,
            bytes32 merkleRoot,
            address issuer,
            uint256 anchoredAt,
            uint256 totalCertificatesCount,
            bool valid
        )
    {
        require(batchExistsMap[_batchId], "Batch does not exist");
        Batch memory b = batches[_batchId];
        return (
            b.batchId,
            b.merkleRoot,
            b.issuer,
            b.anchoredAt,
            b.totalCertificates,
            b.valid
        );
    }

    /**
     * @dev Revoke an entire batch of certificates on-chain
     */
    function revokeBatch(string memory _batchId) external onlyAuthorizedIssuer {
        require(batchExistsMap[_batchId], "Batch does not exist");
        require(batches[_batchId].valid, "Batch is already revoked");

        batches[_batchId].valid = false;
        emit BatchRevoked(_batchId, msg.sender, block.timestamp);
    }

    // =========================================================================
    // INDIVIDUAL CERTIFICATE ANCHORING FUNCTIONS (Backward Compatible)
    // =========================================================================

    /**
     * @dev Issue a single certificate hash on-chain
     */
    function issueCertificate(
        string memory _certificateId,
        bytes32 _certificateHash
    ) external onlyAuthorizedIssuer {
        require(bytes(_certificateId).length > 0, "Certificate ID cannot be empty");
        require(_certificateHash != bytes32(0), "Certificate hash cannot be empty");
        require(!exists[_certificateId], "Certificate ID already exists on-chain");

        certificates[_certificateId] = Certificate({
            certificateId: _certificateId,
            certificateHash: _certificateHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            valid: true
        });

        exists[_certificateId] = true;
        totalCertificates++;

        emit CertificateIssued(_certificateId, _certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if a single certificate ID exists on-chain
     */
    function certificateExists(string memory _certificateId) external view returns (bool) {
        return exists[_certificateId];
    }

    /**
     * @dev Verify an individual certificate hash
     */
    function verifyCertificate(
        string memory _certificateId,
        bytes32 _certificateHash
    )
        external
        view
        returns (
            bool isValid,
            bool isHashMatching,
            address issuer,
            uint256 issuedAt
        )
    {
        require(exists[_certificateId], "Certificate does not exist");
        Certificate memory cert = certificates[_certificateId];
        
        isValid = cert.valid;
        isHashMatching = (cert.certificateHash == _certificateHash);
        issuer = cert.issuer;
        issuedAt = cert.issuedAt;
    }

    /**
     * @dev Retrieve single certificate struct
     */
    function getCertificate(string memory _certificateId)
        external
        view
        returns (
            string memory certificateId,
            bytes32 certificateHash,
            address issuer,
            uint256 issuedAt,
            bool valid
        )
    {
        require(exists[_certificateId], "Certificate does not exist");
        Certificate memory cert = certificates[_certificateId];
        return (
            cert.certificateId,
            cert.certificateHash,
            cert.issuer,
            cert.issuedAt,
            cert.valid
        );
    }

    /**
     * @dev Revoke an individual certificate
     */
    function revokeCertificate(string memory _certificateId) external onlyAuthorizedIssuer {
        require(exists[_certificateId], "Certificate does not exist");
        require(certificates[_certificateId].valid, "Certificate is already revoked");

        certificates[_certificateId].valid = false;
        emit CertificateRevoked(_certificateId, msg.sender, block.timestamp);
    }
}
