// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

contract FundCallbackProxy is Script {
    function run() external {
        // ENV:
        // DESTINATION_PRIVATE_KEY
        // CALLBACK_PROXY_ADDR
        // DESTINATION_FEED   (AbstractFeedProxy)
        // FUND_AMOUNT_WEI

        uint256 pk = vm.envUint("DESTINATION_PRIVATE_KEY");
        address callbackProxy = vm.envAddress("CALLBACK_PROXY_ADDR");
        address destinationFeed = vm.envAddress("DESTINATION_FEED");
        uint256 amount = vm.envUint("FUND_AMOUNT_WEI");

        vm.startBroadcast(pk);

        // depositTo(address) payable
        (bool ok,) = callbackProxy.call{value: amount}(abi.encodeWithSignature("depositTo(address)", destinationFeed));
        require(ok, "depositTo failed");

        vm.stopBroadcast();
    }
}
