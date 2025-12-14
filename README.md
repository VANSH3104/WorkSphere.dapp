# Decentralized Freelance Platform

A blockchain-based freelance marketplace built on Solana, enabling trustless job postings, escrow payments, and dispute resolution through smart contracts.

---

## 📸 Screenshots

<!-- Add screenshots here -->

### Dashboard
![Dashboard](path/to/dashboard-screenshot.png)

### Job Listing
![Job Listing](path/to/job-listing-screenshot.png)

### Job Creation
![Job Creation](path/to/job-creation-screenshot.png)

### Proposal Management
![Proposal Management](path/to/proposal-management-screenshot.png)

### Dispute Resolution
![Dispute Resolution](path/to/dispute-resolution-screenshot.png)

---

## 🌟 Features

### Core Functionality
- **Decentralized Job Marketplace**: Post and browse freelance jobs on the blockchain
- **Smart Contract Escrow**: Secure payments held in escrow until work completion
- **Proposal System**: Freelancers can submit proposals with custom rates and timelines
- **Dispute Resolution**: Built-in dispute system for job conflicts
- **Wallet Integration**: Seamless connection with Solana wallets (Phantom, Solflare, etc.)
- **User Profiles**: On-chain user registration and profile management

### Security Features
- **Trustless Payments**: Funds locked in smart contract escrow
- **Program-Derived Addresses (PDAs)**: Secure account management
- **Job Counter System**: Unique job IDs generated on-chain
- **Multi-stage Job Lifecycle**: Open → Assigned → Submitted → Completed → Disputed

### User Roles
1. **Clients**: Create jobs, review proposals, accept work, and release payments
2. **Freelancers**: Browse jobs, submit proposals, deliver work, and receive payments

---

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 with React 19
- **Styling**: TailwindCSS with custom components
- **Wallet Integration**: Solana Wallet Adapter
- **UI Components**: Radix UI primitives
- **Charts & Visualizations**: Recharts
- **Animations**: Framer Motion
- **State Management**: React Context (UserProvider)

### Backend (Solana Program)
- **Framework**: Anchor 0.32.1
- **Language**: Rust
- **Network**: Solana Devnet/Localnet
- **Program ID**: `TCmSPaJcRMbtzJbkGcGrJtcsjzNRpAwFRNxhqTC9BZZ`

---

## 📁 Project Structure

```
freelanceNew/
├── my-app/                    # Next.js frontend application
│   ├── src/
│   │   ├── (anchor)/         # Solana program integration
│   │   │   ├── setup.ts      # Program initialization & PDAs
│   │   │   ├── actions/      # Blockchain actions
│   │   │   └── idl.json      # Program interface definition
│   │   ├── (providers)/      # React context providers
│   │   ├── (types)/          # TypeScript type definitions
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── jobs/         # Job browsing & details
│   │   │   ├── manage-jobs/  # Job creation & management
│   │   │   ├── proposals/    # Proposal management
│   │   │   ├── submit-work/  # Work submission
│   │   │   └── disputes/     # Dispute handling
│   │   └── lib/              # Utility functions
│   └── package.json
│
└── backend/                   # Solana smart contract
    ├── programs/
    │   └── backend/          # Anchor program source
    ├── tests/                # Program tests
    ├── Anchor.toml           # Anchor configuration
    └── Cargo.toml            # Rust dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **Rust**: Latest stable version
- **Solana CLI**: v1.18 or higher
- **Anchor CLI**: v0.32.1
- **Yarn**: Package manager

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd freelanceNew
```

#### 2. Install Dependencies

**Frontend:**
```bash
cd my-app
npm install
```

**Backend:**
```bash
cd backend
yarn install
```

#### 3. Configure Solana Wallet
```bash
# Create a new wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Set cluster to devnet
solana config set --url devnet

# Airdrop SOL for testing
solana airdrop 2
```

#### 4. Build and Deploy Smart Contract

```bash
cd backend

# Build the program
anchor build

# Deploy to localnet (optional)
anchor localnet
# In another terminal:
anchor deploy

# Or deploy to devnet
anchor deploy --provider.cluster devnet
```

#### 5. Update Program ID

After deployment, update the program ID in:
- `backend/Anchor.toml`
- `my-app/src/(anchor)/idl.json`
- `my-app/src/(anchor)/setup.ts`

#### 6. Set Environment Variables

Create `.env.local` in the `my-app` directory:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
# Or for localnet:
# NEXT_PUBLIC_SOLANA_RPC_URL=http://127.0.0.1:8899
```

#### 7. Run the Frontend

```bash
cd my-app
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🎯 Usage Guide

### For Clients

1. **Connect Wallet**: Click "Connect Wallet" and select your Solana wallet
2. **Register**: Complete user registration (one-time, on-chain)
3. **Create Job**: Navigate to "Manage Jobs" → "New Job"
   - Fill in job details (title, description, budget, deadline)
   - Lock funds in escrow
4. **Review Proposals**: View freelancer proposals on your job
5. **Accept Proposal**: Select the best proposal to assign the job
6. **Review Work**: Check submitted work
7. **Release Payment**: Approve work and release escrowed funds

### For Freelancers

