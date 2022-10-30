const { assert, expect } = require("chai")
const {
    developmentChains,
} = require("../../hardHatNew/hardhat-smartcontract-lottery-fcc/helper-hardhat-config")
const {
    network,
    getNamedAccounts,
    deployments: { deploy, log, fixture },
    ethers,
} = require("hardhat")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft unit tests", function () {
          console.log("-----------------------")
          console.log("Local Network Detected!")
          console.log("Starting Unit Testing")

          // Initializing Variables
          let deployer, randomIpfsNft, vrfCoordinatorV2Mock, mintFee

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer

              await fixture(["all"])

              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)

              mintFee = await randomIpfsNft.getMintFee()
          })

          describe("constructor", function () {
              it("starting values are set correctly", async function () {
                  for (let i = 0; i < 3; i++) {
                      const uri = await randomIpfsNft.getBirdTokenUris(i)
                      assert(uri.startsWith("ipfs://", 0))
                  }
              })
          })

          describe("requestNft", function () {
              it("should revert with RandomIpfsNft__NeedMoreEth()", async function () {
                  // WRONG WAY =>
                  // THIS WILL THROW ERROR IN TERMINAL
                  //   const requestNftTx = await randomIpfsNft.requestNft()
                  //   expect(requestNftTx).to.be.revertedWith("RandomIpfsNft__NeedMoreEth()")

                  // CORRECT WAY=> (BEWARE DON'T USE AWAIT HERE!)
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreEth()"
                  )
              })

              // SEE NOT USING await and tx.wait(1) with the function call
              it("should emit event NftRequested", async function () {
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          describe("fulfillRandomWords", function () {
              it()
          })
      })
