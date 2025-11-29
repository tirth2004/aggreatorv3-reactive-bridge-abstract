// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "reactive-lib/interfaces/IReactive.sol";
import "reactive-lib/abstract-base/AbstractReactive.sol";

import {AggregatorV3Interface} from "../interfaces/AggregatorV3Interface.sol";

interface IAbstractFeedProxy {
    function updateFromBridge(
        address rvmId,
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) external;
}

contract ChainlinkMirrorReactive is IReactive, AbstractReactive {
    // Sepolia mainnet chain id
    // uint256 private constant ORIGIN_CHAIN_ID = 84532;

    uint256 public immutable originChainId;

    // Testing on arbitrum for faster events
    // uint256 private constant ORIGIN_CHAIN_ID = 42161;

    // keccak256("AnswerUpdated(int256,uint256,uint256)")
    uint256 private constant ANSWER_UPDATED_TOPIC_0 =
        0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;

    uint64 private constant CALLBACK_GAS_LIMIT = 500000;

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
        uint256 _originChainId,
        uint256 _destinationChainId,
        address _destinationFeed
    ) payable {
        originFeed = _originFeed;
        originChainId = _originChainId;
        destinationChainId = _destinationChainId;
        destinationFeed = _destinationFeed;

        // Only the RN copy (not ReactVM) should subscribe
        if (!vm) {
            service.subscribe(
                originChainId,
                _originFeed,
                ANSWER_UPDATED_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );

            emit Subscribed(address(service), originChainId, _originFeed);
        }
    }

    // you can optionally add `vmOnly` if AbstractReactive exposes it:
    // function react(LogRecord calldata log) external override vmOnly {
    function react(LogRecord calldata log) external override {
        // Only process logs from our origin feed + topic
        if (
            log.chain_id != originChainId ||
            log._contract != originFeed ||
            log.topic_0 != ANSWER_UPDATED_TOPIC_0
        ) {
            return;
        }

        // event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 updatedAt);
        int256 answer = int256(log.topic_1); // indexed int256 current
        uint80 roundId = uint80(log.topic_2); // indexed uint256 roundId
        uint256 updatedAt = abi.decode(log.data, (uint256)); // non-indexed updatedA

        // simple approximation: startedAt = updatedAt, answeredInRound = roundId
        uint256 startedAt = updatedAt;
        uint80 answeredInRound = roundId;

        // keep some state in ReactVM for debugging
        lastMirroredRoundId = roundId;
        emit NewRoundSeen(roundId, answer, updatedAt);

        bytes memory payload = abi.encodeWithSelector(
            IAbstractFeedProxy.updateFromBridge.selector,
            address(0),
            roundId,
            answer,
            startedAt,
            updatedAt,
            answeredInRound
        );

        emit Callback(
            destinationChainId, // Abstract chain id (e.g. 2741)
            destinationFeed, // 0x30824dA79f07F1653beC0c9ecF35a665A0eCd170
            CALLBACK_GAS_LIMIT, // >= 100_000, we had 200_000
            payload
        );
    }

    function getConfig()
        external
        view
        returns (
            uint256 _originChainId,
            address _originFeed,
            uint256 _destinationChainId,
            address _destinationFeed,
            uint64 _callbackGasLimit
        )
    {
        return (
            originChainId,
            originFeed,
            destinationChainId,
            destinationFeed,
            CALLBACK_GAS_LIMIT
        );
    }
}
