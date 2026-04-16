import { verifyContract } from "@nomicfoundation/hardhat-verify/verify"
import { HardhatRuntimeEnvironment } from "hardhat/types/hre"
import MyMockV3AggregatorModule from '../ignition/modules/MockAggregatorV3Interface.js'
import FundMeModule from '../ignition/modules/FundMe.js'
import ENV from '../helper.hardhat.config.js'

interface AccountTaskArguments {
    // No argument in this case
}

export default async function (
    taskArguments: AccountTaskArguments,
    hre: HardhatRuntimeEnvironment,
) {
    const { networkConfig,ignition,verification } = await hre.network.connect();
    console.log("deploying...")
    let mockV3Addr ;
    if(!networkConfig.chainId || ENV.localChainIds.includes(networkConfig.chainId)) {
        const {mockV3} = await ignition.deploy(MyMockV3AggregatorModule);
        mockV3Addr = mockV3.target.toString();
    } else {
        const chainId = networkConfig.chainId as keyof typeof ENV.networkConfigs
        mockV3Addr = ENV.networkConfigs[chainId].dataFeedAddr
    }
    const { fundMe } = await ignition.deploy(FundMeModule, {
        parameters: {
            FundMe: {
                mockV3Addr: mockV3Addr,
            }
        }
    });

    console.log(`contract deployed successfully. contract address is ${fundMe.target}`)
    if (networkConfig.chainId &&  !(ENV.localChainIds.includes(networkConfig.chainId)) && await verification.etherscan.getApiKey()) {
        console.log("waiting verify.....")
        await verifyContract(
            {
                address: fundMe?.target?.toString(),
                constructorArgs: [ENV.LOCK_TIME, mockV3Addr],
                provider: "etherscan", // or "blockscout", or "sourcify" "etherscan"
                force: true,
            },
            hre,
        );
        await verifyContract(
            {
                address: fundMe?.target?.toString(),
                constructorArgs: [ENV.LOCK_TIME, mockV3Addr],
                provider: "sourcify", // or "blockscout", or "sourcify" "etherscan"
                force: true,
            },
            hre,
        );
        await verifyContract(
            {
                address: fundMe?.target?.toString(),
                constructorArgs: [ENV.LOCK_TIME, mockV3Addr],
                provider: "blockscout", // or "blockscout", or "sourcify" "etherscan"
                force: true,
            },
            hre,
        );

    } else {
        console.log("verify skeiped.....")
    }
}
