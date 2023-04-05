import React, { useState } from 'react';
import EscrowDetails from './EscrowDetails';
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
const ethers = require('ethers');

const networks = {
  polygon: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: 'Polygon Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
};

export const Escrow = () => {
  const [account, setaccount] = useState('');
  const [balance, setbalance] = useState('');
  const [address, setaddress] = useState('');
  const [connect, setconnect] = useState('Connect Wallet');
  const [provider, setprovider] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [escrow, setescrow] = useState('');
  const [allescrow, setallescrow] = useState([]);
  const [selectedescrow, setselectesescrow] = useState('');
  const [buyer, setBuyer] = useState('');
  const [expiry, setExpiry] = useState(0);
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please Install Metamask');
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    setprovider(Provider);
    if (Provider.network !== 'matic') {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              ...networks['polygon'],
            },
          ],
        });
      } catch (e) {
        alert('Please switch to polygon network');
      }
    }

    const Account = Provider.getSigner();
    setaccount(Account);
    const Address = await Account.getAddress();
    setaddress(Address);
    setconnect('connected :');
    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );

    setescrow(contract);
    const Allescrow = await contract.getAllEscrows();
    //console.log('hooo', Allescrow);
    //Allescrow.map((value) => value.amount);
    setallescrow(Allescrow[0]);
  };
  const createRequest = async () => {
    try {
      await escrow.createRequest(buyer, expiry, token, amount);

      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    createRequest();
  };
  return (
    <div>
      <u onClick={connectWallet}> {connect} </u>
      <p>wallet address: {address}</p>
      <p> user balance : {balance}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Buyer Address:</label>
          <input
            type='text'
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
          />
        </div>
        <div>
          <label>Expiry Time:</label>
          <input
            type='number'
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
          />
        </div>
        <div>
          <label>Token Address:</label>
          <input
            type='text'
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </div>
        <div>
          <label>Token Amount:</label>
          <input
            type='number'
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <button type='submit'>Create Request</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>

      {allescrow.map((escrow) => (
        <div key={escrow.id}>
          <h2>Escrow ID: {escrow.id}</h2>
          <p>Buyer: {escrow.buyer}</p>
          <p>Seller: {escrow.seller}</p>
          <p>Amount: {escrow.amount}</p>
        </div>
      ))}
    </div>
  );
};
