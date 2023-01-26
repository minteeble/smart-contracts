const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const refContractInfo = require("../../../artifacts/contracts/token/misc/ReferralSystem.sol/ReferralSystem.json");

const expectThrowsAsync = async (method, errorMessage) => {
  let error = null;
  let noErrors = false;
  try {
    await method();
    noErrors = true;
  } catch (err) {
    error = err;
  }
  expect(noErrors).to.equal(false);
  expect(error).to.be.an("Error");
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
};

describe("MinteebleERC1155", function () {
  let refInterface;

  let account;
  let erc1155;

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);

    erc1155 = await ethers.getContractFactory("MinteebleERC1155");
    accounts = await ethers.getSigners();
  });

  it("Deployment of a basic ERC1155 token", async function () {
    const deployedERC1155 = await erc1155.deploy(
      "https://example.com/{id}.json"
    );

    console.log("Deployed address:", deployedERC1155.address);
  });
});
