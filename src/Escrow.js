import React, { useState } from 'react';
import EscrowDetails from './EscrowDetails.js';
import './Escrow.css';
import Web3Modal from 'web3modal';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import WalletConnect from '@walletconnect/web3-provider';
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
const tokenContract = require('./build/polygon/testnet/Token/Token.json');
const ethers = require('ethers');
export const CurrentStatus = {
  active: 0,
  released: 1,
  withdrawn: 2,
  refunded: 3,
};
export const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: 'Web 3 Modal Demo',
      infuraId: process.env.API_KEY,
    },
  },
  walletconnect: {
    package: WalletConnect,
    options: {
      infuraId: process.env.API_KEY,
    },
  },
};

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
  const [hasClicked, setHasClicked] = useState(false);
  const [provider, setprovider] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [escrow, setescrow] = useState('');
  const [allescrow, setallescrow] = useState([]);
  const [selectedbuyerescrow, setselectedbuyerescrow] = useState('');
  const [selectedsellerescrow, setselectedsellerescrow] = useState('');
  const [Id, setId] = useState(null);
  const [idValue, setIdValue] = useState('');
  const [buyer, setBuyer] = useState('');
  const [allbuyerescrows, setallbuyerescrows] = useState([]);
  const [allsellerescrow, setallsellerescrow] = useState([]);
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [submittedBuyer, setSubmittedBuyer] = useState('');
  const [submittedToken, setSubmittedToken] = useState('');
  const [submittedAmount, setSubmittedAmount] = useState('');
  const [allescrewtext, setallescrewtext] = useState('');
  const [isbuyer, setisbuyer] = useState(false);
  const [isseller, setisseller] = useState(false);
  const [buyeres, setbuyeres] = useState('');
  const [selleres, setselleres] = useState('');
  const [buyertext, setbuyertext] = useState('');
  const [newescrow, setnewescrow] = useState('');
  const [ver, setver] = useState(false);
  const web3Modal = new Web3Modal({
    providerOptions, // required
  });
  const connectWallet = async () => {
    // const web3Modal = new Web3Modal();
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
    for (let i = arr.length - 1; i >= 0; i--) {
      console.log(Address);
      if (arr[i].buyer == Address) {
        console.log('hii');
        setisbuyer(true);
        setbuyeres(arr[i]);
        break;
      } else if (arr[i].seller == Address) {
        setselleres(arr[i]);
        setisseller(true);
        break;
      }
    }
    const Allbuyerescrow = await contract.getBuyerEscrows(Address);
    setallbuyerescrows(Allbuyerescrow);

    setbuyertext('Buyer Active Transactions');

    const Allsellerescrow = await contract.getSellerEscrows(Address);

    setallsellerescrow(Allsellerescrow);
    setallescrewtext('Seller Active Transactions');

    setallescrow(Allescrow[0]);
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
    }
  };
  const handlerequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittedBuyer(ethers.utils.getAddress(buyer));
    setSubmittedToken(ethers.utils.getAddress(token));
    setSubmittedAmount(ethers.utils.parseEther(amount));
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
      .createRequest(submittedBuyer, 1800, submittedToken, submittedAmount);
    await tx.wait();

    const Allescrow = await escrow.getSellerEscrows(address);
    setShowForm(false);
    setnewescrow(Allescrow[Allescrow.length - 1]);

    const Allsellerescrow = await escrow.getSellerEscrows(address);
    setallsellerescrow(Allsellerescrow);
    const Allbuyerescrow = await escrow.getBuyerEscrows(address);
    console.log(Allbuyerescrow);
    setallbuyerescrows(Allbuyerescrow);
  };

  const handleInputChange = (event) => {
    setIdValue(event.target.value);
  };

  function handleClickForm() {
    setShowForm(true);
    setHasClicked(true);
  }
  function handleverify() {
    setver(true);
  }

  return (
    <div>
      <u onClick={connectWallet}> {connect} </u>
      <p>wallet address: {address}</p>
      <p> user balance : {balance}</p>
      {/* <input type='number' value={idValue} onChange={handleInputChange} />
      <button onClick={handleSearchClick}>Search</button> */}
      {!hasClicked && <button onClick={handleClickForm}>Send Tokens</button>}
      <div>
        {showForm && (
          <div className='form-container'>
            <form className='escrow-form' onSubmit={handlerequestSubmit}>
              <div className='form-group'>
                <input
                  type='text'
                  name='buyer'
                  id='buyer'
                  value={buyer}
                  onChange={handlerequestChange}
                  placeholder='Enter buyer address...'
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

              <button type='submit' className='btn btn-primary'>
                Send Tokens
              </button>
            </form>
          </div>
        )}
      </div>
      {newescrow ? <EscrowDetails escrow={newescrow} /> : <></>}

      {selectedsellerescrow ? (
        <EscrowDetails escrow={selectedsellerescrow} />
      ) : (
        <ul>
          <h3>{allescrewtext}</h3>
          {allsellerescrow
            .filter((escroww) => escroww.status == CurrentStatus.active)
            .map((escroww, index) => (
              <li key={index}>
                <u
                  onClick={async () => {
                    const selected = await escrow.getEscrowRequest(
                      Number(escroww.id)
                    );
                    setselectedsellerescrow(selected);
                    setId(Number(selected.id));
                  }}
                >
                  {`Escrow id: ${Number(escroww.id)}`}
                </u>
              </li>
            ))}
          {allescrow.filter((escroww) => escroww.status == CurrentStatus.active)
            .length === 0 && <p>You have no active transactions </p>}
        </ul>
      )}
      <button onClick={handleverify}> Verify Tokens </button>
      {selectedbuyerescrow ? (
        <EscrowDetails escrow={selectedbuyerescrow} />
      ) : null}
      {ver ? (
        <div id='ver'>
          <ul>
            <h3>{buyertext}</h3>
            {allbuyerescrows
              .filter((escroww) => escroww.status == CurrentStatus.active)
              .map((escroww, index) => (
                <li key={index}>
                  <u
                    onClick={async () => {
                      const selected = await escrow.getEscrowRequest(
                        Number(escroww.id)
                      );
                      setselectedbuyerescrow(selected);
                      setId(Number(selected.id));
                    }}
                  >
                    {`Escrow id: ${Number(escroww.id)}`}
                  </u>
                </li>
              ))}
            {allescrow.filter(
              (escroww) => escroww.status == CurrentStatus.active
            ).length === 0 && <p>You have no transactions as buyer </p>}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
