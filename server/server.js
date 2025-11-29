const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const REPO_ROOT = path.join(__dirname, "..");

// helper to promisify exec
function run(cmd, env = {}) {
  return new Promise((resolve, reject) => {
    console.log(">> CMD:", cmd);
    exec(
      cmd,
      {
        cwd: REPO_ROOT,
        env: { ...process.env, ...env },
      },
      (err, stdout, stderr) => {
        console.log(">> STDOUT:\n", stdout);
        if (stderr) console.log(">> STDERR:\n", stderr);

        if (err) {
          return reject(
            new Error((stderr || stdout || err.message).toString())
          );
        }
        resolve({ stdout, stderr });
      }
    );
  });
}

// tiny helper to read via cast
async function castCall(contract, sig, rpcUrl) {
  const cmd = `cast call ${contract} "${sig}" --rpc-url ${rpcUrl}`;
  const { stdout } = await run(cmd);
  return stdout.trim();
}

// POST /api/bridges -> deploy dest feed + RC
app.post("/api/bridges", async (req, res) => {
  try {
    const { originChainId, originFeed, originRpc } = req.body;

    if (!originChainId || !originFeed || !originRpc) {
      return res.status(400).json({
        error: "originChainId, originFeed, originRpc are required",
      });
    }

    // 1) Introspect origin feed (decimals + description)
    const decimalsRaw = await castCall(
      originFeed,
      "decimals()(uint8)",
      originRpc
    );
    const descriptionRaw = await castCall(
      originFeed,
      "description()(string)",
      originRpc
    );

    const feedDecimals = parseInt(decimalsRaw, 10);
    const feedDescription = descriptionRaw.replace(/^"|"$/g, ""); // strip quotes if any

    // 2) Load env for destination + reactive
    const destRpc = process.env.DESTINATION_RPC;
    const destPk = process.env.DESTINATION_PRIVATE_KEY;
    const callbackProxy = process.env.CALLBACK_PROXY_ADDR;
    const reactiveRpc = process.env.REACTIVE_RPC;
    const reactivePk = process.env.REACTIVE_PRIVATE_KEY;

    if (!destRpc || !destPk || !callbackProxy || !reactiveRpc || !reactivePk) {
      return res.status(500).json({
        error:
          "Missing env vars: need DESTINATION_RPC, DESTINATION_PRIVATE_KEY, CALLBACK_PROXY_ADDR, REACTIVE_RPC, REACTIVE_PRIVATE_KEY",
      });
    }

    const DEST_CHAIN_ID = 11155111; // Sepolia for destination
    const FEED_VERSION = 1;

    // 3) Deploy destination AbstractFeedProxy via forge script
    const scriptEnv = {
      ORIGIN_FEED: originFeed,
      CALLBACK_PROXY_ADDR: callbackProxy,
      FEED_DECIMALS: String(feedDecimals),
      FEED_DESCRIPTION: feedDescription,
      FEED_VERSION: String(FEED_VERSION),
      DESTINATION_PRIVATE_KEY: destPk,
    };

    const scriptCmd =
      "forge script script/DeployAbstractFeedProxy.s.sol:DeployAbstractFeedProxy " +
      `--rpc-url ${destRpc} ` +
      "--broadcast";

    await run(scriptCmd, scriptEnv);

    // read address from broadcast file
    const broadcastPath = path.join(
      REPO_ROOT,
      "broadcast",
      "DeployAbstractFeedProxy.s.sol",
      String(DEST_CHAIN_ID),
      "run-latest.json"
    );
    const broadcast = JSON.parse(fs.readFileSync(broadcastPath, "utf8"));
    const txs = broadcast.transactions || [];
    const destTx = [...txs].reverse().find((tx) => tx.contractAddress);
    if (!destTx) {
      throw new Error(
        "No contractAddress found in DeployAbstractFeedProxy broadcast"
      );
    }
    const destinationFeed = destTx.contractAddress;


    // 4) Deploy RC on Lasna via forge create (no env substitution in cmd)
    const createCmd = [
      "forge create src/reactive/ChainlinkMirrorReactive.sol:ChainlinkMirrorReactive",
      "--broadcast",
      `--rpc-url ${reactiveRpc}`,
      `--private-key ${reactivePk}`,
      "--constructor-args",
      originFeed,
      String(originChainId),
      String(DEST_CHAIN_ID),
      destinationFeed,
      
    ].join(" ");

    const { stdout } = await run(createCmd);
    const match = stdout.match(/Deployed to:\s*(0x[a-fA-F0-9]{40})/);
    const reactiveAddress = match ? match[1] : null;

    return res.json({
      originChainId,
      originFeed,
      originRpc,
      destinationChainId: DEST_CHAIN_ID,
      destinationFeed,
      reactiveAddress,
      feedDecimals,
      feedDescription,
    });
  } catch (err) {
    console.error("deploy error:", err);
    return res.status(500).json({ error: err.message || "deploy failed" });
  }
});

