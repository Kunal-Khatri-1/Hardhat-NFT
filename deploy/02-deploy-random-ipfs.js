const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")
const { ethers, network } = require("hardhat")

const imagesLocation = "./images/randomNft"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainIde

    log("-------------------------------")

    // get the IPFS hashes of our images
    // 1. With our own IPFS node => centralized (can be done manually and via scripts. Manually done earlier and for scripts => https://docs.ipfs.io/)
    // 2. Hosting on our own node and some other nodes => Pinata => pay to help pin NFT for you => (trusting Pinata to pin our images and that they are not going to go down)
    //      Pinata is just an IPFS node run by somebody else and we can request to pin our data
    // 3. NFT.Storage => uses fileCoin network at backend to pin our data (filecoin => blockchain dedicated to pinning ipfs data and storing decentralized data)

    if ((process.env.UPLOAD_TO_PINATA = "true")) {
        tokenUris = await handleTokenUris()
    }

    let VRFCoordiantorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordiantorV2Address = VRFCoordinatorV2Mock.address

        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)

        subscriptionId = txReceipt.events[0].args.subId
    } else {
        VRFCoordiantorV2Address = networkConfig[chainId]
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("-------------------------------")

    await storeImages(imagesLocation)

    // const args = [
    //     VRFCoordiantorV2Address,
    //     subscriptionId,
    //     networkConfig[chainId].gasLane,
    //     networkConfig[chainId].callbackGasLimit,
    //     // tokenURIs,
    //     networkConfig[chainId].mintFee,
    // ]
}

async function handleTokenUris() {
    tokenUris = []
    // store the Image in IPFS
    // then store the metadata in IPFS
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
