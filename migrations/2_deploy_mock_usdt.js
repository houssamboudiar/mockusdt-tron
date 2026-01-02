const MockUSDT = artifacts.require("MockUSDT");

module.exports = function(deployer) {
  // Deploy contract (initial supply is hardcoded in constructor: 1 billion tokens with 6 decimals)
  deployer.deploy(MockUSDT);
};