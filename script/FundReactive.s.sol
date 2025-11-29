// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

contract FundReactive is Script {
    function run() external {
        // ENV:
        // REACTIVE_PRIVATE_KEY
        // REACTIVE_CONTRACT_ADDR
        // SYSTEM_CONTRACT_ADDR (0x...fffFfF on Lasna)
        // FUND_AMOUNT_WEI (e.g. 1000000000000000 for 0.001)

        uint256 pk = vm.envUint("REACTIVE_PRIVATE_KEY");
        address systemContract = vm.envAddress("SYSTEM_CONTRACT_ADDR");
        address reactive = vm.envAddress("REACTIVE_CONTRACT_ADDR");

        uint256 amount = vm.envUint("FUND_AMOUNT_WEI");

        vm.startBroadcast(pk);

        // depositTo(address) payable
        (bool ok,) = systemContract.call{value: amount}(abi.encodeWithSignature("depositTo(address)", reactive));
        require(ok, "depositTo failed");

        vm.stopBroadcast();
    }
}
