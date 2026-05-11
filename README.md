# 🎓 EduNetChain - Blockchain-Based Educational Credential Verification System

A decentralized application (dApp) for managing and verifying educational credentials using blockchain technology, IPFS storage, and smart contracts.

## 🌟 Features

- **Student Registration**: Students can register with personal info, education details, and upload certificates
- **Admin Approval System**: Admins review and approve/reject student registrations
- **Blockchain Verification**: Approved credentials are stored immutably on blockchain
- **IPFS Storage**: Decentralized document storage using Web3.Storage
- **JWT Authentication**: Secure role-based access control
- **Responsive UI**: Modern React interface with Tailwind CSS
- **Smart Contracts**: Solidity contracts for on-chain verification storage

## 🏗️ Architecture

```
edunetchain/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── config/   # Database configuration
│   │   ├── middleware/ # Auth middleware
│   │   ├── models/   # MongoDB schemas
│   │   ├── routes/   # API endpoints
│   │   └── services/ # Blockchain, IPFS, Email services
│   └── uploads/      # Certificate storage
├── frontend/         # React + Vite application
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/    # Application pages
│       └── api.js    # API client
└── contracts/        # Smart contracts
    ├── contracts/    # Solidity files
    └── scripts/      # Deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- MetaMask wallet

### 1. Clone Repository
```bash
git clone <repository-url>
cd edunetchain
```

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env file (see SETUP_GUIDE.md)
npm run dev
```

### 3. Smart Contract Setup
```bash
cd contracts
npm install
npx hardhat node  # In one terminal
npx hardhat run scripts/deploy.js --network localhost  # In another
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Create Admin Account
```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edunetchain.com","password":"admin123","name":"Admin"}'
```

## 📱 Application Access

- **Student Portal**: http://localhost:5173/login
- **Admin Portal**: http://localhost:5173/admin-login
- **Registration**: http://localhost:5173/register

## 🔑 Default Credentials

**Admin Login:**
- Email: admin@edunetchain.com
- Password: admin123

## 🛠️ Tech Stack

### Backend
- Express.js 5
- MongoDB + Mongoose
- JWT Authentication
- Ethers.js (Blockchain)
- Multer (File Upload)
- Web3.Storage (IPFS)
- Nodemailer (Email)

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide Icons

### Blockchain
- Solidity 0.8.28
- Hardhat
- Ethers.js

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/create-admin` - Create admin account

### Admin
- `GET /api/admin/pending-students` - Get pending approvals
- `PUT /api/admin/verify-student/:id` - Approve student
- `PUT /api/admin/reject-student/:id` - Reject student

### Verification
- `POST /api/verify/upload` - Upload documents
- `POST /api/verify/request/:studentId` - Request verification
- `GET /api/verify/requests` - Get verification requests

## 🔐 Smart Contract

### Verification.sol
```solidity
function storeVerification(address user, bytes32 hash) external onlyOwner
function getVerifications(address user) external view returns (bytes32[] memory)
function verifyHash(address user, bytes32 hash) external view returns (bool)
```

## 🎯 User Flow

1. **Student Registration**
   - Fill registration form with personal/education info
   - Upload certificates (PDF/images)
   - Submit for admin approval

2. **Admin Approval**
   - Admin logs in and views pending students
   - Reviews certificates and information
   - Approves or rejects with reason

3. **Blockchain Storage**
   - On approval, student data hash is generated
   - Wallet address is created for student
   - Hash is stored on blockchain via smart contract

4. **Student Access**
   - Approved students can login
   - Access dashboard with opportunities
   - Connect with alumni network

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting steps.

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
WEB3_STORAGE_TOKEN=your_web3_storage_token
RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=deployed_contract_address
```

### Frontend (.env)
```env
VITE_API=http://localhost:5000
```

## 🚢 Deployment

### Backend
- Deploy to Railway, Render, or Heroku
- Set environment variables
- Connect MongoDB Atlas

### Frontend
- Deploy to Vercel or Netlify
- Set VITE_API to backend URL
- Build command: `npm run build`

### Smart Contract
- Deploy to Sepolia/Goerli testnet
- Update CONTRACT_ADDRESS in backend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is created by SVPM COE Students for educational purposes.

## 👥 Team

Created by SVPM College of Engineering Students

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**© 2025 EduNetChain | Empowering Student–Alumni Interaction**
