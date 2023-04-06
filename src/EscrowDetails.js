import React, { useState } from 'react';
import './Escrowdetail.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
const ethers = require('ethers');
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
export const CurrentStatus = {
  active: 0,
  released: 1,
  refunded: 2,
};
const checkStatus = (status) => {
  if (status == CurrentStatus.active) {
    return 'Active';
  } else if (status == CurrentStatus.released) {
    return 'Released';
  } else {
    return 'Refunded';
  }
};

function EscrowDetails(props) {
  const { id, seller, buyer, token, amount, expiry, status } = props.escrow;
  const [Status, setStatus] = useState('');

  const [Id, setId] = useState(id);
  const check = checkStatus(status);
  console.log(check);
  // setStatus(check.toString());
  const currentDateInSeconds = Math.floor(Date.now() / 1000);
  const expirydate = currentDateInSeconds + expiry;

  const handleConfirm = async () => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();

    try {
      const tx = await contract.connect(Account).confirmReceived(Id);
      await tx.wait();
    } catch (err) {
      toast.error(`${err.error.data.message}`);
    }
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
    try {
      const tx = await contract.connect(Account).cancelRequest(id);
      await tx.wait();
    } catch (err) {
      toast.error(`${err.error.data.message}`);
    }
  };
  const handleWithdraw = async () => {
    const Provider = new ethers.providers.Web3Provider(window.ethereum);

    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();
    try {
      const tx = await contract.connect(Account).withdrawTokens(Id);
      await tx.wait();
    } catch (err) {
      toast.error(`${err.error.data.message}`);
    }
  };

  return (
    <div style={{ border: '1px solid black', padding: '10px' }}>
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

      {/* <p>
        <strong>expiry:</strong> {convertEpoch(expirydate)}
      </p> */}
      {/* 
      <p>
        <strong>Status:</strong> {Status}
      </p> */}

      <button onClick={handleConfirm}> Confirm </button>
      <ToastContainer />
      <button onClick={handleCancel}> Cancel </button>
      <button onClick={handleWithdraw}> Withdraw Tokens</button>
    </div>
  );
}

export default EscrowDetails;
