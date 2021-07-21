import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Container from 'react-bootstrap/Container';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
//import Web3 from 'web3';
//import { AbiItem } from 'web3-utils'


declare let window: any;

const INIT_WALLET = "CONNECT";
const CHAIN_ID = '0x38';
//let web3 = new Web3(window.ethereum)

export default function App() {
  const [walletAddress, setWalletAddress] = useState(INIT_WALLET);
  const [tokenAddr, setTokenAddr] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  function showAlertDlg(msg: any, timeout: any) {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
        setShowMessage(false)
    }, timeout);
  }

  const getChainId = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showAlertDlg('MetaMask is not installed!', 1400)
    }

    /*** check if it is on BSC network***/
    const chainId = await getChainId()
    if (chainId !== CHAIN_ID) {
      alert('wrong network!')
      return
    }

    /*** metamask connecting ***/
    window.ethereum.request({
      method: 'eth_requestAccounts'
    }).then((accounts: any) => {
      setWalletAddress(accounts[0])
    }).catch(() => {

    })
  }

  useEffect(() => {  
    if (walletAddress === INIT_WALLET) {
      if (typeof window.ethereum === 'undefined') {
        showAlertDlg('MetaMask is not installed!', 1400)
      }
  
      /***** when chain Network is changed *****/
      window.ethereum.on('chainChanged', (chainId: any) => {
        if (chainId !== CHAIN_ID) {
          showAlertDlg('wrong network!', 1400)
        } else {
        }
      });
  
      /***** when account is changed *****/
      window.ethereum.on('accountsChanged', (accounts: any) => {
        if (accounts[0]) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(INIT_WALLET);
        }
      })
  
      window.ethereum.request({
        method: 'eth_accounts'
      }).then((accounts: any) => {
        const addr = (accounts.length <= 0) ? INIT_WALLET : accounts[0];
        if (accounts.length > 0) {
          setWalletAddress(addr);
        } else {
          setWalletAddress(INIT_WALLET);
        }
      })
    } else if (walletAddress !== "") {

    }
  }, [walletAddress]);

  return (
    <div className='main_page'>
      <Container>
        <Row className="justify-content-md-center">
          <Col className="mt-5">LOGO</Col>
          <Col className="justify-content-md-center mt-5">
            <Button className="float-right" variant="contained" color="primary" onClick={connectWallet}>{(walletAddress === INIT_WALLET) ? walletAddress : (walletAddress.substring(0, 7) + "..." + walletAddress.slice(-4))}</Button>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col className="mt-2 mb-2 text-center main_page_heading">Welcome To Our Website</Col>
        </Row>
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-2"></div>
            <div className="col-md-8">
              <div className="hold_form" style={{textAlign: "center"}}>
                <div className="row">
                  <div className="col-md-2"></div>
                  <div className="col-md-8">
                    <input type="text" className="form-control" placeholder="Tokens Address" value={tokenAddr} onChange={(e) => setTokenAddr(e.target.value)}/>
                  </div>
                </div>
                <div style={{marginTop: "10px"}}> 
                  <Button className="submit_btn" style={{marginLeft: "10px"}} color="primary">&nbsp;&nbsp;Scan&nbsp;&nbsp;</Button>
                  <Button className="submit_btn" style={{marginLeft: "10px"}} color="primary">Export</Button>
                </div>
                <div className="recipent_list list-wrap">
                  <label>List of Holders</label>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Amount</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>test</td>
                        <td>test</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        {showMessage && <div className="col-lg-10 top-alert">
            <div className="alert alert-success alert-dismissible">
            <strong>Alert:</strong> {message}
            </div>
        </div>}
      </Container>
    </div>
  );
}
