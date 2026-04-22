import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ENV from '../../helper.hardhat.config.js'
import { network } from 'hardhat'
import MyMockV3AggregatorModule from './MockAggregatorV3Interface.js'

const { networkConfig, ignition } = await network.connect()

let mockV3Addr
if (!networkConfig.chainId || ENV.localChainIds.includes(networkConfig.chainId)) {
    const { mockV3 } = await ignition.deploy(MyMockV3AggregatorModule)
    mockV3Addr = mockV3.target.toString()
} else {
    const chainId = networkConfig.chainId as keyof typeof ENV.networkConfigs
    mockV3Addr = ENV.networkConfigs[chainId].dataFeedAddr
}

export default buildModule("FundMe", (m) => {
    const fundMe = m.contract("FundMe", [ENV.LOCK_TIME, mockV3Addr]);
    return { fundMe };
});