# 🧪 TRON Contract Testing Guide

## ⚠️ Important: MetaMask and TRON

**MetaMask does NOT support TRON network.** TRON uses its own blockchain infrastructure and requires TRON-specific wallets.

**Use TronLink instead** - it's the official and most popular TRON wallet (similar to MetaMask for Ethereum).

---

## 📱 Part 1: Setting Up TronLink Wallet

### Step 1: Install TronLink Extension

1. **Chrome/Brave/Edge**: Go to [TronLink Extension](https://www.tronlink.org/) or search "TronLink" in Chrome Web Store
2. **Firefox**: Search "TronLink" in Firefox Add-ons
3. Click "Add to Chrome" (or your browser)
4. Follow the installation prompts

### Step 2: Create or Import Wallet

1. Open TronLink extension
2. Choose one:
   - **Create Wallet**: Generate new wallet (save your seed phrase securely!)
   - **Import Wallet**: Import existing wallet using seed phrase or private key

### Step 3: Switch to Testnet (For Testing)

1. Click the network dropdown in TronLink (top right)
2. Select **"Shasta Testnet"** (for free testing)
   - Or use **"Mainnet"** if you want to test with real TRX

### Step 4: Get Testnet TRX (Shasta Testnet)

1. Visit [Shasta Testnet Faucet](https://www.trongrid.io/faucet)
2. Enter your TronLink wallet address (starts with `T`)
3. Click "Get TRX" to receive free testnet TRX
4. Wait a few minutes for the transaction to complete

---

## 🎯 Part 2: Adding Your Token to TronLink

### For Mainnet (Your Deployed Contract)

1. Open TronLink extension
2. Click **"Assets"** tab
3. Click **"+"** (Add Token button)
4. Click **"Add Custom Token"**
5. Enter:
   - **Contract Address**: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`
   - **Symbol**: `USDT`
   - **Decimals**: `6`
6. Click **"Confirm"**
7. Your token should now appear in your assets!

### For Testnet

If you deploy to Shasta Testnet, use the same steps but with the testnet contract address.

---

## 🔧 Part 3: Testing Methods

### Method 1: Using TronScan (Easiest)

#### View Your Contract
1. Go to [TronScan](https://tronscan.org) (or [Shasta TronScan](https://shasta.tronscan.org) for testnet)
2. Search for your contract: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`
3. Click on the contract address

#### Read Contract Functions (Free)
1. Click **"Contract"** tab
2. Click **"Read Contract"**
3. You can call any view function:
   - `name()` - Get token name
   - `symbol()` - Get token symbol
   - `totalSupply()` - Get total supply
   - `balanceOf(address)` - Check balance of any address
   - `decimals()` - Get decimals
   - `owner()` - Get contract owner
   - `paused()` - Check if contract is paused

#### Write Contract Functions (Requires TRX)
1. Click **"Write Contract"**
2. Connect your TronLink wallet:
   - Click "Connect Wallet"
   - Select "TronLink"
   - Approve the connection
3. Select a function (e.g., `transfer`)
4. Enter parameters:
   - For `transfer(to, amount)`:
     - `to`: Enter recipient address (e.g., `TQDZ8asLPWZDSVBBZKjxARVMh5d5XRThAq`)
     - `amount`: Enter amount in raw format (100 USDT = 100000000, since 6 decimals)
5. Click **"Write"** or **"Execute"**
6. TronLink will pop up - review and confirm the transaction
7. Wait for confirmation (usually 1-3 minutes)

### Method 2: Using TronLink DApp Browser (Mobile)

If you have TronLink mobile app:
1. Open TronLink mobile app
2. Navigate to TronScan in the in-app browser
3. Follow the same steps as above

### Method 3: Using Your Interaction Script (Advanced)

You already have a testing script! Here's how to use it:

#### Step 1: Setup Environment

1. Create `.env` file in project root (if not exists):
```bash
PRIVATE_KEY_SHASTA=your_shasta_testnet_private_key
PRIVATE_KEY_MAINNET=your_mainnet_private_key
```

**⚠️ Security Warning**: Never commit `.env` to git! It's already in `.gitignore`.

#### Step 2: Get Your Private Key from TronLink

1. Open TronLink extension
2. Click the settings icon (gear)
3. Click **"Export Private Key"**
4. Enter your password
5. Copy the private key (starts with a long hex string)
6. Add it to your `.env` file

#### Step 3: Run the Script

1. Make sure dependencies are installed:
```bash
npm install
```

2. Create a test script or modify `scripts/interact_mockusdt.js`:

Create `test_contract.js`:
```javascript
const MockUSDTInteraction = require('./scripts/interact_mockusdt');

async function testContract() {
    const mockUSDT = new MockUSDTInteraction();
    
    // Get token info
    await mockUSDT.getTokenInfo();
    
    // Get your balance
    const address = mockUSDT.tronWeb.defaultAddress.base58;
    await mockUSDT.getBalance(address);
    
    // Test transfer (uncomment to test)
    // await mockUSDT.transfer("TQDZ8asLPWZDSVBBZKjxARVMh5d5XRThAq", 10); // Transfer 10 USDT
}

testContract().catch(console.error);
```

3. Run the test:
```bash
node test_contract.js
```

### Method 4: Using TronBox Tests (Unit Tests)

Run automated tests:

```bash
npm test
```

This runs `test/MockUSDT.test.js` which tests:
- Token properties (name, symbol, decimals)
- Transfer functions
- Owner functions (mint, burn, pause, etc.)

**Note**: Requires local TronBox test environment setup.

---

## 🧪 Testing Checklist

### Basic Functionality Tests

- [ ] **View Token Info**
  - Name: "Tether USD"
  - Symbol: "USDT"
  - Decimals: 6
  - Total Supply: 1,000,000,000 USDT

- [ ] **Check Balance**
  - Use `balanceOf(your_address)` on TronScan
  - Should show your token balance

- [ ] **Transfer Tokens**
  - Send tokens to another address
  - Verify recipient receives tokens
  - Verify your balance decreases

- [ ] **Approve & TransferFrom**
  - Approve another address to spend your tokens
  - Verify allowance is set correctly
  - Use `transferFrom` from approved address

### Owner Function Tests (If You're the Owner)

- [ ] **Mint Tokens**
  - Mint new tokens to an address
  - Verify total supply increases
  - Verify recipient balance increases

- [ ] **Burn Tokens**
  - Burn tokens from your balance
  - Verify total supply decreases
  - Verify your balance decreases

- [ ] **Pause/Unpause**
  - Pause the contract
  - Try to transfer (should fail)
  - Unpause the contract
  - Try to transfer (should succeed)

- [ ] **Blacklist**
  - Add address to blacklist
  - Try to transfer to/from blacklisted address (should fail)
  - Remove from blacklist
  - Transfer should work again

---

## 🌐 Testing Networks

### Shasta Testnet (Recommended for Testing)

- **Network**: Shasta Testnet
- **TronScan**: https://shasta.tronscan.org
- **Faucet**: https://www.trongrid.io/faucet
- **Cost**: FREE
- **Use Case**: Development and testing

### Mainnet (Your Current Deployment)

- **Network**: TRON Mainnet
- **TronScan**: https://tronscan.org
- **Contract**: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`
- **Cost**: Real TRX (transactions cost ~2-4 TRX)
- **Use Case**: Production testing

---

## 💡 Quick Testing Examples

### Example 1: Check Token Info (TronScan)

1. Go to: https://tronscan.org/#/contract/TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD
2. Click "Contract" → "Read Contract"
3. Click on `name()` → "Query" → Should show: "Tether USD"
4. Click on `symbol()` → "Query" → Should show: "USDT"
5. Click on `totalSupply()` → "Query" → Should show: 1000000000000000

### Example 2: Transfer 10 USDT (TronScan)

1. Go to contract page on TronScan
2. Click "Contract" → "Write Contract"
3. Connect TronLink wallet
4. Find `transfer` function
5. Enter:
   - `_to`: `TQDZ8asLPWZDSVBBZKjxARVMh5d5XRThAq` (or any TRON address)
   - `_value`: `10000000` (10 USDT × 10^6 = 10,000,000)
6. Click "Execute"
7. Confirm in TronLink
8. Wait for transaction confirmation

### Example 3: Check Balance (JavaScript)

```javascript
const TronWeb = require('tronweb');
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io'
});

