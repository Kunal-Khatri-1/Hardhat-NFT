const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying the contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.log("ERROR: ", error)
        }
    } finally {
        log("--------------------------------------")
    }
}

module.exports = { verify }
