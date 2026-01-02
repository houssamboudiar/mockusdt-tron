const MockUSDT = artifacts.require("MockUSDT");

contract("MockUSDT", accounts => {
  let token;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    token = await MockUSDT.new({ from: owner });
  });

  describe("Token Properties", () => {
    it("should have correct name", async () => {
      const name = await token.name();
      assert.equal(name, "Tether USD");
    });

    it("should have correct symbol", async () => {
      const symbol = await token.symbol();
      assert.equal(symbol, "USDT");
    });

    it("should have 6 decimals", async () => {
      const decimals = await token.decimals();
      assert.equal(decimals, 6);
    });

    it("should have correct total supply", async () => {
      const totalSupply = await token.totalSupply();
      const expectedSupply = 1000000000 * Math.pow(10, 6); // 1 billion tokens with 6 decimals
      assert.equal(totalSupply.toString(), expectedSupply.toString());
    });

    it("should assign initial supply to owner", async () => {
      const ownerBalance = await token.balanceOf(owner);
      const totalSupply = await token.totalSupply();
      assert.equal(ownerBalance.toString(), totalSupply.toString());
    });
  });

  describe("Transfers", () => {
    it("should transfer tokens correctly", async () => {
      const amount = 1000000; // 1 USDT
      
      await token.transfer(user1, amount, { from: owner });
      
      const user1Balance = await token.balanceOf(user1);
      assert.equal(user1Balance.toString(), amount.toString());
    });

    it("should handle approve and transferFrom", async () => {
      const amount = 1000000; // 1 USDT
      
      await token.approve(user1, amount, { from: owner });
      const allowance = await token.allowance(owner, user1);
      assert.equal(allowance.toString(), amount.toString());
      
      await token.transferFrom(owner, user2, amount, { from: user1 });
      const user2Balance = await token.balanceOf(user2);
      assert.equal(user2Balance.toString(), amount.toString());
    });
  });

  describe("Owner Functions", () => {
    it("should allow owner to mint", async () => {
      const mintAmount = 1000000000; // 1000 USDT
      const initialBalance = await token.balanceOf(user1);
      
      await token.mint(user1, mintAmount, { from: owner });
      
      const finalBalance = await token.balanceOf(user1);
      const expectedBalance = parseInt(initialBalance) + mintAmount;
      assert.equal(finalBalance.toString(), expectedBalance.toString());
    });

    it("should allow owner to burn", async () => {
      const burnAmount = 1000000000; // 1000 USDT
      const initialBalance = await token.balanceOf(owner);
      
      await token.burn(burnAmount, { from: owner });
      
      const finalBalance = await token.balanceOf(owner);
      const expectedBalance = parseInt(initialBalance) - burnAmount;
      assert.equal(finalBalance.toString(), expectedBalance.toString());
    });

    it("should not allow non-owner to mint", async () => {
      try {
        await token.mint(user1, 1000000, { from: user1 });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Only owner can call this function"));
      }
    });
  });
});