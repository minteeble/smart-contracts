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

describe("MinteebleGadgetCollection", function () {
  let refInterface;

  let accounts = [];
  let erc1155;

  let deployToken = async () => { };

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);

    erc1155 = await ethers.getContractFactory("MinteebleGadgetsCollection");
    accounts = await ethers.getSigners();
    deployToken = async () => {
      let token = await erc1155.deploy(
        "TokenName",
        "TokenSymbol",
        "https://example.com/{id}.json"
      );

      await token.setPaused(false);

      return token;
    };
  });

  it("Deployment of a basic MinteebleGadgetCollection token", async function () {
    await deployToken();
  });

});
