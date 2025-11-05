const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const p = hre.ethers.provider;

  // Find the nonce of the stuck tx (usually == latest nonce)
  const latestNonce = await p.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await p.getTransactionCount(deployer.address, "pending");
  const replaceNonce = latestNonce; // replace the last mined/stuck nonce

  console.log("Deployer:", deployer.address);
  console.log({ latestNonce, pendingNonce, replaceNonce });

  // Strong manual fee overrides (works on DIDLab even if EIP-1559 is flaky)
  const gasPrice = hre.ethers.parseUnits(process.env.GP_GWEI || "5", "gwei"); // bump to 5 gwei
  const overrides = { gasPrice, gasLimit: 1_800_000, nonce: replaceNonce };
  console.log("Using overrides:", overrides);

  const Badge = await hre.ethers.getContractFactory("DidLabBadgeDheeraj");
  const badge = await Badge.deploy(deployer.address, overrides);

  console.log("Deploy tx:", badge.deploymentTransaction().hash);
  await badge.waitForDeployment();
  console.log("Contract:", await badge.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
