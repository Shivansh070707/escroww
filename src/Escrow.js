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
  const [Id, setId] = useState(null);
  const [idValue, setIdValue] = useState('');

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
    console.log('hooo', Allescrow);
    Allescrow.map((value) => value.amount);
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
  const handleConfirm = async () => {
    console.log('address', await account.getAddress());
    console.log(await escrow.getEscrowBalance(Id));
    const tx = await escrow.connect(account).confirmReceived(Id);
    await tx.wait();
  };
  return (
    <div>
      <u onClick={connectWallet}> {connect} </u>
      <p>wallet address: {address}</p>
      <p> user balance : {balance}</p>
      <input type='number' value={idValue} onChange={handleInputChange} />
      <button onClick={handleSearchClick}>Search</button>

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
