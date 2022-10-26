const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Starting basic NFT Unit Tests", function () {
          let basicNft, deployer
          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]

              await deployments.fixture(["basicNft"])
              basicNft = await ethers.getContract("BasicNft")
          })

          describe("Testing contructor", function () {
              it("name is correctly set", async function () {
                  const name = await basicNft.name()
                  assert.equal(name, "Birdie")
              })
              it("symbol is correctly set", async function () {
                  const symbol = await basicNft.symbol()
                  assert.equal(symbol, "BRD")
              })
              it("tokenCounter is correctly set", async function () {
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "0")
              })
          })

          describe("mintNft function", function () {
              beforeEach(async function () {
                  const txResponse = await basicNft.mintNft()
                  await txResponse.wait(1)
              })

              it("shows the correct owner of the NFT", async function () {
                  const deployerAddress = deployer.address
                  const nftOwner = await basicNft.ownerOf("0")

                  assert.equal(deployerAddress, nftOwner)
              })

              it("shows the correct balance of the owner of the NFT", async function () {
                  const deployerBalance = await basicNft.balanceOf(deployer.address)
                  assert.equal(deployerBalance.toString(), "1")
              })

              it("Allows users to mint an NFT, and updates appropriately", async function () {
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()
                  const basicNftTokenURI = await basicNft.TOKEN_URI()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, basicNftTokenURI)
              })
          })
      })
