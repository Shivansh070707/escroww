import React, { useState } from 'react';
import EscrowDetails from './EscrowDetails.js';
import './Escrow.css';
import Web3Modal from 'web3modal';
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
const tokenContract = require('./build/polygon/testnet/Token/Token.json');
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
  const [Id, setId] = useState(null);
  const [idValue, setIdValue] = useState('');
  const [buyer, setBuyer] = useState('');
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [expiry, setExpiry] = useState('');
  const [submittedBuyer, setSubmittedBuyer] = useState('');
  const [submittedToken, setSubmittedToken] = useState('');
  const [submittedAmount, setSubmittedAmount] = useState('');
  const [submittedExpiry, setSubmittedExpiry] = useState('');
  const [allescrewtext, setallescrewtext] = useState('');
  const [isbuyer, setisbuyer] = useState(false);
  const [isseller, setisseller] = useState(false);

  const connectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const Provider = new ethers.providers.Web3Provider(connection);
    setprovider(Provider);

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
    const arr = Allescrow[0];
    for (let i = arr.length; i < 0; i--) {
      console.log('hii');
      let bool = false;
      if (arr[i].buyer == address) {
        console.log('hii');
        setselectesescrow(arr[i]);
        break;
      } else if (arr[i].seller == address) {
        setselectesescrow(arr[i]);
        break;
      }
    }
    alert('No escrow');

    //setallescrewtext('All Escrows :');
    //setallescrow(Allescrow[0]);
    const Bal = await Provider.getBalance(Address);
    const bal = ethers.utils.formatEther(Bal);

    setbalance(`${bal} Matic`);

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
  };

  const handlerequestChange = (e) => {
    const { name, value } = e.target;

    if (name === 'buyer') {
      setBuyer(value);
    } else if (name === 'token') {
      setToken(value);
    } else if (name === 'amount') {
      setAmount(value);
    } else {
      setExpiry(value);
    }
  };
  const handlerequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittedBuyer(ethers.utils.getAddress(buyer));
    setSubmittedToken(ethers.utils.getAddress(token));
    setSubmittedAmount(ethers.utils.parseEther(amount));
    setSubmittedExpiry(expiry);
    console.log(token);
    console.log(submittedAmount);
    const erc = new ethers.Contract(
      submittedToken,
      tokenContract.abi,
      provider.getSigner()
    );

    const approve = await erc
      .connect(account)
      .approve(escrowContract.address, submittedAmount);
    await approve.wait();

    const tx = await escrow
      .connect(account)
      .createRequest(
        submittedBuyer,
        submittedExpiry,
        submittedToken,
        submittedAmount
      );
    await tx.wait();
    const Allescrow = await escrow.getAllEscrows();

    setallescrow(Allescrow[0]);
  };

  const handleInputChange = (event) => {
    setIdValue(event.target.value);
  };

  const handleSearchClick = async () => {
    let value = Number(idValue);
    console.log(`Searching for number ${value}...`);
    try {
      const searchedescrow = await escrow.getEscrowRequest(value);
      setselectesescrow(searchedescrow);
    } catch (e) {
      console.log(e);
      alert('not found');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <u onClick={connectWallet}> {connect} </u>
      <p>wallet address: {address}</p>
      <p> user balance : {balance}</p>
      <input type='number' value={idValue} onChange={handleInputChange} />
      <button onClick={handleSearchClick}>Search</button>
      <div>
        {(isbuyer || isseller) && (
          <div className='form-container'>
            <form className='escrow-form' onSubmit={handlerequestSubmit}>
              <div className='form-group'>
                <input
                  type='text'
                  name='buyer'
                  id='buyer'
                  value={buyer}
                  onChange={handlerequestChange}
                  placeholder='Enter buyer name...'
                  className='form-control'
                />
              </div>

              <div className='form-group'>
                <input
                  type='text'
                  name='token'
                  id='token'
                  value={token}
                  onChange={handlerequestChange}
                  placeholder='Enter token...'
                  className='form-control'
                />
              </div>

              <div className='form-group'>
                <input
                  type='text'
                  name='amount'
                  id='amount'
                  value={amount}
                  onChange={handlerequestChange}
                  placeholder='Enter amount...'
                  className='form-control'
                />
              </div>

              <div className='form-group'>
                <input
                  type='text'
                  name='expiry'
                  id='expiry'
                  value={expiry}
                  onChange={handlerequestChange}
                  placeholder='Enter expiry...'
                  className='form-control'
                />
              </div>

              <button type='submit' className='btn btn-primary'>
                Create Escrow
              </button>
            </form>
          </div>
        )}
      </div>

      {selectedescrow ? (
        <EscrowDetails escrow={selectedescrow} />
      ) : (
        <ul>
          <h2>{allescrewtext}</h2>
          {allescrow.map((escroww, index) => (
            <li key={index}>
              <u
                onClick={async () => {
                  const selected = await escrow.getEscrowRequest(
                    Number(escroww.id)
                  );
                  console.log(selected.buyer);
                  setselectesescrow(selected);
                  setId(Number(selected.id));
                }}
              >
                {`Escrow id: ${Number(escroww.id)}`}
              </u>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
