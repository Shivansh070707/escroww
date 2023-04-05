//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract token is ERC20 {
    constructor() ERC20("S", "s") {
        _mint(msg.sender, 100 ether);
    }
}
