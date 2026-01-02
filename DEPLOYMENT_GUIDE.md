# 🚀 Testnet Deployment Guide

Complete guide to deploy your MockUSDT contract to TRON Shasta Testnet (FREE).

---

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **TronLink Wallet** (for getting testnet TRX)
   - Install: https://www.tronlink.org/

3. **Testnet TRX** (FREE from faucet)
   - Faucet: https://www.trongrid.io/faucet

---

## 🛠️ Step-by-Step Deployment

### Step 1: Install Dependencies

Open terminal in your project directory and run:

```bash
npm install
```

This installs:
- `tronbox` - TRON deployment framework
- `tronweb` - TRON Web3 library
- `dotenv` - Environment variable management

---

### Step 2: Get Your Private Key from TronLink

1. **Open TronLink Extension**
   - Click the TronLink icon in your browser

2. **Export Private Key**
   - Click the **Settings** icon (gear ⚙️)
   - Click **"Export Private Key"**
   - Enter your TronLink password
   - **Copy the private key** (long hex string starting with letters/numbers)
   
   ⚠️ **SECURITY WARNING**: Never share your private key! This is for testnet only.

3. **Switch to Shasta Testnet** (if not already)
   - In TronLink, click the network dropdown
   - Select **"Shasta Testnet"**

---

### Step 3: Get Free Testnet TRX

1. **Get Your TronLink Address**
   - In TronLink, copy your address (starts with `T`)
   - Example: `TRX...` or `T...`

2. **Visit Shasta Faucet**
   - Go to: https://www.trongrid.io/faucet
   - Paste your address
   - Click **"Get TRX"**
   - Wait 1-2 minutes for the transaction to complete

3. **Verify Balance**
   - Check TronLink - you should see testnet TRX (usually 10,000 TRX)
   - You need at least ~500 TRX for deployment (but faucet gives plenty)

---

### Step 4: Create .env File

1. **Create `.env` file** in the project root directory

2. **Add your private key**:

```bash
# Shasta Testnet Private Key
PRIVATE_KEY_SHASTA=your_private_key_here_without_quotes

# Optional: Mainnet Private Key (don't add unless deploying to mainnet)
# PRIVATE_KEY_MAINNET=your_mainnet_private_key_here
```

**Example `.env` file:**
```bash
PRIVATE_KEY_SHASTA=abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

⚠️ **Important**:
- Replace `your_private_key_here_without_quotes` with your actual private key
- **NO quotes** around the private key
- **NO spaces** before or after the `=`
- Make sure `.env` is in `.gitignore` (it should be by default)

---

### Step 5: Compile the Contract

Before deploying, compile your contract to check for errors:

```bash
npm run compile
```

**Expected Output:**
```
Compiling ./contracts/MockUSDT.sol...
Compiling ./contracts/Migrations.sol...
Compilation successful. See directory: ./build/contracts
```

✅ If you see "Compilation successful", you're good to go!

❌ If you see errors, fix them before proceeding.

---

### Step 6: Deploy to Shasta Testnet

Run the deployment command:

```bash
npm run deploy:shasta
```

**What happens:**
1. TronBox connects to Shasta testnet
2. Runs migration files in order
3. Deploys Migrations contract first
4. Deploys MockUSDT contract
5. Shows deployment results

**Expected Output:**
```
Running migration: 1_initial_migration.js
  Deploying Migrations...
  Migrations: 0x...
Saving successful migration to network...
Running migration: 2_deploy_mock_usdt.js
  Deploying MockUSDT...
  MockUSDT: 0x...
