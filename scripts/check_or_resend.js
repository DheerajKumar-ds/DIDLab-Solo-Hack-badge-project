require("dotenv").config();
const { ethers } = require("ethers");
const artifact = require("../artifacts/contracts/DidLabBadgeDheeraj.sol/DidLabBadgeDheeraj.json");

(async () => {
  const { RPC_URL, PRIVATE_KEY, BADGE_ADDRESS, ADDR, TOKEN_URI } = process.env;
  const TX = process.env.TX;
  if (!RPC_URL || !PRIVATE_KEY || !BADGE_ADDRESS || !ADDR || !TOKEN_URI) {
    throw new Error("Missing RPC_URL / PRIVATE_KEY / BADGE_ADDRESS / ADDR / TOKEN_URI");
  }
  if (!TX) throw new Error("Missing TX (set env TX to your last tx hash)");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const badge = new ethers.Contract(BADGE_ADDRESS, artifact.abi, wallet);

  // 1) If already mined, use that receipt
  let receipt = await provider.getTransactionReceipt(TX);
  if (!receipt) {
    // 2) Still pending: fetch the tx to get its nonce, then resend with higher gas
    const stuck = await provider.getTransaction(TX);
    if (!stuck) throw new Error("Original TX not found in mempool. Double-check hash.");
    const nonce = stuck.nonce;
    const gp = ethers.parseUnits("6", "gwei"); // bump gas
    console.log("Replacing stuck tx with nonce", nonce, "gasPrice", gp.toString());

    const tx2 = await badge.mintTo(ADDR, TOKEN_URI, { gasLimit: 1_200_000, gasPrice: gp, nonce });
    console.log("New tx:", tx2.hash);
    receipt = await tx2.wait();
  } else {
    console.log("Original tx mined in block:", receipt.blockNumber);
  }

  // 3) Parse Transfer event for tokenId
  const TRANSFER_SIG = ethers.id("Transfer(address,address,uint256)");
  let tokenId = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === BADGE_ADDRESS.toLowerCase() && log.topics[0] === TRANSFER_SIG) {
      tokenId = BigInt(log.topics[3]).toString();
      break;
    }
  }
  console.log("Token ID:", tokenId ?? "(Transfer not found)");
  console.log("Token URI:", TOKEN_URI);

  // 4) Verify on-chain
  const owner = tokenId ? await badge.ownerOf(tokenId) : "(unknown)";
  console.log("Owner:", owner);
})().catch(e => { console.error(e); process.exit(1); });
