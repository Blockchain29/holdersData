import { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner'
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import Web3 from 'web3';
//import { AbiItem } from 'web3-utils'


declare let window: any;

const INIT_WALLET = "CONNECT";
const DISPALY_NUM = 50;
//const CHAIN_ID = '0x38';
//let web3 = new Web3(window.ethereum)

export default function App() {
  const [walletAddress, setWalletAddress] = useState(INIT_WALLET);
  const [tokenAddr, setTokenAddr] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [holderList, setHolderList] = useState<{}[]>([])
  const [fetching, setFetching] = useState(false);
  
  const [page, setPage] = useState(1);
  function showAlertDlg(msg: any, timeout: any) {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
        setShowMessage(false)
    }, timeout);
  }

  /*const getChainId = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  }*/

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showAlertDlg('MetaMask is not installed!', 1400)
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

  const onInputTokenAddr = async (e: any) => {
    if(!Web3.utils.isAddress(e.target.value)) {
      showAlertDlg("Invalid Address", 1000)
    }
    setTokenAddr(e.target.value);
  }

  const scan = async (pageNum: any) => {
    if(!Web3.utils.isAddress(tokenAddr)) {
      showAlertDlg("Invalid Address", 1000);
      return;
    }

    setFetching(true);

    fetch("https://api.bloxy.info/token/token_holders_list?token=" + tokenAddr + "&limit=" + pageNum * DISPALY_NUM + "&key=ACCIlegf1FPc0&format=csv")
    .then(res => res.text())
    .then(res => {
      let infos = res.split('\n');
      infos.shift();
      infos.pop();
      let holdersToDisplay = [];
      for (let index = (pageNum - 1) * DISPALY_NUM; index < pageNum * DISPALY_NUM; index++) {
        const element = infos[index];
        if (element) {
          const holder = element.split(',')
          if (holder.length > 3 && Web3.utils.isAddress(holder[0])) {
            holdersToDisplay.push({addr: holder[0], bal: holder[2]});
            //setHolderList([...holderList, {addr: holder[0], bal: holder[1]}]);
          }
        }
      }
      setFetching(false)
      setHolderList(holdersToDisplay);
    })
  }

  const exportFile = async () => {
    if(!Web3.utils.isAddress(tokenAddr)) {
      showAlertDlg("Invalid Address", 1000);
      return;
    }

    const downloadUrl = "https://api.bloxy.info/token/token_holders_list?token=" + tokenAddr + "&limit=100000&key=ACCIlegf1FPc0&format=csv";
    window.open(downloadUrl, "_blank")
  }

  const goNextPage = async () => {
    setPage(page + 1);
    scan(page + 1);
  }

  const goPrevPage = async () => {
    if (page === 1) {
      return;
    }
    setPage(page - 1);
    scan(page - 1);
  }

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
                    <input type="text" className="form-control" placeholder="Tokens Address" value={tokenAddr} onChange={(e) => onInputTokenAddr(e)}/>
                  </div>
                </div>
                <div style={{marginTop: "20px"}}> 
                  <Button className="submit_btn" onClick={() => scan(page)} style={{marginLeft: "10px"}} color="primary">&nbsp;&nbsp;Scan&nbsp;&nbsp;</Button>
                  <Button className="submit_btn" onClick={exportFile} style={{marginLeft: "10px"}} color="primary">Export</Button>
                </div>
                <div style={{marginBottom: "5px"}}>
                  {fetching ? <div><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" variant="info"></Spinner><span className="loading-span">&nbsp;Loading...</span></div> : <div><span>List of Holders</span></div>}
                </div>
                <div className="address_list list-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Amount</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {holderList.map((e: any, i: any) => {
                        return <tr key={i}>
                        <td>{e.addr}</td>
                        <td>{e.bal}</td>
                      </tr>})}
                    </tbody>
                  </table>
                </div>
                {(page > 0 && holderList.length > 0) && <div style={{marginTop: "20px"}}> 
                    <button className="page_btn" onClick={goPrevPage}>Prev</button>
                    <label style={{padding: "15px"}}>{page}</label>
                    <button className="page_btn" onClick={goNextPage}>Next</button>
                </div>}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-10 top-alert">
            <div className={"alert alert-success alert-dismissible " + (showMessage ? "alert-shown" : "alert-hidden")}>
            <strong>Alert:</strong> {message}
            </div>
        </div>
      </Container>
    </div>
  );
}
