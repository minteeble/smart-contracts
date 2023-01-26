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

  let accounts = [];
  let erc1155;

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);

    erc1155 = await ethers.getContractFactory("MinteebleERC1155");
    accounts = await ethers.getSigners();
  });

  it("Deployment of a basic ERC1155 token", async function () {
    await erc1155.deploy("https://example.com/{id}.json");
  });

  it("No ids available at the beginning", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    let ids = await token.getIds();

    expect(ids.length).to.equal(0);
  });

  it("No ids available at the beginning", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    let ids = await token.getIds();

    expect(ids.length).to.equal(0);
  });

  it("Adding new ids from admin account", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await token.addId(5);
    await token.addId(9);

    let ids = await token.getIds();

    expect(ids.length).to.equal(2);
    expect(ids[0]).to.equal(5);
    expect(ids[1]).to.equal(9);
  });

  it("Removing new ids from admin account", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await token.addId(5);
    await token.addId(9);
    await token.removeId(5);

    let ids = await token.getIds();

    expect(ids.length).to.equal(1);
    expect(ids[0]).to.equal(9);
  });

  it("Try removing new ids from non-admin account", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await token.addId(5);
    await token.addId(9);

    await expectThrowsAsync(() => token.connect(accounts[1]).removeId(5));
  });

  it("Try adding new ids from non-admin account", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await expectThrowsAsync(() => token.connect(accounts[1]).addId(6));
  });

  it("Try adding duplicate id", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await token.addId(9);
    await expectThrowsAsync(() => token.addId(9));
  });

  it("Try removing non-existing id", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await expectThrowsAsync(() => token.removeId(9));
  });

  it("Admin mints tokens for address", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await token.addId(10);
    await token.mintForAddress(accounts[1].address, 10, 4);

    expect(await token.balanceOf(accounts[1].address, 10)).to.equal(4);
  });

  it("Admin try minting tokens with non existing ids", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");

    await token.addId(9);

    await expectThrowsAsync(() =>
      token.mintForAddress(accounts[2].address, 10, 4)
    );
  });

  it("Admin triggers airdrop", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");
    let id = 0x8975;

    await token.addId(id);
    await token.airdrop(id, [
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
      accounts[6].address,
    ]);

    expect(await token.balanceOf(accounts[1].address, id)).to.equal(1);
    expect(await token.balanceOf(accounts[2].address, id)).to.equal(1);
    expect(await token.balanceOf(accounts[3].address, id)).to.equal(1);
    expect(await token.balanceOf(accounts[4].address, id)).to.equal(1);
    expect(await token.balanceOf(accounts[5].address, id)).to.equal(1);
    expect(await token.balanceOf(accounts[6].address, id)).to.equal(1);
  });

  it("Admin triggers airdrop with non existing-id", async function () {
    let token = await erc1155.deploy("https://example.com/{id}.json");
    let id = 0x8975;

    await expectThrowsAsync(() =>
      token.airdrop(id, [
        accounts[1].address,
        accounts[2].address,
        accounts[3].address,
        accounts[4].address,
        accounts[5].address,
        accounts[6].address,
      ])
    );
  });
});