const contractAddress = 'TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD';
const userAddress = 'YOUR_ADDRESS_HERE';

async function checkBalance() {
    const contract = await tronWeb.contract().at(contractAddress);
    const balance = await contract.balanceOf(userAddress).call();
    const decimals = await contract.decimals().call();
    const symbol = await contract.symbol().call();
    
    const formattedBalance = balance / Math.pow(10, decimals);
    console.log(`Balance: ${formattedBalance} ${symbol}`);
}

checkBalance();
```

---

## 🔐 Security Best Practices

1. **Never share your private key or seed phrase**
2. **Use testnet for testing** - Don't waste real TRX
3. **Start with small amounts** when testing on mainnet
4. **Double-check addresses** before sending tokens
5. **Verify contract address** - Make sure you're interacting with the correct contract

---

## ❓ Troubleshooting

### Issue: "Insufficient Energy/Bandwidth"

**Solution**: You need TRX in your wallet to pay for transactions. Either:
- Get more TRX
- Freeze TRX to get bandwidth/energy (reduces transaction costs)

### Issue: "Transaction Failed"

**Possible Causes**:
- Insufficient TRX for fees
- Contract is paused (if you're trying to transfer)
- Address is blacklisted
- Invalid parameters

**Solution**: Check the error message on TronScan for details

### Issue: "Cannot Connect TronLink"

**Solution**:
- Make sure TronLink extension is installed and unlocked
- Refresh the page
- Try disconnecting and reconnecting

### Issue: Token Not Showing in TronLink

**Solution**:
- Make sure you entered the correct contract address
- Check that you're on the correct network (Mainnet vs Testnet)
- Try refreshing TronLink or re-adding the token

---

## 📚 Additional Resources

- **TronLink Official**: https://www.tronlink.org/
- **TronScan**: https://tronscan.org
- **TronGrid API**: https://www.trongrid.io/
- **TRON Documentation**: https://developers.tron.network/

---

## ✅ Summary

1. **Install TronLink** (not MetaMask - it doesn't support TRON)
2. **Add your token** to TronLink using the contract address
3. **Test on TronScan** using the Read/Write Contract interface
4. **Use testnet first** (Shasta) to save money
5. **Test all functions** systematically

Your contract is already deployed at: `TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD`

Happy testing! 🚀

