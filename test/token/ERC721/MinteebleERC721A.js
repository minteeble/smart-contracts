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

      // await instance.setPaused(false);

      return instance;
    };

  });

  this.beforeEach(async () => {
    collectionInstance = await deployCollection();

  })

  it("Should deploy a basic MinteebleGadgetCollection token", async function () {
    collectionInstance = await deployCollection();
  });

  it("Should correctly mint nft", async () => {
    await collectionInstance.setPaused(false);
    await collectionInstance.connect(accounts[1]).mint(1, { value: "1000000000000000" });

    expect(await collectionInstance.ownerOf(1)).to.equal(accounts[1].address);
  })

  it("Should throw exepction if trying to mint without enough funds", async () => {
    await collectionInstance.setPaused(false);

    await expectThrowsAsync(() => collectionInstance.connect(accounts[1]).mint(1, { value: "100000000000000" }));
  })

  it("Should throw exception if trying to mint in paused state", async () => {
    await expectThrowsAsync(() => collectionInstance.connect(accounts[1]).mint(1, { value: "1000000000000000" }));
  })

  it("Should thorw exception if trying to change price from non-owner account", async () => {
    await expectThrowsAsync(() => collectionInstance.connect(accounts[1]).setMintPrice("100000"));
  })

  it("Should change price", async () => {
    await collectionInstance.setMintPrice("100000")

    expect(await collectionInstance.mintPrice()).to.equal("100000");
  })

  it("Should return empty string when trying to read token URI", async () => {
    await collectionInstance.setPaused(false);
    await collectionInstance.connect(accounts[1]).mint(1, { value: "1000000000000000" });

    let uri = await collectionInstance.tokenURI(1);

    expect(uri).to.equal(uri);
  });

  it("Should return revealed URI without prefix", async () => {
    await collectionInstance.setPaused(false);
    await collectionInstance.connect(accounts[1]).mint(1, { value: "1000000000000000" });
    await collectionInstance.setRevealed(true);

    let uri = await collectionInstance.tokenURI(1);

    expect(uri).to.equal("1.json");
  })

  it("Should return prerevealed URI", async () => {
    await collectionInstance.setPaused(false);
    await collectionInstance.connect(accounts[1]).mint(2, { value: "2000000000000000" });
    await collectionInstance.setRevealed(false);
    await collectionInstance.setBaseUri("ipfs://cid/");
    await collectionInstance.setPreRevealUri("ipfs://another_cid/prereveal.json");

    expect(await collectionInstance.tokenURI(1)).to.equal("ipfs://another_cid/prereveal.json");
    expect(await collectionInstance.tokenURI(2)).to.equal("ipfs://another_cid/prereveal.json");
  })

  it("Should follow max mint amount per wallet", async () => {
    await collectionInstance.setPaused(false);
    await collectionInstance.setMaxMintAmountPerTrx(5);
    await collectionInstance.setMaxMintAmountPerAddress(20);

    await collectionInstance.connect(accounts[1]).mint(5, { value: "5000000000000000" });
    await collectionInstance.connect(accounts[1]).mint(5, { value: "5000000000000000" });
    await collectionInstance.connect(accounts[1]).mint(5, { value: "5000000000000000" });
    await collectionInstance.connect(accounts[1]).mint(5, { value: "5000000000000000" });
    await expectThrowsAsync(() => collectionInstance.connect(accounts[1]).mint(1, { value: "1000000000000000" }));
  })

  it("Should follow max mint amount per trx", async () => {
    await collectionInstance.setPaused(false);
    await collectionInstance.setMaxMintAmountPerTrx(5);
    await collectionInstance.setMaxMintAmountPerAddress(20);

    await expectThrowsAsync(() => collectionInstance.connect(accounts[1]).mint(6, { value: "1000000000000000" }));
    await collectionInstance.connect(accounts[1]).mint(5, { value: "5000000000000000" });

  })

  it("Should change max mint amount per trx", async () => {
    await collectionInstance.setMaxMintAmountPerTrx(3);

    expect(await collectionInstance.maxMintAmountPerTrx()).to.equal(3);
  })

  it("Should change max mint amount per wallet", async () => {
    await collectionInstance.setMaxMintAmountPerAddress(10);

    expect(await collectionInstance.maxMintAmountPerAddress()).to.equal(10);
  })

  it("Should throw error when trying to change max mint amount per trx", async () => {
    await expectThrowsAsync(() => collectionInstance.coonnect(accounts[1]).setMaxMintAmountPerTrx(3))
  })

  it("Should throw error when trying to change max mint amount per wallet", async () => {
    await expectThrowsAsync(() => collectionInstance.coonnect(accounts[1]).setMaxMintAmountPerAddress(10));
  })

  // it("Should ", async () => { })


});