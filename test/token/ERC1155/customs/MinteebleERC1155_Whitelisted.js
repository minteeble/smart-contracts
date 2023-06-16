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


describe("MinteebleERC1155_Whitelisted", function () {

  let accounts = [];
  let erc1155;

  let deployToken = async () => { };

  let erc1155Instance;

  before(async () => {

    erc1155 = await ethers.getContractFactory("MinteebleERC1155_Whitelisted");
    accounts = await ethers.getSigners();
    deployToken = async () => {
      let token = await erc1155.deploy(
        "TokenName",
        "TokenSymbol",
        "https://example.com/{id}.json"
      );

      await token.setPaused(false);
      await token.grantRole(await token.MINTER_ROLE(), accounts[0].address);

      return token;
    };
  });


  this.beforeEach(async () => {
    erc1155Instance = await deployToken();
  })

  it("Deployment of a MinteebleERC1155_Whitelisted token", async function () {
    await deployToken();
  });

  it("Should set merkle root", async () => {
    let wl = getWhitelistRoot([accounts[2].address, accounts[3].address]);
    await erc1155Instance.setMerkleRoot(wl.root);
    expect(await erc1155Instance.merkleRoot()).to.equal(wl.root);
  });

  it("Should mint from whitelist", async () => {
    let wl = getWhitelistRoot([accounts[1].address, accounts[2].address]);
    // await collectionInstance.createWhitelistGroup(0, wl.root, "1000000000000000");
    // await collectionInstance.setWhitelistGroupEnabled(0, true);

    await erc1155Instance.addId(1);
    await erc1155Instance.setMintPrice(1, "1000000000000000");
    await erc1155Instance.setMerkleRoot(wl.root);
    await erc1155Instance.setWhitelistMintEnabled(true);
    await erc1155Instance.setPaused(true);

    await erc1155Instance.connect(accounts[1]).whitelistMint(1, 1, evalMerkleProof(wl.tree, accounts[1].address), { value: "1000000000000000" });
  });

});
