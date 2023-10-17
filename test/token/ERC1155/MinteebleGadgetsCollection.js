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

  let tokenInstance;

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

  this.beforeEach(async () => {
    token = await deployToken();
  })

  it("Should deploy a basic MinteebleGadgetCollection token", async function () {
    await deployToken();
  });

  it("Should create two empty gadget groups", async () => {
    await token.addGadgetGroup();
    await token.addGadgetGroup();

    expect(await token.getGadgetGroups()).to.equal(2);
  });

  it("Should create two empty gadget groups and remove one", async () => {
    await token.addGadgetGroup();
    await token.addGadgetGroup();

    await token.removeGadgetGroup();

    expect(await token.getGadgetGroups()).to.equal(1);
  });

  it("Should create two empty gadget groups and remove both", async () => {
    await token.addGadgetGroup();
    await token.addGadgetGroup();

    await token.removeGadgetGroup();
    await token.removeGadgetGroup();

    expect(await token.getGadgetGroups()).to.equal(0);
  });

  it("Should add variations one by one", async () => {
    await token.addGadgetGroup();

    await token.addVariation(0);

    expect(await token.getGadgetGroups()).to.equal(1);
    expect(await token.getGadgetGroupVariations(0)).to.equal(1);
  })

  it("Should add variations in bulk", async () => {
    await token.addGadgetGroup();

    await token.addVariations(0, 10);

    expect(await token.getGadgetGroups()).to.equal(1);
    expect(await token.getGadgetGroupVariations(0)).to.equal(10);
  });

  it("Should add variations in bulk to multiple groups", async () => {
    await token.addGadgetGroup();
    await token.addGadgetGroup();
    await token.addGadgetGroup();

    await token.addVariations(0, 10);
    await token.addVariations(1, 10);
    await token.addVariations(2, 10);

    expect(await token.getGadgetGroups()).to.equal(3);
    expect(await token.getGadgetGroupVariations(0)).to.equal(10);
    expect(await token.getGadgetGroupVariations(1)).to.equal(10);
    expect(await token.getGadgetGroupVariations(2)).to.equal(10);
  });

  it("Should remove variations one by one", async () => {
    await token.addGadgetGroup();
    await token.addVariations(0, 10);

    await token.removeVariation(0);

    expect(await token.getGadgetGroups()).to.equal(1);
    expect(await token.getGadgetGroupVariations(0)).to.equal(9);
  });

  it("Should remove all variations from a group", async () => {
    await token.addGadgetGroup();
    await token.addVariations(0, 10);

    // Remove all variations one by one
    for (let i = 0; i < 10; i++) {
      await token.removeVariation(0);
    }

    expect(await token.getGadgetGroups()).to.equal(1);
    expect(await token.getGadgetGroupVariations(0)).to.equal(0);

  });

  it("Should throw exception if trying to add variations with no gadgets groups available", async () => {
    await expectThrowsAsync(() => token.addVariation(0));
  })

  it("Should throw exception if trying to add variations to a non-existent group", async () => {
    await token.addGadgetGroup();
    await token.addGadgetGroup();
    await token.addGadgetGroup();

    await expectThrowsAsync(() => token.addVariation(3));
    await expectThrowsAsync(() => token.addVariation(4));

  });

});
