import { HardhatRuntimeEnvironment } from "hardhat/types/hre"


interface InfactTaskArguments{
    addr: string
}

export default async function(
    taskArgs: InfactTaskArguments,
    hre: HardhatRuntimeEnvironment
) {
    const { ethers } = await hre.network.connect();
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = fundMeFactory.attach(taskArgs.addr)
    const [account1, account2]= await ethers.getSigners()

    // const getFundTx = await fundMe.getFund()
    // await getFundTx.wait()


    const fundTx = await fundMe.fund({value: 9*10**15})
    await fundTx.wait()

    const providerBalance =  await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the Contract is ${providerBalance}`)

    const fundTxOfSecendAccount =  await fundMe.connect(account2).fund({value: ethers.parseEther('0.012')})
    await fundTxOfSecendAccount.wait()

    const providerBalanceAfterSecendTx =  await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the Contract is ${providerBalanceAfterSecendTx}`)

    const fundBalanceOfAccount1 = await fundMe.addressToAmountFunded(account1.address)
    console.log(`Balance of the Account ${account1.address} is ${fundBalanceOfAccount1}`)

    const fundBalanceOfAccount2 = await fundMe.addressToAmountFunded(account2.address)
    console.log(`Balance of the Account ${account2.address} is ${fundBalanceOfAccount2}`)

}

// export default task("infact-fundMe", "infact FundMe contract")
//   .addOption({ name: "addr", defaultValue: "" })
//   .setInlineAction(async (taskArgs, hre) => {
//     const { ethers } = await hre.network.connect();
//     const fundMeFactory = await ethers.getContractFactory("FundMe")
//     const fundMe = fundMeFactory.attach(taskArgs.addr)

//     const [account1, account2] = await ethers.getSigners()

//     // const getFundTx = await fundMe.getFund()
//     // await getFundTx.wait()


//     const fundTx = await fundMe.fund({ value: 9 * 10 ** 15 })
//     await fundTx.wait()

//     const providerBalance = await ethers.provider.getBalance(fundMe.target)
//     console.log(`Balance of the Contract is ${providerBalance}`)

//     const fundTxOfSecendAccount = await fundMe.connect(account2).fund({ value: ethers.parseEther('0.012') })
//     await fundTxOfSecendAccount.wait()

//     const providerBalanceAfterSecendTx = await ethers.provider.getBalance(fundMe.target)
//     console.log(`Balance of the Contract is ${providerBalanceAfterSecendTx}`)

//     const fundBalanceOfAccount1 = await fundMe.addressToAmountFunded(account1.address)
//     console.log(`Balance of the Account ${account1.address} is ${fundBalanceOfAccount1}`)

//     const fundBalanceOfAccount2 = await fundMe.addressToAmountFunded(account2.address)
//     console.log(`Balance of the Account ${account2.address} is ${fundBalanceOfAccount2}`)
//   })
//   .build();
