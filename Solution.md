# Details about origin, RC and destination contracts

- Origin chain (Sepolia)
    contract to be monitored: 0x719E22E3D4b690E5d96cCb40619180B5427F14AE (ETH/USD Aggregator price feed )
    topic0: keccak256("AnswerUpdated(int256,uint256,uint256)")

- RC Contract (Reactive Lasna testnet)

- Destination Chain (Abstract)
    It does not have support for chainlink feeds. RC contract will now enable Abstract to use chainlink ETH/USD feeds 

# Steps followed to solve the problem

- Initialise foundry

```
forge init . --force
```

- Install dependencies 
```
forge install foundry-rs/forge-std --no-commit
forge install Reactive-Network/reactive-lib --no-commit
```

- Change foundry.toml for easier imports

```
[profile.default.remappings]
forge-std = "lib/forge-std/src"
reactive-lib = "lib/reactive-lib/src"
```

So now our imports look like: 
```
import "reactive-lib/abstract-base/AbstractReactive.sol";
import "reactive-lib/interfaces/IReactive.sol";
```

- forge create src/reactive/ChainlinkMirrorReactive.sol:ChainlinkMirrorReactive --broadcast --rpc-url "$REACTIVE_RPC" --private-key "$REACTIVE_PRIVATE_KEY" --constructor-args "$ORIGIN_FEED" "$DESTINATION_CHAIN_ID" "$DESTINATION_FEED" 


# Put foundry-zksync first (for Abstract)
export PATH="$HOME/.foundry/bin:$PATH"

# If you want standard Foundry, comment the above and uncomment:
# export PATH="/opt/homebrew/bin:$HOME/.foundry/bin:$PATH"

- forge create src/destination/AbstractFeedProxy.sol:AbstractFeedProxy --broadcast --rpc-url "$DESTINATION_RPC" --private-key "$DESTINATION_PRIVATE_KEY" --constructor-args "$SOURCE_FEED" "$CALLBACK_PROXY_ADDR" "$FEED_DECIMALS" "$FEED_DESCRIPTION" "$FEED_VERSION"

-- sending tokens to contracts
# 1. Basic metadata
cast call "$DESTINATION_FEED" "decimals()(uint8)" --rpc-url "$DESTINATION_RPC"
cast call "$DESTINATION_FEED" "description()(string)" --rpc-url "$DESTINATION_RPC"
cast call "$DESTINATION_FEED" "version()(uint256)" --rpc-url "$DESTINATION_RPC"

# 2. Config / wiring
cast call "$DESTINATION_FEED" "sourceFeed()(address)" --rpc-url "$DESTINATION_RPC"
cast call "$DESTINATION_FEED" "callbackProxy()(address)" --rpc-url "$DESTINATION_RPC"

# 3. Last round id
cast call "$DESTINATION_FEED" "latestRoundId()(uint80)" --rpc-url "$DESTINATION_RPC"

# 4. Specific round data
cast call "$DESTINATION_FEED" \
  "getRoundData(uint80)(uint80,int256,uint256,uint256,uint80)" \
  123456 \
  --rpc-url "$DESTINATION_RPC"

# 5. Latest round data
cast call "$DESTINATION_FEED" \
  "latestRoundData()(uint80,int256,uint256,uint256,uint80)" \
  --rpc-url "$DESTINATION_RPC"

cast send "$CALLBACK_PROXY_ADDR" \
  "depositTo(address)" "$DESTINATION_FEED" \
  --value 0.001ether \
  --rpc-url "$DESTINATION_RPC" \
  --private-key "$DESTINATION_PRIVATE_KEY"

  # Balance of the callback contract itself
cast balance "$DESTINATION_FEED" --rpc-url "$DESTINATION_RPC"

# Debt of the callback contract (as tracked by callback proxy)
cast call "$CALLBACK_PROXY_ADDR" "debts(address)(uint256)" "$DESTINATION_FEED" \
  --rpc-url "$DESTINATION_RPC"

# Reserves held by callback proxy for that contract
cast call "$CALLBACK_PROXY_ADDR" "reserves(address)(uint256)" "$DESTINATION_FEED" \
  --rpc-url "$DESTINATION_RPC" 

cast send "$SYSTEM_CONTRACT_ADDR" \
  "depositTo(address)" "$REACTIVE_RC_ADDR" \
  --value 0.01ether \
  --rpc-url "$REACTIVE_RPC" \
  --private-key "$REACTIVE_PRIVATE_KEY"

# Balance of RC in REACT
cast balance "$REACTIVE_RC_ADDR" --rpc-url "$REACTIVE_RPC"

# Debt recorded by system contract
cast call "$SYSTEM_CONTRACT_ADDR" "debts(address)(uint256)" "$REACTIVE_RC_ADDR" \
  --rpc-url "$REACTIVE_RPC" 

# Reserves for RC held by system contract
cast call "$SYSTEM_CONTRACT_ADDR" "reserves(address)(uint256)" "$REACTIVE_RC_ADDR" \
  --rpc-url "$REACTIVE_RPC"

DEPLOYED CONTRACT ON ABSTRACT: 0x30824dA79f07F1653beC0c9ecF35a665A0eCd170
DEPLOYED RC try-1
0xa7E456Bb9df184100AbCF044415F71103509e917 ( gives malformed callback error )

changed encode with selector to raw encode. 0x1d780EBC1f2dcD7722BC0965639CB97753050534

RESULTS: error 

// new abstractfeed proxy with abi update: 0xe9446100C10a6c44011a1ACce9eA4895d2b668f9
// new rc contract: 0x77c97FbD61D07fe6D1c6F5116c434A6bb7C0E40a

// new rc arbitrum contract: 0x0248CA48026d3aA4fc5CaA80693A84b30354c849

--------
All (origin, rc, dest) should either be all testnet or all mainnet

1. RC ( without dest update, to check firing): 0x28e7b8001C4d414a75d5E9d3a2D2fB073A9FB0A4