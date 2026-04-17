// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


// 1. 创建一个收款函数,设置一个单次投资最小值
// 2. 记录投资人并查看
// 3. 在锁定期内，达到目标值，生产商可以提取
// 4. 在锁定期内，没有达到目标值，投资人在锁定期后，可以退款
contract FundMe {

    uint256 constant public MINIMUM_VALUE = 10 * 10 ** 18;
    mapping (address => uint256) public addressToAmountFunded;
    uint256 public deploymentTimestamp;
    uint256 public lockTime; 
    address private owner;
    uint256 constant public TARGET = 18 * 10 ** 15;
    bool public ownerFunded;
    AggregatorV3Interface internal dataFeed;

    event FundEvent(address  _funder,uint256 _amount);
    event OwnerGetFundEvent(address  _owner,uint256 _amount);
    event ReFundEvent(address  _funder,uint256 _amount);

    constructor(uint256 _lockTime ,address _dataFeedAddr) {
        dataFeed = AggregatorV3Interface(_dataFeedAddr);
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
        owner = msg.sender;
    }

    function fund() external payable checkValue checkInTime {
        addressToAmountFunded[msg.sender] += msg.value;
        emit FundEvent(msg.sender, msg.value);
    }

    function getFund() external enoughAmount onlyOwner checkOutTime {
        if(!ownerFunded) {
            addressToAmountFunded[msg.sender] = 0;
            ownerFunded=true;
            bool success;
            uint256 _balance = address(this).balance;
            (success, )  = payable(msg.sender).call{value: _balance}("");
            require(success, "transfer tx failed");
            emit OwnerGetFundEvent(owner, _balance);
        }
    }

    function reFund() external notEnoughAmount checkOutTime  {
        require(addressToAmountFunded[msg.sender] > 0, "there is no fund for you");
        uint256 _amount = addressToAmountFunded[msg.sender];
        addressToAmountFunded[msg.sender] = 0;
        bool success;
        (success,) = payable(msg.sender).call{value: _amount}("");
        require(success, "transfer tx failed");

    }

    modifier enoughAmount() {
        require(convertEthToUsd(address(this).balance) >= TARGET, "you have not reached the target");
        _;
    }

    modifier notEnoughAmount() {
        require(convertEthToUsd(address(this).balance) < TARGET, "target is reached");
        _;
    }

    modifier  onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }

    modifier checkValue() {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "send more ETH");
        _;
    }

    modifier checkInTime() {
        require(block.timestamp <  deploymentTimestamp+lockTime, "window is closed");
        _;
    }
    modifier checkOutTime() {
        require(block.timestamp >=  deploymentTimestamp+lockTime, "window is not closed");
        _;
    }


    function convertEthToUsd(uint256 _amount) public view returns (uint256) {
        return uint256(getChainlinkDataFeedLatestAnswer()) * _amount / (10**8);
    }


  /**
   * Returns the latest answer.
   */
  function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
     (
      /* uint80 roundId */
      ,
      int256 answer,
      /*uint256 startedAt*/
      ,
      /*uint256 updatedAt*/
      ,
      /*uint80 answeredInRound*/
    ) = dataFeed.latestRoundData();
    return answer;
  }
}