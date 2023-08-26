const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
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

describe.only("RequestMapper", function () {

  let accounts = [];
  let contractInstance;

  let deployTracker = async () => { };

  before(async () => {

    accounts = await ethers.getSigners();

    deployTracker = async () => {
      let contract = await ethers.getContractFactory("Test_RequestMapper");

      contractInstance = await contract.deploy();
    };
  });

  beforeEach(async () => {
    await deployTracker();
  });

  it("Deployment of a basic tracker", async function () {
    await deployTracker();
  });

  it("Should get value of an empty request", async () => {
    let request = keccak256("A");

    let id = await contractInstance.getIdByRequest(request);

    expect(id).to.equal(0);
  })

  it("Should set request", async () => {
    let request = keccak256("A");

    await contractInstance.setRequest(request, 10);

    let id = await contractInstance.getIdByRequest(request);

    expect(id).to.equal(10);
  })

  it("Should throw error when setting multiple times the same request", async () => {
    let request = keccak256("A");

    await contractInstance.setRequest(request, 10);

    await expectThrowsAsync(() => contractInstance.setRequest(request, 10));
  })




});
