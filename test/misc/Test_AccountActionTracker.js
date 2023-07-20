const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

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

describe.only("AccountActionTracker", function () {

  let accounts = [];
  let trackerInstance;

  let deployTracker = async () => { };

  before(async () => {

    accounts = await ethers.getSigners();

    deployTracker = async () => {
      let contract = await ethers.getContractFactory("Test_AccountActionTracker");

      trackerInstance = await contract.deploy();
    };
  });

  beforeEach(async () => {
    await deployTracker();
  });

  it("Deployment of a basic tracker", async function () {
    await deployTracker();
  });

  it("Should add action to account enabled in manual mode", async () => {
    await trackerInstance.setManualMode(true);
    await trackerInstance.setAccountEnabled(accounts[1].address, true);
    await trackerInstance.trackActionToAccount(accounts[1].address);

    let accountInfo = await trackerInstance.accountInfo(accounts[1].address);

    expect(accountInfo.actions.toString()).to.equal("1");
  });

  it("Should revert when trying to action to account not enabled in manual mode", async () => {
    await trackerInstance.setManualMode(true);
    await trackerInstance.setAccountEnabled(accounts[1].address, false);

    expectThrowsAsync(() => trackerInstance.trackActionToAccount(accounts[1].address))

  });

  it("Should add action to account enabled in automatic mode", async () => {
    await trackerInstance.setManualMode(false);
    await trackerInstance.setAccountEnabled(accounts[1].address, true);
    await trackerInstance.trackActionToAccount(accounts[1].address);

    let accountInfo = await trackerInstance.accountInfo(accounts[1].address);

    expect(accountInfo.actions.toString()).to.equal("1");
  });

  it("Should add action to account non enabled in automatic mode", async () => {
    await trackerInstance.setManualMode(false);
    await trackerInstance.setAccountEnabled(accounts[1].address, false);
    await trackerInstance.trackActionToAccount(accounts[1].address);

    let accountInfo = await trackerInstance.accountInfo(accounts[1].address);

    expect(accountInfo.actions.toString()).to.equal("1");
  });

  it("Should reset account", async () => {
    await trackerInstance.setManualMode(true);
    await trackerInstance.setAccountEnabled(accounts[1].address, true);
    await trackerInstance.trackActionToAccount(accounts[1].address);

    let accountInfo = await trackerInstance.accountInfo(accounts[1].address);

    expect(accountInfo.actions.toString()).to.equal("1");
    await trackerInstance.resetAccount(accounts[1].address);
    accountInfo = await trackerInstance.accountInfo(accounts[1].address);

    expect(accountInfo.actions.toString()).to.equal("0");
    expect(accountInfo.enabled).to.equal(false);

  });




});
