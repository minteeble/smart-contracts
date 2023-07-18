const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const helpers = require("@nomicfoundation/hardhat-network-helpers");

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

describe("Test_MinteebleRandomizationConsumer", function () {
  let accounts = [];

  let VRFCoordinatorV2MockContract;
  let VRFCoordinatorV2MockInstance;
  let deployVRFCoordinatorV2Mock = async () => { };

  let MockV3AggregatorContract;
  let MockV3AggregatorInstance;
  let deploMockV3Aggregator = async () => { };

  let LinkTokenContract;
  let LinkTokenInstance;
  let deployLinkToken = async () => { };

  let VRFV2WrapperContract;
  let VRFV2WrapperInstance;
  let deployVRFV2Wrapper = async () => { };

  let nftToken;
  let nftInstance;
  let deployNft = async () => { };

  before(async () => {
    VRFCoordinatorV2MockContract = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    MockV3AggregatorContract = await ethers.getContractFactory("MockV3Aggregator");
    LinkTokenContract = await ethers.getContractFactory("LinkToken");
    VRFV2WrapperContract = await ethers.getContractFactory("VRFV2Wrapper");

    nftToken = await ethers.getContractFactory("Test_MinteebleRandomizationConsumer");

    accounts = await ethers.getSigners();


    deployNft = async (linkAddress, wrapperAddress) => {
      return await nftToken.deploy(linkAddress, wrapperAddress);
    }

    deployVRFCoordinatorV2Mock = async () => {
      return await VRFCoordinatorV2MockContract.deploy("100000000000000000", "1000000000");
    }

    deployMockV3Aggregator = async () => {
      return await MockV3AggregatorContract.deploy("18", "3000000000000000");
    }

    deployLinkToken = async () => {
      return await LinkTokenContract.deploy();
    }

    deployVRFV2Wrapper = async (linkAddress, aggregatorAddress, coordinatorAddress) => {
      let instance = await VRFV2WrapperContract.deploy(linkAddress, aggregatorAddress, coordinatorAddress);

      await instance.setConfig("60000", "52000", "10", "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", "10");

      return instance;
    }
  });

  const contractsDeployment = async () => {
    VRFCoordinatorV2MockInstance = await deployVRFCoordinatorV2Mock();
    MockV3AggregatorInstance = await deployMockV3Aggregator();
    LinkTokenInstance = await deployLinkToken();
    VRFV2WrapperInstance = await deployVRFV2Wrapper(
      LinkTokenInstance.address,
      MockV3AggregatorInstance.address,
      VRFCoordinatorV2MockInstance.address
    );

    await VRFCoordinatorV2MockInstance.fundSubscription("1", "10000000000000000000");

    nftInstance = await deployNft(LinkTokenInstance.address, VRFV2WrapperInstance.address);

    await LinkTokenInstance.transfer(nftInstance.address, "10000000000000000000");
  };

  beforeEach(async () => {
    await contractsDeployment();
  });

  let unit = BigNumber.from("100000000000000000000000");

  it("Deployment of a NftStakingSystem contract", async function () {
    await contractsDeployment();
  });

  it("Test random", async function () {
    await contractsDeployment();

    let res = await nftInstance.getRandom(); await nftInstance.getRandom();
    await (await VRFCoordinatorV2MockInstance.fulfillRandomWords("1", VRFV2WrapperInstance.address)).wait();

    console.log("Res", await nftInstance.s_requests(1));
  });


});
