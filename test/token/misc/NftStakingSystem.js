const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const refContractInfo = require("../../../artifacts/contracts/token/misc/ReferralSystem.sol/ReferralSystem.json");
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

    deployNftStakingSystem = async (
      nftCollectionAddress,
      rewardTokenAddress
    ) => {
      return await nftStakingSystem.deploy(
        nftCollectionAddress,
        rewardTokenAddress
      );
    };
  });

  const contractsDeployment = async () => {
    nftCollectionInstance = await deployNftCollection();
    rewardTokenInstance = await deployRewardToken();
    stakingSystemInstance = await deployNftStakingSystem(
      nftCollectionInstance.address,
      rewardTokenInstance.address
    );

    await rewardTokenInstance.grantRole(await rewardTokenInstance.MINTER_ROLE(), stakingSystemInstance.address);
  };

  beforeEach(async () => {
    await contractsDeployment();
  });

  it("Deployment of a NftStakingSystem contract", async function () {
    await contractsDeployment();
  });

  it("Get info about empty account", async function () {
    let accountInfo = await stakingSystemInstance.stakers(accounts[1].address);
  });

  it("Single item staking", async function () {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(
      accounts[1].address
    );
  });

  it("Single item instant unstaking", async function () {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);

    await stakingSystemInstance.connect(accounts[1]).unstake(1);

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("Multiple item staking", async function () {
    await nftCollectionInstance.ownerMintForAddress(4, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 2);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 3);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 4);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);
    await stakingSystemInstance.connect(accounts[1]).stake(2, 0);
    await stakingSystemInstance.connect(accounts[1]).stake(3, 0);
    await stakingSystemInstance.connect(accounts[1]).stake(4, 0);

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(
      accounts[1].address
    );
    expect(await stakingSystemInstance.stakerAddress(2)).to.equal(
      accounts[1].address
    );
    expect(await stakingSystemInstance.stakerAddress(3)).to.equal(
      accounts[1].address
    );
    expect(await stakingSystemInstance.stakerAddress(4)).to.equal(
      accounts[1].address
    );
    expect(
      await stakingSystemInstance.getAccountStakedItemsAmount(
        accounts[1].address
      )
    ).to.equal(4);

    let stakedIds = await stakingSystemInstance.getAccountStakedIds(
      accounts[1].address
    );
    expect(stakedIds.map((amount) => parseInt(amount._hex))).to.eql([
      1, 2, 3, 4,
    ]);
  });

  it("Multiple items instant unstaking", async function () {
    await nftCollectionInstance.ownerMintForAddress(4, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 2);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 3);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 4);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);
    await stakingSystemInstance.connect(accounts[1]).stake(2, 0);
    await stakingSystemInstance.connect(accounts[1]).stake(3, 0);
    await stakingSystemInstance.connect(accounts[1]).stake(4, 0);

    await stakingSystemInstance.connect(accounts[1]).unstake(1);
    await stakingSystemInstance.connect(accounts[1]).unstake(2);
    await stakingSystemInstance.connect(accounts[1]).unstake(3);
    await stakingSystemInstance.connect(accounts[1]).unstake(4);

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await stakingSystemInstance.stakerAddress(2)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await stakingSystemInstance.stakerAddress(3)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await stakingSystemInstance.stakerAddress(4)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(
      await stakingSystemInstance.getAccountStakedItemsAmount(
        accounts[1].address
      )
    ).to.equal(0);
  });

  it("Trying to stake a non existing id", async () => {
    await expectThrowsAsync(() =>
      stakingSystemInstance.connect(accounts[1]).stake(1, 0)
    );
  });

  it("Trying to stake a not-owned id", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[2].address);

    await expectThrowsAsync(() =>
      stakingSystemInstance.connect(accounts[1]).stake(1, 0)
    );
  });

  it("Trying to unstake a non existing id", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);

    await expectThrowsAsync(() =>
      stakingSystemInstance.connect(accounts[1]).unstake(2)
    );
  });

  it("Trying to unstake a not staked id", async () => {
    await nftCollectionInstance.ownerMintForAddress(2, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);

    await expectThrowsAsync(() =>
      stakingSystemInstance.connect(accounts[1]).unstake(2)
    );
  });

  it("Trying to unstake a not owned id", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);

    await expectThrowsAsync(() =>
      stakingSystemInstance.connect(accounts[2]).unstake(1)
    );
  });

  it("Calculate claimable reward after 1 hour", async () => {
    await nftCollectionInstance.ownerMintForAddress(3, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);

    expect(await stakingSystemInstance.calculateClaimableReward(accounts[1].address)).to.equal("0");
    expect(await stakingSystemInstance.getUnclaimedReward(accounts[1].address)).to.equal("0");
    await helpers.time.increase(3600);
    expect(await stakingSystemInstance.calculateClaimableReward(accounts[1].address)).to.equal("100000");
    expect(await stakingSystemInstance.getUnclaimedReward(accounts[1].address)).to.equal("0");


    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 2);
    await stakingSystemInstance.connect(accounts[1]).stake(2, 0);

    expect(await stakingSystemInstance.calculateClaimableReward(accounts[1].address)).to.equal("100000");
    expect(await stakingSystemInstance.getUnclaimedReward(accounts[1].address)).to.equal("100000");

    await helpers.time.increase(3600);

    expect(await stakingSystemInstance.calculateClaimableReward(accounts[1].address)).to.equal("300000");
    expect(await stakingSystemInstance.getUnclaimedReward(accounts[1].address)).to.equal("100000");

    await stakingSystemInstance.claim(accounts[1].address);

    expect(await stakingSystemInstance.calculateClaimableReward(accounts[1].address)).to.equal("0");
    expect(await stakingSystemInstance.getUnclaimedReward(accounts[1].address)).to.equal("0");
    expect(await rewardTokenInstance.balanceOf(accounts[1].address)).to.equal("300000");

    await stakingSystemInstance.connect(accounts[1]).unstake(1);
    await stakingSystemInstance.connect(accounts[1]).unstake(2);

    await helpers.time.increase(3600 * 24);

    expect(await stakingSystemInstance.calculateClaimableReward(accounts[1].address)).to.equal("0");
    expect(await stakingSystemInstance.getUnclaimedReward(accounts[1].address)).to.equal("0");
    expect(await rewardTokenInstance.balanceOf(accounts[1].address)).to.equal("300000");

  });

  it("Trying to stake two times the same token without unstaking it", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);
    await expectThrowsAsync(() => stakingSystemInstance.connect(accounts[1]).stake(1, 0));

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(
      accounts[1].address
    );
  });

  it("Trying two times the staking-unstaking cycle", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);
    await stakingSystemInstance.connect(accounts[1]).unstake(1);

    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 0);
    await stakingSystemInstance.connect(accounts[1]).unstake(1);

    expect(await stakingSystemInstance.stakerAddress(1)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("Trying to pass 0 as minPeriod in static staking", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);

    await stakingSystemInstance.setStakingMode(0);
    await expectThrowsAsync(() => stakingSystemInstance.connect(accounts[1]).stake(1, 0));
  });

  it("Trying to pass a non-zero minPeriod without waiting for unstaking", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);

    await stakingSystemInstance.setStakingMode(0);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 3600);

    await expectThrowsAsync(() => stakingSystemInstance.connect(accounts[1]).unstake(1));
  });


  it("Trying to pass a non-zero minPeriod without waiting for unstaking", async () => {
    await nftCollectionInstance.ownerMintForAddress(1, accounts[1].address);
    await nftCollectionInstance
      .connect(accounts[1])
      .approve(stakingSystemInstance.address, 1);

    await stakingSystemInstance.setStakingMode(0);
    await stakingSystemInstance.connect(accounts[1]).stake(1, 3600);
    await helpers.time.increase(3599);
    await expectThrowsAsync(() => stakingSystemInstance.connect(accounts[1]).unstake(1));
    await helpers.time.increase(1);
    await stakingSystemInstance.connect(accounts[1]).unstake(1);
  });



});
