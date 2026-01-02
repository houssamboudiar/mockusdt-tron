# 🔧 Deployment Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Private key not found" or "Cannot read property"

**Error Message:**
```
Error: Cannot read property 'PRIVATE_KEY_SHASTA' of undefined
```

**Solution:**
1. Make sure `.env` file exists in the project root (same folder as `package.json`)
2. Check the format - should be exactly:
   ```
   PRIVATE_KEY_SHASTA=your_key_here_no_quotes
   ```
3. No spaces around the `=`
4. No quotes around the private key
5. Restart your terminal after creating/modifying `.env`

**Verify:**
```bash
node -e "require('dotenv').config(); console.log(process.env.PRIVATE_KEY_SHASTA ? 'SET' : 'NOT SET');"
```

---

### Issue 2: "Insufficient balance" or "Not enough TRX"

**Error Message:**
```
Error: Insufficient balance
```

**Solution:**
1. Make sure you're on **Shasta Testnet** in TronLink
2. Get free testnet TRX from: https://www.trongrid.io/faucet
3. Enter your TronLink address (starts with `T`)
4. Wait 1-2 minutes for TRX to arrive
5. You need at least 1-2 TRX for deployment (faucet gives 10,000)

**Check Balance:**
- Open TronLink
- Make sure network is set to "Shasta Testnet"
- Check your TRX balance

---

### Issue 3: "Network connection failed" or "Cannot connect"

**Error Message:**
```
Error: Network connection failed
```

**Solution:**
1. Check your internet connection
2. Verify the endpoint in `tronbox.js`:
   ```javascript
   fullHost: "https://api.shasta.trongrid.io"
   ```
3. Try again - network might be temporarily unavailable
4. Check if TronGrid is down: https://status.trongrid.io/

---

### Issue 4: "TronBox command not found" or "tronbox is not recognized"

**Error Message:**
```
'tronbox' is not recognized as an internal or external command
```

**Solution:**
1. Make sure dependencies are installed:
   ```bash
   npm install
   ```
2. Use `npx` prefix:
   ```bash
   npx tronbox migrate --network shasta
   ```
3. Or use the npm script:
   ```bash
   npm run deploy:shasta
   ```

---

### Issue 5: "Compilation failed" or Solidity errors

**Error Message:**
```
Error: Compilation failed
```

**Solution:**
1. Check Solidity version matches:
   - Contract uses: `pragma solidity ^0.8.0;`
   - TronBox config: `version: "0.8.6"`
2. Compile first to see errors:
   ```bash
   npm run compile
   ```
3. Fix any syntax errors in `contracts/MockUSDT.sol`
4. Make sure all files are saved

---

### Issue 6: "Migration already ran" or deployment hangs

**Error Message:**
```
Error: Migration already ran
```

**Solution:**
- This is normal if you've deployed before
- Each deployment creates a NEW contract address
- Save the new address from the output
- If it hangs, press `Ctrl+C` and try again

---

### Issue 7: PowerShell/Windows specific issues

**Symptoms:**
- Commands don't show full output
- Errors are cut off
- Deployment seems to hang

**Solution:**
1. Try using Command Prompt (cmd) instead of PowerShell
2. Or use Git Bash if you have it
3. Check if antivirus is blocking Node.js
4. Run as Administrator if needed

---

## Step-by-Step Debugging

### Step 1: Verify Environment

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check if dependencies are installed
npm list tronbox tronweb dotenv
```

### Step 2: Verify .env File

```bash
# Check if .env exists (Windows PowerShell)
Test-Path .env

# Check if private key is loaded
node -e "require('dotenv').config(); console.log(process.env.PRIVATE_KEY_SHASTA ? 'OK' : 'MISSING');"
```

### Step 3: Test Network Connection

```bash
# Test if you can reach TronGrid
curl https://api.shasta.trongrid.io/wallet/getnowblock
```

### Step 4: Try Manual Deployment

If `npm run deploy:shasta` doesn't work, try:

```bash
# Compile first
npx tronbox compile

# Then migrate
npx tronbox migrate --network shasta --reset
```

---

## Quick Fixes Checklist

- [ ] `.env` file exists in project root
- [ ] `PRIVATE_KEY_SHASTA` is set correctly (no quotes, no spaces)
- [ ] Dependencies installed: `npm install`
- [ ] Have testnet TRX (get from faucet)
- [ ] TronLink is on Shasta Testnet
- [ ] Internet connection is working
- [ ] No antivirus blocking Node.js
- [ ] Using correct command: `npm run deploy:shasta`

---

## Still Not Working?

1. **Check the exact error message** - copy the full error
2. **Check your .env file format** - must be exactly:
   ```
   PRIVATE_KEY_SHASTA=your_64_character_hex_key
   ```
3. **Try a fresh terminal** - close and reopen
4. **Check TronBox version**:
   ```bash
   npx tronbox --version
   ```
5. **Try reinstalling dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## Alternative: Deploy via TronIDE (Web-based)

If command line doesn't work, you can deploy via web interface:

1. Go to: https://www.tronide.io/
2. Connect TronLink wallet
3. Switch to Shasta Testnet
4. Copy your contract code from `contracts/MockUSDT.sol`
5. Paste into TronIDE
6. Select compiler version: 0.8.6
7. Click "Deploy"
8. Confirm in TronLink

This bypasses all local setup issues!

---

## Getting Help

If none of these solutions work:

1. **Copy the FULL error message** (not just part of it)
2. **Check which step fails**:
   - Compilation?
   - Network connection?
   - Transaction sending?
   - Balance check?
3. **Share your setup**:
   - Operating system (Windows/Mac/Linux)
   - Node.js version
   - TronBox version
   - Exact command you ran

---

## Success Indicators

You'll know it worked when you see:

```
Running migration: 1_initial_migration.js
  Deploying Migrations...
  Migrations: 0x...
Saving successful migration to network...
Running migration: 2_deploy_mock_usdt.js
  Deploying MockUSDT...
  MockUSDT: TYourContractAddressHere
Saving successful migration to network...
```

**Save the contract address!** You'll need it to interact with your contract.


