const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    // BASIC NFT
    const basicNft = await ethers.getContract("BasicNft", deployer)
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has token URI: ${await basicNft.tokenURI(0)}`)

    // DYNAMIC SVG NFT
    const highValue = ethers.utils.parseEther("30000")
    const lowValue = ethers.utils.parseEther("1")

    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue, lowValue)
    await dynamicSvgNftMintTx.wait(1)

    console.log(`Dynamic SVG NFT index 1 tokenURI: ${await dynamicSvgNft.tokenURI(1)}`)

    // RANDOM IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    console.log(`randomIpfsNft: ${randomIpfsNft.address}`)

    const mintFee = await randomIpfsNft.getMintFee()
    console.log(`mintFee: ${mintFee}`)

    await new Promise(async (resolve, reject) => {
        setTimeout(reject, 30000) // 5 mins

        randomIpfsNft.once("NftMinted", async function () {
            resolve()
            console.log("NftMinted event emitted")
        })

        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
        console.log(`Nft requested...`)
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
        console.log("requestNft transaction receipt received...")

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
        }
    })

    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`)
}

module.exports.tags = ["all", "mint"]
