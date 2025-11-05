require("dotenv").config();
const { Wallet } = require("ethers");
const fs = require("fs");

(async ()=>{
  const msg = fs.readFileSync("siwe.txt","utf8");
  if (!process.env.PRIVATE_KEY) { console.error("Missing PRIVATE_KEY"); process.exit(1); }
  const sig = await new Wallet(process.env.PRIVATE_KEY).signMessage(msg);
  console.log(sig);
})();
