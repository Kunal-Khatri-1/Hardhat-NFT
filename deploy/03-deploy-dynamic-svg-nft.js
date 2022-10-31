const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("Started deploying dynamicSvgNft")

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("getting the images")
    const lowSvg = await fs.readFileSync("./images/dynamicSvgNft/low.svg", { encoding: "utf-8" })
    const mediumSvg = await fs.readFileSync("./images/dynamicSvgNft/medium.svg", {
        encoding: "utf-8",
    })
    const highSvg = await fs.readFileSync("./images/dynamicSvgNft/high.svg", { encoding: "utf-8" })
    log("images got successfully")

    args = [ethUsdPriceFeedAddress, lowSvg, mediumSvg, highSvg]

    log("deploying DynamicSvgNft")
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }

    log("--------------------------------------")
}

module.exports.tags = ["all", "dynamicsvg", "main"]
