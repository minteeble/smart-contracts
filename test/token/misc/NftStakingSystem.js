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

describe("NftStakingSystem", function () {
  let accounts = [];

  let nftStakingSystem;
  let nftCollection;
  let rewardToken;

  let deployNftCollection = async () => { };
  let deployRewardToken = async () => { };
  let deployNftStakingSystem = async () => { };

  let stakingSystemInstance;
  let nftCollectionInstance;
  let rewardTokenInstance;

  before(async () => {
    nftStakingSystem = await ethers.getContractFactory("NftStakingSystem");
    nftCollection = await ethers.getContractFactory("MinteebleERC721A");
    rewardToken = await ethers.getContractFactory("NftStakingERC20Token");

    accounts = await ethers.getSigners();

    deployNftCollection = async () => {
      return await nftCollection.deploy(
        "TokenName",
        "TokenSymbol",
        10000,
        "1000000000000000"
      );
    };

    deployRewardToken = async () => {
      return await rewardToken.deploy(
        "TokenName",
        "TokenSymbol",
        "1000000000000000000"
      );
    };

    deployNftStakingSystem = async (nftCollectionAddress, rewardTokenAddress) => {
      return await nftStakingSystem.deploy(
        nftCollectionAddress, rewardTokenAddress
      );
    }
  });

  const contractsDeployment = async () => {
    nftCollectionInstance = await deployNftCollection();
    rewardTokenInstance = await deployRewardToken();
    stakingSystemInstance = await deployNftStakingSystem(nftCollectionInstance.address, rewardTokenInstance.address);
  }

  beforeEach(async () => {
    await contractsDeployment();
  });

  it("Deployment of a NftStakingSystem contract", async function () {
    await contractsDeployment();
  });

  it("Get info about empty account", async function () {
    let accountInfo = await stakingSystemInstance.stakers(accounts[1].address);

    console.log("Info:", accountInfo);
  });

  it("Single item staking", async function () {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance.connect(accounts[1]).approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1);

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(accounts[1].address);
  });





});
