import { network } from 'hardhat'
import ENV from '../../helper.hardhat.config.js'
import { expect } from 'chai'
import FundMeDeploy from '../../ignition/modules/FundMe.js'


const { ethers, networkConfig,ignition } = await network.connect()
ENV.localChainIds.includes(networkConfig.chainId as number)
    ? describe.skip
    : describe('FundMe staging', () => {
        let fundMe:any
        beforeEach('',async()=> {
            try{
                const address = require(`../../ignition/deployments/chain-${networkConfig.chainId}/deployed_addresses.json`)["FundMe#FundMe"]
                fundMe = await ethers.getContractAt('FundMe', address)
                const resetTx = await fundMe.reset()
                await resetTx.wait()
            }catch{
                const deploy = await ignition.deploy(FundMeDeploy, {parameters: {FundMe: {mockV3Addr: ENV.networkConfigs[networkConfig.chainId as keyof typeof ENV.networkConfigs].dataFeedAddr}}})
                fundMe =deploy.fundMe
            }
        })

        afterEach('',async()=> {
            const resetTx = await fundMe.reset()
            await resetTx.wait()
        })

        it('fund enough amount, window closed,owner getFund successfully', async () => {
            const fundTx = await fundMe.fund({ value: ethers.parseEther('0.015'),gasLimit: 150000 })
            await fundTx.wait()
            await new Promise(resolve => setTimeout(resolve, (ENV.LOCK_TIME + 1) * 1000))
            const [account1, _] = await ethers.getSigners()
            const getFuncTx = await fundMe.getFund()
            expect(await getFuncTx.wait()).to.emit(fundMe, 'OwnerGetFundEvent').withArgs(account1.address, ethers.parseEther('0.015'))
        })
        it('fund not enough amount, window closed,owner getFund successfully', async () => {
            const fundTx = await fundMe.fund({ value: ethers.parseEther('0.006'),gasLimit: 1500000 })
            await fundTx.wait()
            // await fundTx.wait()
            await new Promise(resolve => setTimeout(resolve, (ENV.LOCK_TIME + 1) * 1000))
            const [account1, _] = await ethers.getSigners()
            const getFuncTx = await fundMe.reFund()
            expect(await getFuncTx.wait()).to.emit(fundMe, 'ReFundEvent').withArgs(account1.address, ethers.parseEther('0.006'))
        })
    })