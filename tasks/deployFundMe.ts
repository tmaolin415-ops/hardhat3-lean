import { verifyContract } from "@nomicfoundation/hardhat-verify/verify"
import { HardhatRuntimeEnvironment } from "hardhat/types/hre"
import FundMeModule from '../ignition/modules/FundMe.js'
import ENV from '../helper.hardhat.config.js'

interface AccountTaskArguments {
    // No argument in this case
}

export default async function (
    taskArguments: AccountTaskArguments,
    hre: HardhatRuntimeEnvironment,
) {
    const { networkConfig,ignition,verification } = await hre.network.connect()
    const { fundMe } = await ignition.deploy(FundMeModule)
    console.log(`contract deployed successfully. contract address is ${fundMe.target}`)
    if (networkConfig.chainId &&  !(ENV.localChainIds.includes(networkConfig.chainId)) && await verification.etherscan.getApiKey()) {
        console.log("waiting verify.....")
        if(await verification.etherscan.getApiKey()) {
            await verifyContract(
                {
                    address: fundMe?.target?.toString(),
                    constructorArgs: [ENV.LOCK_TIME, ENV.networkConfigs[networkConfig.chainId as keyof typeof ENV.networkConfigs].dataFeedAddr],
                    provider: "etherscan", // or "blockscout", or "sourcify" or "etherscan"
                    force: true,
                },
                hre,
            )
        }
        await verifyContract(
            {
                address: fundMe?.target?.toString(),
                constructorArgs: [ENV.LOCK_TIME, ENV.networkConfigs[networkConfig.chainId as keyof typeof ENV.networkConfigs].dataFeedAddr],
                provider: "sourcify", // or "blockscout", or "sourcify" or "etherscan"
                force: true,
            },
            hre,
        )
        await verifyContract(
            {
                address: fundMe?.target?.toString(),
                constructorArgs: [ENV.LOCK_TIME, ENV.networkConfigs[networkConfig.chainId as keyof typeof ENV.networkConfigs].dataFeedAddr],
                provider: "blockscout", // or "blockscout", or "sourcify" or "etherscan"
                force: true,
            },
            hre,
        )
    } else {
        console.log("verify skeiped.....")
    }
}
