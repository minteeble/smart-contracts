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

describe("ReferralSystem", function () {
  it("Deployment of a basic referral", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();
  });

  it("Gets empty layers", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();
    let levels = await hardhatReferralSystem.getLevels();

    expect(Array.isArray(levels)).to.equal(true);
    expect(levels.length).to.equal(0);
  });

  it("Adds 1 level", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    // level with 23 %
    await hardhatReferralSystem.addLevel(23);
    let levels = await hardhatReferralSystem.getLevels();

    expect(Array.isArray(levels)).to.equal(true);
    expect(levels.length).to.equal(1);
    expect(BigNumber.from(levels[0][0]._hex).toNumber()).to.equal(23);
  });

  it("Adds 3 levels", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(21);
    await hardhatReferralSystem.addLevel(9);
    await hardhatReferralSystem.addLevel(2);
    let levels = await hardhatReferralSystem.getLevels();

    expect(Array.isArray(levels)).to.equal(true);
    expect(levels.length).to.equal(3);
    expect(BigNumber.from(levels[0][0]._hex).toNumber()).to.equal(21);
    expect(BigNumber.from(levels[1][0]._hex).toNumber()).to.equal(9);
    expect(BigNumber.from(levels[2][0]._hex).toNumber()).to.equal(2);
  });

  it("Trying edit level percentage - no levels", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(0, 10));
    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(-1, 10));
    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(10, 10));
  });

  it("Trying edit level percentage - 1 level", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(20);
    await hardhatReferralSystem.editLevel(0, 30);
    expect(
      BigNumber.from((await hardhatReferralSystem.getLevels())[0][0]._hex)
    ).to.equal(30);
    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(1, 10));
  });

  it("Trying edit level percentage - multiple levels", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(20);
    await hardhatReferralSystem.addLevel(12);
    await hardhatReferralSystem.editLevel(0, 30);
    await hardhatReferralSystem.editLevel(1, 23);
    expect(
      BigNumber.from((await hardhatReferralSystem.getLevels())[0][0]._hex)
    ).to.equal(30);

    expect(
      BigNumber.from((await hardhatReferralSystem.getLevels())[1][0]._hex)
    ).to.equal(23);
    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(2, 10));
    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(3, 10));
    await expectThrowsAsync(() => hardhatReferralSystem.editLevel(-1, 0));
  });

  it("Trying removing level - no levels", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await expectThrowsAsync(() => hardhatReferralSystem.removeLevel());
  });

  it("Trying removing level - 1 level", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(20);
    await hardhatReferralSystem.removeLevel();
    let levels = await hardhatReferralSystem.getLevels();
    expect(Array.isArray(levels)).to.equal(true);
    expect(levels.length).to.equal(0);
  });

  it("Trying removing level - multiple level", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(20);
    await hardhatReferralSystem.addLevel(10);
    await hardhatReferralSystem.addLevel(5);
    await hardhatReferralSystem.removeLevel();
    await hardhatReferralSystem.removeLevel();
    let levels = await hardhatReferralSystem.getLevels();
    expect(Array.isArray(levels)).to.equal(true);
    expect(levels.length).to.equal(1);
  });

  it("Checks if null address has inviter", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    expect(
      await hardhatReferralSystem.hasInviter(
        "0x0000000000000000000000000000000000000000"
      )
    ).to.equal(false);
  });

  it("Checks if contract address has inviter", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();
    expect(
      await hardhatReferralSystem.hasInviter(hardhatReferralSystem.address)
    ).to.equal(false);
  });

  it("Checks if non-invited address has inviter", async function () {
    const [owner] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();
    expect(await hardhatReferralSystem.hasInviter(owner.address)).to.equal(
      false
    );
  });

  it("Checks if invited address has inviter", async function () {
    const [owner, account2] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.setInvitation(owner.address, account2.address);
    expect(await hardhatReferralSystem.hasInviter(owner.address)).to.equal(
      false
    );
    expect(await hardhatReferralSystem.hasInviter(account2.address)).to.equal(
      true
    );
  });

  it("Try set null address as inviter", async function () {
    const [owner, account2] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await expectThrowsAsync(() =>
      hardhatReferralSystem.setInvitation(
        "0x0000000000000000000000000000000000000000",
        account2.address
      )
    );
  });

  it("Try set contract address as inviter", async function () {
    const [owner, account2] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await expectThrowsAsync(() =>
      hardhatReferralSystem.setInvitation(
        hardhatReferralSystem.address,
        account2.address
      )
    );
  });

  it("Try set contract address as invitee", async function () {
    const [owner, account2] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await expectThrowsAsync(() =>
      hardhatReferralSystem.setInvitation(
        owner.address,
        "0x0000000000000000000000000000000000000000"
      )
    );
  });

  it("Try set null address as invitee", async function () {
    const [owner, account2] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await expectThrowsAsync(() =>
      hardhatReferralSystem.setInvitation(
        owner.address,
        hardhatReferralSystem.address
      )
    );
  });

  it("Try valid invitation", async function () {
    const [owner, account2] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    hardhatReferralSystem.setInvitation(owner.address, account2.address);

    expect(await hardhatReferralSystem.inviter(account2.address)).to.equal(
      owner.address
    );
    expect(await hardhatReferralSystem.inviter(owner.address)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("Try valid multiple invitations", async function () {
    const [owner, account2, account3] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    hardhatReferralSystem.setInvitation(owner.address, account2.address);
    hardhatReferralSystem.setInvitation(account2.address, account3.address);
    expect(await hardhatReferralSystem.inviter(owner.address)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await hardhatReferralSystem.inviter(account2.address)).to.equal(
      owner.address
    );
    expect(await hardhatReferralSystem.inviter(account3.address)).to.equal(
      account2.address
    );
  });

  it("Try getting refInfo after one invitation", async function () {
    const [owner, account2, account3] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(20);
    await hardhatReferralSystem.setInvitation(owner.address, account2.address);

    let ownerRefInfo = await hardhatReferralSystem.getRefInfo(owner.address);
    let account2refInfo = await hardhatReferralSystem.getRefInfo(
      account2.address
    );

    expect(await hardhatReferralSystem.inviter(owner.address)).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await hardhatReferralSystem.inviter(account2.address)).to.equal(
      owner.address
    );
    expect(ownerRefInfo.length).to.equal(0);

    expect(account2refInfo.length).to.equal(1);
    expect(account2refInfo[0]["percentage"].toNumber()).to.equal(20);
    expect(account2refInfo[0]["account"].toString()).to.equal(owner.address);
  });

  it("Try getting refInfo after two invitation with one level", async function () {
    const [owner, account2, account3] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    hardhatReferralSystem.setInvitation(owner.address, account2.address);
    hardhatReferralSystem.setInvitation(account2.address, account3.address);

    await hardhatReferralSystem.addLevel(9);
    let ownerRefInfo = await hardhatReferralSystem.getRefInfo(owner.address);
    let account2RefInfo = await hardhatReferralSystem.getRefInfo(
      account2.address
    );
    let account3RefInfo = await hardhatReferralSystem.getRefInfo(
      account3.address
    );

    expect(ownerRefInfo.length).to.equal(0);

    expect(account2RefInfo.length).to.equal(1);
    expect(account2RefInfo[0]["percentage"].toNumber()).to.equal(9);
    expect(account2RefInfo[0]["account"].toString()).to.equal(owner.address);

    expect(account3RefInfo.length).to.equal(1);
    expect(account3RefInfo[0]["percentage"].toNumber()).to.equal(9);
    expect(account3RefInfo[0]["account"].toString()).to.equal(account2.address);
  });

  it("Try getting refInfo after two invitation with two level", async function () {
    const [owner, account2, account3] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");

    const hardhatReferralSystem = await referralSystem.deploy();

    hardhatReferralSystem.setInvitation(owner.address, account2.address);
    hardhatReferralSystem.setInvitation(account2.address, account3.address);

    await hardhatReferralSystem.addLevel(10);
    await hardhatReferralSystem.addLevel(4);
    let ownerRefInfo = await hardhatReferralSystem.getRefInfo(owner.address);
    let account2RefInfo = await hardhatReferralSystem.getRefInfo(
      account2.address
    );
    let account3RefInfo = await hardhatReferralSystem.getRefInfo(
      account3.address
    );

    expect(ownerRefInfo.length).to.equal(0);

    expect(account2RefInfo.length).to.equal(1);
    expect(account2RefInfo[0]["percentage"].toNumber()).to.equal(10);
    expect(account2RefInfo[0]["account"].toString()).to.equal(owner.address);

    expect(account3RefInfo.length).to.equal(2);
    expect(account3RefInfo[0]["percentage"].toNumber()).to.equal(10);
    expect(account3RefInfo[0]["account"].toString()).to.equal(account2.address);
    expect(account3RefInfo[1]["percentage"].toNumber()).to.equal(4);
    expect(account3RefInfo[1]["account"].toString()).to.equal(owner.address);
  });

  /**
   * Emulates and verifies the following accounts structure:
   *
   *  └── a1/
   *      └── a2/
   *          ├── a3/
   *          │   ├── a4
   *          │   └── a5/
   *          │       └── a8
   *          └── a6/
   *              └── a7
   */
  it("Try getting refInfo after multiple invitation with multiple levels", async function () {
    const [a1, a2, a3, a4, a5, a6, a7, a8] = await ethers.getSigners();
    const referralSystem = await ethers.getContractFactory("ReferralSystem");
    const hardhatReferralSystem = await referralSystem.deploy();

    await hardhatReferralSystem.addLevel(8);
    await hardhatReferralSystem.addLevel(3);
    await hardhatReferralSystem.addLevel(1);

    await hardhatReferralSystem.setInvitation(a1.address, a2.address);
    await hardhatReferralSystem.setInvitation(a2.address, a3.address);
    await hardhatReferralSystem.setInvitation(a3.address, a4.address);
    await hardhatReferralSystem.setInvitation(a3.address, a5.address);
    await hardhatReferralSystem.setInvitation(a5.address, a8.address);
    await hardhatReferralSystem.setInvitation(a2.address, a6.address);
    await hardhatReferralSystem.setInvitation(a6.address, a7.address);

    let a1Ref = await hardhatReferralSystem.getRefInfo(a1.address);
    let a2Ref = await hardhatReferralSystem.getRefInfo(a2.address);
    let a3Ref = await hardhatReferralSystem.getRefInfo(a3.address);
    let a4Ref = await hardhatReferralSystem.getRefInfo(a4.address);
    let a5Ref = await hardhatReferralSystem.getRefInfo(a5.address);
    let a6Ref = await hardhatReferralSystem.getRefInfo(a6.address);
    let a7Ref = await hardhatReferralSystem.getRefInfo(a7.address);
    let a8Ref = await hardhatReferralSystem.getRefInfo(a8.address);

    expect(a1Ref.length).to.equal(0);

    expect(a2Ref.length).to.equal(1);
    expect(a2Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a2Ref[0]["account"].toString()).to.equal(a1.address);

    expect(a3Ref.length).to.equal(2);
    expect(a3Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a3Ref[0]["account"].toString()).to.equal(a2.address);
    expect(a3Ref[1]["percentage"].toNumber()).to.equal(3);
    expect(a3Ref[1]["account"].toString()).to.equal(a1.address);

    expect(a4Ref.length).to.equal(3);
    expect(a4Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a4Ref[0]["account"].toString()).to.equal(a3.address);
    expect(a4Ref[1]["percentage"].toNumber()).to.equal(3);
    expect(a4Ref[1]["account"].toString()).to.equal(a2.address);
    expect(a4Ref[2]["percentage"].toNumber()).to.equal(1);
    expect(a4Ref[2]["account"].toString()).to.equal(a1.address);

    expect(a5Ref.length).to.equal(3);
    expect(a5Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a5Ref[0]["account"].toString()).to.equal(a3.address);
    expect(a5Ref[1]["percentage"].toNumber()).to.equal(3);
    expect(a5Ref[1]["account"].toString()).to.equal(a2.address);
    expect(a5Ref[2]["percentage"].toNumber()).to.equal(1);
    expect(a5Ref[2]["account"].toString()).to.equal(a1.address);

    expect(a6Ref.length).to.equal(2);
    expect(a6Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a6Ref[0]["account"].toString()).to.equal(a2.address);
    expect(a6Ref[1]["percentage"].toNumber()).to.equal(3);
    expect(a6Ref[1]["account"].toString()).to.equal(a1.address);

    expect(a7Ref.length).to.equal(3);
    expect(a7Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a7Ref[0]["account"].toString()).to.equal(a6.address);
    expect(a7Ref[1]["percentage"].toNumber()).to.equal(3);
    expect(a7Ref[1]["account"].toString()).to.equal(a2.address);
    expect(a7Ref[2]["percentage"].toNumber()).to.equal(1);
    expect(a7Ref[2]["account"].toString()).to.equal(a1.address);

    expect(a8Ref.length).to.equal(3);
    expect(a8Ref[0]["percentage"].toNumber()).to.equal(8);
    expect(a8Ref[0]["account"].toString()).to.equal(a5.address);
    expect(a8Ref[1]["percentage"].toNumber()).to.equal(3);
    expect(a8Ref[1]["account"].toString()).to.equal(a3.address);
    expect(a8Ref[2]["percentage"].toNumber()).to.equal(1);
    expect(a8Ref[2]["account"].toString()).to.equal(a2.address);
  });
});
