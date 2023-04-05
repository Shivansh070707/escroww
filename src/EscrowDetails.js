import React, { useState } from 'react';
const ethers = require('ethers');
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');

function EscrowDetails(props) {
  const { id, seller, buyer, token, amount, expiry, Status } = props.escrow;
  //console.log(Status);
  // const Amount =props.escrow[4];
  //console.log(props.escrow);
  const [Id, setId] = useState(1);

  const handleConfirm = async () => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();
    console.log('address', await Account.getAddress());
    console.log(await contract.getEscrowBalance(Id));
    const tx = await contract.connect(Account).confirmReceived(Id);
    await tx.wait();
  };
  const handleCancel = async () => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();
    await contract.connect(Account).cancelRequest(id);
  };
  const handleWithdraw = async () => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();
    console.log('address', await Account.getAddress());
    console.log(await contract.getEscrowBalance(Id));
    const tx = await contract.connect(Account).withdrawTokens(Id);
    await tx.wait();
  };

  return (
    <div>
      <h2>Escrow Details</h2>
      <p>
        <strong>id :</strong> {Number(id)}
      </p>
      <p>
        <strong>Seller:</strong> {seller}
      </p>
      <p>
        <strong>buyer:</strong> {buyer}
      </p>
      <p>
        <strong>token:</strong> {token}
      </p>

      <p>
        <strong>amount:</strong> {ethers.utils.formatEther(amount)}
      </p>

      <p>
        <strong>expiry:</strong> {Number(expiry)}
      </p>

      <p>
        <strong>Status:</strong> {Status}
      </p>

      <button onClick={handleConfirm}> Confirm </button>
      <button onClick={handleCancel}> Cancel </button>
      <button onClick={handleWithdraw}> Withdraw Tokens</button>
    </div>
  );
}

export default EscrowDetails;
