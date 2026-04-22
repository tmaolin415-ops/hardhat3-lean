import { expect } from "chai";
import { network } from "hardhat";
import ENV from '../../helper.hardhat.config.js'

const { ethers, networkHelpers, networkConfig } = await network.connect();
!ENV.localChainIds.includes(networkConfig.chainId as number)
    ? describe.skip
    : describe("FundMe", function () {
        async function deployCounterFixture() {
            const mockV3 = await ethers.deployContract('MyMockV3Aggregator', [ENV.MOCK_DECIMAL, ENV.INITIAL_ANSWER]);
            const fundMe = await ethers.deployContract('FundMe', [ENV.LOCK_TIME, mockV3.target.toString()]);
            return { fundMe };
        }

        // 发送少量eth（小于最小值）
        it('window open,value less than MINIMUM_VALUE, fund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            // await new Promise(resolve => setTimeout(resolve, 181*1000))
            expect(fundMe.fund({ value: ethers.parseEther('0.001') })).to.be.revertedWith('send more ETH')
        })

        // 正常交易
        it("aftre calling the fund() function", async function () {
            const [account1, _] = await ethers.getSigners()
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            const fundTx = await fundMe.fund({ value: ethers.parseEther('0.012') })
            await expect(fundTx).to.emit(fundMe, 'FundEvent').withArgs(account1.address, ethers.parseEther('0.012'))
            const account1Amount = await fundMe.addressToAmountFunded(account1.address)
            expect(account1Amount).eq(ethers.parseEther('0.012'))
            expect(await ethers.provider.getBalance(fundMe.target)).eq(ethers.parseEther('0.012'))
        })

        // 窗口关闭
        it('window closed, value more equals MINIMUM_VALUE, fundMe failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            // 模拟窗口关闭
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            expect(fundMe.fund({ value: ethers.parseEther('0.01') })).to.be.revertedWith('window is closed')
        })

        //getFund
        // 窗口关闭,余额充足，不是拥有者，请求失败
        it('window closed, fund enough amount,not owner, getFund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.012') })
            // 模拟窗口关闭
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            const [_, account2] = await ethers.getSigners()
            await expect(fundMe.connect(account2).getFund()).to.be.revertedWith('this function can only be called by owner')
        })

        // 窗口关闭,余额不足，请求失败
        it('window closed, fund not enough amount, getFund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.004') })
            // 模拟窗口关闭
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            await expect(fundMe.getFund()).to.be.revertedWith('you have not reached the target')
        })

        // 窗口未关闭,余额充足，请求失败
        it('window not closed, fund enough amount, getFund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.007') })
            await expect(fundMe.getFund()).to.be.revertedWith('window is not closed')
        })


        // 窗口关闭,余额充足，请求成功
        it('window closed, fund enough amount, getFund success', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            const [account1, _] = await ethers.getSigners()
            await fundMe.fund({ value: ethers.parseEther('0.007') })
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            await expect(fundMe.getFund()).to.emit(fundMe, 'OwnerGetFundEvent').withArgs(account1.address, ethers.parseEther('0.007'))
        })


        //reFund
        it('window not closed, target not enough,reFund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.004') })
            await expect(fundMe.reFund()).revertedWith('window is not closed')
        })


        it('window  closed, target  enough,reFund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.008') })
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            await expect(fundMe.reFund()).to.revertedWith('target is reached')
        })


        it('window closed, target not enough, not funded account reFund failed', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.004') })
            const [_, account2] = await ethers.getSigners()
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            await expect(fundMe.connect(account2).reFund()).to.be.revertedWith('there is no fund for you')
        })


        it('window closed, target not enough, reFund success', async () => {
            const { fundMe } = await networkHelpers.loadFixture(deployCounterFixture)
            await fundMe.fund({ value: ethers.parseEther('0.004') })
            await networkHelpers.time.increase(ENV.LOCK_TIME)
            await networkHelpers.mine()
            const [account1, _] = await ethers.getSigners()
            await expect(fundMe.reFund()).to.emit(fundMe, 'ReFundEvent').withArgs(account1.address, ethers.parseEther('0.004'))
        })


    })