function extractTxHash(stdout) {
    // cast send prints a table; one of the lines is:
    // transactionHash      0x....
    const match = stdout.match(/transactionHash\s+(0x[a-fA-F0-9]{64})/);
    return match ? match[1] : null;
  }

/**
 * POST /api/fund/reactive
 * Body: { rcAddress: string, amountEth: string }
 * - Funds a Reactive Contract on Lasna via the system contract's depositTo(address)
 */
app.post("/api/fund/reactive", async (req, res) => {
    try {
      const { rcAddress, amountEth } = req.body;
  
      if (!rcAddress || !amountEth) {
        return res
          .status(400)
          .json({ error: "rcAddress and amountEth are required" });
      }
  
      const reactiveRpc = process.env.REACTIVE_RPC;
      const reactivePk = process.env.REACTIVE_PRIVATE_KEY;
      const systemContract =
        process.env.REACTIVE_SYSTEM_CONTRACT ||
        "0x0000000000000000000000000000000000fffFfF"; // default from Reactive docs
  
      if (!reactiveRpc || !reactivePk) {
        return res.status(500).json({
          error: "Missing env vars: REACTIVE_RPC, REACTIVE_PRIVATE_KEY",
        });
      }
  
      const cmd = [
        "cast send",
        systemContract,
        `"depositTo(address)"`,
        rcAddress,
        `--value ${amountEth}ether`,
        `--rpc-url ${reactiveRpc}`,
        `--private-key ${reactivePk}`,
      ].join(" ");
  
      const { stdout } = await run(cmd);
      const txHash = extractTxHash(stdout);
  
      return res.json({
        rcAddress,
        amountEth,
        txHash,
        raw: stdout,
      });
    } catch (err) {
      console.error("fund reactive error:", err);
      return res.status(500).json({ error: err.message || "fund reactive failed" });
    }
  });
  
  /**
   * POST /api/fund/destination
   * Body: { feedAddress: string, amountEth: string }
   * - Sends ETH to CALLBACK_PROXY_ADDR.depositTo(feedAddress) on Sepolia
   */
  app.post("/api/fund/destination", async (req, res) => {
    try {
      const { feedAddress, amountEth } = req.body;
  
      if (!feedAddress || !amountEth) {
        return res
          .status(400)
          .json({ error: "feedAddress and amountEth are required" });
      }
  
      const destRpc = process.env.DESTINATION_RPC;
      const destPk = process.env.DESTINATION_PRIVATE_KEY;
      const callbackProxy = process.env.CALLBACK_PROXY_ADDR;
  
      if (!destRpc || !destPk || !callbackProxy) {
        return res.status(500).json({
          error:
            "Missing env vars: DESTINATION_RPC, DESTINATION_PRIVATE_KEY, CALLBACK_PROXY_ADDR",
        });
      }
  
      const cmd = [
        "cast send",
        callbackProxy,
        `"depositTo(address)"`,
        feedAddress,
        `--value ${amountEth}ether`,
        `--rpc-url ${destRpc}`,
        `--private-key ${destPk}`,
      ].join(" ");
  
      const { stdout } = await run(cmd);
      const txHash = extractTxHash(stdout);
  
      return res.json({
        feedAddress,
        amountEth,
        txHash,
        raw: stdout,
      });
    } catch (err) {
      console.error("fund destination error:", err);
      return res
        .status(500)
        .json({ error: err.message || "fund destination failed" });
    }
  });

app.listen(3001, () => {
  console.log("Backend listening on http://localhost:3001");
});