# Backend Server

## Overview

The backend server is an Express.js application that orchestrates the deployment and funding of cross-chain oracle bridges. It acts as an intermediary between the frontend UI and the blockchain, executing Foundry commands to deploy contracts and send transactions.

The server handles:
- Bridge creation by deploying contracts on destination chains and Reactive Network
- Contract funding operations for both Reactive contracts and destination callback proxies
- Chainlink feed introspection to extract metadata (decimals, description)

## Tech Stack

- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing middleware
- **dotenv**: Environment variable management
- **Foundry/Cast**: Blockchain interaction via command-line tools

## Installation

Install dependencies:
```bash
npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (one level up from `server/`) with the following variables:

**Required:**
- `DESTINATION_RPC`: RPC URL for the destination chain (Eth-Sepolia)
- `DESTINATION_PRIVATE_KEY`: Private key for deploying and funding on destination chain
- `CALLBACK_PROXY_ADDR`: Reactive callback proxy address on the destination chain
- `REACTIVE_RPC`: RPC URL for Reactive Network (Lasna)
- `REACTIVE_PRIVATE_KEY`: Private key for deploying and funding on Reactive Network

**Optional:**
- `REACTIVE_SYSTEM_CONTRACT`: System contract address on Reactive Network (defaults to `0x0000000000000000000000000000000000fffFfF`)

Example `.env` file:
```
DESTINATION_RPC=https://sepolia.infura.io/v3/YOUR_KEY
DESTINATION_PRIVATE_KEY=0x...
CALLBACK_PROXY_ADDR=0x...
REACTIVE_RPC=https://lasna.reactive.network
REACTIVE_PRIVATE_KEY=0x...
REACTIVE_SYSTEM_CONTRACT=0x0000000000000000000000000000000000fffFfF
```

## Running the Server

Start the server:
```bash
node server.js
```

The server will start on port 3001 and log:
```
Backend listening on http://localhost:3001
```

## API Endpoints

### POST /api/bridges

Creates a new oracle bridge by deploying both the destination feed proxy and the Reactive contract.

**Request Body:**
```json
{
  "originChainId": 84532,
  "originFeed": "0x...",
  "originRpc": "https://..."
}
```

**Response:**
```json
{
  "originChainId": 84532,
  "originFeed": "0x...",
  "originRpc": "https://...",
  "destinationChainId": 11155111,
  "destinationFeed": "0x...",
  "reactiveAddress": "0x...",
  "feedDecimals": 8,
  "feedDescription": "ETH / USD"
}
```

**Process:**
1. Introspects the origin Chainlink feed to get `decimals()` and `description()`
2. Deploys `AbstractFeedProxy` to the destination chain using `forge script`
3. Reads the deployed address from the broadcast JSON file
4. Deploys `ChainlinkMirrorReactive` to Reactive Network using `forge create`
5. Extracts the Reactive contract address from the deployment output
6. Returns all deployment information

**Error Responses:**
- `400`: Missing required fields (`originChainId`, `originFeed`, `originRpc`)
- `500`: Missing environment variables or deployment failure

### POST /api/fund/reactive

Funds a Reactive contract on Lasna by sending ETH to the system contract's `depositTo(address)` function.

**Request Body:**
```json
{
  "rcAddress": "0x...",
  "amountEth": "0.01"
}
```

**Response:**
```json
{
  "rcAddress": "0x...",
  "amountEth": "0.01",
  "txHash": "0x...",
  "raw": "..."
}
```

**Process:**
1. Validates `rcAddress` and `amountEth` are provided
2. Constructs a `cast send` command to call `depositTo(address)` on the system contract
3. Sends the specified amount of ETH to fund the Reactive contract
4. Extracts and returns the transaction hash

**Error Responses:**
- `400`: Missing `rcAddress` or `amountEth`
- `500`: Missing environment variables or transaction failure

### POST /api/fund/destination

Funds the destination callback proxy by sending ETH to the callback proxy's `depositTo(address)` function.

**Request Body:**
```json
{
  "feedAddress": "0x...",
  "amountEth": "0.001"
}
```

**Response:**
```json
{
  "feedAddress": "0x...",
  "amountEth": "0.001",
  "txHash": "0x...",
  "raw": "..."
}
```

**Process:**
1. Validates `feedAddress` and `amountEth` are provided
2. Constructs a `cast send` command to call `depositTo(address)` on the callback proxy
3. Sends the specified amount of ETH to fund the destination feed proxy
4. Extracts and returns the transaction hash

**Error Responses:**
- `400`: Missing `feedAddress` or `amountEth`
- `500`: Missing environment variables or transaction failure

## Implementation Details

### Helper Functions

**`run(cmd, env = {})`**

Promisified wrapper around Node's `child_process.exec`. Executes shell commands with:
- Working directory set to the project root
- Environment variables merged with process.env
- Logging of command, stdout, and stderr
- Error handling and rejection on failure

**`castCall(contract, sig, rpcUrl)`**

Helper function to read contract state using Foundry's `cast call`. Used to introspect Chainlink feeds for metadata.

**`extractTxHash(stdout)`**

Extracts transaction hash from `cast send` output by parsing the stdout for the `transactionHash` field.

### Deployment Flow

**Destination Feed Proxy Deployment:**
1. Sets environment variables for the Foundry script
2. Executes `forge script script/DeployAbstractFeedProxy.s.sol:DeployAbstractFeedProxy`
3. Reads the deployed contract address from `broadcast/DeployAbstractFeedProxy.s.sol/{chainId}/run-latest.json`
4. Finds the transaction with a `contractAddress` field

**Reactive Contract Deployment:**
1. Constructs `forge create` command with constructor arguments
2. Executes the command on Reactive Network
3. Parses stdout for "Deployed to: 0x..." pattern to extract address

### Funding Operations

Both funding endpoints use `cast send` to execute transactions:
- `--value {amount}ether`: Specifies the amount of ETH to send
- `--rpc-url {url}`: Target chain RPC endpoint
- `--private-key {key}`: Private key for signing transactions

The transaction hash is extracted from the command output for tracking.

## Dependencies

- **express**: Web server framework
- **cors**: Enable CORS for frontend requests
- **dotenv**: Load environment variables from `.env` file

## Prerequisites

- **Foundry**: Must be installed and available in PATH
- **Node.js**: Version 14 or higher
- **Access to RPC endpoints**: For destination chain and Reactive Network
- **Private keys**: For signing deployment and funding transactions

## Troubleshooting

**Server fails to start:**
- Check that port 3001 is not already in use
- Verify Node.js is installed: `node --version`

**Deployment failures:**
- Ensure Foundry is installed: `forge --version`
- Check that all required environment variables are set
- Verify RPC endpoints are accessible
- Confirm private keys have sufficient balance

**"Missing env vars" error:**
- Verify `.env` file exists in the project root (not in `server/`)
- Check that all required variables are set
- Ensure no typos in variable names

**"No contractAddress found" error:**
- Check that the broadcast directory exists: `broadcast/DeployAbstractFeedProxy.s.sol/{chainId}/`
- Verify the deployment transaction succeeded on-chain
- Check Foundry logs for deployment errors

**Funding transaction failures:**
- Verify the account has sufficient balance
- Check that contract addresses are correct
- Ensure RPC endpoints are responding
- Review `cast send` output in server logs

**CORS errors:**
- The server enables CORS for all origins by default
- If issues persist, check that the frontend is using the correct API URL

## Logging

The server logs:
- All executed commands (`>> CMD:`)
- Command stdout (`>> STDOUT:`)
- Command stderr (`>> STDERR:`)
- Errors with stack traces

Enable more verbose logging by adding console.log statements or using a logging library.

## Security Considerations

- **Private Keys**: Never commit `.env` files or private keys to version control
- **CORS**: In production, restrict CORS to specific origins
- **Input Validation**: The server performs basic validation but additional checks may be needed
- **Rate Limiting**: Consider adding rate limiting for production deployments
- **Error Messages**: Avoid exposing sensitive information in error responses

## Future Improvements

- Add request validation middleware
- Implement rate limiting
- Add structured logging (e.g., Winston)
- Create health check endpoint
- Add metrics and monitoring
- Support for multiple destination chains
- Batch funding operations
- Transaction status polling

