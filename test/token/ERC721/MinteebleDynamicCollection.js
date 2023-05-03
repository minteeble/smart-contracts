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

describe("MinteebleDynamicCollection", function () {
  let refInterface;

  let accounts = [];
  let dynamicCollection;
  let gadgetsCollection;

  let deployDynamicCollection = async () => { };
  let deployGadgetsCollection = async () => { };

  let dynamicCollectionInstance;
  let gadgetsCollectionInstance;

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);

    dynamicCollection = await ethers.getContractFactory("MinteebleDynamicCollection");
    gadgetsCollection = await ethers.getContractFactory("MinteebleGadgetsCollection");
    accounts = await ethers.getSigners();

    deployDynamicCollection = async (gadgetInstance) => {
      let instance = await dynamicCollection.deploy(
        "TokenName",
        "TokenSymbol",
        10000,
        "1000000000000000"
      );

      await instance.setPaused(false);

      return instance;
    };

    deployGadgetsCollection = async () => {
      let instance = await gadgetsCollection.deploy(
        "TokenName",
        "TokenSymbol",
        "https://example.com/{id}.json"
      );

      await instance.setPaused(false);

      return instance;
    }
  });



  this.beforeEach(async () => {
    gadgetsCollectionInstance = await deployGadgetsCollection();
    dynamicCollectionInstance = await deployDynamicCollection();

    await dynamicCollectionInstance.setGadgetCollection(gadgetsCollectionInstance.address);

  })

  it("Should deploy a basic MinteebleGadgetCollection token", async function () {
    gadgetsCollectionInstance = await deployGadgetsCollection();
    dynamicCollectionInstance = await deployDynamicCollection();
  });

  it("Should correctly set gadgetCollection address", async () => {
    gadgetsCollectionInstance = await deployGadgetsCollection();
    dynamicCollectionInstance = await deployDynamicCollection();

    await dynamicCollectionInstance.setGadgetCollection(gadgetsCollectionInstance.address);

    expect(await dynamicCollectionInstance.gadgetCollection()).to.equal(gadgetsCollectionInstance.address);
  })

  it("Should pair single gadget with single variation", async () => {
    await gadgetsCollectionInstance.addGadgetGroup();
    await gadgetsCollectionInstance.addVariation(0);

    await gadgetsCollectionInstance.mint(0, 1, { value: 0 });
    await dynamicCollectionInstance.mint(1, { value: "1000000000000000" });

    await gadgetsCollectionInstance.setApprovalForAll(dynamicCollectionInstance.address, true)
    await dynamicCollectionInstance.pairGadget(1, 0, 0);

    expect(await gadgetsCollectionInstance.balanceOf(dynamicCollectionInstance.address, 0)).to.equal(1);
    expect(await dynamicCollectionInstance.ownerOf(1)).to.equal(accounts[0].address)
    let itemInfo = await dynamicCollectionInstance.getItemInfo(1);
    expect(itemInfo.gadgets.length).to.equal(1);
    expect(itemInfo.gadgets[0]).to.equal(0);
  });

  it("Should throw exception if trying to pair the single gadget and variation", async () => {
    await gadgetsCollectionInstance.addGadgetGroup();
    await gadgetsCollectionInstance.addVariation(0);

    await gadgetsCollectionInstance.mint(0, 2, { value: 0 });
    await dynamicCollectionInstance.mint(1, { value: "1000000000000000" });

    await gadgetsCollectionInstance.setApprovalForAll(dynamicCollectionInstance.address, true)
    await dynamicCollectionInstance.pairGadget(1, 0, 0);
    await expectThrowsAsync(() => dynamicCollectionInstance.pairGadget(1, 0, 0));
  });

  it("Should switch gadget to pair different variations of the same gadget", async () => {
    await gadgetsCollectionInstance.addGadgetGroup();
    await gadgetsCollectionInstance.addVariation(0);
    await gadgetsCollectionInstance.addVariation(0);

    await gadgetsCollectionInstance.mint(0, 1, { value: 0 });
    await gadgetsCollectionInstance.mint(1, 1, { value: 0 });
    await dynamicCollectionInstance.mint(1, { value: "1000000000000000" });

    await gadgetsCollectionInstance.setApprovalForAll(dynamicCollectionInstance.address, true)
    await dynamicCollectionInstance.pairGadget(1, 0, 0);

    expect(await gadgetsCollectionInstance.balanceOf(dynamicCollectionInstance.address, 0)).to.equal(1);
    expect(await gadgetsCollectionInstance.balanceOf(dynamicCollectionInstance.address, 1)).to.equal(0);

    await dynamicCollectionInstance.pairGadget(1, 0, 1);

    expect(await gadgetsCollectionInstance.balanceOf(dynamicCollectionInstance.address, 0)).to.equal(0);
    expect(await gadgetsCollectionInstance.balanceOf(dynamicCollectionInstance.address, 1)).to.equal(1);
  })

});
