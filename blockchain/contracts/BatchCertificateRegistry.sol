// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BatchCertificateRegistry
 * @dev Production Solidity smart contract for anchoring batch Merkle Roots on Polygon Amoy.
 */
contract BatchCertificateRegistry {
    struct BatchAnchor {
        bytes32 merkleRoot;
        uint256 studentCount;
        uint256 version;
        uint256 timestamp;
        address issuer;
        bool exists;
    }

    address public owner;
    mapping(address => bool) public authorizedIssuers;

    // Mapping: batchId => version => BatchAnchor
    mapping(string => mapping(uint256 => BatchAnchor)) private batchAnchors;

    // Track total batches and anchor count
    uint256 public totalAnchoredBatches;

    event BatchRootAnchored(
        string indexed batchId,
        bytes32 indexed merkleRoot,
        uint256 studentCount,
        uint256 version,
        address indexed issuer,
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
            "Caller is not an authorized issuer"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
        emit IssuerAuthorized(msg.sender);
    }

    function authorizeIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(!authorizedIssuers[_issuer], "Issuer already authorized");
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }

    function deauthorizeIssuer(address _issuer) external onlyOwner {
        require(_issuer != owner, "Cannot deauthorize contract owner");
        require(authorizedIssuers[_issuer], "Issuer is not authorized");
        authorizedIssuers[_issuer] = false;
        emit IssuerDeauthorized(_issuer);
    }

    /**
     * @dev Anchor a batch Merkle Root for a specific batch version
     */
    function anchorBatchRoot(
        string memory batchId,
        bytes32 merkleRoot,
        uint256 studentCount,
        uint256 version
    ) external onlyAuthorizedIssuer {
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(merkleRoot != bytes32(0), "Merkle Root cannot be empty");
        require(version > 0, "Version must be greater than 0");
        require(
            !batchAnchors[batchId][version].exists,
            "Batch version already anchored on-chain"
        );

        batchAnchors[batchId][version] = BatchAnchor({
            merkleRoot: merkleRoot,
            studentCount: studentCount,
            version: version,
            timestamp: block.timestamp,
            issuer: msg.sender,
            exists: true
        });

        totalAnchoredBatches++;

        emit BatchRootAnchored(
            batchId,
            merkleRoot,
            studentCount,
            version,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Get stored Batch Anchor for a given batchId and version
     */
    function getBatchAnchor(string memory batchId, uint256 version)
        external
        view
        returns (
            bytes32 merkleRoot,
            uint256 studentCount,
            uint256 versionNumber,
            uint256 timestamp,
            address issuer,
            bool isAnchored
        )
    {
        require(batchAnchors[batchId][version].exists, "Batch version not found");
        BatchAnchor memory anchor = batchAnchors[batchId][version];
        return (
            anchor.merkleRoot,
            anchor.studentCount,
            anchor.version,
            anchor.timestamp,
            anchor.issuer,
            anchor.exists
        );
    }
}
