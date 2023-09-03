const { ethers } = require("hardhat");

const sleep = async (ms) => {
  console.log(`Waiting ${ms} milliseconds.`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  })
}

const verify = async (address, arguments = []) => {
  let sleepInterval = 2000;
  let verified = false;

  while (!verified) {
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: arguments || [],
      });
      verified = true;
      console.log("Successfully verified contract", address);
    } catch {
      console.log("Fail on verifying contract.");
      sleepInterval *= 2;
      await sleep(sleepInterval);
    }
  }
}

async function main() {
  const Deployer = await ethers.getContractFactory("TestTokenContract");
  const deployer = await Deployer.deploy();

  res = await deployer.deployed();

  console.log("Deployer deployed to:", deployer.address);

  await verify(deployer.address, []);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });