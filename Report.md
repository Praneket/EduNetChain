EduNetChain
4th May 2026

Intro:
EdunetChain is a blockchain-based student–alumni interaction platform designed to create a secure, trustworthy, and verifiable academic ecosystem.
•	Purpose:
o	To connect students and alumni in a trusted environment.
o	To ensure authenticity of users and academic data.
•	Problem in existing systems:
o	Fake or unverified profiles
o	No proper validation of certificates or identity
o	Data can be modified without detection
o	Lack of trust in interactions and opportunities
•	Our approach:
o	Introduce blockchain technology for integrity
o	Use cryptographic hashing (keccak256)
o	Maintain tamper-evident records
o	Ensure only verified users access the platform
•	Core idea:
o	Not just a networking platform
o	It is a trust-based system where data authenticity is guaranteed

Newness/Innovation:
1. Multi-Validator Consensus System
•	Replaced:
o	Single admin approval
•	With:
o	Multiple validators (faculty members managed by Super Admin)
•	Working:
o	Student submits registration or update request
o	All active validators receive the request in their dashboard
o	Each validator independently casts a vote (Approve / Reject)
o	floor(N/2) + 1 approvals required — strict majority, not just 50%
Impact:
•	Removes single-point control
•	Introduces distributed trust
•	For 2 validators: both must approve. For 3 validators: 2 must approve.

2. Blockchain-based Data Integrity
•	Instead of storing full data on blockchain:
o	Store only cryptographic hash (keccak256)
•	Why:
o	Efficient
o	Secure
o	Immutable
Impact:
•	Any change in data changes the hash completely
•	Makes tampering immediately detectable

3. Tamper Detection Mechanism
•	Process:
o	Fetch student data from MongoDB
o	Re-generate keccak256 hash from current data
o	Compare with hash stored on Sepolia blockchain
•	Result:
o	Match → data is valid
o	Mismatch → data has been tampered
Impact:
•	Ensures data integrity even if the database is compromised
•	Blockchain acts as the independent source of truth

4. Version-based Update System
•	Blockchain data cannot be modified (write-once)
•	So:
o	Student submits an UPDATE request
o	Validators vote again (same consensus rule)
o	New hash is added as a new versioned entry with previousHash link
Impact:
•	Maintains immutability
•	Keeps full history of credential changes (audit trail)

5. Hybrid Architecture (On-chain + Off-chain)
•	MongoDB → stores actual student data, profiles, messages, posts
•	Blockchain (Sepolia) → stores only keccak256 hashes
Impact:
•	Combines:
o	Efficiency (database for queries and storage)
o	Security (blockchain for tamper-proof verification)

6. Controlled Decentralization
•	Not a fully public blockchain — write access is permissioned
•	Validators are authorized institutional faculty members
•	Super Admin manages validator accounts through a dedicated portal
Impact:
•	Secure and practical for academic institutional use

Application: [Explanation & overview of Webapp]
Tech Stack:
Frontend
Layer			Technology
Framework		React 19 + Vite
Routing			React Router v6
Styling			Tailwind CSS
HTTP Client		Axios
Icons			Lucide React
Auth Storage		localStorage (namespaced per portal)

Backend
Layer			Technology
Runtime			Node.js
Framework		Express.js 5
Database		MongoDB + Mongoose
Authentication		JWT (jsonwebtoken) + bcryptjs
File Uploads		Multer + Supabase Storage
Email			Nodemailer
Blockchain Client	Ethers.js v6
Rate Limiting		express-rate-limit

Blockchain & Storage
Layer				Technology
Smart Contract Language		Solidity 0.8.17
Development Framework		Hardhat
Network				Ethereum Sepolia Testnet
RPC Provider			Alchemy
File Storage			Supabase Storage (certificates, resumes)
Hashing				keccak256 (Ethers.js)

Blockchain usages:
1. What we store on blockchain
•	We do not store full personal data
•	We store:
o	keccak256 hash of credential data (name, email, degree, institution, resume)
o	Timestamp (block.timestamp at time of issuance)
o	Wallet address of the student (auto-generated on approval)
Reason:
•	Lightweight — no gas cost for large data
•	Secure — hash is one-way, PII never exposed on-chain
•	Efficient — fast lookups by wallet address

2. How blockchain is used
•	After validator consensus is reached:
o	Student data is taken from MongoDB
o	keccak256 hash is generated for each field (name, email, degree, institution, resume)
o	issueCredential() is called on the smart contract
o	Hash is permanently stored on Sepolia blockchain
This creates:
•	An immutable, timestamped credential record tied to the student's wallet address

3. Immutability
•	Once issueCredential() is called:
o	require(!credentials[student].exists) prevents any overwrite
o	The record is permanent and cannot be changed
•	Any modification to student data in MongoDB:
o	Changes the hash completely (avalanche effect of keccak256)
Ensures:
•	Tamper-proof credential system

4. Tamper Detection Mechanism (VERY IMPORTANT)
•	When tamper check is triggered (by validator or system):
o	Fetch current student data from MongoDB
o	Re-generate keccak256 hash from current data
o	Query blockchain via getVerifications(walletAddress)
o	Compare current hash with on-chain stored hash
Result:
•	Match → data is valid and untampered
•	Mismatch → data has been modified after blockchain storage

5. Why we use blockchain
•	To ensure:
o	Data integrity — credentials cannot be silently altered
o	Transparency — anyone can verify a credential by wallet address
o	Trust — no single authority controls the verification
•	Removes dependency on:
o	Single admin or central authority

6. Type of Blockchain Used
•	Public Permissioned Hybrid (see Blockchain Type section below)
•	Write access is restricted to the contract owner (deployer wallet)
•	Read access is public — any recruiter or institution can verify
•	Suitable for academic systems — controlled yet transparent

