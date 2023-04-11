import React, { useEffect, useState } from 'react';
import './Escrowdetail.css';
import Web3Modal from 'web3modal';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
const ethers = require('ethers');
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
export const CurrentStatus = {
  active: 0,
  released: 1,
  withdrawn: 2,
  refunded: 3,
};
const checkStatus = (status) => {
  if (status === CurrentStatus.active) {
    return 'Active';
  } else if (status === CurrentStatus.released) {
    return 'Released';
  } else if (status === CurrentStatus.withdrawn) {
    return 'Withdrawn';
  } else {
    return 'Refunded';
  }
};

function EscrowDetails(props) {
  let { id, seller, buyer, token, amount, expiry, status } = props.escrow;
  const [Status, setStatus] = useState(status);
  const [showconfirm, setshowconfirm] = useState(false);
  const [statustext, setstatustext] = useState('Active');

  const [address, setaddress] = useState('');

  const [bool, setbool] = useState(false);

  const [Id, setId] = useState(id);

  useEffect(() => {
    const connection = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const Provider = new ethers.providers.Web3Provider(connection);
      const Contract = new ethers.Contract(
        escrowContract.address,
        escrowContract.abi,
        Provider.getSigner()
      );
      const Account = Provider.getSigner();
      const Address = await Account.getAddress();
      setaddress(Address);

      const Bool = await Contract.checkIsExpired(Id);
      setbool(Bool);
    };
    connection();
    const check = checkStatus(Status);
    setstatustext(check);
  }, [Status]);

  const handleConfirm = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const Provider = new ethers.providers.Web3Provider(connection);
    const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );
    const Account = Provider.getSigner();
    try {
      const tx = await contract.connect(Account).confirmReceived(Id);
      await tx.wait();
      const check = await contract.getEscrowRequest(id);
      amount = ethers.utils.formatEther(check.amount);
      setStatus(1);
    } catch (err) {
      toast.error(`${err.error.data.message}`);
    }
  };
  const handleCancel = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const Provider = new ethers.providers.Web3Provider(connection);
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
      console.log(status);
      setStatus('Cancelled');
      console.log(status);
    } catch (err) {
      toast.error(`${err.error.data.message}`);
    }
  };
  const handleWithdraw = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
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
      setStatus('Withdrawn');
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

      <p>
        <strong>Status:</strong> {statustext}
      </p>

      <>
        {address === seller && !showconfirm && (
          <button onClick={handleConfirm}> Confirm </button>
        )}
      </>
      <>
        {address === seller && bool && (
          <button onClick={handleCancel}> Cancel </button>
        )}
      </>
      <>
        {address === seller && !bool && (
          <button onClick={handleWithdraw}> Withdraw Tokens</button>
        )}
      </>
    </div>
  );
}

export default EscrowDetails;
