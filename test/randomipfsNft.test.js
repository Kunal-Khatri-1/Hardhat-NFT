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
              it("should revert when no ETH sent with RandomIpfsNft__NeedMoreEth()", async function () {
                  // WRONG WAY =>
                  // THIS WILL THROW ERROR IN TERMINAL
                  //   const requestNftTx = await randomIpfsNft.requestNft()
                  //   expect(requestNftTx).to.be.revertedWith("RandomIpfsNft__NeedMoreEth()")

                  // CORRECT WAY=> (BEWARE DON'T USE AWAIT HERE!)
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreEth()"
                  )
              })

              it("should revert when less ETH is sent than mintFee with RandomIpfsNft__NeedMoreEth()", async function () {
                  await expect(
                      randomIpfsNft.requestNft({
                          value: mintFee.sub(ethers.utils.parseEther("0.0001")).toString(),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NeedMoreEth()")
              })

              // SEE NOT USING await and tx.wait(1) with the function call
              it("should emit event NftRequested", async function () {
                  await expect(randomIpfsNft.requestNft({ value: mintFee.toString() })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          describe("fulfillRandomWords", function () {
              it("mints the NFT after a random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async function () {
                          try {
                              const tokenUri = await randomIpfsNft.getBirdTokenUris("0")
                              const tokenCounter = await randomIpfsNft.getTokenCounter()

                              assert.equal(tokenUri.toString().startsWith("ipfs://", 0), true)
                              assert.equal(tokenCounter.toString(), 1)

                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })

                      try {
                          const requestNftResponse = await randomIpfsNft.requestNft({
                              value: mintFee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (error) {
                          console.log(error)
                          reject(error)
                      }
                  })
              })
          })
      })
