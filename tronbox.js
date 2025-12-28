require('dotenv').config();

module.exports = {
  networks: {
    development: {
      privateKey: '',
      userFeePercentage: 50,
      feeLimit: 1e8,
      fullHost: 'http://127.0.0.1:9090',
      network_id: "9"
    },
    nile: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1e8,
      fullHost: "https://nile.trongrid.io",
      network_id: "3"
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1e8,
      fullHost: "https://api.shasta.trongrid.io",
      network_id: "2"
    },
    mainnet: {
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      userFeePercentage: 100,
      feeLimit: 1e8,
      fullHost: "https://api.trongrid.io",
      network_id: "1"
    }
  },
  compilers: {
    solc: {
      version: "0.8.6"
    }
  }
};