1. **Connect Wallet**: Connect your Solana wallet
2. **Register**: Complete user registration
3. **Browse Jobs**: Explore available jobs on the dashboard
4. **Submit Proposal**: Apply to jobs with your rate and timeline
5. **Deliver Work**: Submit completed work with proof/links
6. **Receive Payment**: Get paid when client approves your work

### Dispute Handling

If there's a disagreement:
1. Client or freelancer can raise a dispute
2. Provide evidence and description
3. Funds remain locked until resolution
4. (Future: Implement DAO-based dispute resolution)

---

## 🔑 Key Components

### Smart Contract Accounts

1. **User Account**
   - Stores user registration data
   - PDA: `["user", authority]`

2. **Job Account**
   - Contains job details and status
   - PDA: `["job", job_id]`

3. **Job Counter**
   - Generates unique job IDs
   - PDA: `["job_counter"]`

4. **Escrow Account**
   - Holds locked SOL for job payment
   - PDA: `["escrow", job_account]`

### Job Lifecycle

```
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌───────────┐
│  Open   │────▶│ Assigned │────▶│ Submitted │────▶│ Completed │
└─────────┘     └──────────┘     └───────────┘     └───────────┘
                      │                                   │
                      │                                   │
                      ▼                                   ▼
                 ┌──────────┐                      ┌──────────┐
                 │ Disputed │                      │ Disputed │
                 └──────────┘                      └──────────┘
```

### Frontend Pages

- **Dashboard**: Overview of jobs, proposals, and user stats
- **Jobs**: Browse and search available jobs
- **Job Details**: View full job information and submit proposals
- **Manage Jobs**: Create, edit, and manage your posted jobs
- **Proposals**: Track your submitted proposals
- **Submit Work**: Deliver completed work
- **Disputes**: Handle job conflicts

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework with app router |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| TailwindCSS | Styling |
| Radix UI | Accessible components |
| Solana Wallet Adapter | Wallet integration |
| Framer Motion | Animations |
| Recharts | Data visualization |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Anchor 0.32.1 | Solana development framework |
| Rust | Smart contract language |
| Solana Web3.js | Client library |
| BN.js | Big number handling |

---

## 📊 Database Schema (On-Chain)

### User Account
```rust
pub struct User {
    pub authority: Pubkey,
    pub name: String,
    pub created_at: i64,
    // Additional user fields
}
```

### Job Account
```rust
pub struct Job {
    pub job_id: u64,
    pub client: Pubkey,
    pub title: String,
    pub description: String,
    pub budget: u64,
    pub deadline: i64,
    pub status: JobStatus,
    pub assigned_freelancer: Option<Pubkey>,
    pub created_at: i64,
    // Additional job fields
}

pub enum JobStatus {
    Open,
    Assigned,
    Submitted,
    Completed,
    Disputed,
}
```

---

## 🧪 Testing

### Run Smart Contract Tests
```bash
cd backend
anchor test
```

### Test Locally
```bash
# Start local validator
solana-test-validator

# In another terminal, deploy
cd backend
anchor deploy

# Run tests
anchor test --skip-local-validator
```

---

## 🚢 Deployment

### Deploy to Devnet
```bash
cd backend
anchor build
anchor deploy --provider.cluster devnet
```

### Deploy Frontend
```bash
cd my-app
npm run build
npm start
```

Or deploy to Vercel/Netlify:
```bash
vercel deploy
# or
netlify deploy
```

---

## 🔐 Security Considerations

- ✅ PDAs ensure secure account ownership
- ✅ Escrow system prevents payment fraud
- ✅ On-chain authorization checks
- ✅ Wallet signature verification
- ⚠️ Always verify transaction details before signing
- ⚠️ Use devnet for testing, mainnet for production

---

## 🐛 Troubleshooting

### Common Issues

**1. Wallet Connection Fails**
- Ensure wallet extension is installed
- Check network matches (devnet/mainnet)
- Refresh page and try again

**2. Transaction Fails**
- Verify sufficient SOL balance for gas fees
- Check account exists (user must register first)
- Ensure correct program deployment

**3. Build Errors**
- Run `npm install` or `yarn install`
- Clear `.next` cache: `rm -rf .next`
- Verify Node.js version

**4. Program Deployment Issues**
- Ensure Solana CLI is properly configured
- Check program size (may need to increase compute)
- Verify wallet has sufficient SOL

---

## 🗺️ Roadmap

- [ ] **Phase 1**: Core marketplace functionality ✅
- [ ] **Phase 2**: Enhanced dispute resolution
- [ ] **Phase 3**: Reputation system & reviews
- [ ] **Phase 4**: Multi-token payment support (USDC, USDT)
- [ ] **Phase 5**: DAO governance for disputes
- [ ] **Phase 6**: Mobile app (React Native)
- [ ] **Phase 7**: Advanced analytics & insights
- [ ] **Phase 8**: Integration with other platforms

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Team

<!-- Add team member information here -->

---

## 📞 Contact

For questions or support, please:
- Open an issue on GitHub
- Contact the development team

---

## 🙏 Acknowledgments

- Solana Foundation for the blockchain infrastructure
- Anchor Framework team for development tools
- Radix UI for accessible component primitives
- The open-source community

---

**Built with ❤️ on Solana**
