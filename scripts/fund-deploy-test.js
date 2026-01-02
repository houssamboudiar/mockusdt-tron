#!/usr/bin/env node

/**
 * Complete Testnet Deployment and Testing Script
 * 
 * This script automates:
 * 1. Environment and wallet balance checking
 * 2. Contract compilation
 * 3. Deployment to Shasta testnet
 * 4. Unit testing
 * 5. Contract verification
 * 6. Integration testing
 */

require('dotenv').config();
const { execSync, exec } = require('child_process');
const TronWeb = require('tronweb').TronWeb || require('tronweb');
const path = require('path');
const fs = require('fs');

// Configuration
const NETWORK = 'shasta';
const MIN_BALANCE_TRX = 10; // Minimum TRX required for deployment
const FAUCET_URL = 'https://www.trongrid.io/faucet';
const FULL_HOST = 'https://api.shasta.trongrid.io';
const TRONSCAN_TESTNET_URL = 'https://shasta.tronscan.org';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Results tracking
const results = {
    environmentCheck: false,
    balanceCheck: false,
    compilation: false,
    deployment: false,
    unitTests: false,
    contractVerification: false,
    integrationTests: false,
    contractAddress: null,
    errors: []
};

/**
 * Step 1: Environment Check
 */
function checkEnvironment() {
    logSection('STEP 1: Environment Check');
    
    // Check .env file exists
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        logError('.env file not found!');
        logInfo('Create .env file with: PRIVATE_KEY_SHASTA=your_private_key_here');
        results.errors.push('Missing .env file');
        return false;
    }
    logSuccess('.env file found');
    
    // Check private key is set
    if (!process.env.PRIVATE_KEY_SHASTA) {
        logError('PRIVATE_KEY_SHASTA not found in .env file!');
        logInfo('Add to .env: PRIVATE_KEY_SHASTA=your_private_key_here');
        results.errors.push('PRIVATE_KEY_SHASTA not set');
        return false;
    }
    
    const privateKey = process.env.PRIVATE_KEY_SHASTA.trim();
    if (privateKey.length < 64) {
        logError('Invalid private key format!');
        results.errors.push('Invalid private key format');
        return false;
    }
    
    logSuccess('Private key found and validated');
    logInfo(`Private key length: ${privateKey.length} characters`);
    
    // Check dependencies
    logStep('CHECK', 'Verifying dependencies...');
    try {
        require('tronbox');
        require('tronweb');
        require('dotenv');
        logSuccess('All dependencies installed');
    } catch (error) {
        logError('Missing dependencies!');
        logInfo('Run: npm install');
        results.errors.push('Missing dependencies');
        return false;
    }
    
    results.environmentCheck = true;
    return true;
}

/**
 * Step 2: Balance Check
 */
function checkBalance() {
    logSection('STEP 2: Wallet Balance Check');
    
    const privateKey = process.env.PRIVATE_KEY_SHASTA.trim();
    
    try {
        logStep('INIT', 'Connecting to Shasta testnet...');
        const tronWeb = new TronWeb({
            fullHost: FULL_HOST,
            privateKey: privateKey
        });
        
        const address = tronWeb.defaultAddress.base58;
        logSuccess(`Connected to Shasta testnet`);
        logInfo(`Wallet address: ${address}`);
        
        logStep('CHECK', 'Checking TRX balance...');
        return new Promise((resolve, reject) => {
            tronWeb.trx.getBalance(address).then(balance => {
                const balanceTRX = balance / 1000000; // Convert from sun to TRX
                
                logInfo(`Current balance: ${balanceTRX.toFixed(2)} TRX`);
                
                if (balanceTRX < MIN_BALANCE_TRX) {
                    logError(`Insufficient balance! You have ${balanceTRX.toFixed(2)} TRX, need at least ${MIN_BALANCE_TRX} TRX`);
                    console.log('\n' + '='.repeat(60));
                    log('Faucet Instructions', 'bright');
                    console.log('='.repeat(60));
                    logInfo(`1. Visit: ${FAUCET_URL}`);
                    logInfo(`2. Enter your address: ${address}`);
                    logInfo(`3. Click "Get TRX" and wait 1-2 minutes`);
                    logInfo(`4. Run this script again once you have sufficient TRX`);
                    console.log('='.repeat(60) + '\n');
                    
                    results.errors.push('Insufficient balance');
                    reject(new Error('Insufficient balance'));
                } else {
                    logSuccess(`Sufficient balance (${balanceTRX.toFixed(2)} TRX)`);
                    results.balanceCheck = true;
                    resolve(tronWeb);
                }
            }).catch(err => {
                logError(`Failed to check balance: ${err.message}`);
                results.errors.push(`Balance check failed: ${err.message}`);
                reject(err);
            });
        });
    } catch (error) {
        logError(`Error initializing TronWeb: ${error.message}`);
        results.errors.push(`TronWeb initialization failed: ${error.message}`);
        return Promise.reject(error);
    }
}

