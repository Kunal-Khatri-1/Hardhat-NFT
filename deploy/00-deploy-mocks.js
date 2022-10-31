const { network, ethers } = require("hardhat")

const BASE_FEE = "500000000000000000"
const GAS_PRICE_LINK = 2e9

const DECIMALS = "18"
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("----------------------------------------------------")
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        log("Mocks Deployed!")
        log("----------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
