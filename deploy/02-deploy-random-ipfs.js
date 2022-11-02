const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
const { ethers, network } = require("hardhat")

const imagesLocation = "./images/randomNft"

const metaDataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "cuteness",
            value: "",
        },
    ],
}

let tokenUris = [
    "ipfs://QmfXXASpngdeknPtFBC67foGVWJZ1SqW5ab9YhUPbVCRmV",
    "ipfs://QmbCjVQCzV9ncTDffDYMQzVDcxZGGWJD7hthnLTG4Z1dih",
    "ipfs://QmXccaaMPgzYBBL6Lh9oEaFVKReTAhtLUHb2DCHVEiRQLk",
]

const FUND_AMOUNT = ethers.utils.parseUnits("10")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("-------------------------------")

    // get the IPFS hashes of our images
    // 1. With our own IPFS node => centralized (can be done manually and via scripts. Manually done earlier and for scripts => https://docs.ipfs.io/)
    // 2. Hosting on our own node and some other nodes => Pinata => pay to help pin NFT for you => (trusting Pinata to pin our images and that they are not going to go down)
    //      Pinata is just an IPFS node run by somebody else and we can request to pin our data
    // 3. NFT.Storage => uses fileCoin network at backend to pin our data (filecoin => blockchain dedicated to pinning ipfs data and storing decentralized data)

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let VRFCoordiantorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordiantorV2Address = VRFCoordinatorV2Mock.address

        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)

        subscriptionId = txReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        VRFCoordiantorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("-------------------------------")

    const args = [
        VRFCoordiantorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ]

    const randomipfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("-------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomipfsNft.address, args)
    }
}

async function handleTokenUris() {
    tokenUris = []
    // store the Image in IPFS
    // then store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        // create metadata
        // upload the metadata
        let tokenUriMetadata = { ...metaDataTemplate }

        // files = ["Skyie.png", "Duckie.png", "Quackie.png"]
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} birb`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)

        // store the JSON to Pinata / IPFS
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs Uploaded! They are: ")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
