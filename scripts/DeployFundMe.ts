import { network } from "hardhat";
import hre from 'hardhat';
import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import { configVariable } from "hardhat/config";


const { ethers,networkConfig } = await network.connect();

async function main() {
    // const fundMeFactory = await ethers.getContractFactory('FundMe')
    // console.log("deploying...")
    // const fundMe = await fundMeFactory.deploy(180)
    // await fundMe.waitForDeployment()
    // console.log(`contract deployed successfully. contract address is ${fundMe.target}`)
    // if (networkConfig.chainId == 11155111 && configVariable("ETHERSCAN_API_KEY")) {
    //     console.log("waiting verify.....")
    //     await fundMe.deploymentTransaction()?.wait(5)
    //     await verifyContract(
    //         {
    //             address: fundMe?.target?.toString(),
    //             constructorArgs: [180],
    //             provider: "sourcify", // or "blockscout", or "sourcify"
    //         },
    //         hre,
    //     );
    // }else {
    //     console.log("verify skeiped.....")
    // }
}

// main().then().catch(e => {
//     console.error(e)
//     process.exit(1)
// })

