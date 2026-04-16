const localChainIds = [1,2,3]
const networkConfigs = {
    11155111: {
        dataFeedAddr: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    97: {
        dataFeedAddr: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}
const LOCK_TIME=300



export default { LOCK_TIME,localChainIds,networkConfigs }