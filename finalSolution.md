### Step - 1 Write contracts

### Step - 2 Write scripts

#### Deploy Abstract feed

```
forge script script/DeployAbstractFeedProxy.s.sol:DeployAbstractFeedProxy \
  --rpc-url "$DESTINATION_RPC" \
  --broadcast \
  --verify \
  --etherscan-api-key "$ETHERSCAN_API_KEY" \
  --chain sepolia

```

####  deploy the reactive contract

forge create src/reactive/ChainlinkMirrorReactive.sol:ChainlinkMirrorReactive \
  --rpc-url "$REACTIVE_RPC" \
  --private-key "$REACTIVE_PRIVATE_KEY" \
  --constructor-args "$ORIGIN_FEED" "$ORIGIN_CHAIN_ID" "$DESTINATION_CHAIN_ID" "$DESTINATION_FEED" \
  --broadcast