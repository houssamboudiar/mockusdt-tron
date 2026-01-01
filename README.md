# 🚀 MockUSDT - Professional TRC20 Token

**🎉 LIVE ON TRON MAINNET!**

A complete USDT-like TRC20 token with advanced features, successfully deployed on TRON blockchain.

## 🌐 **LIVE DEPLOYMENT**

- **Contract Address**: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`
- **Network**: TRON Mainnet  
- **Symbol**: MUSDT
- **Decimals**: 6
- **Total Supply**: 1,000,000,000 MUSDT
- **Deployment Date**: December 29, 2025
- **TronScan**: https://tronscan.org/#/contract/TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD

## ✨ Features

- **USDT-Compatible**: 6 decimals, 1 billion supply, identical functionality
- **Enhanced Security**: Pausable, blacklist, and fee collection features  
- **Professional Grade**: Production-ready smart contract
- **Multi-Network**: Testnet and mainnet deployment ready

## 🎯 How to Add MUSDT to Your Wallet

### TronLink
1. Open TronLink → Assets
2. Click "+" → Add Custom Token
3. Enter contract: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`
4. Symbol: MUSDT, Decimals: 6

### Trust Wallet  
1. Add Custom Token → TRON Network
2. Contract: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`
3. Symbol: MUSDT, Decimals: 6

## 🔧 Contract Interaction

### Transfer MUSDT
```javascript
// Transfer 100 MUSDT (remember 6 decimals!)
transfer("TQDZ8asLPWZDSVBBZKjxARVMh5d5XRThAq", 100000000)
```

### Check Balance
```javascript
balanceOf("TYourAddressHere")
```

## Quick Start

### Prerequisites
- Node.js 16+
- TRON wallet (TronLink recommended)
- TRX for gas fees

### Installation
```bash
npm install
```

### Configuration
1. Copy `.env.example` to `.env`
2. Add your private key
3. Configure networks in `tronbox.js`

### Deploy
```bash
# Testnet (FREE)
npm run deploy:shasta

# Mainnet (~$100-200)
npm run deploy:mainnet
```

## Token Details

- **Name**: Mock USDT
- **Symbol**: MUSDT  
- **Decimals**: 6
- **Supply**: 1,000,000,000 MUSDT
- **Standard**: TRC20

## Core Functions

```javascript
// Basic TRC20
transfer(address to, uint256 amount)
approve(address spender, uint256 amount)  
transferFrom(address from, address to, uint256 amount)
balanceOf(address account)
totalSupply()

// Enhanced Features (Owner Only)
pause() / unpause()
addToBlacklist(address account)
setTransferFee(uint256 fee) // 0-10%
mint(address to, uint256 amount)
burn(uint256 amount)
```

## Networks

### Testnet (FREE)
- **Shasta**: https://shasta.tronscan.org
- **Cost**: Free TRX from faucets
- **Perfect for**: Testing and development

### Mainnet  
- **TRON**: https://tronscan.org
- **Cost**: ~400-800 TRX deployment (~$100-200)
- **For**: Production launch

## Project Structure

```
├── contracts/
│   ├── MockUSDT.sol    # Main token contract
│   └── Migrations.sol  # Deployment helper
├── migrations/         # Deployment scripts  
├── test/              # Test files
├── tronbox.js         # Network config
└── .env               # Private keys
```

## Usage Examples

### Transfer Tokens
```javascript
// Transfer 100 MUSDT
await contract.transfer("TAddress...", 100000000);
```

### Check Balance  
```javascript
const balance = await contract.balanceOf("TAddress...");
console.log(`Balance: ${balance / 1000000} MUSDT`);
```

### Owner Functions
```javascript
// Set 1% transfer fee
await contract.setTransferFee(100);

// Pause all transfers
await contract.pause();

// Mint 1000 new tokens
await contract.mint("TAddress...", 1000000000);
```

## Security Features

- ✅ **Pausable**: Emergency stop mechanism
- ✅ **Blacklist**: Block malicious addresses  
- ✅ **Fee Control**: Configurable 0-10% fees
- ✅ **Owner Controls**: Restricted admin functions
- ✅ **Mint/Burn**: Supply management
- ✅ **Zero Address Protection**: Prevent accidents

## Testing

```bash
npm test
```

## Deployment Costs

| Network | Deployment | Transfer |
|---------|------------|----------|
| Shasta Testnet | FREE | FREE |
| TRON Mainnet | ~$100-200 | ~$2-4 |

## License

MIT