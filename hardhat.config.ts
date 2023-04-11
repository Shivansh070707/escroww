import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import * as dotenv from 'dotenv';
dotenv.config();
const { POLY_MUMBAI_RPC_URL, PRIVATE_KEY, POLYGONSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  paths: {
    artifacts: 'build/artifacts',
    cache: 'build/cache',
    sources: 'contracts',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 100000000,
  },
  networks: {
    hardhat: {
      forking: {
        url: `${POLY_MUMBAI_RPC_URL}`,
        blockNumber: 16139820,
      },
    },
    'truffle-dashboard': {
      url: 'http://localhost:24012/rpc',
    },
    mumbai: {
      url: POLY_MUMBAI_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: ['diamond/'],
  },
};
export default config;
