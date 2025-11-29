// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {AbstractFeedProxy} from "../src/destination/AbstractFeedProxy.sol";

contract DeployAbstractFeedProxy is Script {
    function run() external {
        // ---- env vars you set in .env ----
        // ORIGIN_FEED          = source Chainlink feed on Sepolia/Base/etc.
        // CALLBACK_PROXY_ADDR  = Reactive callback proxy on Sepolia
        // FEED_DECIMALS        = e.g. 8
        // FEED_DESCRIPTION     = e.g. "ETH / USD"
        // FEED_VERSION         = e.g. 1
        // DESTINATION_PRIVATE_KEY = pk for Sepolia deployer

        uint256 deployerKey = vm.envUint("DESTINATION_PRIVATE_KEY");

        address sourceFeed = vm.envAddress("ORIGIN_FEED");
        address callbackProxy = vm.envAddress("CALLBACK_PROXY_ADDR");
        uint8 decimals = uint8(vm.envUint("FEED_DECIMALS"));
        string memory description = vm.envString("FEED_DESCRIPTION");
        uint256 version = vm.envUint("FEED_VERSION");

        vm.startBroadcast(deployerKey);

        AbstractFeedProxy proxy = new AbstractFeedProxy(
            sourceFeed,
            callbackProxy,
            decimals,
            description,
            version
        );

        vm.stopBroadcast();

        console2.log("AbstractFeedProxy deployed at:", address(proxy));
    }
}
