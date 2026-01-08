import hre from "hardhat";

async function main() {
    console.log("Deploying contract...");

    const timestamp = await hre.ethers.deployContract("DocumentTimestamp");

    await timestamp.waitForDeployment();

    const address = await timestamp.getAddress();

    console.log(`DocumentTimestamp deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