7. Hybrid Architecture
•	MongoDB:
o	Stores actual student data, profiles, posts, messages
•	Blockchain (Sepolia):
o	Stores keccak256 hashes only
Combines:
•	Efficiency (MongoDB for rich queries) + Security (blockchain for integrity)

8. Key Understanding (IMPORTANT LINE)
•	Blockchain does NOT prevent hacking or unauthorized database access
•	It makes tampering detectable and provable — any change is immediately visible

Blockchain type:
Type: Public Permissioned Hybrid

Property		Detail
Network			Ethereum Sepolia (public testnet)
Consensus		Ethereum's Proof-of-Stake (network level)
Write Access		Permissioned — only the contract owner (deployer wallet) can write
Read Access		Public — anyone can verify a credential hash by wallet address
Contract		Deployed at 0x26E86BAB79C32Ad11Fe374A15e98aB2Cc6eE2fc5
Immutability		Credentials are write-once on-chain (issueCredential enforces this);
			updates create new versioned entries linked by previousHash
Off-chain Consensus	Custom multi-validator voting (floor(N/2)+1) before anything reaches the chain

This is a hybrid model: the blockchain itself is public Ethereum (Sepolia testnet), but write access is strictly permissioned through the smart contract's onlyOwner guard and the off-chain validator consensus layer that gates what gets submitted to the chain.

Portal separation:

/login → Students
/alumni-login → Alumni
/validator-login → Validators (faculty)
/super-admin-login → Super Admin
/verify-credential → Public credential check (no login required)

Each portal uses a separate localStorage namespace (token, val_token, sa_token) so sessions are completely isolated — logging into one portal does not affect any other.

Workflow:
Student Registers
│
▼
Uploads Resume + Certificates (stored in Supabase)
│
▼
Verification Request Created (type: ADD)
│
▼
Validators Receive Request in Dashboard
│
▼
Each Validator Casts Vote (Approve / Reject)
│
▼
Consensus Engine: floor(N/2) + 1 votes needed
│
┌──┴──┐
Approved    Rejected
│            │
▼            ▼
Wallet       Student
Created      Notified
│
▼
keccak256 Hash Generated
(name, email, degree, institution, resume)
│
▼
issueCredential() → Sepolia Blockchain
│
▼
CredentialVersion saved in MongoDB
│
▼
Student Notified → Dashboard Unlocked
│
▼
Alumni / Recruiter can view verified profile
│
▼
Recruiter verifies by wallet address on-chain

Security Features:
Authentication & Authorization

JWT tokens with expiry, verified on every protected route via auth middleware

Separate localStorage namespaces per portal (token, val_token, sa_token) — logins are fully isolated, one portal's session cannot affect another

Role-based access control: student, alumni, faculty, recruiter, isValidator, isSuperAdmin

bcrypt password hashing (salt rounds: 12)

Refresh token support for session continuity

Blockchain Security

onlyOwner modifier on all write functions — only the deployer wallet can store data on-chain

issueCredential() is write-once: require(!credentials[student].exists) prevents any credential from being overwritten

All credential data stored as keccak256 hashes — raw PII (name, email, degree) never appears on the blockchain

Tamper detection: live hash of current DB data is compared against the on-chain stored hash; any mismatch is flagged immediately with the differing hashes shown

Consensus Security

No single validator can approve a credential — requires floor(N/2) + 1 majority votes

Duplicate vote prevention via unique MongoDB index on (requestId, validatorId) — a validator cannot vote twice on the same request

Validators cannot vote on already-finalized (approved/rejected) requests

API Security

Rate limiting on super admin login (20 requests / 15 min window)

Super admin bootstrap protected by SUPER_ADMIN_KEY environment variable — one-time setup only

Validator creation and management protected by isSuperAdmin JWT claim check

Messaging rules enforced server-side: students can only message alumni who have accepted them on a post

Data Integrity

Credential version history with previousHash chain — each update links to the prior hash, creating an auditable chain of changes

Post content hashes stored on-chain via storePostHash() for post integrity verification

All sensitive keys (JWT_SECRET, DEPLOYER_PRIVATE_KEY, SUPER_ADMIN_KEY) stored in .env, never hardcoded in source code

Conclusion:
EduNetChain solves a real problem in academic credential verification — paper certificates are easy to forge, centralized databases are single points of failure, and traditional single-admin approval systems have no accountability trail.

What this system achieves:

Trustless verification — a recruiter or institution can verify a student's credential by wallet address directly on the Sepolia blockchain without trusting any central authority.

Tamper-proof records — keccak256 hashes stored on-chain mean any modification to a student's data in MongoDB is immediately detectable by comparing the live hash against the blockchain record.

Decentralized approval — no single admin can approve credentials; a strict majority of independent validators (floor(N/2)+1) must agree, reducing the risk of corruption or bias.

Version-controlled credentials — credential updates do not overwrite history; every version is chained via previousHash, creating a full auditable trail of changes.

Role isolation — students, alumni, validators, recruiters, and super admin operate in completely separate authenticated contexts with no session interference.

Limitations (honest assessment):
•	Deployed on Sepolia testnet, not mainnet — gas costs and finality times would differ in a production deployment.
•	Deployer private key is stored in .env; a production system would use a KMS (AWS KMS or HashiCorp Vault) for key management.
•	File storage uses Supabase Storage; for long-term decentralized storage, IPFS via Pinata or Filecoin would be more appropriate.

Overall, EduNetChain demonstrates a production-viable architecture for blockchain-based credential management, combining the immutability of Ethereum smart contracts with a practical off-chain multi-validator consensus layer, making it suitable as a real institutional deployment with minor infrastructure upgrades.
