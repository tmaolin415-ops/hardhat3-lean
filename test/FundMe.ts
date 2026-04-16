import { expect } from "chai";
import { network } from "hardhat";
import MyMockV3AggregatorModule from '../ignition/modules/MockAggregatorV3Interface.js'
import FundMeModule from '../ignition/modules/FundMe.js'

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
    it("aftre calling the fund() function",async function () {
        const [account1,_] =  await ethers.getSigners()
        const {fundMe} = await networkHelpers.loadFixture(deployCounterFixture)
        const fundTx = await fundMe.fund({value: ethers.parseEther('0.012')})
        await fundTx.wait()
        const account1Amount = await fundMe.addressToAmountFunded(account1.address)
        expect(account1Amount).eq(12000000000000000n)
        expect(await ethers.provider.getBalance(fundMe.target)).eq(12000000000000000n)
    })




})