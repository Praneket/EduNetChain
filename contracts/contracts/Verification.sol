// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Verification {
    address public owner;

    // ── Immutable Credential Record ───────────────────────────────────────────
    struct Credential {
        bytes32 dataHash;       // keccak256 of full credential JSON
        bytes32 nameHash;       // keccak256(name)
        bytes32 emailHash;      // keccak256(email)
        bytes32 degreeHash;     // keccak256(degree)
        bytes32 institutionHash;// keccak256(institution)
        bytes32 resumeHash;     // keccak256(resume file buffer)
        uint256 issuedAt;       // block.timestamp at approval
        bool    exists;
    }

    // wallet address => credential (write-once, never updated)
    mapping(address => Credential) private credentials;

    // wallet address => all historical hashes (append-only)
    mapping(address => bytes32[]) private records;

    // post integrity hashes
    mapping(bytes32 => bool) private postHashes;

    event CredentialIssued(address indexed student, bytes32 dataHash, uint256 timestamp);
    event VerificationStored(address indexed user, bytes32 hash, uint256 timestamp);
    event PostHashStored(bytes32 indexed postHash, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ── Issue full immutable credential (called once on admin approval) ───────
    function issueCredential(
        address student,
        bytes32 dataHash,
        bytes32 nameHash,
        bytes32 emailHash,
        bytes32 degreeHash,
        bytes32 institutionHash,
        bytes32 resumeHash
    ) external onlyOwner {
        require(!credentials[student].exists, "Credential already issued");
        credentials[student] = Credential({
            dataHash:        dataHash,
            nameHash:        nameHash,
            emailHash:       emailHash,
            degreeHash:      degreeHash,
            institutionHash: institutionHash,
            resumeHash:      resumeHash,
            issuedAt:        block.timestamp,
            exists:          true
        });
        records[student].push(dataHash);
        emit CredentialIssued(student, dataHash, block.timestamp);
    }

    // ── Legacy: store a single hash (kept for backward compat) ───────────────
    function storeVerification(address user, bytes32 hash) external onlyOwner {
        records[user].push(hash);
        emit VerificationStored(user, hash, block.timestamp);
    }

    // ── Read credential ───────────────────────────────────────────────────────
    function getCredential(address student) external view returns (
        bytes32 dataHash,
        bytes32 nameHash,
        bytes32 emailHash,
        bytes32 degreeHash,
        bytes32 institutionHash,
        bytes32 resumeHash,
        uint256 issuedAt,
        bool    exists
    ) {
        Credential memory c = credentials[student];
        return (c.dataHash, c.nameHash, c.emailHash, c.degreeHash, c.institutionHash, c.resumeHash, c.issuedAt, c.exists);
    }

    function hasCredential(address student) external view returns (bool) {
        return credentials[student].exists;
    }

    function getVerifications(address user) external view returns (bytes32[] memory) {
        return records[user];
    }

    function verifyHash(address user, bytes32 hash) external view returns (bool) {
        bytes32[] memory arr = records[user];
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == hash) return true;
        }
        return false;
    }

    // ── Post integrity ────────────────────────────────────────────────────────
    function storePostHash(bytes32 postHash) external onlyOwner {
        postHashes[postHash] = true;
        emit PostHashStored(postHash, block.timestamp);
    }

    function verifyPostHash(bytes32 postHash) external view returns (bool) {
        return postHashes[postHash];
    }

    function getOwner() external view returns (address) {
        return owner;
    }
}
