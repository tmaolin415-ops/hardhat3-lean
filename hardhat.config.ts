import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers"
import { configVariable, defineConfig, task } from "hardhat/config"
import hardhatVerify from "@nomicfoundation/hardhat-verify"
import hardhatKeystore from "@nomicfoundation/hardhat-keystore"

const deployFundMe = task("deploy-fundMe", "deploy the FundMe")
  .setAction(() => import("./tasks/deployFundMe.js"))
  .build();

const infactFundMe = task("infact-fundMe", "infact the FundMe")
  .addOption({
    name: "addr",
    defaultValue: ""
  })
  .setAction(() => import("./tasks/infactFundMe.js"))
  .build();


export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatVerify, hardhatKeystore],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  tasks: [deployFundMe, infactFundMe],
  test:{
   mocha: {
    timeout: 500000
   }
  },
  verify: {
    etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 1,
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
      chainId: 1,
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('PRIVATE_KEY'), configVariable('PRIVATE_KEY1')],
      chainId: 11155111
    },
  },
});
