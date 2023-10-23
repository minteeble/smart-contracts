const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");



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

const getWhitelistRoot = (addresses) => {
  let nodes = addresses.map((addr) =>
    keccak256(addr)
  );
  const tree = new MerkleTree(nodes, keccak256, { sortPairs: true });
  const root = "0x" + tree.getRoot().toString("hex");

  return {
    nodes, tree, root
  }
}

const evalMerkleProof = (tree, address) => {
  let proof = tree.getHexProof(keccak256(address));

  return proof;
}

describe("MinteebleERC721A_SimpleMultiWhitelist", function () {
  let refInterface;

  let accounts = [];
  let collection;

  let deployCollection = async () => { };

  let collectionInstance;

  before(async () => {

    collection = await ethers.getContractFactory("MinteebleERC721A_SimpleMultiWhitelist");
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

  it("Should deploy a basic MinteebleERC721A_SimpleMultiWhitelist token", async function () {
    collectionInstance = await deployCollection();
  });

  it("Should throw exception when trying to add whitelists with same id", async () => {
    let w0_nodes = [accounts[1].address, accounts[2].address].map((addr) =>
      keccak256(addr)
    );
    const w0_tree = new MerkleTree(w0_nodes, keccak256, { sortPairs: true });
    const w0_root = "0x" + w0_tree.getRoot().toString("hex");

    await collectionInstance.createWhitelistGroup(0, w0_root, 1000000000000000);

    let w1_nodes = [accounts[2].address, accounts[3].address, accounts[4].address].map((addr) =>
      keccak256(addr)
    );
    const w1_tree = new MerkleTree(w1_nodes, keccak256, { sortPairs: true });
    const w1_root = "0x" + w1_tree.getRoot().toString("hex");

    await expectThrowsAsync(() => collectionInstance.createWhitelistGroup(0, w1_root, 1000000000000000));
  });

  it("Should add whitelists", async () => {
    let w0_nodes = [accounts[1].address, accounts[2].address].map((addr) =>
      keccak256(addr)
    );
    const w0_tree = new MerkleTree(w0_nodes, keccak256, { sortPairs: true });
    const w0_root = "0x" + w0_tree.getRoot().toString("hex");

    await collectionInstance.createWhitelistGroup(0, w0_root, 1000000000000000);

    let w1_nodes = [accounts[2].address, accounts[3].address, accounts[4].address].map((addr) =>
      keccak256(addr)
    );
    const w1_tree = new MerkleTree(w1_nodes, keccak256, { sortPairs: true });
    const w1_root = "0x" + w1_tree.getRoot().toString("hex");

    await collectionInstance.createWhitelistGroup(1, w1_root, 1000000000000000);
  });

  it("Should throw expection when trying to change price for a non existent whitelist", async () => {
    await expectThrowsAsync(() => collectionInstance.setWhitelistPrice(0, "2000000000000000"))
    // expect(await collectionInstance.getWhitelistPrice(0)).to.equal("1000000000000000");
  });

  it("Should change price", async () => {
    let wl = getWhitelistRoot([accounts[1].address, accounts[2].address]);
    await collectionInstance.createWhitelistGroup(0, wl.root, 1000000000000000);

    // console.log(wl.root);
    await collectionInstance.setWhitelistPrice(0, 2000000000000000);
    expect(await collectionInstance.getWhitelistPrice(0)).to.equal("2000000000000000");


  })

  it("Should throw expection when trying to change merkle root for a non existent whitelist", async () => {
    let wl = getWhitelistRoot([accounts[1].address, accounts[2].address]);

    await expectThrowsAsync(() => collectionInstance.setWhitelistMerkleRoot(0, wl.root))
    // await collectionInstance.setWhitelistMerkleRoot(0, wl.root)
  });

  it("Should set merkle root", async () => {
    let wl = getWhitelistRoot([accounts[1].address, accounts[2].address]);
    await collectionInstance.createWhitelistGroup(0, wl.root, 1000000000000000);

    let wl2 = getWhitelistRoot([accounts[2].address, accounts[3].address]);
    await collectionInstance.setWhitelistMerkleRoot(0, wl2.root);
    expect(await collectionInstance.getWhitelistMerkleRoot(0)).to.equal(wl2.root);
  });


  it("Should mint from whitelist", async () => {
    let wl = getWhitelistRoot([accounts[1].address, accounts[2].address]);
    await collectionInstance.createWhitelistGroup(0, wl.root, "1000000000000000");
    await collectionInstance.setWhitelistGroupEnabled(0, true);

    await collectionInstance.connect(accounts[1]).whitelistMint(0, evalMerkleProof(wl.tree, accounts[1].address), { value: "1000000000000000" });
  });

  it("Should mint from a multi-whitelist scenario", async () => {
    let wl = getWhitelistRoot([accounts[1].address, accounts[2].address]);
    await collectionInstance.createWhitelistGroup(0, wl.root, "1000000000000000");
    await collectionInstance.setWhitelistGroupEnabled(0, true);

    let wl2 = getWhitelistRoot([accounts[3].address, accounts[2].address, accounts[4].address]);
    await collectionInstance.createWhitelistGroup(1, wl2.root, "2000000000000000");
    await collectionInstance.setWhitelistGroupEnabled(1, true);

    let wl3 = getWhitelistRoot([accounts[5].address, accounts[6].address, accounts[2].address]);
    await collectionInstance.createWhitelistGroup(2, wl3.root, "4000000000000000");
    await collectionInstance.setWhitelistGroupEnabled(2, true);

    await collectionInstance.connect(accounts[1]).whitelistMint(0, evalMerkleProof(wl.tree, accounts[1].address), { value: "1000000000000000" });
    await collectionInstance.connect(accounts[6]).whitelistMint(2, evalMerkleProof(wl3.tree, accounts[6].address), { value: "4000000000000000" });
    await collectionInstance.connect(accounts[5]).whitelistMint(2, evalMerkleProof(wl3.tree, accounts[5].address), { value: "4000000000000000" });
    // await collectionInstance.connect(accounts[5]).whitelistMint(2, evalMerkleProof(wl3.tree, accounts[5].address), { value: "4000000000000000" });
    // await collectionInstance.connect(accounts[5]).whitelistMint(1, evalMerkleProof(wl3.tree, accounts[4].address), { value: "2000000000000000" });
  });




  // it("Should throw expection when trying to enable a non existent whitelist", async () => {

  // });

});