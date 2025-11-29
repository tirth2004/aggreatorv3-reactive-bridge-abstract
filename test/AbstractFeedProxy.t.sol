// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AbstractFeedProxy} from "../src/destination/AbstractFeedProxy.sol";
import {AggregatorV3Interface} from "../src/interfaces/AggregatorV3Interface.sol";

contract AbstractFeedProxyTest is Test {
    AbstractFeedProxy public feedProxy;
    address public sourceFeed;
    address public callbackProxy;
    uint8 public decimals = 8;
    string public description = "ETH / USD";
    uint256 public version = 1;

    function setUp() public {
        sourceFeed = address(0x1111);
        callbackProxy = address(0x2222);

        feedProxy = new AbstractFeedProxy(sourceFeed, callbackProxy, decimals, description, version);
    }

    function test_Constructor() public {
        assertEq(feedProxy.sourceFeed(), sourceFeed);
        assertEq(feedProxy.callbackProxy(), callbackProxy);
        assertEq(feedProxy.decimals(), decimals);
        assertEq(feedProxy.description(), description);
        assertEq(feedProxy.version(), version);
    }

    function test_UpdateFromBridge_Success() public {
        address rvmId = address(0x3333);
        uint80 roundId = 1;
        int256 answer = 2000e8; // $2000 with 8 decimals
        uint256 startedAt = 1000;
        uint256 updatedAt = 1100;
        uint80 answeredInRound = 1;

        vm.prank(callbackProxy);
        feedProxy.updateFromBridge(rvmId, roundId, answer, startedAt, updatedAt, answeredInRound);

        assertEq(feedProxy.latestRoundId(), roundId);

        (uint80 rId, int256 ans, uint256 sAt, uint256 uAt, uint80 aInRound) = feedProxy.getRoundData(roundId);

        assertEq(rId, roundId);
        assertEq(ans, answer);
        assertEq(sAt, startedAt);
        assertEq(uAt, updatedAt);
        assertEq(aInRound, answeredInRound);
    }

    function test_UpdateFromBridge_UpdatesLatestRoundId() public {
        uint80 roundId1 = 1;
        uint80 roundId2 = 2;
        int256 answer = 2000e8;
        uint256 timestamp = block.timestamp;

        vm.startPrank(callbackProxy);

        feedProxy.updateFromBridge(address(0), roundId1, answer, timestamp, timestamp, roundId1);

        assertEq(feedProxy.latestRoundId(), roundId1);

        feedProxy.updateFromBridge(address(0), roundId2, answer, timestamp, timestamp, roundId2);

        assertEq(feedProxy.latestRoundId(), roundId2);

        vm.stopPrank();
    }

    function test_UpdateFromBridge_EmitsEvents() public {
        address rvmId = address(0x3333);
        uint80 roundId = 1;
        int256 answer = 2000e8;
        uint256 startedAt = 1000;
        uint256 updatedAt = 1100;
        uint80 answeredInRound = 1;

        vm.prank(callbackProxy);

        vm.expectEmit(true, true, true, true);
        emit AbstractFeedProxy.BridgeUpdateReceived(rvmId, roundId, answer, startedAt, updatedAt, answeredInRound);

        vm.expectEmit(true, true, true, true);
        emit AbstractFeedProxy.LatestRoundSynced(roundId, answer, updatedAt);

        feedProxy.updateFromBridge(rvmId, roundId, answer, startedAt, updatedAt, answeredInRound);
    }

    function test_UpdateFromBridge_RevertsOnZeroTimestamp() public {
        vm.prank(callbackProxy);

        vm.expectRevert("AbstractFeedProxy: bad timestamp");
        feedProxy.updateFromBridge(
            address(0),
            1,
            2000e8,
            block.timestamp,
            0, // zero updatedAt
            1
        );
    }

    function test_GetRoundData_Success() public {
        uint80 roundId = 1;
        int256 answer = 2000e8;
        uint256 startedAt = 1000;
        uint256 updatedAt = 1100;
        uint80 answeredInRound = 1;

        vm.prank(callbackProxy);
        feedProxy.updateFromBridge(address(0), roundId, answer, startedAt, updatedAt, answeredInRound);

        (uint80 rId, int256 ans, uint256 sAt, uint256 uAt, uint80 aInRound) = feedProxy.getRoundData(roundId);

        assertEq(rId, roundId);
        assertEq(ans, answer);
        assertEq(sAt, startedAt);
        assertEq(uAt, updatedAt);
        assertEq(aInRound, answeredInRound);
    }

    function test_GetRoundData_RevertsOnNonExistentRound() public {
        vm.expectRevert(AbstractFeedProxy.NoDataPresent.selector);
        feedProxy.getRoundData(999);
    }

    function test_LatestRoundData_Success() public {
        uint80 roundId = 5;
        int256 answer = 2500e8;
        uint256 timestamp = block.timestamp;

        vm.prank(callbackProxy);
        feedProxy.updateFromBridge(address(0), roundId, answer, timestamp, timestamp, roundId);

        (uint80 rId, int256 ans, uint256 sAt, uint256 uAt, uint80 aInRound) = feedProxy.latestRoundData();

        assertEq(rId, roundId);
        assertEq(ans, answer);
        assertEq(sAt, timestamp);
        assertEq(uAt, timestamp);
        assertEq(aInRound, roundId);
    }

    function test_LatestRoundData_RevertsWhenNoData() public {
        // Create a new proxy without any updates
        AbstractFeedProxy newProxy = new AbstractFeedProxy(sourceFeed, callbackProxy, decimals, description, version);

        vm.expectRevert(AbstractFeedProxy.NoDataPresent.selector);
        newProxy.latestRoundData();
    }

    function test_GetConfig() public {
        (address _sourceFeed, address _callbackProxy, uint8 _decimals, string memory _description, uint256 _version) =
            feedProxy.getConfig();

        assertEq(_sourceFeed, sourceFeed);
        assertEq(_callbackProxy, callbackProxy);
        assertEq(_decimals, decimals);
        assertEq(_description, description);
        assertEq(_version, version);
    }

    function test_MultipleRounds() public {
        vm.startPrank(callbackProxy);

        // Update multiple rounds
        for (uint80 i = 1; i <= 10; i++) {
            feedProxy.updateFromBridge(
                address(0), i, int256(uint256(i) * 100e8), 1000 + uint256(i), 1100 + uint256(i), i
            );
        }

        // Verify latest is round 10
        (uint80 latestRoundId,,,,) = feedProxy.latestRoundData();
        assertEq(latestRoundId, 10);

        // Verify we can read any round
        for (uint80 i = 1; i <= 10; i++) {
            (, int256 answer,,,) = feedProxy.getRoundData(i);
            assertEq(answer, int256(uint256(i) * 100e8));
        }

        vm.stopPrank();
    }

    function test_ImplementsAggregatorV3Interface() public {
        // Verify the contract implements the interface
        assertTrue(feedProxy.decimals() == decimals);
        assertTrue(keccak256(bytes(feedProxy.description())) == keccak256(bytes(description)));
        assertTrue(feedProxy.version() == version);
    }
}
