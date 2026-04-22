import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ENV from '../../helper.hardhat.config.js'


export default buildModule("MyMockV3Aggregator", (m) => {
    const mockV3 = m.contract("MyMockV3Aggregator", [ENV.MOCK_DECIMAL,ENV.INITIAL_ANSWER]);
    return { mockV3 };
});