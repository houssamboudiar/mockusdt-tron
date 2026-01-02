const TronWeb = require('tronweb').TronWeb || require('tronweb');
require('dotenv').config();

// MockUSDT Contract Interaction Script
const CONTRACT_ADDRESS = 'TBEDHFeW17mFnbdLGwPjze4aizJfke9FTD';

class MockUSDTInteraction {
    constructor() {
        // Initialize TronWeb
        const privateKey = process.env.PRIVATE_KEY_MAINNET || process.env.PRIVATE_KEY_SHASTA;
        const isMainnet = !!process.env.PRIVATE_KEY_MAINNET;
        
        const fullHost = isMainnet 
            ? 'https://api.trongrid.io'
            : 'https://api.shasta.trongrid.io';

        this.tronWeb = new TronWeb({
            fullHost: fullHost,
            privateKey: privateKey
        });

        this.network = isMainnet ? 'mainnet' : 'shasta';
        console.log(`🌐 Connected to TRON ${this.network.toUpperCase()}`);
    }

    async getContract() {
        try {
            const contract = await this.tronWeb.contract().at(CONTRACT_ADDRESS);
            return contract;
        } catch (error) {
            console.error('❌ Error getting contract:', error);
            return null;
        }
    }

    async getTokenInfo() {
        console.log('📋 Getting MockUSDT Token Information...\n');
        
        try {
            const contract = await this.getContract();
            if (!contract) return;

            const name = await contract.name().call();
            const symbol = await contract.symbol().call();
            const decimals = await contract.decimals().call();
            const totalSupply = await contract.totalSupply().call();
            const owner = await contract.owner().call();
            const paused = await contract.paused().call();

            console.log('🏷️  Token Details:');
            console.log(`   • Name: ${name}`);
            console.log(`   • Symbol: ${symbol}`);
            console.log(`   • Decimals: ${decimals}`);
            console.log(`   • Total Supply: ${this.formatTokenAmount(totalSupply, decimals)} ${symbol}`);
            console.log(`   • Raw Supply: ${totalSupply}`);
            console.log(`   • Owner: ${owner}`);
            console.log(`   • Paused: ${paused}`);
            console.log(`   • Contract: ${CONTRACT_ADDRESS}`);

        } catch (error) {
            console.error('❌ Error getting token info:', error);
        }
    }

    async getBalance(address) {
        try {
            const contract = await this.getContract();
            if (!contract) return;

            const balance = await contract.balanceOf(address).call();
            const decimals = await contract.decimals().call();
            const symbol = await contract.symbol().call();

            console.log(`💰 Balance for ${address}:`);
            console.log(`   • Balance: ${this.formatTokenAmount(balance, decimals)} ${symbol}`);
            console.log(`   • Raw Balance: ${balance}`);

            return balance;
        } catch (error) {
            console.error('❌ Error getting balance:', error);
        }
    }

    async transfer(toAddress, amount) {
        console.log(`🚀 Transferring ${amount} USDT to ${toAddress}...\n`);
        
        try {
            const contract = await this.getContract();
            if (!contract) return;

            // Convert amount to raw format (multiply by 10^6)
            const rawAmount = amount * Math.pow(10, 6);
            
            console.log(`📊 Transfer Details:`);
            console.log(`   • To: ${toAddress}`);
            console.log(`   • Amount: ${amount} USDT`);
            console.log(`   • Raw Amount: ${rawAmount}`);

            const result = await contract.transfer(toAddress, rawAmount).send();
            
            console.log('✅ Transfer successful!');
            console.log(`   • Transaction Hash: ${result}`);
            console.log(`   • View on TronScan: https://tronscan.org/#/transaction/${result}`);

            return result;
        } catch (error) {
            console.error('❌ Transfer failed:', error);
        }
    }

    async approve(spenderAddress, amount) {
        console.log(`🔓 Approving ${amount} USDT for ${spenderAddress}...\n`);
        
        try {
            const contract = await this.getContract();
            if (!contract) return;

            const rawAmount = amount * Math.pow(10, 6);
            
            const result = await contract.approve(spenderAddress, rawAmount).send();
            
            console.log('✅ Approval successful!');
            console.log(`   • Transaction Hash: ${result}`);

            return result;
        } catch (error) {
            console.error('❌ Approval failed:', error);
        }
    }

    async getAllowance(ownerAddress, spenderAddress) {
        try {
            const contract = await this.getContract();
            if (!contract) return;

            const allowance = await contract.allowance(ownerAddress, spenderAddress).call();
            const decimals = await contract.decimals().call();

            console.log(`🔍 Allowance from ${ownerAddress} to ${spenderAddress}:`);
            console.log(`   • Allowance: ${this.formatTokenAmount(allowance, decimals)} USDT`);

            return allowance;
        } catch (error) {
            console.error('❌ Error getting allowance:', error);
        }
    }

    formatTokenAmount(rawAmount, decimals) {
        return (rawAmount / Math.pow(10, decimals)).toLocaleString();
    }

    async checkOwnerFunctions() {
        console.log('👑 Checking Owner Functions...\n');
        
        try {
            const contract = await this.getContract();
            if (!contract) return;

            const currentAddress = this.tronWeb.defaultAddress.base58;
            const owner = await contract.owner().call();
            
            console.log(`📍 Current Address: ${currentAddress}`);
            console.log(`👑 Contract Owner: ${owner}`);
            console.log(`🔑 Is Owner: ${currentAddress === owner ? 'YES' : 'NO'}`);

            if (currentAddress === owner) {
                console.log('\n✅ Available Owner Functions:');
                console.log('   • mint(address, amount) - Create new tokens');
                console.log('   • burn(amount) - Destroy tokens');
                console.log('   • pause() - Pause all transfers');
                console.log('   • unpause() - Resume transfers');
                console.log('   • addToBlacklist(address) - Block address');
                console.log('   • removeFromBlacklist(address) - Unblock address');
                console.log('   • setTransferFee(fee) - Set transfer fees');
                console.log('   • transferOwnership(newOwner) - Transfer ownership');
            }

        } catch (error) {
            console.error('❌ Error checking owner functions:', error);
        }
    }
}

// Usage Examples
async function main() {
    const mockUSDT = new MockUSDTInteraction();
    
    console.log('🎯 MockUSDT Contract Interaction Tool');
    console.log('====================================\n');

    // Get token information
    await mockUSDT.getTokenInfo();
    console.log('\n' + '='.repeat(50) + '\n');

    // Check owner functions
    await mockUSDT.checkOwnerFunctions();
    console.log('\n' + '='.repeat(50) + '\n');

    // Get balance of current address
    const currentAddress = mockUSDT.tronWeb.defaultAddress.base58;
    await mockUSDT.getBalance(currentAddress);

    console.log('\n💡 Usage Examples:');
    console.log('==================');
    console.log('// Transfer 100 USDT');
    console.log('await mockUSDT.transfer("TQDZ8asLPWZDSVBBZKjxARVMh5d5XRThAq", 100);');
    console.log('');
    console.log('// Check balance');
    console.log('await mockUSDT.getBalance("TYourAddressHere");');
    console.log('');
    console.log('// Approve spending');
    console.log('await mockUSDT.approve("TSpenderAddressHere", 1000);');
}

// Uncomment to run
// main().catch(console.error);

module.exports = MockUSDTInteraction;