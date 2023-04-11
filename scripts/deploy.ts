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
 
  
}
async function upgrade() {
  const EscrowV2 = await ethers.getContractFactory('EscrowV2');
  const escrow = await upgrades.upgradeProxy(
    '0x37ecCC5093869756dec26097Aad40025b182e1AD',
    EscrowV2
  );
  console.log('EscrowV2 upgraded');

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
