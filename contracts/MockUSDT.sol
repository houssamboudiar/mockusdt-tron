// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MockUSDT - Professional USDT-like TRC20 token
 * @dev Advanced features: pausable, blacklist, fee collection, detailed events
 */
contract MockUSDT {
    // Basic token info
    string public name = "Mock USDT";
    string public symbol = "MUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    
    // Roles
    address public owner;
    address public feeCollector;
    
    // State variables
    bool public paused = false;
    uint256 public transferFee = 0; // Fee in basis points (100 = 1%)
    
    // Mappings
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public feeExempt;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event Pause();
    event Unpause();
    event Blacklist(address indexed account);
    event Unblacklist(address indexed account);
    event FeeUpdate(uint256 oldFee, uint256 newFee);
    event FeeCollected(address indexed from, address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }

    constructor() {
        owner = msg.sender;
        feeCollector = msg.sender;
        totalSupply = 1000000000 * 10**decimals; // 1 billion tokens
        balanceOf[owner] = totalSupply;
        
        // Owner is exempt from fees
        feeExempt[owner] = true;
        
        emit Transfer(address(0), owner, totalSupply);
    }

    // Basic transfer function with fees and checks
    function transfer(address to, uint256 value) public 
        whenNotPaused 
        notBlacklisted(msg.sender) 
        notBlacklisted(to) 
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        uint256 fee = 0;
        uint256 transferAmount = value;
        
        // Calculate fee if not exempt
        if (!feeExempt[msg.sender] && transferFee > 0) {
            fee = (value * transferFee) / 10000;
            transferAmount = value - fee;
        }
        
        // Execute transfer
        balanceOf[msg.sender] -= value;
        balanceOf[to] += transferAmount;
        
        // Collect fee
        if (fee > 0) {
            balanceOf[feeCollector] += fee;
            emit FeeCollected(msg.sender, feeCollector, fee);
            emit Transfer(msg.sender, feeCollector, fee);
        }
        
        emit Transfer(msg.sender, to, transferAmount);
        return true;
    }

    function approve(address spender, uint256 value) public 
        whenNotPaused 
        notBlacklisted(msg.sender) 
        returns (bool) 
    {
        require(spender != address(0), "Cannot approve zero address");
        
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public 
        whenNotPaused 
        notBlacklisted(from) 
        notBlacklisted(to) 
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        uint256 fee = 0;
        uint256 transferAmount = value;
        
        // Calculate fee if not exempt
        if (!feeExempt[from] && transferFee > 0) {
            fee = (value * transferFee) / 10000;
            transferAmount = value - fee;
        }
        
        // Execute transfer
        balanceOf[from] -= value;
        balanceOf[to] += transferAmount;
        allowance[from][msg.sender] -= value;
        
        // Collect fee
        if (fee > 0) {
            balanceOf[feeCollector] += fee;
            emit FeeCollected(from, feeCollector, fee);
            emit Transfer(from, feeCollector, fee);
        }
        
        emit Transfer(from, to, transferAmount);
        return true;
    }

    // Owner functions
    function mint(address to, uint256 value) public onlyOwner returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        
        totalSupply += value;
        balanceOf[to] += value;
        emit Mint(to, value);
        emit Transfer(address(0), to, value);
        return true;
    }

    function burn(uint256 value) public onlyOwner returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance to burn");
        
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        emit Burn(msg.sender, value);
        emit Transfer(msg.sender, address(0), value);
        return true;
    }

    // Pause functions
    function pause() public onlyOwner {
        paused = true;
        emit Pause();
    }

    function unpause() public onlyOwner {
        paused = false;
        emit Unpause();
    }

    // Blacklist functions
    function addToBlacklist(address account) public onlyOwner {
        blacklisted[account] = true;
        emit Blacklist(account);
    }

    function removeFromBlacklist(address account) public onlyOwner {
        blacklisted[account] = false;
        emit Unblacklist(account);
    }

    // Fee functions
    function setTransferFee(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max 10%
        uint256 oldFee = transferFee;
        transferFee = newFee;
        emit FeeUpdate(oldFee, newFee);
    }

    function setFeeCollector(address newCollector) public onlyOwner {
        require(newCollector != address(0), "Fee collector cannot be zero address");
        feeCollector = newCollector;
    }

    function setFeeExempt(address account, bool exempt) public onlyOwner {
        feeExempt[account] = exempt;
    }

    // Ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) public onlyOwner {
        if (token == address(0)) {
            // Withdraw TRX
            payable(owner).transfer(amount);
        } else {
            // Withdraw other tokens (if any sent by mistake)
            MockUSDT(token).transfer(owner, amount);
        }
    }

    // View functions
    function getCirculatingSupply() public view returns (uint256) {
        return totalSupply - balanceOf[address(0)];
    }

    function isBlacklisted(address account) public view returns (bool) {
        return blacklisted[account];
    }

    function isFeeExempt(address account) public view returns (bool) {
        return feeExempt[account];
    }
}