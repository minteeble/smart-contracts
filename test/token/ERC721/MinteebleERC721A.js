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

describe("MinteebleERC721A", function () {
  let refInterface;

  let accounts = [];
  let collection;

  let deployCollection = async () => { };

  let collectionInstance;

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);

    collection = await ethers.getContractFactory("MinteebleERC721A");
    accounts = await ethers.getSigners();

    deployCollection = async () => {
      let instance = await collection.deploy(
        "TokenName",
        "TokenSymbol",
        10000,
        "1000000000000000"
      );

      await instance.setPaused(false);

      return instance;
    };

  });

  this.beforeEach(async () => {
    collectionInstance = await deployCollection();

  })

  it("Should deploy a basic MinteebleGadgetCollection token", async function () {
    collectionInstance = await deployCollection();
  });


});