import { ethers, upgrades } from 'hardhat';
import { storeContract } from './storeContracts';

async function main() {
  const Escrow = await ethers.getContractFactory('Escrow');
  const escrow = await Escrow.deploy();

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
  console.log(`token deployed on ${token.address}`);
  console.log(`escrow deployed on ${escrow.address}`);
  await token.approve(escrow.address, 100000000000);

  await escrow.createRequest(
    '0xb824465A26846eF8f7E6Ce3a2AEEc2F359690218',
    110000000,
    token.address,
    1000000
  );

  await token.approve(escrow.address, 100000000000);

  await escrow.createRequest(
    '0xb824465A26846eF8f7E6Ce3a2AEEc2F359690218',
    110000000,
    token.address,
    1000000
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
