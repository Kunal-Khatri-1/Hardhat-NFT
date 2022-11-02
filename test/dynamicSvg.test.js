const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const fs = require("fs")

const lowSVGImageuri =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iLTEwMCAtMTAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgICAgICAgPGRlZnM+DQogICAgICAgICAgICA8bGluZWFyR3JhZGllbnQNCiAgICAgICAgICAgICAgaWQ9ImxpbmVhcl9ncmFkaWVudCINCiAgICAgICAgICAgICAgeDE9IjAlIg0KICAgICAgICAgICAgICB5MT0iMCUiDQogICAgICAgICAgICAgIHgyPSIxMDAlIg0KICAgICAgICAgICAgICB5Mj0iMCUiDQogICAgICAgICAgICA+DQogICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9InJlZCI+PC9zdG9wPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0ib3JhbmdlIj48L3N0b3A+DQogICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iZ3JlZW4iPjwvc3RvcD4NCiAgICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoNCiAgICAgICAgICAgIDxyYWRpYWxHcmFkaWVudA0KICAgICAgICAgICAgICBpZD0icmFkaWFsX2dyYWRpZW50Ig0KICAgICAgICAgICAgICB4MT0iMCUiDQogICAgICAgICAgICAgIHkxPSIwJSINCiAgICAgICAgICAgICAgeDI9IjEwMCUiDQogICAgICAgICAgICAgIHkyPSIwJSINCiAgICAgICAgICAgID4NCiAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0id2hpdGUiPjwvc3RvcD4NCiAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzRjNGM0Ij48L3N0b3A+DQogICAgICAgICAgICA8L3JhZGlhbEdyYWRpZW50Pg0KICAgICAgICAgIDwvZGVmcz4NCg0KICAgICAgICAgIDxyZWN0DQogICAgICAgICAgICB4PSItMTAwIg0KICAgICAgICAgICAgeT0iLTEwMCINCiAgICAgICAgICAgIHdpZHRoPSIyMDAiDQogICAgICAgICAgICBoZWlnaHQ9IjIwMCINCiAgICAgICAgICAgIGZpbGw9InVybCgjcmFkaWFsX2dyYWRpZW50KSINCiAgICAgICAgICA+PC9yZWN0Pg0KDQogICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAzMCkiPg0KICAgICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgICAgZD0iDQogICAgICAgICAgTSAtNzUgMA0KICAgICAgICAgIEEgNzUgNzUgMCAxIDEgNzUgMA0KICAgICAgICAgICINCiAgICAgICAgICAgICAgZmlsbD0ibm9uZSINCiAgICAgICAgICAgICAgc3Ryb2tlPSJ1cmwoI2xpbmVhcl9ncmFkaWVudCkiDQogICAgICAgICAgICAgIHN0cm9rZS13aWR0aD0iMTAiDQogICAgICAgICAgICA+PC9wYXRoPg0KDQogICAgICAgICAgICA8cGF0aA0KICAgICAgICAgICAgICBkPSINCiAgICAgICAgICAgIE0gLTcwIC0yLjUNCiAgICAgICAgICAgIEwgMCAtNy41DQogICAgICAgICAgICBRIDMgLTIuNSAwIDIuNQ0KICAgICAgICAgICAgTCAtNzAgLTIuNSAgDQogICAgICAgICAgIg0KICAgICAgICAgICAgICB0cmFuc2Zvcm09InJvdGF0ZSgzMCkiDQogICAgICAgICAgICA+PC9wYXRoPg0KICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9zdmc+"
const mediumSVGImageuri =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iLTEwMCAtMTAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgICAgICAgPGRlZnM+DQogICAgICAgICAgICA8bGluZWFyR3JhZGllbnQNCiAgICAgICAgICAgICAgaWQ9ImxpbmVhcl9ncmFkaWVudCINCiAgICAgICAgICAgICAgeDE9IjAlIg0KICAgICAgICAgICAgICB5MT0iMCUiDQogICAgICAgICAgICAgIHgyPSIxMDAlIg0KICAgICAgICAgICAgICB5Mj0iMCUiDQogICAgICAgICAgICA+DQogICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9InJlZCI+PC9zdG9wPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0ib3JhbmdlIj48L3N0b3A+DQogICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iZ3JlZW4iPjwvc3RvcD4NCiAgICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoNCiAgICAgICAgICAgIDxyYWRpYWxHcmFkaWVudA0KICAgICAgICAgICAgICBpZD0icmFkaWFsX2dyYWRpZW50XzIiDQogICAgICAgICAgICAgIHgxPSIwJSINCiAgICAgICAgICAgICAgeTE9IjAlIg0KICAgICAgICAgICAgICB4Mj0iMTAwJSINCiAgICAgICAgICAgICAgeTI9IjAlIg0KICAgICAgICAgICAgPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSI+PC9zdG9wPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4ZmZmZmUiPjwvc3RvcD4NCiAgICAgICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+DQogICAgICAgICAgPC9kZWZzPg0KDQogICAgICAgICAgPHJlY3QNCiAgICAgICAgICAgIHg9Ii0xMDAiDQogICAgICAgICAgICB5PSItMTAwIg0KICAgICAgICAgICAgd2lkdGg9IjIwMCINCiAgICAgICAgICAgIGhlaWdodD0iMjAwIg0KICAgICAgICAgICAgZmlsbD0idXJsKCNyYWRpYWxfZ3JhZGllbnRfMikiDQogICAgICAgICAgPjwvcmVjdD4NCg0KICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzApIj4NCiAgICAgICAgICAgIDxwYXRoDQogICAgICAgICAgICAgIGQ9Ig0KICAgICAgICAgICAgICBNIC03NSAwDQogICAgICAgICAgICAgIEEgNzUgNzUgMCAxIDEgNzUgMA0KICAgICAgICAgICAgICAiDQogICAgICAgICAgICAgIGZpbGw9Im5vbmUiDQogICAgICAgICAgICAgIHN0cm9rZT0idXJsKCNsaW5lYXJfZ3JhZGllbnQpIg0KICAgICAgICAgICAgICBzdHJva2Utd2lkdGg9IjEwIg0KICAgICAgICAgICAgPjwvcGF0aD4NCg0KICAgICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgICAgZD0iDQogICAgICAgICAgICAgICAgTSAtNzAgLTIuNQ0KICAgICAgICAgICAgICAgIEwgMCAtNy41DQogICAgICAgICAgICAgICAgUSAzIC0yLjUgMCAyLjUNCiAgICAgICAgICAgICAgICBMIC03MCAtMi41ICANCiAgICAgICAgICAgICAgIg0KICAgICAgICAgICAgICB0cmFuc2Zvcm09InJvdGF0ZSg5MCkgdHJhbnNsYXRlKDAgMi41KSINCiAgICAgICAgICAgID48L3BhdGg+DQogICAgICAgICAgPC9nPg0KICAgICAgICA8L3N2Zz4="
const highSVGimageUri =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iLTEwMCAtMTAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogICAgICAgICAgPGRlZnM+DQogICAgICAgICAgICA8bGluZWFyR3JhZGllbnQNCiAgICAgICAgICAgICAgaWQ9ImxpbmVhcl9ncmFkaWVudCINCiAgICAgICAgICAgICAgeDE9IjAlIg0KICAgICAgICAgICAgICB5MT0iMCUiDQogICAgICAgICAgICAgIHgyPSIxMDAlIg0KICAgICAgICAgICAgICB5Mj0iMCUiDQogICAgICAgICAgICA+DQogICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9InJlZCI+PC9zdG9wPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0ib3JhbmdlIj48L3N0b3A+DQogICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iZ3JlZW4iPjwvc3RvcD4NCiAgICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+DQoNCiAgICAgICAgICAgIDxyYWRpYWxHcmFkaWVudA0KICAgICAgICAgICAgICBpZD0icmFkaWFsX2dyYWRpZW50XzMiDQogICAgICAgICAgICAgIHgxPSIwJSINCiAgICAgICAgICAgICAgeTE9IjAlIg0KICAgICAgICAgICAgICB4Mj0iMTAwJSINCiAgICAgICAgICAgICAgeTI9IjAlIg0KICAgICAgICAgICAgPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSI+PC9zdG9wPg0KICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4ZmZmOWUiPjwvc3RvcD4NCiAgICAgICAgICAgIDwvcmFkaWFsR3JhZGllbnQ+DQogICAgICAgICAgPC9kZWZzPg0KDQogICAgICAgICAgPHJlY3QNCiAgICAgICAgICAgIHg9Ii0xMDAiDQogICAgICAgICAgICB5PSItMTAwIg0KICAgICAgICAgICAgd2lkdGg9IjIwMCINCiAgICAgICAgICAgIGhlaWdodD0iMjAwIg0KICAgICAgICAgICAgZmlsbD0idXJsKCNyYWRpYWxfZ3JhZGllbnRfMykiDQogICAgICAgICAgPjwvcmVjdD4NCg0KICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMzApIj4NCiAgICAgICAgICAgIDxwYXRoDQogICAgICAgICAgICAgIGQ9Ig0KICAgICAgICAgICAgICBNIC03NSAwDQogICAgICAgICAgICAgIEEgNzUgNzUgMCAxIDEgNzUgMA0KICAgICAgICAgICAgICAiDQogICAgICAgICAgICAgIGZpbGw9Im5vbmUiDQogICAgICAgICAgICAgIHN0cm9rZT0idXJsKCNsaW5lYXJfZ3JhZGllbnQpIg0KICAgICAgICAgICAgICBzdHJva2Utd2lkdGg9IjEwIg0KICAgICAgICAgICAgPjwvcGF0aD4NCg0KICAgICAgICAgICAgPHBhdGgNCiAgICAgICAgICAgICAgZD0iDQogICAgICAgICAgICAgICAgTSAtNzAgLTIuNQ0KICAgICAgICAgICAgICAgIEwgMCAtNy41DQogICAgICAgICAgICAgICAgUSAzIC0yLjUgMCAyLjUNCiAgICAgICAgICAgICAgICBMIC03MCAtMi41ICANCiAgICAgICAgICAgICAgIg0KICAgICAgICAgICAgICB0cmFuc2Zvcm09InJvdGF0ZSgxNTApIHRyYW5zbGF0ZSgwIDUpIg0KICAgICAgICAgICAgPjwvcGF0aD4NCiAgICAgICAgICA8L2c+DQogICAgICAgIDwvc3ZnPg=="

