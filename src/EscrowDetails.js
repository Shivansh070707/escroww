import React, { useState } from 'react';
const ethers = require('ethers');
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');

function EscrowDetails(props) {
  const { Buyer, Seller, Amount } = props.escrow;
  const [id, setid] = useState(1);
  const handleConfirm = async () => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();
    await contract.connect(Account).confirmReceived(id);
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

  return (
    <div>
      <h2>Escrow Details</h2>
      <p>
        <strong>Buyer:</strong> {Buyer}
      </p>
      <p>
        <strong>Seller:</strong> {Seller}
      </p>
      <p>
        <strong>Amount:</strong> {Amount}
      </p>

      <button onClick={handleConfirm}> Confirm </button>
      <button onClick={handleCancel}> Cancel </button>
    </div>
  );
}

export default EscrowDetails;
