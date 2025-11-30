// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "../interfaces/AggregatorV3Interface.sol";

/// @title AbstractFeedProxy
/// @notice Chainlink-style price feed on Abstract, updated only by the
///         Reactive callback proxy. Compatible with AggregatorV3Interface.
contract AbstractFeedProxy is AggregatorV3Interface {
    struct RoundData {
        int256 answer;
        uint256 startedAt;
        uint256 updatedAt;
        uint80 answeredInRound;
        bool initialized;
    }

    event BridgeUpdateReceived(
        address indexed rvmId,
        uint80 indexed roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );

    event LatestRoundSynced(
        uint80 indexed roundId,
        int256 answer,
        uint256 updatedAt
    );

    /// @notice decimals of the price feed (e.g. 8 for ETH/USD)
    uint8 public immutable override decimals;

    /// @notice human-readable description (e.g. "ETH / USD")
    string public override description;

    /// @notice version number you choose (just to match interface)
    uint256 public immutable override version;

    /// @notice Original Chainlink feed on Sepolia/Base we mirror from
    address public immutable sourceFeed;

    /// @notice Reactive callback proxy on Abstract (the only allowed caller)
    address public immutable callbackProxy;

    /// @notice last round id that was written
    uint80 public latestRoundId;

    // dev-key-EOA
    address public constant authorizedRvmId =
        0x7a9B05C27b9D5e3D1E463956991ef7AbB24F309D;

    /// @dev stored round data
    mapping(uint80 => RoundData) private rounds;

    modifier onlyAuthorizedRvm(address rvmId) {
        require(rvmId == authorizedRvmId, "AbstractFeedProxy: bad rvmId");
        _;
    }

    error NoDataPresent();

    constructor(
        address _sourceFeed, // 0x57d2... on Sepolia/Base
        address _callbackProxy, // provided by Reactive docs for Abstract
        uint8 _decimals,
        string memory _description,
        uint256 _version
    ) {
        sourceFeed = _sourceFeed;
        callbackProxy = _callbackProxy;
        decimals = _decimals;
        description = _description;
        version = _version;
    }

    // -----------------------------------------------------------------------
    //  Called from Reactive callback
    // -----------------------------------------------------------------------

    /// @notice Updates feed values from Reactive bridge.
    /// @dev Only the Reactive callback proxy may call this.
    function updateFromBridge(
        address rvmId,
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) external onlyAuthorizedRvm(rvmId) {
        require(updatedAt != 0, "AbstractFeedProxy: bad timestamp");

        latestRoundId = roundId;

        rounds[roundId] = RoundData({
            answer: answer,
            startedAt: startedAt,
            updatedAt: updatedAt,
            answeredInRound: answeredInRound,
            initialized: true
        });

        emit BridgeUpdateReceived(
            rvmId,
            roundId,
            answer,
            startedAt,
            updatedAt,
            answeredInRound
        );

        emit LatestRoundSynced(roundId, answer, updatedAt);
    }

    // -----------------------------------------------------------------------
    //  AggregatorV3Interface view functions
    // -----------------------------------------------------------------------

    function getRoundData(
        uint80 _roundId
    )
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        RoundData memory r = rounds[_roundId];
        if (!r.initialized) revert NoDataPresent();

        return (
            _roundId,
            r.answer,
            r.startedAt,
            r.updatedAt,
            r.answeredInRound
        );
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        uint80 _latest = latestRoundId;
        RoundData memory r = rounds[_latest];
        if (!r.initialized) revert NoDataPresent();

        return (_latest, r.answer, r.startedAt, r.updatedAt, r.answeredInRound);
    }

    function getConfig()
        external
        view
        returns (
            address _sourceFeed,
            address _callbackProxy,
            uint8 _decimals,
            string memory _description,
            uint256 _version
        )
    {
        return (sourceFeed, callbackProxy, decimals, description, version);
    }
}