const lowTokenUri = fs.readFileSync("./tokenURI/DynamicSvgNft/lowSVGJSONURI.txt", {
    encoding: "utf-8",
})
const mediumokenUri = fs.readFileSync("./tokenURI/DynamicSvgNft/mediumSVGJSONURI.txt", {
    encoding: "utf-8",
})
const highTokenUri = fs.readFileSync("./tokenURI/DynamicSvgNft/highSVGJSONURI.txt", {
    encoding: "utf-8",
})

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT Unit Tests", function () {
          let dynamicSvgNft, deployer, mockV3Aggregator, price

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "dynamicsvg"])
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft")
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")

              const [, priceVal, , ,] = await mockV3Aggregator.latestRoundData()
              price = priceVal

              // price = 2000_000000000000000000
              //   console.log(`price: ${price}`)
          })

          describe("DynamicSvgNft constructor", () => {
              it("sets starting values correctly", async function () {
                  const lowSVG = await dynamicSvgNft.getLowSVG()
                  const mediumSVG = await dynamicSvgNft.getMediumSVG()
                  const highSVG = await dynamicSvgNft.getHighSVG()
                  const priceFeed = await dynamicSvgNft.getPriceFeed()

                  assert.equal(lowSVG, lowSVGImageuri)
                  assert.equal(mediumSVG, mediumSVGImageuri)
                  assert.equal(highSVG, highSVGimageUri)

                  assert.equal(priceFeed, mockV3Aggregator.address)
              })
          })

          describe("mint DynamicSvgNft", () => {
              it("emits an event and creates the NFT", async function () {
                  // 1 dollar per ether
                  const highValue = ethers.utils.parseEther("2")
                  const lowValue = ethers.utils.parseEther("1")

                  await expect(dynamicSvgNft.mintNft(highValue, lowValue)).to.emit(
                      dynamicSvgNft,
                      "DynamicSvgNftMinted"
                  )
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")

                  const tokenURI = await dynamicSvgNft.tokenURI(1)
                  assert.equal(tokenURI, highTokenUri)
              })

              it("low price DynamicSvgNft", async function () {
                  const highValue = ethers.utils.parseEther("3000")
                  const lowValue = ethers.utils.parseEther("2500")

                  console.log(
                      `lowValue: ${lowValue}    highValue: ${highValue}     price: ${price}`
                  )

                  const txResponse = await dynamicSvgNft.mintNft(highValue, lowValue)
                  await txResponse.wait(1)

                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")

                  const tokenURI = await dynamicSvgNft.tokenURI(1)
                  assert.equal(tokenURI, lowTokenUri)
              })

              it("medium price DynamicSvgNft", async function () {
                  const highValue = ethers.utils.parseEther("3000")
                  const lowValue = ethers.utils.parseEther("1")

                  console.log(
                      `lowValue: ${lowValue}    highValue: ${highValue}     price: ${price}`
                  )

                  const txResponse = await dynamicSvgNft.mintNft(highValue, lowValue)
                  await txResponse.wait(1)

                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")

                  const tokenURI = await dynamicSvgNft.tokenURI(1)
                  assert.equal(tokenURI, mediumokenUri)
              })

              it("medium price DynamicSvgNft", async function () {
                  const highValue = ethers.utils.parseEther("3000")
                  const lowValue = ethers.utils.parseEther("1")

                  console.log(
                      `lowValue: ${lowValue}    highValue: ${highValue}     price: ${price}`
                  )

                  const txResponse = await dynamicSvgNft.mintNft(highValue, lowValue)
                  await txResponse.wait(1)

                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")

                  const tokenURI = await dynamicSvgNft.tokenURI(1)
                  assert.equal(tokenURI, mediumokenUri)
              })
          })
      })
