import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ENV from '../../helper.hardhat.config.js'

export default buildModule("FundMe", (m) => {
    const mockV3Addr =  m.getParameter('mockV3Addr','0x694AA1769357215DE4FAC081bf1f309aDC325306')
    const fundMe = m.contract("FundMe", [ENV.LOCK_TIME,mockV3Addr]);
    return { fundMe };
});