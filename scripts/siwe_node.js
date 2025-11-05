// scripts/siwe_node.js
require('dotenv').config();
const fs = require('fs');
const { Wallet } = require('ethers');

const RPC_PREPARE = 'https://api.didlab.org/v1/siwe/prepare';
const RPC_VERIFY  = 'https://api.didlab.org/v1/siwe/verify';

async function run(){
  const addr = process.env.ADDR;
  const pk = process.env.PRIVATE_KEY;
  if(!addr || !pk){ console.error('Missing ADDR or PRIVATE_KEY in .env'); process.exit(1); }

  // 1) prepare
  const prep = await fetch(RPC_PREPARE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: addr })
  });
  if(!prep.ok){ console.error('prepare failed', await prep.text()); process.exit(1); }
  const prepJson = await prep.json();
  const message = prepJson.message;
  console.log('Message received (first 140 chars):', message.slice(0,140).replace(/\r?\n/g,'\\n'));

  // 2) sign EXACTLY this message (no modifications)
  const wallet = new Wallet(pk);
  const signature = await wallet.signMessage(message);
  console.log('Signature:', signature.slice(0,16) + '...');

  // 3) verify
  const verifyRes = await fetch(RPC_VERIFY, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: addr, message: message, signature: signature })
  });

  const verifyText = await verifyRes.text();
  if(!verifyRes.ok){
    console.error('verify failed:', verifyRes.status, verifyText);
    process.exit(1);
  }
  const verifyJson = JSON.parse(verifyText);
  console.log('✅ Got JWT: ', verifyJson.token.slice(0,40) + '...');
  // also save to .env-like session file if you want
  fs.writeFileSync('didlab_jwt.txt', verifyJson.token, 'utf8');
  console.log('Saved JWT to didlab_jwt.txt');
}

run().catch(e=>{ console.error(e); process.exit(1); });
