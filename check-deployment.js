// Quick deployment check script
require('dotenv').config();
const TronWeb = require('tronweb');

console.log('🔍 Deployment Environment Check\n');
console.log('='.repeat(50));

// Check 1: Environment variables
console.log('\n1. Environment Variables:');
const privateKey = process.env.PRIVATE_KEY_SHASTA;
if (privateKey) {
    console.log('   ✅ PRIVATE_KEY_SHASTA is set');
    console.log('   📝 Length:', privateKey.length, 'characters');
    console.log('   📝 Starts with:', privateKey.substring(0, 10) + '...');
} else {
    console.log('   ❌ PRIVATE_KEY_SHASTA is NOT set!');
    console.log('   💡 Create .env file with: PRIVATE_KEY_SHASTA=your_key');
    process.exit(1);
}

// Check 2: TronWeb connection
console.log('\n2. Network Connection:');
try {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io'
    });
    console.log('   ✅ TronWeb initialized');
    console.log('   🌐 Network: Shasta Testnet');
    console.log('   🔗 Endpoint: https://api.shasta.trongrid.io');
    
    // Test connection
    tronWeb.trx.getNodeInfo().then(info => {
        console.log('   ✅ Network connection successful');
        console.log('   📊 Latest Block:', info.block);
    }).catch(err => {
        console.log('   ❌ Network connection failed:', err.message);
    });
} catch (error) {
    console.log('   ❌ TronWeb initialization failed:', error.message);
}

// Check 3: Account balance
console.log('\n3. Account Information:');
try {
    const tronWeb = new TronWeb({
        fullHost: 'https://api.shasta.trongrid.io',
        privateKey: privateKey
    });
    
    const address = tronWeb.defaultAddress.base58;
    console.log('   📍 Address:', address);
    
    tronWeb.trx.getBalance(address).then(balance => {
        const balanceTRX = balance / 1000000;
        console.log('   💰 Balance:', balanceTRX, 'TRX');
        
        if (balanceTRX < 1) {
            console.log('   ⚠️  WARNING: Low balance! You need at least 1 TRX for deployment.');
            console.log('   💡 Get free testnet TRX from: https://www.trongrid.io/faucet');
        } else {
            console.log('   ✅ Sufficient balance for deployment');
        }
    }).catch(err => {
        console.log('   ❌ Error checking balance:', err.message);
    });
} catch (error) {
    console.log('   ❌ Error getting account info:', error.message);
}

// Check 4: Dependencies
console.log('\n4. Dependencies:');
try {
    const tronbox = require('tronbox');
    console.log('   ✅ tronbox is installed');
} catch (error) {
    console.log('   ❌ tronbox not found. Run: npm install');
}

try {
    const tronweb = require('tronweb');
    console.log('   ✅ tronweb is installed');
} catch (error) {
    console.log('   ❌ tronweb not found. Run: npm install');
}

try {
    const dotenv = require('dotenv');
    console.log('   ✅ dotenv is installed');
} catch (error) {
    console.log('   ❌ dotenv not found. Run: npm install');
}

console.log('\n' + '='.repeat(50));
console.log('\n✅ Check complete! Review the results above.\n');

