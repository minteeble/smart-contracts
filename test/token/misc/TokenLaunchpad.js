const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const refContractInfo = require("../../../artifacts/contracts/token/misc/TokenLaunchpad.sol/TokenLaunchpad.json");

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

describe("TokenLaunchpad", function () {
  let refInterface;

  before(async () => {
    refInterface = new ethers.utils.Interface(refContractInfo.abi);
  });

  it("Deployment of a basic TokenLaunchpad", async function () {
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    await launchpad.deploy();
  });

  it("Admin adds a project", async function () {
    const [admin, project] = await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    const deployedLaunchpad = await launchpad.deploy();

    await deployedLaunchpad.addProject(project.address);
    expect(await deployedLaunchpad.projectsNum()).to.equal(1);
    expect(await deployedLaunchpad.projectAtIndex(0)).to.equal(project.address);
  });

  it("Admin removes a project", async function () {
    const [admin, project] = await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    const deployedLaunchpad = await launchpad.deploy();

    await deployedLaunchpad.addProject(project.address);
    await deployedLaunchpad.removeProject(project.address);
    expect(await deployedLaunchpad.projectsNum()).to.equal(0);
  });

  it("Admin try to remove a project in an empty launchpad", async function () {
    const [admin, project] = await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    const deployedLaunchpad = await launchpad.deploy();

    await expectThrowsAsync(() =>
      deployedLaunchpad.removeProject(project.address)
    );
  });

  it("Try listing projects", async function () {
    const [admin, project1, project2] = await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    const deployedLaunchpad = await launchpad.deploy();

    await deployedLaunchpad.addProject(project1.address);
    await deployedLaunchpad.addProject(project2.address);

    expect(await deployedLaunchpad.projectsNum()).to.equal(2);
    expect(await deployedLaunchpad.projectAtIndex(0)).to.equal(
      project1.address
    );
    expect(await deployedLaunchpad.projectAtIndex(1)).to.equal(
      project2.address
    );
  });

  it("Unauthorized account tries adding a project", async function () {
    const [admin, account2, project] = await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    const deployedLaunchpad = await launchpad.deploy();

    await expectThrowsAsync(() =>
      deployedLaunchpad.connect(account2).addProject(project.address)
    );
  });

  it("Unauthorized account tries removing a project", async function () {
    const [admin, account2, project] = await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");

    const deployedLaunchpad = await launchpad.deploy();

    await deployedLaunchpad.addProject(project.address);

    await expectThrowsAsync(() =>
      deployedLaunchpad.connect(account2).removeProject(project.address)
    );
  });

  it("Chain of self invitations", async function () {
    const [admin, project, a1, a2, a3, a4, a5, a6, a7, a8] =
      await ethers.getSigners();
    const launchpad = await ethers.getContractFactory("TokenLaunchpad");
    const token = await ethers.getContractFactory("LaunchpadERC20Token");

    const deployedLaunchpad = await launchpad.deploy();
    const deployedToken = await token.deploy("NAME", "SYMBOL", "10");

    // console.log("LAUNCHPAD:", deployedLaunchpad.address);
    // console.log("TOKEN:", deployedToken.address);
    // console.log("ADMIN:", admin.address);

    await deployedLaunchpad.setERC20Token(deployedToken.address);

    await deployedToken.grantRole(
      (await deployedToken.MINTER_ROLE()).toString(),
      deployedLaunchpad.address
    );

    await deployedLaunchpad.addRank();
    await deployedLaunchpad.addLevel(0, 7);
    await deployedLaunchpad.addLevel(0, 6);
    await deployedLaunchpad.addLevel(0, 5);
    await deployedLaunchpad.addLevel(0, 4);
    await deployedLaunchpad.addLevel(0, 3);
    await deployedLaunchpad.addLevel(0, 2);
    await deployedLaunchpad.addLevel(0, 1);

    await deployedLaunchpad.connect(a2).acceptInvitation(a1.address);
    await deployedLaunchpad.connect(a3).acceptInvitation(a2.address);
    await deployedLaunchpad.connect(a4).acceptInvitation(a3.address);
    await deployedLaunchpad.connect(a5).acceptInvitation(a4.address);
    await deployedLaunchpad.connect(a6).acceptInvitation(a5.address);
    await deployedLaunchpad.connect(a7).acceptInvitation(a6.address);
    await deployedLaunchpad.connect(a8).acceptInvitation(a7.address);

    let a1Ref = await deployedLaunchpad.getRefInfo(a1.address);
    let a2Ref = await deployedLaunchpad.getRefInfo(a2.address);
    let a3Ref = await deployedLaunchpad.getRefInfo(a3.address);
    let a4Ref = await deployedLaunchpad.getRefInfo(a4.address);
    let a5Ref = await deployedLaunchpad.getRefInfo(a5.address);
    let a6Ref = await deployedLaunchpad.getRefInfo(a6.address);
    let a7Ref = await deployedLaunchpad.getRefInfo(a7.address);
    let a8Ref = await deployedLaunchpad.getRefInfo(a8.address);

    expect((await deployedLaunchpad.getLevels(0)).length).to.equal(7);

    expect(a1Ref.length).to.equal(0);

    expect(a2Ref.length).to.equal(1);
    expect(a2Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a2Ref[0]["account"].toString()).to.equal(a1.address);

    expect(a3Ref.length).to.equal(2);
    expect(a3Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a3Ref[0]["account"].toString()).to.equal(a2.address);
    expect(a3Ref[1]["percentage"].toNumber()).to.equal(6);
    expect(a3Ref[1]["account"].toString()).to.equal(a1.address);

    expect(a4Ref.length).to.equal(3);
    expect(a4Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a4Ref[0]["account"].toString()).to.equal(a3.address);
    expect(a4Ref[1]["percentage"].toNumber()).to.equal(6);
    expect(a4Ref[1]["account"].toString()).to.equal(a2.address);
    expect(a4Ref[2]["percentage"].toNumber()).to.equal(5);
    expect(a4Ref[2]["account"].toString()).to.equal(a1.address);

    expect(a5Ref.length).to.equal(4);
    expect(a5Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a5Ref[0]["account"].toString()).to.equal(a4.address);
    expect(a5Ref[1]["percentage"].toNumber()).to.equal(6);
    expect(a5Ref[1]["account"].toString()).to.equal(a3.address);
    expect(a5Ref[2]["percentage"].toNumber()).to.equal(5);
    expect(a5Ref[2]["account"].toString()).to.equal(a2.address);
    expect(a5Ref[3]["percentage"].toNumber()).to.equal(4);
    expect(a5Ref[3]["account"].toString()).to.equal(a1.address);

    expect(a6Ref.length).to.equal(5);
    expect(a6Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a6Ref[0]["account"].toString()).to.equal(a5.address);
    expect(a6Ref[1]["percentage"].toNumber()).to.equal(6);
    expect(a6Ref[1]["account"].toString()).to.equal(a4.address);
    expect(a6Ref[2]["percentage"].toNumber()).to.equal(5);
    expect(a6Ref[2]["account"].toString()).to.equal(a3.address);
    expect(a6Ref[3]["percentage"].toNumber()).to.equal(4);
    expect(a6Ref[3]["account"].toString()).to.equal(a2.address);
    expect(a6Ref[4]["percentage"].toNumber()).to.equal(3);
    expect(a6Ref[4]["account"].toString()).to.equal(a1.address);

    expect(a7Ref.length).to.equal(6);
    expect(a7Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a7Ref[0]["account"].toString()).to.equal(a6.address);
    expect(a7Ref[1]["percentage"].toNumber()).to.equal(6);
    expect(a7Ref[1]["account"].toString()).to.equal(a5.address);
    expect(a7Ref[2]["percentage"].toNumber()).to.equal(5);
    expect(a7Ref[2]["account"].toString()).to.equal(a4.address);
    expect(a7Ref[3]["percentage"].toNumber()).to.equal(4);
    expect(a7Ref[3]["account"].toString()).to.equal(a3.address);
    expect(a7Ref[4]["percentage"].toNumber()).to.equal(3);
    expect(a7Ref[4]["account"].toString()).to.equal(a2.address);
    expect(a7Ref[5]["percentage"].toNumber()).to.equal(2);
    expect(a7Ref[5]["account"].toString()).to.equal(a1.address);

    expect(a8Ref.length).to.equal(7);
    expect(a8Ref[0]["percentage"].toNumber()).to.equal(7);
    expect(a8Ref[0]["account"].toString()).to.equal(a7.address);
    expect(a8Ref[1]["percentage"].toNumber()).to.equal(6);
    expect(a8Ref[1]["account"].toString()).to.equal(a6.address);
    expect(a8Ref[2]["percentage"].toNumber()).to.equal(5);
    expect(a8Ref[2]["account"].toString()).to.equal(a5.address);
    expect(a8Ref[3]["percentage"].toNumber()).to.equal(4);
    expect(a8Ref[3]["account"].toString()).to.equal(a4.address);
    expect(a8Ref[4]["percentage"].toNumber()).to.equal(3);
    expect(a8Ref[4]["account"].toString()).to.equal(a3.address);
    expect(a8Ref[5]["percentage"].toNumber()).to.equal(2);
    expect(a8Ref[5]["account"].toString()).to.equal(a2.address);
    expect(a8Ref[6]["percentage"].toNumber()).to.equal(1);
    expect(a8Ref[6]["account"].toString()).to.equal(a1.address);

    let actionRes = await (
      await deployedLaunchpad.connect(admin).addAction(a8.address)
    ).wait();

    expect(actionRes.events.length).to.equal(7 * 2);
    expect(actionRes.events[0].args._percentage).to.equal(7);
    expect(actionRes.events[0].args._from).to.equal(a8.address);
    expect(actionRes.events[0].args._to).to.equal(a7.address);
    expect(actionRes.events[2].args._percentage).to.equal(6);
    expect(actionRes.events[2].args._from).to.equal(a8.address);
    expect(actionRes.events[2].args._to).to.equal(a6.address);
    expect(actionRes.events[4].args._percentage).to.equal(5);
    expect(actionRes.events[4].args._from).to.equal(a8.address);
    expect(actionRes.events[4].args._to).to.equal(a5.address);
    expect(actionRes.events[6].args._percentage).to.equal(4);
    expect(actionRes.events[6].args._from).to.equal(a8.address);
    expect(actionRes.events[6].args._to).to.equal(a4.address);
    expect(actionRes.events[8].args._percentage).to.equal(3);
    expect(actionRes.events[8].args._from).to.equal(a8.address);
    expect(actionRes.events[8].args._to).to.equal(a3.address);
    expect(actionRes.events[10].args._percentage).to.equal(2);
    expect(actionRes.events[10].args._from).to.equal(a8.address);
    expect(actionRes.events[10].args._to).to.equal(a2.address);
    expect(actionRes.events[12].args._percentage).to.equal(1);
    expect(actionRes.events[12].args._from).to.equal(a8.address);
    expect(actionRes.events[12].args._to).to.equal(a1.address);
  });

  // Single self invitation
  // Long chain of self invitation
});
