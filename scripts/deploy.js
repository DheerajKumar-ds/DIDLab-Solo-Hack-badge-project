const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const fee = await hre.ethers.provider.getFeeData();
  const overrides = (fee.maxFeePerGas && fee.maxPriorityFeePerGas)
    ? { maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas, gasLimit: 1_800_000 }
    : { gasPrice: hre.ethers.parseUnits("2", "gwei"), gasLimit: 1_800_000 };
  console.log("Using overrides:", overrides);

  const Badge = await hre.ethers.getContractFactory("DidLabBadgeDheeraj");
  const badge = await Badge.deploy(deployer.address, overrides);

  console.log("Deploy tx:", badge.deploymentTransaction().hash);
  await badge.waitForDeployment();
  console.log("Contract:", await badge.getAddress());
}

main().catch((e)=>{ console.error(e); process.exit(1); });
