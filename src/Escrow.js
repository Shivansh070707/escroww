import React, { useState } from 'react';
import EscrowDetails from './EscrowDetails';
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please Install Metamask');
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
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
    } else {
      setExpiry(value);
    }
  };
  const handlerequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittedBuyer(ethers.utils.getAddress(buyer));
    setSubmittedToken(ethers.utils.getAddress(token));
    setSubmittedAmount(ethers.utils.parseUnits(amount, 'ether'));
    setSubmittedExpiry(expiry);
    console.log(token);
    const erc = new ethers.Contract(
      submittedToken,
      tokenContract.abi,
      provider.getSigner()
    );
    console.log(erc);
    console.log(
      await erc.balanceOf('0xb824465A26846eF8f7E6Ce3a2AEEc2F359690218')
    );
    const approve = await erc
      .connect(account)
      .increaseAllowance(escrowContract.address, amount);
    await approve.wait();
    const val = ethers.utils.formatEther(submittedAmount);

    const tx = await escrow
      .connect(account)
      .createRequest(
        submittedBuyer,
        submittedExpiry,
        submittedToken,
        Number(val)
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
        <form onSubmit={handlerequestSubmit}>
          <label htmlFor='buyer'>Buyer:</label>
          <input
            type='text'
            name='buyer'
            id='buyer'
            value={buyer}
            onChange={handlerequestChange}
          />

          <label htmlFor='token'>Token:</label>
          <input
            type='text'
            name='token'
            id='token'
            value={token}
            onChange={handlerequestChange}
          />

          <label htmlFor='amount'>Amount:</label>
          <input
            type='text'
            name='amount'
            id='amount'
            value={amount}
            onChange={handlerequestChange}
          />

          <label htmlFor='expiry'>Expiry:</label>
          <input
            type='text'
            name='expiry'
            id='expiry'
            value={expiry}
            onChange={handlerequestChange}
          />

          <button type='submit'>create escrow</button>
        </form>
      </div>

      {selectedescrow ? (
        <EscrowDetails escrow={selectedescrow} />
      ) : (
        <ul>
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
                {Number(escroww.id)}
              </u>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
