// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// ─── Minimal OpenZeppelin-style base contracts (no external deps needed) ──────

abstract contract Ownable {
    address private _owner;
    event OwnershipTransferred(address indexed prev, address indexed next);
    constructor() { _owner = msg.sender; }
    modifier onlyOwner() { require(msg.sender == _owner, "Not owner"); _; }
    function owner() public view returns (address) { return _owner; }
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

abstract contract ReentrancyGuard {
    uint256 private _status = 1;
    modifier nonReentrant() {
        require(_status != 2, "Reentrant call");
        _status = 2; _; _status = 1;
    }
}

// ─── Credential Verification Contract ────────────────────────────────────────

contract Verification is Ownable, ReentrancyGuard {

    // ── Credential Storage ────────────────────────────────────────────────────
    mapping(address => bytes32[]) private _records;
    mapping(bytes32 => bool)      private _postHashes;

    event CredentialStored(address indexed user, bytes32 hash, uint256 timestamp);
    event PostHashStored(bytes32 indexed postHash, uint256 timestamp);

    function storeVerification(address user, bytes32 hash) external onlyOwner nonReentrant {
        require(user != address(0), "Zero address");
        _records[user].push(hash);
        emit CredentialStored(user, hash, block.timestamp);
    }

    function getVerifications(address user) external view returns (bytes32[] memory) {
        return _records[user];
    }

    function verifyHash(address user, bytes32 hash) external view returns (bool) {
        bytes32[] memory arr = _records[user];
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == hash) return true;
        }
        return false;
    }

    function storePostHash(bytes32 postHash) external onlyOwner {
        _postHashes[postHash] = true;
        emit PostHashStored(postHash, block.timestamp);
    }

    function verifyPostHash(bytes32 postHash) external view returns (bool) {
        return _postHashes[postHash];
    }
}

// ─── NFT Certificate Contract (ERC-721 minimal) ───────────────────────────────

contract CertificateNFT is Ownable, ReentrancyGuard {

    string public name   = "EduNetChain Certificate";
    string public symbol = "ENCERT";

    uint256 private _tokenIdCounter;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string)  private _tokenURIs;
    mapping(uint256 => address) private _approvals;

    // studentAddress => tokenId (one cert per student)
    mapping(address => uint256) public studentToken;
    mapping(address => bool)    public hasCertificate;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    // ── ERC-721 Core ──────────────────────────────────────────────────────────
    function balanceOf(address owner_) public view returns (uint256) {
        require(owner_ != address(0), "Zero address");
        return _balances[owner_];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner_ = _owners[tokenId];
        require(owner_ != address(0), "Token does not exist");
        return owner_;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _approvals[tokenId] = to;
        emit Approval(msg.sender, to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == from, "Not owner");
        require(msg.sender == from || msg.sender == _approvals[tokenId], "Not authorized");
        require(to != address(0), "Zero address");
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;
        delete _approvals[tokenId];
        emit Transfer(from, to, tokenId);
    }

    // ── Mint Certificate ──────────────────────────────────────────────────────
    function mintCertificate(address student, string calldata uri)
        external onlyOwner nonReentrant returns (uint256)
    {
        require(student != address(0), "Zero address");
        require(!hasCertificate[student], "Certificate already minted");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _owners[tokenId]    = student;
        _balances[student]++;
        _tokenURIs[tokenId] = uri;
        studentToken[student]    = tokenId;
        hasCertificate[student]  = true;

        emit Transfer(address(0), student, tokenId);
        return tokenId;
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
