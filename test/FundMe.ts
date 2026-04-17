import { expect } from "chai";
import { network } from "hardhat";
import MyMockV3AggregatorModule from '../ignition/modules/MockAggregatorV3Interface.js'
import FundMeModule from '../ignition/modules/FundMe.js'
import ENV from '../helper.hardhat.config.js'

const { ethers, networkHelpers,ignition } = await network.connect();

describe("FundMe", function () {
    async function deployCounterFixture() {
        const {mockV3} = await ignition.deploy(MyMockV3AggregatorModule)
        const {fundMe} = await ignition.deploy(FundMeModule, {
            parameters:{
                FundMe: {
                    mockV3Addr: mockV3.target.toString()
                }
            }
        })
        return { fundMe };
    }
  
    // 发送少量eth（小于最小值）
    it('window open,value less than MINIMUM_VALUE, fund failed',async() => {
        const {fundMe} = await networkHelpers.loadFixture(deployCounterFixture)
        expect(fundMe.fund({value: ethers.parseEther('0.001')})).to.be.revertedWith('send more ETH')
    })

    // 正常交易
    it("aftre calling the fund() function",async function () {
        const [account1,_] =  await ethers.getSigners()
        const {fundMe} = await networkHelpers.loadFixture(deployCounterFixture)
        const fundTx = await fundMe.fund({value: ethers.parseEther('0.012')})
        await expect(fundTx).emit(fundMe, 'FundEvent').withArgs(account1.address ,12000000000000000n)
        const account1Amount = await fundMe.addressToAmountFunded(account1.address)
        expect(account1Amount).eq(12000000000000000n)
        expect(await ethers.provider.getBalance(fundMe.target)).eq(12000000000000000n)
    })

    // 窗口关闭
    it('window closed, value more equals MINIMUM_VALUE, fundMe failed', async()=> {
        const {fundMe} = await networkHelpers.loadFixture(deployCounterFixture)
        // 模拟窗口关闭
        await networkHelpers.time.increase(ENV.LOCK_TIME)
        await networkHelpers.mine()
        expect(fundMe.fund({value: ethers.parseEther('0.01')})).to.be.revertedWith('window is closed')
    })


})