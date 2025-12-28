const MockUSDT = artifacts.require("MockUSDT");

module.exports = function(deployer) {
  // Deploy with 1 billion initial supply (will be converted to 6 decimals in contract)
  const initialSupply = 1000000000; // 1 billion MUSDT
  deployer.deploy(MockUSDT, initialSupply);
};