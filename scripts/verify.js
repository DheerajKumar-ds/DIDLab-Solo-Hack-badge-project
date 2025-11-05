const hre = require("hardhat");

async function main() {
  const a = process.env.BADGE_ADDRESS;
  const id = process.env.TOKEN_ID || "1";
  if (!a) throw new Error("Missing BADGE_ADDRESS");
  const C = await hre.ethers.getContractAt("DidLabBadgeDheeraj", a);
  const uri = await C.tokenURI(id);
  console.log("tokenId:", id);
  console.log("tokenURI:", uri);
  console.log("Gateway URL:", uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
}

main().catch((e)=>{ console.error(e); process.exit(1); });
