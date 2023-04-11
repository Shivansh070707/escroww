import { ethers, upgrades } from 'hardhat';
import { storeContract } from './storeContracts';

async function main() {
  const Escrow = await ethers.getContractFactory('Escrow');
  const escrow = await upgrades.deployProxy(Escrow);

  await escrow.deployed();
  await storeContract(
    escrow.address,
    JSON.parse(String(escrow.interface.format('json'))),
    'Escrow',
    'Escrow'
  );
  const Token = await ethers.getContractFactory('token');
  const token = await Token.deploy();
  await token.deployed();

  await storeContract(
    escrow.address,
    JSON.parse(String(token.interface.format('json'))),
    'Token',
    'Token'
  );
  console.log(`token deployed on ${token.address}`);
  console.log(`escrow deployed on ${escrow.address}`);
  const tx = await token.increaseAllowance(escrow.address, 100000000000);
  await tx.wait();
  await escrow.createRequest(
    '0xb824465A26846eF8f7E6Ce3a2AEEc2F359690218',
    110000000,
    token.address,
    1000000
  );

  //await token.approve(escrow.address, 100000000000);

  await escrow.createRequest(
    '0x068aeB7f11fb0d5e27BbbDfD07a63B59D0448Da8',
    110000000,
    token.address,
    1000000
  );
  await escrow.createRequest(
    '0x068aeB7f11fb0d5e27BbbDfD07a63B59D0448Da8',
    110000000,
    token.address,
    1000000
  );
}
async function upgrade() {
  const Box = await ethers.getContractFactory('Escrow');
  const escrow = await upgrades.upgradeProxy(
    '0x37ecCC5093869756dec26097Aad40025b182e1AD',
    Box
  );
  console.log('Box upgraded');

  const Token = await ethers.getContractFactory('token');
  const token = await Token.deploy();
  await token.deployed();

  await storeContract(
    escrow.address,
    JSON.parse(String(token.interface.format('json'))),
    'Token',
    'Token'
  );
  console.log(`token deployed on ${token.address}`);
  console.log(`escrow deployed on ${escrow.address}`);
  const tx = await token.increaseAllowance(escrow.address, 100000000000);
  await tx.wait();
  await escrow.createRequest(
    '0xb824465A26846eF8f7E6Ce3a2AEEc2F359690218',
    110000000,
    token.address,
    1000000
  );

  //await token.approve(escrow.address, 100000000000);

  await escrow.createRequest(
    '0x068aeB7f11fb0d5e27BbbDfD07a63B59D0448Da8',
    110000000,
    token.address,
    1000000
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
upgrade().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
