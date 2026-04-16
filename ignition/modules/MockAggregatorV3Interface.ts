import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


export default buildModule("MyMockV3Aggregator", (m) => {
    const mockV3 = m.contract("MyMockV3Aggregator", [8,280000000000n]);
    return { mockV3 };
});