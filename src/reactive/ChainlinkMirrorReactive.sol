// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "reactive-lib/interfaces/IReactive.sol";
import "reactive-lib/abstract-base/AbstractReactive.sol";

import {AggregatorV3Interface} from "../interfaces/AggregatorV3Interface.sol";

contract ChainlinkMirrorReactive is IReactive, AbstractReactive {
    // Base mainnet chain id
    uint256 private constant ORIGIN_CHAIN_ID = 11155111;

    // keccak256("AnswerUpdated(int256,uint256,uint256)")
    uint256 private constant ANSWER_UPDATED_TOPIC_0 =
        0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;

    uint64 private constant CALLBACK_GAS_LIMIT = 200000;

    address public immutable originFeed;
    uint256 public immutable destinationChainId;
    address public immutable destinationFeed;

    uint80 public lastMirroredRoundId;

    event Subscribed(
        address indexed service,
        uint256 indexed chainId,
        address indexed feed
    );

    event NewRoundSeen(
        uint80 indexed roundId,
        int256 answer,
        uint256 updatedAt
    );

    constructor(
        address _originFeed,
        uint256 _destinationChainId,
        address _destinationFeed
    ) payable {
        originFeed = _originFeed;
        destinationChainId = _destinationChainId;
        destinationFeed = _destinationFeed;

        // Only the RN copy (not ReactVM) should subscribe
        if (!vm) {
            service.subscribe(
                ORIGIN_CHAIN_ID,
                _originFeed,
                ANSWER_UPDATED_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );

            emit Subscribed(address(service), ORIGIN_CHAIN_ID, _originFeed);
        }
    }

    // you can optionally add `vmOnly` if AbstractReactive exposes it:
    // function react(LogRecord calldata log) external override vmOnly {
    function react(LogRecord calldata log) external override {
        // Only process logs from our origin feed + topic
        if (
            log.chain_id != ORIGIN_CHAIN_ID ||
            log._contract != originFeed ||
            log.topic_0 != ANSWER_UPDATED_TOPIC_0
        ) {
            return;
        }

        // For now: just prove we saw something
        lastMirroredRoundId = lastMirroredRoundId + 1;

        emit NewRoundSeen(lastMirroredRoundId, 0, 0);
    }
}
