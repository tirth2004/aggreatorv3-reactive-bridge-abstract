// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {ChainlinkMirrorReactive} from "../src/reactive/ChainlinkMirrorReactive.sol";

contract DeployChainlinkMirrorReactive is Script {
    function run() external {
        // ---- env vars you set in .env ----
        // ORIGIN_FEED          = source Chainlink feed address (same as above)
        // ORIGIN_CHAIN_ID      = e.g. 84532 / 11155111 / 42161 etc.
        // DESTINATION_CHAIN_ID = MUST be 11155111 for now (Sepolia)
        // DESTINATION_FEED     = AbstractFeedProxy address you just deployed
        // REACTIVE_PRIVATE_KEY = pk on Lasna

        uint256 deployerKey = vm.envUint("REACTIVE_PRIVATE_KEY");

        address originFeed = vm.envAddress("ORIGIN_FEED");
        uint256 originChainId = vm.envUint("ORIGIN_CHAIN_ID");
        uint256 destinationChainId = vm.envUint("DESTINATION_CHAIN_ID");
        address destinationFeed = vm.envAddress("DESTINATION_FEED");

        vm.startBroadcast(deployerKey);

        ChainlinkMirrorReactive rc = new ChainlinkMirrorReactive(
            originFeed,
            originChainId,
            destinationChainId,
            destinationFeed
        );

        vm.stopBroadcast();

        console2.log("ChainlinkMirrorReactive deployed at:", address(rc));
    }
}
