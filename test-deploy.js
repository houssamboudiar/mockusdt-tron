// Simple deployment test
console.log('Testing deployment setup...\n');

// Test 1: Check .env
require('dotenv').config();
if (!process.env.PRIVATE_KEY_SHASTA) {
    console.error('❌ ERROR: PRIVATE_KEY_SHASTA not found in .env file!');
    console.log('\nCreate .env file with:');
    console.log('PRIVATE_KEY_SHASTA=your_private_key_here');
    process.exit(1);
}
console.log('✅ Private key found');

// Test 2: Check balance (simplified)
const TronWeb = require('tronweb').TronWeb;
const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',
    privateKey: process.env.PRIVATE_KEY_SHASTA
});

const address = tronWeb.defaultAddress.base58;
console.log('✅ Address:', address);

tronWeb.trx.getBalance(address).then(balance => {
    const balanceTRX = balance / 1000000;
    console.log('✅ Balance:', balanceTRX, 'TRX');
    
    if (balanceTRX < 1) {
        console.error('\n❌ ERROR: Insufficient balance!');
        console.log('Get free testnet TRX from: https://www.trongrid.io/faucet');
        process.exit(1);
    }
    
    console.log('\n✅ All checks passed! Ready to deploy.');
    console.log('\nRun: npm run deploy:shasta');
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

