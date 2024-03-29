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

  let deployToken = async () => { };

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);

    erc1155 = await ethers.getContractFactory("MinteebleERC1155");
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

  it("Deployment of a basic ERC1155 token", async function () {
    await deployToken();
  });

  it("No ids available at the beginning", async function () {
    let token = await deployToken();

    let ids = await token.getIds();

    expect(ids.length).to.equal(0);
  });

  it("No ids available at the beginning", async function () {
    let token = await deployToken();

    let ids = await token.getIds();

    expect(ids.length).to.equal(0);
  });

  it("Adding new ids from admin account", async function () {
    let token = await deployToken();

    await token.addId(5);
    await token.addId(9);

    let ids = await token.getIds();

    expect(ids.length).to.equal(2);
    expect(ids[0].id).to.equal(5);
    expect(ids[1].id).to.equal(9);
  });

  it("Removing new ids from admin account", async function () {
    let token = await deployToken();

    await token.addId(5);
    await token.addId(9);
    await token.removeId(5);

    let ids = await token.getIds();

    expect(ids.length).to.equal(1);
    expect(ids[0].id).to.equal(9);
  });

  it("Try removing new ids from non-admin account", async function () {
    let token = await deployToken();

    await token.addId(5);
    await token.addId(9);

    await expectThrowsAsync(() => token.connect(accounts[1]).removeId(5));
  });

  it("Try adding new ids from non-admin account", async function () {
    let token = await deployToken();

    await expectThrowsAsync(() => token.connect(accounts[1]).addId(6));
  });

  it("Try adding duplicate id", async function () {
    let token = await deployToken();

    await token.addId(9);
    await expectThrowsAsync(() => token.addId(9));
  });

  it("Try removing non-existing id", async function () {
    let token = await deployToken();

    await expectThrowsAsync(() => token.removeId(9));
  });

  it("Try removing id with items already minted", async function () {
    let token = await deployToken();

    await token.addId(10);
    await token.connect(accounts[0]).mintForAddress(accounts[1].address, 10, 4);
    await expectThrowsAsync(() => token.removeId(10));
  });

  it("Admin mints tokens for address", async function () {
    let token = await deployToken();

    await token.addId(10);
    await token.mintForAddress(accounts[1].address, 10, 4);

    expect(await token.balanceOf(accounts[1].address, 10)).to.equal(4);
  });

  it("Admin try minting tokens with non existing ids", async function () {
    let token = await deployToken();

    await token.addId(9);

    await expectThrowsAsync(() =>
      token.mintForAddress(accounts[2].address, 10, 4)
    );
  });

  it("Admin triggers airdrop", async function () {
    let token = await deployToken();
    let id = 1;

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
    let token = await deployToken();
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

  it("Admin sets new uri", async function () {
    let token = await deployToken();
    let id = 0x8975;

    await token.setURI("https://example2.com/{id}.json");

    expect(await token.uri(id)).to.equal("https://example2.com/{id}.json");
  });

  it("Non-admin account try setting new uri", async function () {
    let token = await deployToken();
    let id = 0x8975;

    await expectThrowsAsync(() =>
      token.connect(accounts[1]).setURI("https://example2.com/{id}.json")
    );
  });

  it("Should do the normal mint", async () => {
    let token = await deployToken();

    await token.addId(8);
    let price = await token.mintPrice(8);
    await token.mint(8, 1, { value: price, from: accounts[0].address });
    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(1);

  });

  it("Should throw exception when user tries to mint over the supply", async () => {
    let token = await deployToken();

    let amount = 10;

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000");
    await token.setMaxSupply(8, amount);
    let price = await token.mintPrice(8);


    await expectThrowsAsync(() => token.mint(8, amount + 1, { value: BigNumber.from(price).mul(amount + 1), from: accounts[0].address }))
    await token.mint(8, amount, { value: BigNumber.from(price).mul(amount), from: accounts[0].address })

  });

  it("Should throw exception when user tries to mint a non existant id", async () => {
    let token = await deployToken();

    await token.addId(8);
    let price = await token.mintPrice(8);
    await expectThrowsAsync(() => token.mint(7, 1, { value: price, from: accounts[0].address }));
  });

  it("Should return information about the existing IDs", async () => {
    let token = await deployToken();

    await token.addId(5);
    await token.setMintPrice(5, "1000000000000000");
    await token.setMaxSupply(5, 10000);
    await token.addId(8);
    await token.setMintPrice(8, "100000000000000");
    await token.setMaxSupply(8, 3000);
    await token.addId(9);
    await token.setMintPrice(9, "100000000000000");
    await token.setMaxSupply(9, 100);

    let ids = await token.getIds();

    expect(ids[0].id).to.equal(5);
    expect(ids[0].maxSupply).to.equal(10000);
    expect(ids[0].price).to.equal("1000000000000000");

    expect(ids[1].id).to.equal(8);
    expect(ids[1].maxSupply).to.equal(3000);
    expect(ids[1].price).to.equal("100000000000000");

    expect(ids[2].id).to.equal(9);
    expect(ids[2].maxSupply).to.equal(100);
    expect(ids[2].price).to.equal("100000000000000");

  });

  it("Should throw exception when a common account tries to withdraw balance", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000")
    let price = await token.mintPrice(8);
    await token.mint(8, 1, { value: price, from: accounts[0].address });

    await expectThrowsAsync(() => token.connect(accounts[1]).withdrawBalance());

  });

  it("Should withdraw balance", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000")
    let price = await token.mintPrice(8);
    await token.mint(8, 1, { value: price, from: accounts[0].address });

    await token.connect(accounts[0]).withdrawBalance();
  });

  it("Should throw exception when trying to mint without enough funds", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000000000")
    await expectThrowsAsync(() => token.mint(8, 1, { value: "0", from: accounts[0].address }));
  });

  it("Should correctly mint for another address", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000");

    let price = await token.mintPrice(8);
    await token.mintForAddress(accounts[4].address, 8, 1, { value: price, from: accounts[0].address });

    expect(await token.balanceOf(accounts[4].address, 8)).to.equal(1);
  });

  it("Should throw exception whn trying to mint for another address withour providing enough funds", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000");

    await expectThrowsAsync(() => token.mintForAddress(accounts[4].address, 8, 1, { value: "0", from: accounts[0].address }));

    expect(await token.balanceOf(accounts[4].address, 8)).to.equal(0);
  })

  it("Should batch read the mint prices", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMintPrice(8, "1000000000000000");
    await token.addId(9);
    await token.setMintPrice(9, "1000000000000000");
    await token.addId(10);
    await token.setMintPrice(10, "4000000000000000");

    let prices = await token.batchMintPrice([8, 9, 10]);

    expect(prices[0]).to.equal("1000000000000000");
    expect(prices[1]).to.equal("1000000000000000");
    expect(prices[2]).to.equal("4000000000000000");
  });

  it("Should batch set the mint prices", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await token.batchSetMintPrice([8, 9, 10], ["1000000000000000", "1000000000000000", "4000000000000000"]);

    let prices = await token.batchMintPrice([8, 9, 10]);

    expect(prices[0]).to.equal("1000000000000000");
    expect(prices[1]).to.equal("1000000000000000");
    expect(prices[2]).to.equal("4000000000000000");
  });

  it("Should throw exception when trying to batch set the mint prices with different lengths", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await expectThrowsAsync(() => token.batchSetMintPrice([8, 9, 10], ["1000000000000000", "1000000000000000"]));
  });

  it("Should throw exception when trying to batch set the mint prices with different lengths", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await expectThrowsAsync(() => token.batchSetMintPrice([8, 9, 10], ["1000000000000000", "1000000000000000"]));
  });

  it("Should batch read the max supplies", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setMaxSupply(8, 10000);
    await token.addId(9);
    await token.setMaxSupply(9, 10000);
    await token.addId(10);
    await token.setMaxSupply(10, 40000);

    let supplies = await token.batchMaxSupply([8, 9, 10]);

    expect(supplies[0]).to.equal(10000);
    expect(supplies[1]).to.equal(10000);
    expect(supplies[2]).to.equal(40000);
  });

  it("Should batch set the max supplies", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await token.batchSetMaxSupply([8, 9, 10], [10000, 10000, 40000]);

    let supplies = await token.batchMaxSupply([8, 9, 10]);

    expect(supplies[0]).to.equal(10000);
    expect(supplies[1]).to.equal(10000);
    expect(supplies[2]).to.equal(40000);
  });

  it("Should throw exception when trying to batch set the max supplies with different lengths", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await expectThrowsAsync(() => token.batchSetMaxSupply([8, 9, 10], [10000, 10000]));
  });

  it("Should throw exception when trying to batch set the max supplies with different lengths", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await expectThrowsAsync(() => token.batchSetMaxSupply([8, 9, 10], [10000, 10000]));
  });

  it("Should batch read the balances (balanceOfBatch)", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await token.mint(8, 1, { value: "1000000000000000", from: accounts[0].address });
    await token.mint(9, 1, { value: "1000000000000000", from: accounts[0].address });
    await token.mint(10, 1, { value: "1000000000000000", from: accounts[0].address });

    let balances = await token.balanceOfBatch([accounts[0].address, accounts[0].address, accounts[0].address], [8, 9, 10]);

    expect(balances[0]).to.equal(1);
    expect(balances[1]).to.equal(1);
    expect(balances[2]).to.equal(1);
  });

  it("Should batch read the balances (balanceOfBatch) with different lengths", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);

    await token.mint(8, 1, { value: "1000000000000000", from: accounts[0].address });
    await token.mint(9, 1, { value: "1000000000000000", from: accounts[0].address });

    let balances = await token.balanceOfBatch([accounts[0].address, accounts[0].address, accounts[0].address], [8, 9, 10]);

    expect(balances[0]).to.equal(1);
    expect(balances[1]).to.equal(1);
    expect(balances[2]).to.equal(0);
  });

  it("Should revert mint if paused", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setPaused(true);

    await expectThrowsAsync(() => token.mint(8, 1, { value: "0", from: accounts[0].address }));
  });

  it("Should revert mint if freeItemsBuyable is false and price is zero", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setFreeItemsBuyable(false);

    await expectThrowsAsync(() => token.mint(8, 1, { value: "0", from: accounts[0].address }));
    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(0);
  });

  it("Should allow minter role to ownerMintForAddress if freeItemsBuyable is false and price is zero", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setFreeItemsBuyable(false);

    await token.ownerMintForAddress(accounts[0].address, 8, 1);
    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(1);
  });

  it("Should revert ownerMintForAddress if freeItemsBuyable is false and price is zero and caller is not minter", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.setFreeItemsBuyable(false);

    await expectThrowsAsync(() => token.connect(accounts[1]).ownerMintForAddress(accounts[2].address, 8, 1));
    expect(await token.balanceOf(accounts[2].address, 8)).to.equal(0);
  });


  it("Should correctly mintBatchForAddress", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);

    await token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1, 1], { value: "3000000000000000", from: accounts[0].address });

    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(1);
    expect(await token.balanceOf(accounts[0].address, 9)).to.equal(1);
    expect(await token.balanceOf(accounts[0].address, 10)).to.equal(1);
  });

  it("Should revert mintBatchForAddress if paused", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);
    await token.setPaused(true);

    await expectThrowsAsync(() => token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1, 1], { value: "3000000000000000", from: accounts[0].address }));
  });

  it("Should revert mintBatchForAddress if freeItemsBuyable is false and price is zero", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);
    await token.setFreeItemsBuyable(false);

    await expectThrowsAsync(() => token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1, 1], { value: "0", from: accounts[0].address }));
    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(0);
    expect(await token.balanceOf(accounts[0].address, 9)).to.equal(0);
    expect(await token.balanceOf(accounts[0].address, 10)).to.equal(0);
  });

  it("Should allow minter role to ownerMintBatchForAddress if freeItemsBuyable is false and price is zero", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);
    await token.setFreeItemsBuyable(false);

    await token.ownerMintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1, 1]);
    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(1);
    expect(await token.balanceOf(accounts[0].address, 9)).to.equal(1);
    expect(await token.balanceOf(accounts[0].address, 10)).to.equal(1);
  });

  it("Should revert ownerMintBatchForAddress if caller is not minter", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);
    await token.setFreeItemsBuyable(false);

    await expectThrowsAsync(() => token.connect(accounts[1]).ownerMintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1, 1]));
    expect(await token.balanceOf(accounts[0].address, 8)).to.equal(0);
    expect(await token.balanceOf(accounts[0].address, 9)).to.equal(0);
    expect(await token.balanceOf(accounts[0].address, 10)).to.equal(0);
  });

  it("Should revert mintBatchForAddress if price is not correct", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);
    await token.addId(10);
    await token.setMintPrice(8, "1000000000000000");
    await token.setMintPrice(9, "1000000000000000");
    await token.setMintPrice(10, "1000000000000000");

    await expectThrowsAsync(() => token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1, 1], { value: "2900000000000000", from: accounts[0].address }));
  });

  it("Should revert mintBatchForAddress if ids and amounts are not the same length", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);

    await expectThrowsAsync(() => token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1], { value: "2900000000000000", from: accounts[0].address }));
  });

  it("Should revert mintBatchForAddress if ids and amounts are not the same length", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);

    await expectThrowsAsync(() => token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1], { value: "2900000000000000", from: accounts[0].address }));
  });

  it("Should revert mintBatchForAddress if ids and amounts are not the same length", async () => {
    let token = await deployToken();

    await token.addId(8);
    await token.addId(9);

    await expectThrowsAsync(() => token.mintBatchForAddress(accounts[0].address, [8, 9, 10], [1, 1], { value: "2900000000000000", from: accounts[0].address }));
  });




});
