import React, { useState } from 'react';
import EscrowDetails from './EscrowDetails.js';
import './Escrow.css';
import Web3Modal from 'web3modal';
import Button from '@mui/material/Button';
import WalletIcon from '@mui/icons-material/Wallet';
import SendIcon from '@mui/icons-material/Send';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

// import WalletConnectProvider from '@walletconnect/web3-provider';
// import WalletLink from 'walletlink';
const escrowContract = require('./build/polygon/testnet/Escrow/Escrow.json');
const tokenContract = require('./build/polygon/testnet/Token/Token.json');
const ethers = require('ethers');
export const CurrentStatus = {
  active: 0,
  released: 1,
  withdrawn: 2,
  refunded: 3,
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
  const [connected, setconnected] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [provider, setprovider] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [escrow, setescrow] = useState('');
  const [selectedbuyerescrow, setselectedbuyerescrow] = useState('');
  const [selectedsellerescrow, setselectedsellerescrow] = useState('');
  const [buyer, setBuyer] = useState('');
  const [allbuyerescrows, setallbuyerescrows] = useState([]);
  const [allsellerescrow, setallsellerescrow] = useState([]);
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [allescrewtext, setallescrewtext] = useState('');
  const [buyertext, setbuyertext] = useState('');
  const [newescrow, setnewescrow] = useState('');
  const [ver, setver] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const Provider = new ethers.providers.Web3Provider(connection);
    setprovider(Provider);

    if ((await Provider.getNetwork()).chainId !== 80001) {
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
    const contract = new ethers.Contract(
      escrowContract.address,
      escrowContract.abi,
      Provider.getSigner()
    );

    setescrow(contract);

    const Allbuyerescrow = await contract.getBuyerEscrows(Address);
    setallbuyerescrows(Allbuyerescrow);

    setbuyertext('Buyer Active Transactions');

    const Allsellerescrow = await contract.getSellerEscrows(Address);

    setallsellerescrow(Allsellerescrow);
    setallescrewtext('Seller Active Transactions');

    const Bal = await Provider.getBalance(Address);
    const bal = ethers.utils.formatEther(Bal);

    setbalance(`${bal} Matic`);
    setLoading(false);
    setconnected(true);

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
    const submittedBuyer = ethers.utils.getAddress(buyer);
    const submittedToken = ethers.utils.getAddress(token);
    const submittedAmount = ethers.utils.parseEther(amount);
    const erc = new ethers.Contract(
      ethers.utils.getAddress(token),
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

    setallbuyerescrows(Allbuyerescrow);
  };

  function handleClickForm() {
    setShowForm(true);
    setHasClicked(true);
  }
  function handleverify() {
    setver(true);
  }

  return (
    <div className='home-container'>
      <Button onClick={connectWallet} variant="contained" endIcon={<WalletIcon />} sx={{ mt:3}}>
      {connected ? 'Connected' : 'Connect Wallet'}
      </Button>
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}>
          <CircularProgress color="inherit" />
      </Backdrop>

      { connected && 
      <div className='user-info'>
        <Typography sx={{ mt:3}} variant="h6">
          Wallet address 
          <Typography variant='subtitle1'>{address}</Typography>
        </Typography>

        <Typography sx={{ mt:3, mb:3}} variant="h6">
          User Balance Address
          <Typography variant='subtitle1'>{balance}</Typography>
        </Typography>

        {!hasClicked && <Button variant="contained" endIcon={<SendIcon />} onClick={handleClickForm}>Send Tokens</Button>}
      </div>
      }

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

              <Button type='submit' variant="contained">
                Send Tokens
              </Button>
              <Button onClick={()=> {setHasClicked(false); setShowForm(false)}} variant="outlined" sx={{ mt:2}}>Cancel</Button>
            </form>
          </div>
        )}
      </div>

      {newescrow ? <EscrowDetails escrow={newescrow} /> : <></>}

      {selectedsellerescrow ? (
        <EscrowDetails escrow={selectedsellerescrow} />
      ) : (
        <div>
          <h3>{allescrewtext}</h3>
          {allsellerescrow
            .filter((escroww) => escroww.status === CurrentStatus.active)
            .map((escroww, index) => (
              <Button variant="outlined" key={index} onClick={async () => {
                    const selected = await escrow.getEscrowRequest(
                      Number(escroww.id)
                    );
                    setselectedsellerescrow(selected);
                  }}>
                  <b>{`Escrow id: ${Number(escroww.id)}`}</b>
              </Button>
            ))}

          {connected && allsellerescrow.filter(
            (escroww) => escroww.status === CurrentStatus.active
          ).length === 0 && <p>You have no active transactions </p>}
        </div>
      )}

      <br />
      { connected &&
      <Button sx={{ mb:3 }} variant="contained" onClick={handleverify}> Verify Tokens </Button>
      }

      {selectedbuyerescrow ? (
        <EscrowDetails escrow={selectedbuyerescrow} />
      ) : null}

      {ver ? (
        <div id='ver'>
          <ul>
            <h3>{buyertext}</h3>
            {allbuyerescrows
              .filter((escroww) => escroww.status === CurrentStatus.active)
              .map((escroww, index) => (
                <Button sx={{ mb:5}} variant="outlined" key={index} onClick={async () => {
                      const selected = await escrow.getEscrowRequest(
                        Number(escroww.id)
                      );
                      setselectedbuyerescrow(selected);
                    }}>
                  
                    <b>{`Escrow id: ${Number(escroww.id)}`}</b>
                </Button>
              ))}
            {allbuyerescrows.filter(
              (escroww) => escroww.status === CurrentStatus.active
            ).length === 0 && <p>You have no transactions as buyer </p>}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