Saving successful migration to network...
```

**Important Info from Output:**
- **Contract Address**: The address where your contract is deployed (starts with `T`)
- **Transaction Hash**: The deployment transaction ID
- **Block Number**: The block where it was deployed

**📝 Save this information!** You'll need it later.

---

### Step 7: Verify Deployment

#### Option 1: Check on TronScan (Easiest)

1. **Copy your contract address** from the deployment output
2. Go to [Shasta TronScan](https://shasta.tronscan.org)
3. Paste the address in the search box
4. You should see:
   - ✅ Contract created
   - ✅ Token information
   - ✅ Contract code

#### Option 2: Check in TronLink

1. Open TronLink
2. Make sure you're on **Shasta Testnet**
3. Go to **Assets**
4. Click **"+"** → **"Add Custom Token"**
5. Enter:
   - Contract: `YOUR_CONTRACT_ADDRESS`
   - Symbol: `USDT`
   - Decimals: `6`
6. Your token should appear!

#### Option 3: Interact via TronScan

1. Go to your contract on [Shasta TronScan](https://shasta.tronscan.org)
2. Click **"Contract"** tab
3. Click **"Read Contract"**
4. Test functions:
   - `name()` → Should return: "Tether USD"
   - `symbol()` → Should return: "USDT"
   - `totalSupply()` → Should return: 1000000000000000 (1 billion with 6 decimals)

---

## 🔧 Troubleshooting

### Error: "Insufficient balance"

**Problem**: Not enough TRX in your wallet

**Solution**:
- Get more testnet TRX from the faucet
- Make sure you're using the correct network (Shasta Testnet)
- Check your balance in TronLink

### Error: "Private key not found" or "Cannot read properties"

**Problem**: `.env` file not set up correctly

**Solution**:
- Make sure `.env` file exists in project root
- Check private key format (no quotes, no spaces)
- Verify the variable name: `PRIVATE_KEY_SHASTA`
- Restart terminal after creating `.env`

### Error: "Network connection failed"

**Problem**: Cannot connect to Shasta testnet

**Solution**:
- Check your internet connection
- Try again (network may be temporarily unavailable)
- Verify `tronbox.js` has correct Shasta endpoint: `https://api.shasta.trongrid.io`

### Error: "Contract compilation failed"

**Problem**: Solidity compilation errors

**Solution**:
- Run `npm run compile` to see detailed errors
- Check your Solidity version matches (0.8.6)
- Fix any syntax errors in `contracts/MockUSDT.sol`
- Make sure all dependencies are installed: `npm install`

### Error: "Migration already ran"

**Problem**: Trying to redeploy when already deployed

**Solution**:
- If you want to redeploy, you'll get a new contract address
- To deploy fresh, you can reset migrations (advanced)
- Or just note the new address from the output

---

## 📝 Deployment Checklist

Before deploying, make sure:

- [ ] Node.js installed and working
- [ ] Dependencies installed (`npm install`)
- [ ] TronLink installed and set to Shasta Testnet
- [ ] Have testnet TRX (from faucet)
- [ ] Private key exported from TronLink
- [ ] `.env` file created with `PRIVATE_KEY_SHASTA`
- [ ] Contract compiles successfully (`npm run compile`)
- [ ] Ready to deploy (`npm run deploy:shasta`)

After deployment:

- [ ] Contract address saved
- [ ] Transaction hash saved
- [ ] Contract verified on TronScan
- [ ] Token added to TronLink
- [ ] Tested contract functions

---

## 🎯 Quick Command Reference

```bash
# Install dependencies
npm install

# Compile contract
npm run compile

# Deploy to Shasta Testnet
npm run deploy:shasta

# Deploy to Nile Testnet (alternative)
npm run deploy:nile

# Run tests
npm test

# Deploy to Mainnet (costs real TRX!)
npm run deploy:mainnet
```

---

## 📊 Deployment Costs

| Network | Cost | Notes |
|---------|------|-------|
| **Shasta Testnet** | **FREE** | Recommended for testing |
| **Nile Testnet** | **FREE** | Alternative testnet |
| **Mainnet** | ~400-800 TRX | ~$100-200 USD |

**Always test on testnet first!**

---

## 🔗 Useful Links

- **Shasta TronScan**: https://shasta.tronscan.org
- **Testnet Faucet**: https://www.trongrid.io/faucet
- **TronLink**: https://www.tronlink.org/
- **TronBox Docs**: https://developers.tron.network/docs/tron-box-user-guide

---

## ✅ Success Indicators

You'll know deployment was successful when:

1. ✅ Deployment command completes without errors
2. ✅ Contract address is shown in output
3. ✅ Contract appears on TronScan
4. ✅ You can read contract functions (name, symbol, etc.)
5. ✅ Token can be added to TronLink
6. ✅ Your wallet balance shows the token

---

## 🚨 Security Reminders

1. ⚠️ **Never commit `.env` file to git**
2. ⚠️ **Never share your private key**
3. ⚠️ **Use testnet for testing only**
4. ⚠️ **Double-check network before mainnet deployment**
5. ⚠️ **Keep your seed phrase and private keys secure**

---

## 🎉 Next Steps After Deployment

1. **Add token to TronLink** (see TESTING_GUIDE.md)
2. **Test contract functions** on TronScan
3. **Transfer tokens** to test transfers
4. **Test owner functions** (if you're the deployer/owner)
5. **Verify contract** on TronScan (see VERIFICATION_GUIDE.md)

---

**Need Help?** Check the error messages carefully - they usually tell you exactly what's wrong. Most issues are related to:
- Missing or incorrect `.env` file
- Insufficient TRX balance
- Network connection issues
- Compilation errors

Happy deploying! 🚀