/**
 * Step 3: Compile Contracts
 */
function compileContracts() {
    logSection('STEP 3: Compile Contracts');
    
    try {
        logStep('COMPILE', 'Running tronbox compile...');
        const output = execSync('npx tronbox compile', {
            cwd: process.cwd(),
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        
        if (output.includes('Compilation successful') || output.includes('Compiling')) {
            logSuccess('Contracts compiled successfully');
            results.compilation = true;
            return true;
        } else {
            logError('Compilation may have failed - check output');
            console.log(output);
            results.errors.push('Compilation failed');
            return false;
        }
    } catch (error) {
        logError(`Compilation failed: ${error.message}`);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.log(error.stderr);
        results.errors.push(`Compilation error: ${error.message}`);
        return false;
    }
}

/**
 * Step 4: Deploy Contracts
 */
function deployContracts() {
    logSection('STEP 4: Deploy to Shasta Testnet');
    
    return new Promise((resolve, reject) => {
        logStep('DEPLOY', 'Running tronbox migrate --network shasta...');
        logInfo('This may take 1-2 minutes...');
        
        const deployProcess = exec('npx tronbox migrate --network shasta', {
            cwd: process.cwd(),
            encoding: 'utf-8'
        }, (error, stdout, stderr) => {
            if (error) {
                logError(`Deployment failed: ${error.message}`);
                if (stderr) console.log(stderr);
                results.errors.push(`Deployment failed: ${error.message}`);
                reject(error);
                return;
            }
            
            console.log(stdout);
            
            // Extract contract address from output
            // Look for pattern like "MockUSDT: T..." or "Contract deployed at: T..."
            const addressMatch = stdout.match(/MockUSDT:\s*([T][a-zA-Z0-9]{33})/i) ||
                                stdout.match(/at:\s*([T][a-zA-Z0-9]{33})/i) ||
                                stdout.match(/([T][a-zA-Z0-9]{33})/);
            
            if (addressMatch) {
                const contractAddress = addressMatch[1];
                results.contractAddress = contractAddress;
                logSuccess(`Contract deployed successfully!`);
                logInfo(`Contract address: ${contractAddress}`);
                logInfo(`View on TronScan: ${TRONSCAN_TESTNET_URL}/#/contract/${contractAddress}`);
                results.deployment = true;
                resolve(contractAddress);
            } else {
                logWarning('Could not extract contract address from output');
                logInfo('Please check the output above for the contract address');
                // Still consider deployment successful if no error
                results.deployment = true;
                resolve(null);
            }
        });
        
        deployProcess.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        
        deployProcess.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}

/**
 * Step 5: Run Unit Tests
 */
function runUnitTests() {
    logSection('STEP 5: Run Unit Tests');
    
    try {
        logStep('TEST', 'Running tronbox test...');
        logInfo('This may take 1-2 minutes...');
        
        const output = execSync('npx tronbox test', {
            cwd: process.cwd(),
            encoding: 'utf-8',
            stdio: 'inherit'
        });
        
        // If we get here without error, tests passed
        logSuccess('Unit tests completed');
        results.unitTests = true;
        return true;
    } catch (error) {
        logError(`Unit tests failed: ${error.message}`);
        results.errors.push(`Unit tests failed: ${error.message}`);
        results.unitTests = false;
        return false;
    }
}

/**
 * Step 6: Verify Deployed Contract
 */
async function verifyContract(tronWeb, contractAddress) {
    logSection('STEP 6: Contract Verification');
    
    if (!contractAddress) {
        logWarning('No contract address available - skipping verification');
        logInfo('You can verify manually using the contract address from deployment output');
        results.contractVerification = false;
        return false;
    }
    
    try {
        logStep('VERIFY', `Connecting to contract at ${contractAddress}...`);
        const contract = await tronWeb.contract().at(contractAddress);
        
        if (!contract) {
            logError('Failed to connect to contract');
            results.errors.push('Failed to connect to contract');
            return false;
        }
        
        logSuccess('Connected to contract');
        
        // Test read functions
        logStep('TEST', 'Testing contract read functions...');
        
        const name = await contract.name().call();
        logInfo(`Name: ${name}`);
        if (name !== 'Tether USD') {
            logWarning(`Expected name "Tether USD", got "${name}"`);
        } else {
            logSuccess('Name is correct');
        }
        
        const symbol = await contract.symbol().call();
        logInfo(`Symbol: ${symbol}`);
        if (symbol !== 'USDT') {
            logWarning(`Expected symbol "USDT", got "${symbol}"`);
        } else {
            logSuccess('Symbol is correct');
        }
        
        const decimals = await contract.decimals().call();
        logInfo(`Decimals: ${decimals}`);
        if (decimals.toString() !== '6') {
            logWarning(`Expected decimals 6, got ${decimals}`);
        } else {
            logSuccess('Decimals are correct');
        }
        
        const totalSupply = await contract.totalSupply().call();
        logInfo(`Total Supply: ${totalSupply.toString()}`);
        logSuccess('Total supply retrieved');
        
        const owner = await contract.owner().call();
        logInfo(`Owner: ${owner}`);
        const deployerAddress = tronWeb.defaultAddress.base58;
        logInfo(`Deployer: ${deployerAddress}`);
        
        const deployerBalance = await contract.balanceOf(deployerAddress).call();
        logInfo(`Deployer Balance: ${deployerBalance.toString()}`);
        logSuccess('Balance retrieved');
        
        const paused = await contract.paused().call();
        logInfo(`Paused: ${paused}`);
        logSuccess('Paused status retrieved');
        
        results.contractVerification = true;
        return {
            name,
            symbol,
            decimals,
            totalSupply,
            owner,
            deployerBalance,
            paused
        };
    } catch (error) {
        logError(`Contract verification failed: ${error.message}`);
        results.errors.push(`Verification failed: ${error.message}`);
        console.error(error);
        return false;
    }
}

/**
 * Step 7: Integration Tests
 */
async function runIntegrationTests(tronWeb, contractAddress, contractInfo) {
    logSection('STEP 7: Integration Tests');
    
    if (!contractAddress) {
        logWarning('No contract address available - skipping integration tests');
        results.integrationTests = false;
        return false;
    }
    
    try {
        logStep('INIT', `Connecting to contract for integration tests...`);
        const contract = await tronWeb.contract().at(contractAddress);
        const deployerAddress = tronWeb.defaultAddress.base58;
        
        logSuccess('Connected to contract');
        logInfo(`Deployer address: ${deployerAddress}`);
        
        // Check if deployer is owner
        const owner = await contract.owner().call();
        const isOwner = owner.toLowerCase() === deployerAddress.toLowerCase();
        logInfo(`Is deployer owner: ${isOwner ? 'YES' : 'NO'}`);
        
        // Test 1: Get initial balances
        logStep('TEST 1', 'Checking initial balances...');
        const initialDeployerBalance = await contract.balanceOf(deployerAddress).call();
        logInfo(`Deployer balance: ${initialDeployerBalance.toString()}`);
        
        // Generate a test address for transfers
        const testAddress = TronWeb.address.fromPrivateKey(
            TronWeb.utils.randomPrivateKey()
        );
        logInfo(`Test address: ${testAddress}`);
        
        let integrationSuccess = true;
        
        // Test 2: Transfer test (if deployer has balance)
        const initialBalanceBN = TronWeb.toBigNumber(initialDeployerBalance);
        if (initialBalanceBN.gt(0)) {
            logStep('TEST 2', 'Testing token transfer...');
            const transferAmount = 1000000; // 1 USDT (6 decimals)
            
            if (initialBalanceBN.gte(transferAmount)) {
                try {
                    logInfo(`Transferring ${transferAmount / 1000000} USDT to test address...`);
                    const tx = await contract.transfer(testAddress, transferAmount).send();
                    logSuccess(`Transfer successful! TX: ${tx}`);
                    
                    // Verify balance
                    const testBalance = await contract.balanceOf(testAddress).call();
                    logInfo(`Test address balance: ${testBalance.toString()}`);
                    
                    if (testBalance.toString() === transferAmount.toString()) {
                        logSuccess('Transfer balance verification passed');
                    } else {
                        logError(`Balance mismatch! Expected ${transferAmount}, got ${testBalance}`);
                        integrationSuccess = false;
                    }
                } catch (error) {
                    logError(`Transfer failed: ${error.message}`);
                    integrationSuccess = false;
                }
            } else {
                logWarning('Insufficient balance for transfer test');
            }
        } else {
            logWarning('Deployer has zero balance - skipping transfer test');
        }
        
        // Test 3: Owner functions (if deployer is owner)
        if (isOwner) {
            logStep('TEST 3', 'Testing owner functions...');
            
            // Test mint
            try {
                logInfo('Testing mint function...');
                const mintAmount = 1000000000; // 1000 USDT
                const beforeBalance = await contract.balanceOf(testAddress).call();
                const beforeSupply = await contract.totalSupply().call();
                
                const mintTx = await contract.mint(testAddress, mintAmount).send();
                logSuccess(`Mint successful! TX: ${mintTx}`);
                
                const afterBalance = await contract.balanceOf(testAddress).call();
                const afterSupply = await contract.totalSupply().call();
                
                const expectedBalance = TronWeb.toBigNumber(beforeBalance).plus(mintAmount);
                const expectedSupply = TronWeb.toBigNumber(beforeSupply).plus(mintAmount);
                
                if (afterBalance.toString() === expectedBalance.toString()) {
                    logSuccess('Mint balance verification passed');
                } else {
                    logError(`Mint balance mismatch! Expected ${expectedBalance}, got ${afterBalance}`);
                    integrationSuccess = false;
                }
                
                if (afterSupply.toString() === expectedSupply.toString()) {
                    logSuccess('Mint supply verification passed');
                } else {
                    logError(`Mint supply mismatch! Expected ${expectedSupply}, got ${afterSupply}`);
                    integrationSuccess = false;
                }
            } catch (error) {
                logError(`Mint test failed: ${error.message}`);
                integrationSuccess = false;
            }
            
            // Test burn (from deployer's balance)
            try {
                logInfo('Testing burn function...');
                const deployerBalance = await contract.balanceOf(deployerAddress).call();
                const beforeSupply = await contract.totalSupply().call();
                
                const burnAmount = TronWeb.toBigNumber(deployerBalance).gte(1000000000) 
                    ? 1000000000 
                    : deployerBalance;
                
                if (TronWeb.toBigNumber(burnAmount).gt(0)) {
                    const burnTx = await contract.burn(burnAmount.toString()).send();
                    logSuccess(`Burn successful! TX: ${burnTx}`);
                    
                    const afterSupply = await contract.totalSupply().call();
                    const expectedSupply = TronWeb.toBigNumber(beforeSupply).minus(burnAmount);
                    
                    if (afterSupply.toString() === expectedSupply.toString()) {
                        logSuccess('Burn supply verification passed');
                    } else {
                        logError(`Burn supply mismatch! Expected ${expectedSupply}, got ${afterSupply}`);
                        integrationSuccess = false;
                    }
                } else {
                    logWarning('Insufficient balance for burn test');
                }
            } catch (error) {
                logError(`Burn test failed: ${error.message}`);
                integrationSuccess = false;
            }
        } else {
            logInfo('Deployer is not owner - skipping owner function tests');
        }
        
        // Test 4: Approve (test approve from deployer)
        logStep('TEST 4', 'Testing approve function...');
        const deployerBalance = await contract.balanceOf(deployerAddress).call();
        if (TronWeb.toBigNumber(deployerBalance).gt(0)) {
            try {
                logInfo('Testing approve (deployer approves testAddress to spend tokens)...');
                const approveAmount = 500000; // 0.5 USDT
                
                // Deployer approves testAddress to spend deployer's tokens
                const approveTx = await contract.approve(testAddress, approveAmount).send({
                    feeLimit: 100000000
                });
                logSuccess(`Approve successful! TX: ${approveTx}`);
                
                // Verify the allowance
                const allowance = await contract.allowance(deployerAddress, testAddress).call();
                if (allowance.toString() === approveAmount.toString()) {
                    logSuccess('Approve verification passed - allowance set correctly');
                } else {
                    logError(`Allowance mismatch! Expected ${approveAmount}, got ${allowance}`);
                    integrationSuccess = false;
                }
                
                logInfo('Note: transferFrom test skipped (requires spender private key)');
            } catch (error) {
                logError(`Approve test failed: ${error.message}`);
                integrationSuccess = false;
            }
        } else {
            logWarning('Deployer has no balance - skipping approve test');
        }
        
        results.integrationTests = integrationSuccess;
        return integrationSuccess;
    } catch (error) {
        logError(`Integration tests failed: ${error.message}`);
        results.errors.push(`Integration tests failed: ${error.message}`);
        console.error(error);
        results.integrationTests = false;
        return false;
    }
}

/**
 * Generate Summary Report
 */
function generateSummary() {
    logSection('DEPLOYMENT & TEST SUMMARY');
    
    console.log('\n' + '='.repeat(60));
    log('Results Summary', 'bright');
    console.log('='.repeat(60) + '\n');
    
    const statusIcon = (status) => status ? '✅' : '❌';
    
    console.log(`Environment Check:     ${statusIcon(results.environmentCheck)}`);
    console.log(`Balance Check:         ${statusIcon(results.balanceCheck)}`);
    console.log(`Compilation:           ${statusIcon(results.compilation)}`);
    console.log(`Deployment:            ${statusIcon(results.deployment)}`);
    console.log(`Unit Tests:            ${statusIcon(results.unitTests)}`);
    console.log(`Contract Verification: ${statusIcon(results.contractVerification)}`);
    console.log(`Integration Tests:     ${statusIcon(results.integrationTests)}`);
    
    if (results.contractAddress) {
        console.log('\n' + '-'.repeat(60));
        log('Contract Information', 'bright');
        console.log('-'.repeat(60));
        console.log(`Contract Address: ${results.contractAddress}`);
        console.log(`TronScan: ${TRONSCAN_TESTNET_URL}/#/contract/${results.contractAddress}`);
    }
    
    if (results.errors.length > 0) {
        console.log('\n' + '-'.repeat(60));
        log('Errors', 'bright');
        console.log('-'.repeat(60));
        results.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    const allSuccess = results.environmentCheck && 
                       results.balanceCheck && 
                       results.compilation && 
                       results.deployment && 
                       results.unitTests && 
                       results.contractVerification && 
                       results.integrationTests;
    
    if (allSuccess) {
        logSuccess('🎉 All steps completed successfully!');
    } else {
        logWarning('Some steps had issues - review the errors above');
    }
}

/**
 * Main execution flow
 */
async function main() {
    console.log('\n');
    log('╔══════════════════════════════════════════════════════════╗', 'bright');
    log('║  MockUSDT Testnet Deployment & Testing Script           ║', 'bright');
    log('╚══════════════════════════════════════════════════════════╝', 'bright');
    console.log('\n');
    
    let tronWeb = null;
    let contractAddress = null;
    
    try {
        // Step 1: Environment Check
        if (!checkEnvironment()) {
            generateSummary();
            process.exit(1);
        }
        
        // Step 2: Balance Check
        try {
            tronWeb = await checkBalance();
        } catch (error) {
            generateSummary();
            process.exit(1);
        }
        
        // Step 3: Compile
        if (!compileContracts()) {
            generateSummary();
            process.exit(1);
        }
        
        // Step 4: Deploy
        try {
            contractAddress = await deployContracts();
            // Store in results for summary
            if (contractAddress) {
                results.contractAddress = contractAddress;
            }
        } catch (error) {
            generateSummary();
            process.exit(1);
        }
        
        // Step 5: Unit Tests
        runUnitTests(); // Don't exit on failure, continue to verification
        
        // Step 6: Verify Contract
        if (contractAddress && tronWeb) {
            const contractInfo = await verifyContract(tronWeb, contractAddress);
            
            // Step 7: Integration Tests
            if (contractInfo) {
                await runIntegrationTests(tronWeb, contractAddress, contractInfo);
            }
        }
        
        // Generate Summary
        generateSummary();
        
    } catch (error) {
        logError(`Unexpected error: ${error.message}`);
        console.error(error);
        results.errors.push(`Unexpected error: ${error.message}`);
        generateSummary();
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        logError(`Fatal error: ${error.message}`);
        console.error(error);
        process.exit(1);
    });
}

module.exports = { main };

