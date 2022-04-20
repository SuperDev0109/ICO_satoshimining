import React, { Fragment, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Countdown from "react-countdown";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useDispatch, useSelector } from "react-redux";
// import { connector } from "../../crosswise/web3";
import { setAddress, setNetworkId } from "../redux/actions";
import api from '../utils/api';

// import { getUserDetail, getAmountUnlocked, deposit, withdrawToken, checkAllowanceBusd, ApproveBusd, checkWhitelistMember } from "../satm/token";
import { getDepositRate, deposit } from "../satm/token";
import { web3 } from "../satm/web3";

const Dashboard = () => {
    const dispatch = useDispatch();
    const address = useSelector((state) => state.authUser.address);

    const minimum = (address) => {
        const temp = String(address);
        return temp.slice(0, 4) + "..." + temp.slice(39, 42);
    };

    const [showPresaleDialog, setShowPresaleDialog] = useState(false);
    const [ethAmount, setEthAmount] = useState('');
    const [satmAmount, setSatmAmount] = useState('');
    const [showBuyButton, setShowBuyButton] = useState(false);
    const [formData, setFormData] = useState({
        c_name: '',
        c_email: '',
        c_message: ''
    });

    const { c_name, c_email, c_message } = formData;

    const handleClickOpen = () => {
        setShowPresaleDialog(true);
    };
    
    const handleClose = () => {
        setShowPresaleDialog(false);
    };

    const ethAmountChanged = async (e) => {
        setEthAmount(e.target.value);

        // Calculate the SATM token amount
        let depositRate = await getDepositRate();
        setSatmAmount(e.target.value * 10 ** 5 / depositRate * 0.999);
    }

    const handleBuyClicked = async () => {
        if (!address) {
            alert("Please connect the Metamask");
        } else {
            if (ethAmount < 1) {
                alert("Minimum invest amount is 1ETH");
            } else {
                const result = await deposit(web3.utils.toWei(ethAmount), address);
            }
        }
    }

    const handleJoinClicked = () => {
        setShowBuyButton(true);
    }

    const handleAddSatmToMetamask = async () => {
        try {
            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
            const wasAdded = await window.ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                  address: "0x62c1d77fe79c2b590bec1a64c6f479c8ed4a1e19", // The address that the token is at.
                  symbol: "SATM", // A ticker symbol or shorthand, up to 5 chars.
                  decimals: "18", // The number of decimals in the token
                //   image: tokenImage, // A string url of the token logo
                },
              },
            });
          
            if (wasAdded) {
              console.log('Thanks for your interest!');
            } else {
              console.log('Your loss!');
            }
          } catch (error) {
            console.log(error);
          }
    }

    const menuClick = (e, type) => {
        e.preventDefault();  // Stop Page Reloading
        let menuMove = document.getElementById(type);
        menuMove && menuMove.scrollIntoView({ behavior: "smooth", block: "start"});
        document.getElementById('menuBtn').className = 'navbarToggle';
        document.getElementById('menuToggle').className = 'headerNavbar headerNavbarS1 animatedMenu fadeOut';
        document.getElementById('menuOverlay').style.display = 'none';
    }

    const Completionist = () => <span>Private Sale started</span>;

    // Renderer callback with condition
    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a complete state
            return <Completionist />;
        } else {
            // Render a countdown
            return (
            <span>
                {hours}:{minutes}:{seconds}
            </span>
            );
        }
    };

    const menuToggle = () => {
        if (document.getElementById('menuBtn').className == 'navbarToggle navbarActive') {
            document.getElementById('menuBtn').className = 'navbarToggle';
            document.getElementById('menuToggle').className = 'headerNavbar headerNavbarS1 animatedMenu fadeOut';
            document.getElementById('menuOverlay').style.display = 'none';
        } else {
            document.getElementById("menuBtn").className = "navbarToggle navbarActive";
            document.getElementById('menuToggle').className = 'headerNavbar headerNavbarS1 menuShown animatedMenu fadeInLeft';
            document.getElementById('menuOverlay').style.display = 'block';
        }
    }

    const onConnectClick = async () => {
        console.log("Chain ID: ", window.ethereum.chainId);

        if (typeof window.ethereum === "undefined") {
            alert("Please install MetaMask!");
            return;
        }
    
        if (window.ethereum.chainId !== "0x4") {
            alert("Please choose the Ethereum rinkeby testnet!");
            return;
        }
    
        if (window.ethereum.selectedAddress !== null) {
            dispatch(setAddress(window.ethereum.selectedAddress));
            console.log("MetaMask was already connected.");
            return;
        }

        if (window.ethereum.selectedAddress === null) {
            try {
                console.log("Connecting wallet...");
                await window.ethereum.request({ method: "eth_requestAccounts" });
                dispatch(setAddress(window.ethereum.selectedAddress));
            } catch (err) {
                console.log("Error: ", err);
            }
        }
    }

    const onChangeContact = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onContactClick = async e=> {
        if (!c_name) {
            alert('Please input your name!');
            return;
        }
        if (!c_email) {
            alert('Please input your email!');
            return;
        }
        if (!c_message) {
            alert('Please input message!');
            return;
        }

        const formData = new FormData();
        formData.append('name', c_name);
        formData.append('email', c_email);
        formData.append('message', c_message);
    
        try {
          const res = await api.post('/contact', formData);
          setFormData({
              c_name: '',
              c_email: '',
              c_message: ''
          })
          alert('sent');
        } catch(err) {
          alert('fail');
        }
    }

    return (
        <Fragment>
            <div className="nk-body body-wider mode-onepage">

                <div className="nk-wrap">
                    <header
                        className="nk-header page-header is-sticky is-shrink is-transparent is-light"
                        id="header">
                        <div className="header-main">
                            <div className="header-container container">
                                <div className="header-wrap">
                                    <div
                                        className="header-logo logo animated"
                                        data-animate="fadeInDown"
                                        data-delay=".65">
                                        <a href="./" className="logo-link">
                                            <img
                                                className="logo-dark"
                                                src="images/logo/logo1.png" 
                                                style={{ width: '200px !important', height: '80px !important' }}
                                                alt="logo"/>
                                            <img
                                                className="logo-light"
                                                src="images/logo/logo1.png"
                                                style={{ width: '200px !important', height: '80px !important' }}
                                                alt="logo"/>
                                        </a>
                                    </div>
                                    <div className="header-nav-toggle">
                                        <span  className="navbarToggle" data-menu-toggle="header-menu" onClick={() => menuToggle()} id="menuBtn" style={{ cursor: 'pointer' }}>
                                            <div className="toggle-line">
                                                <span></span>
                                            </div>
                                        </span>
                                    </div>
                                    <div className="headerNavbar headerNavbarS1" id="menuToggle">
                                        <nav className="header-menu" id="header-menu">
                                            <ul className="menu animated" data-animate="fadeInDown" data-delay=".75">
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'tokenomics')}>
                                                        Tokenomics
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'ecosystem')}>
                                                        Ecosystem
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'token')}>
                                                        Token Sale
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'whitepaper')}>
                                                        Whitepaper
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'roadmap')}>
                                                        Roadmap
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'team')}>
                                                        Team
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'faqs')}>
                                                        Faqs
                                                    </a>
                                                </li>
                                                <li className="menu-item">
                                                    <a className="menu-link nav-link" href="/" onClick={(e) => menuClick(e, 'contact')}>
                                                        Contact
                                                    </a>
                                                </li>
                                            </ul>
                                            <ul
                                                className="menu-btns menu-btns-s3 align-items-center animated"
                                                data-animate="fadeInDown"
                                                data-delay=".85">
                                                {/* <li className="language-switcher language-switcher-s1 toggle-wrap">
                                                    <a className="toggle-tigger" href="#">English</a>
                                                    <ul
                                                        className="toggle-class toggle-drop toggle-drop-left drop-list drop-list-sm">
                                                        <li>
                                                            <a href="#">French</a>
                                                        </li>
                                                        <li>
                                                            <a href="#">Chinese</a>
                                                        </li>
                                                        <li>
                                                            <a href="#">Hindi</a>
                                                        </li>
                                                    </ul>
                                                </li> */}
                                                <li>
                                                    {!address ? (
                                                        <a data-toggle="modal" data-target="#register-popup" className="btn btn-md btn-primary btn-outline" onClick={() => onConnectClick()}>
                                                            <span>Connect Wallet</span>
                                                        </a>
                                                    ) : (
                                                        <a className="btn btn-md btn-primary btn-outline">
                                                        <span>{minimum(address)}</span>
                                                    </a>
                                                    )}
                                                </li>
                                            </ul>
                                        </nav>
                                        <div className='header-navbar-overlay' id="menuOverlay" hidden></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="header-banner bg-light ov-h header-banner-jasmine">
                            <div className="background-shape"></div>
                            <div className="nk-banner">
                                <div className="banner banner-fs banner-single">
                                    <div className="nk-block nk-block-header my-auto">
                                        <div className="container">
                                            <div className="row align-items-center justify-content-center">
                                                <div className="col-lg-9 text-center">
                                                    <div className="banner-caption">
                                                        <div className="cpn-head">
                                                            {/* <h1
                                                                className="title title-xl-2 animated"
                                                                data-animate="fadeInUp"
                                                                data-delay="1.25">Satoshi Mining, 
                                                                <br className="d-none d-xl-block"/>
                                                                the bitcoin mining token</h1> */}
                                                            <img src='images/logo/SM_logo_tagline.png' className='animated logo-tagline' data-animate="fadeInUp" data-delay="1.25" />
                                                        </div>
                                                        {/* <div className="cpn-text cpn-text-s2">
                                                            <p className="lead-s2 animated" data-animate="fadeInUp" data-delay="1.35">
                                                                <br className="d-none d-sm-block"/>&nbsp;</p>
                                                        </div> */}
                                                        {/* <div className="cpn-action">
                                                            <ul className="cpn-links animated" data-animate="fadeInUp" data-delay="1.45">
                                                                <li>
                                                                    <a className="link link-primary" href="download/Satoshi Minining Whitepaper.pdf" target="_blank">
                                                                        <em className="link-icon icon-circle ti ti-files"></em>
                                                                        <span>White Paper</span>
                                                                    </a>
                                                                </li>
                                                            </ul>
                                                        </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="nk-block nk-block-status">
                                        <div className="container">
                                            <div className="row justify-content-center">
                                                <div className="col-lg-8">
                                                    <div className="row justify-content-center">
                                                        <div className="col-md-8">
                                                            <div className="token-status token-status-s4">
                                                                <div
                                                                    className="token-box token-box-s2 bg-transparent animated"
                                                                    data-animate="fadeInUp"
                                                                    data-delay="1.65"
                                                                    style={{paddingBottom: "0"}}>
                                                                    <h4 className="title title-xs-alt tc-default">PRIVATE SALE STARTING IN</h4>
                                                                    <h6 className="title tc-default">
                                                                        <Countdown date={Date.now() + 5000000} renderer={renderer} />
                                                                    </h6>
                                                                    <div className="countdown-s3 countdown-s4 countdown" data-date="2021/08/10"></div>
                                                                </div>
                                                                <div
                                                                    className="token-action token-action-s1 animated"
                                                                    data-animate="fadeInUp"
                                                                    data-delay="1.65" style={{ marginTop: '0px' }}>
                                                                    <a className="btn btn-md btn-primary btn-outline" onClick={() => handleAddSatmToMetamask()}>
                                                                        <span>Add SATM to Metamask</span>
                                                                    </a>
                                                                    {showBuyButton ? (
                                                                        // <Button className="presale-join" variant="outlined" onClick={handleClickOpen}>
                                                                        //     BUY SATM
                                                                        // </Button>
                                                                        <><br /><button className="btn btn-rg btn-grad btn-grad-alt" onClick={handleClickOpen} style={{color: "white", marginTop: "25px"}}>Buy SATM</button></>
                                                                    ) : (
                                                                        <a className="btn btn-rg btn-grad btn-grad-alt" href="https://bs0vr736kem.typeform.com/to/QsXKrfN3" target="_blank" onClick={() => handleJoinClicked()} style={{marginTop: "25px"}}>Sign UP &amp; Join our Private-Sale list</a>
                                                                    )}
                                                                </div>
                                                                <ul className="icon-list animated" data-animate="fadeInUp" data-delay="1">
                                                                    {/* <li>
                                                                        <em className="fab fa-bitcoin"></em>
                                                                    </li> */}
                                                                    <li style={{fontSize: '24px', cursor: 'pointer'}}>
                                                                        <em className="fab fa-ethereum"></em>
                                                                    </li>
                                                                    {/* <li>
                                                                        <em className="fab fa-cc-visa"></em>
                                                                    </li>
                                                                    <li>
                                                                        <em className="fab fa-cc-mastercard"></em>
                                                                    </li> */}
                                                                </ul>
                                                                <ul className="animated" data-animate="fadeInUp" data-delay=".65">
                                                                    <p className="title title-xs-alt tc-default animated" style={{ textAlign: 'left', fontWeight: '500' }} data-animate="fadeInUp" data-delay=".68">1. Register for the SATM ICO by clicking the "Sign-Up & Join Our Private-Sale List".</p>
                                                                    <p className="title title-xs-alt tc-default animated" style={{ textAlign: 'left', fontWeight: '500' }} data-animate="fadeInUp" data-delay=".70">2. Move your Ethereum to a wallet you control.</p>
                                                                    <p className="title title-xs-alt tc-default animated" style={{ textAlign: 'left', fontWeight: '500' }} data-animate="fadeInUp" data-delay=".72">3. Connect your Ethereum wallet to our website, click the "BUY" and input the amount of SATM you wish to purchase.</p>
                                                                    <p className="title title-xs-alt tc-default animated" style={{ textAlign: 'left', fontWeight: '500' }} data-animate="fadeInUp" data-delay=".74">4. Receive your SATM tokens in the Ethereum address you provided immediately once you complete the ICO process.</p>
                                                                </ul>
                                                                <div
                                                                    className="circle-animation animated"
                                                                    data-animate="fadeIn"
                                                                    data-delay="1.55"
                                                                    style={{ zIndex: '-1' }}>
                                                                    <div className="circle-animation-l1 ca">
                                                                        <span className="circle-animation-l1-d1 ca-dot ca-color-1"></span>
                                                                        <span className="circle-animation-l1-d2 ca-dot ca-color-2"></span>
                                                                        <span className="circle-animation-l1-d3 ca-dot ca-color-3"></span>
                                                                        <span className="circle-animation-l1-d4 ca-dot ca-color-1"></span>
                                                                        <span className="circle-animation-l1-d5 ca-dot ca-color-2"></span>
                                                                        <span className="circle-animation-l1-d6 ca-dot ca-color-3"></span>
                                                                    </div>
                                                                    <div className="circle-animation-l2 ca">
                                                                        <span className="circle-animation-l2-d1 ca-dot ca-color-1"></span>
                                                                        <span className="circle-animation-l2-d2 ca-dot ca-color-3"></span>
                                                                        <span className="circle-animation-l2-d3 ca-dot ca-color-2"></span>
                                                                        <span className="circle-animation-l2-d4 ca-dot ca-color-1"></span>
                                                                        <span className="circle-animation-l2-d5 ca-dot ca-color-2"></span>
                                                                    </div>
                                                                    <div className="circle-animation-l3 ca">
                                                                        <span className="circle-animation-l3-d1 ca-dot ca-color-1"></span>
                                                                        <span className="circle-animation-l3-d2 ca-dot ca-color-3"></span>
                                                                        <span className="circle-animation-l3-d3 ca-dot ca-color-2"></span>
                                                                        <span className="circle-animation-l3-d4 ca-dot ca-color-1"></span>
                                                                        <span className="circle-animation-l3-d5 ca-dot ca-color-2"></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </header>

                    <main className="nk-pages">
                        <section className="section bg-white" id="tokenomics">
                            <div className="container">

                                <div className="nk-block nk-block-lg nk-block-features-s2">
                                    <div className="row align-items-center flex-row-reverse gutter-vr-30px">
                                        <div className="col-md-6">
                                            <div className="gfx animated" data-animate="fadeInUp" data-delay=".1">
                                                <img src="images/gfx/gfx-s-light.png" alt="gfx"/>
                                            </div>
                                        </div>
                                        <div className="col-md-6">

                                            <div className="nk-block-text">
                                                <h6
                                                    className="title title-xs title-s1 tc-primary animated"
                                                    data-animate="fadeInUp"
                                                    data-delay=".2">Tokenomics</h6>
                                                <h2 className="title animated" data-animate="fadeInUp" data-delay=".3">Tokenomics</h2>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".4" style={{ fontWeight: '500' }}>What is the total supply of SATM?</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".45">100,000,000 SATM</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".5" style={{ fontWeight: '500' }}>What is the token distribution?</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".5">
                                                    20,000,000 SATM Crowdsale  <br />
                                                    20,000,000 Founders  <br />
                                                    50,000,000 Circulating supply <br />
                                                    1,000,000 Bonuses, bounties, and rewards  <br />
                                                    9,000,000 Merger &amp; Acquisition and treasury
                                                </p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".6">40% of annual profits will be used to reinvest into Satoshi Mining to scale the operation.</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".65">10% of annual profits will go to buybacks of SATM in the open market which will then be burned.</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".7">This will reduce the circulating supply and therefore should increase the value of SATM tokens. There is no set strategic schedule of buybacks but they will occur on a yearly basis.</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".75">Buybacks help to control float, which grants control over the uncertainty of the market. Controlling float is important so that a company can not be manipulated by anyone who does not have the company’s best interests at heart. 50% of profits will be used to pay for research, marketing, team member’s salaries and other necessary costs to grow the company and token.</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".8">The team's founding tokens have a 2 year lockup period. Only founders and certain partners are locked or vested. We will have more updates on the number of locked/vested tokens in the future.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="nk-block nk-block-features-s2">
                                    <div className="row align-items-center flex-row-reverse gutter-vr-30px">
                                        <div className="col-md-6">
                                            <div className="nk-block-text">
                                                <h6
                                                    className="title title-xs title-s1 tc-primary animated"
                                                    data-animate="fadeInUp"
                                                    data-delay=".2">Smart Contracts</h6>
                                                <h2 className="title animated" data-animate="fadeInUp" data-delay=".3">Adaptive Smart Contracts</h2>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".4">Satoshi Mining exclusively uses Open Zeppelin audited smart contracts.  OpenZeppelin Smart Contracts mitigates risk by using audited libraries of smart contracts for Ethereum.  The library of smart contracts includes the most common applications of ERC standards. </p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".5">In 2017, Delaware passed Senate Bill 69, which allows businesses to be incorporated and managed using blockchain technology.  This bill opened the door to the growth of decentralized autonomous organizations (DAOs), which function as corporations wherein ownership and compensation can be built into smart contracts.</p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".6"> DAOs, using smart contracts to encode corporate structures, can enable sophisticated, automatically enforced incentive structures within a corporate framework. </p>
                                                <p className="animated" data-animate="fadeInUp" data-delay=".7"> Part of Satoshi Mining’s road map is to implement a governance platform or token, which would be airdropped to SATM token holders in our ecosystem in order to become a fully operating DAO.</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="gfx animated" data-animate="fadeInUp" data-delay=".1">
                                                <img src="images/gfx/gfx-u-light.png" alt="gfx"/>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="section bg-light" id="ecosystem">
                            <div className="container">
                                <div className="section-head section-head-s9 wide-md">
                                    <h6
                                        className="title title-xs title-s1 tc-primary animated"
                                        data-animate="fadeInUp"
                                        data-delay=".1">Ecosystem</h6>
                                    <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Ecosystem</h2>
                                    <p className="animated" data-animate="fadeInUp" data-delay=".3">Satoshi Mining is a Bitcoin-first company on a mission to support the decentralized growth of hashrate and strengthen network security by democratizing bitcoin mining and helping more people learn, explore, and mine bitcoin.  With Satoshi Mining, bitcoin mining will become a decentralized and democratized bitcoin mining DAO.</p>
                                    <p className="animated" data-animate="fadeInUp" data-delay=".4">Implementing an options overlay strategy on our bitcoin treasury is imperative.  The strategy will reduce the risk of our bitcoin holdings by 50% without having an effect on long-term returns. Eventually, as we capture more bitcoin price data, we will implement an A.I.-based derivatives overlay hedging strategy on the company's bitcoin treasury.  The A.I.-based derivatives strategy will reduce the volatility of our portfolio by 50% without affecting the treasuries bitcoin's upside potential.</p>
                                    <p className="animated" data-animate="fadeInUp" data-delay=".5">Diversifying the locations and methods of mining mitigates the risks of the operation completely halting.  It is very important we focus on diversification as we grow.</p>
                                    <p className="animated" data-animate="fadeInUp" data-delay=".6">Part of our roadmap is to start borrowing SATM tokens from holders.  Holders can expect a minimum of a 10% yield paid out annually in bitcoin.  Longer-term loans will guarantee higher rates.  We are initially planning 1 to 5-year lending periods.  All SATM borrowed will be used to scale the Satoshi Mining operation.</p>
                                    <p className="animated" data-animate="fadeInUp" data-delay=".7">Also part of Satoshi Mining’s roadmap is to become a fully operating DAO.  In order to achieve this we would implement a governance platform or token.  If we develop a governance token, the tokens would be airdropped to only SATM token holders.</p>
                                </div>
                            </div>
                        </section>

                        <section className="section bg-white" id="token">

                            <div className="container">
                                <div className="section-head section-head-s9 wide-md">
                                    <h6
                                        className="title title-xs title-s1 tc-primary animated"
                                        data-animate="fadeInUp"
                                        data-delay=".1">Token</h6>
                                    <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Token Sale</h2>
                                    <div className="wide-md">
                                        <p className="animated" data-animate="fadeInUp" data-delay=".3">In our token sale, Satoshi Mining sells 20% of its own tokens through a private sale and crowdsale of SATM tokens.  SATM tokens are exchanged for an amount of an existing liquid medium of exchange, such as Btc or Eth, at a fixed or tiered exchange rate.  This allows Satoshi Mining to finance the development of its products and services and to grow and operate the company.</p>
                                    </div>
                                </div>
                                <div className="nk-block nk-block-token">
                                    <div className="row gutter-vr-30px">
                                        <div className="col-lg-7">
                                            <div className="row" style={{ justifyContent: 'center' }}>
                                                <div className="col-sm-5">
                                                    <div
                                                        className="token-stage text-center animated"
                                                        data-animate="fadeInUp"
                                                        data-delay=".4">
                                                        <div className="token-stage-title token-stage-pre">Private sale</div>
                                                        <div className="token-stage-date">
                                                            <h6>15 March 2022</h6>
                                                            <span>7 Days</span>
                                                        </div>
                                                        <div className="token-stage-info">
                                                            <span className="token-stage-bonus">19% Bonus</span>
                                                            <span className="token-stage-cap">Price: 0.9$</span>
                                                            <span className="token-stage-amount">Minimum Invest Amount: <br/>$2500 USD</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-sm-5">
                                                    <div
                                                        className="token-stage text-center animated"
                                                        data-animate="fadeInUp"
                                                        data-delay=".5">
                                                        <div className="token-stage-title token-stage-one">Crowd sale</div>
                                                        <div className="token-stage-date">
                                                            <h6>22 March 2022</h6>
                                                            <span>7 Days</span>
                                                        </div>
                                                        <div className="token-stage-info">
                                                            <span className="token-stage-bonus">10% Bonus</span>
                                                            <span className="token-stage-cap">Price: 1$</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="token-action-box text-center animated"
                                                data-animate="fadeInUp"
                                                data-delay=".7">
                                                <div className="token-action-title">Join Our
                                                    <br/>
                                                    Private-Sale List</div>
                                                <div className="token-action-date">
                                                    <strong>Private-Sale Start at</strong>
                                                    15 March 2022</div>
                                                <div className="token-action-btn">
                                                    {showBuyButton ? (
                                                        <Button className="presale-join" variant="outlined" onClick={handleClickOpen}>
                                                            BUY SATM
                                                        </Button>
                                                    ) : (
                                                        <a href="https://bs0vr736kem.typeform.com/to/QsXKrfN3" target="_blank" className="btn btn-lg btn-grad" onClick={() => handleJoinClicked()}>Signup &amp; Join</a>
                                                    )}
                                                    <Dialog open={showPresaleDialog} onClose={handleClose}>
                                                        <DialogTitle>BUY SATM</DialogTitle>
                                                        <DialogContent>
                                                        {/* <DialogContentText>
                                                            To subscribe to this website, please enter your email address here. We
                                                            will send updates occasionally.
                                                        </DialogContentText> */}
                                                        <div>
                                                            <TextField
                                                                autoFocus
                                                                margin="dense"
                                                                id="eth-amount"
                                                                label="ETHER"
                                                                type="number"
                                                                fullWidth
                                                                variant="standard"
                                                                value={ethAmount}
                                                                onChange={(e) => ethAmountChanged(e)}
                                                                inputProps={{min: "1"}}
                                                            />
                                                            <TextField
                                                                margin="dense"
                                                                id="satm-amount"
                                                                label="SATM"
                                                                type="text"
                                                                fullWidth
                                                                variant="standard"
                                                                disabled
                                                                value={satmAmount}
                                                            />
                                                        </div>
                                                        </DialogContent>
                                                        <DialogActions>
                                                            <Button onClick={handleBuyClicked}>Buy</Button>
                                                            <Button onClick={handleClose}>Cancel</Button>
                                                        </DialogActions>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-5">
                                            <table
                                                className="table table-token table-token-s1 animated"
                                                data-animate="fadeInUp"
                                                data-delay=".8">
                                                <tbody>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Token Symbol</td>
                                                        <td className="table-des table-des-s1">SATM</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Token Sale Start</td>
                                                        <td className="table-des table-des-s1">15 March 2022</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Token Sale End</td>
                                                        <td className="table-des table-des-s1">22 March 2022</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Tokens for sale</td>
                                                        <td className="table-des table-des-s1">20,000,000</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Specifications</td>
                                                        <td className="table-des table-des-s1">SATM token</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Max circulating supply</td>
                                                        <td className="table-des table-des-s1">100,000,000</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="table-head table-head-s1">Sale duration</td>
                                                        <td className="table-des table-des-s1">7 days</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="nk-block">
                                    <div className="row">
                                        <div className="col-lg-6" style={{ marginBottom: '50px' }}>
                                            <h3 className="sub-heading-s2 animated" data-animate="fadeInUp" data-delay=".1" style={{ marginBottom: '20px' }}>Token Allocation</h3>
                                            <div className='pie_panel'>
                                                <div className='pie_chart'>
                                                    <ReactApexChart options={ {
                                                        chart: {
                                                            type: 'donut',
                                                        },
                                                        labels: ["ICO", "Founders", "Circulating Supply", "Bonuses, Bounties, & Rewards", "M&A & Treasury"],
                                                        legend: {
                                                            show: true,
                                                            position: 'right',
                                                        },
                                                        responsive: [
                                                            {
                                                                breakpoint: 1200,
                                                                options: {
                                                                    chart: {
                                                                        width: 550
                                                                    },
                                                                    legend: {
                                                                        position: 'right'
                                                                    }
                                                                },
                                                            },
                                                        {
                                                            breakpoint: 992,
                                                            options: {
                                                                chart: {
                                                                    width: 500
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 650,
                                                            options: {
                                                                chart: {
                                                                    width: 500
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 533,
                                                            options: {
                                                                chart: {
                                                                    width: 450
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 484,
                                                            options: {
                                                                chart: {
                                                                    width: 400
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 425,
                                                            options: {
                                                                chart: {
                                                                    width: 350
                                                                },
                                                                legend: {
                                                                    position: 'bottom'
                                                                }
                                                            },
                                                        }
                                                        ]
                                                    } } 
                                                    series={[20, 20, 50, 1, 9]} 
                                                    type="donut" 
                                                    />
                                                </div>
                                                <div className='pie_chart_detail' style={{ width: '70%', margin: 'auto', paddingTop: '40px' }}>
                                                    <ul className='chart-data'>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#008ffb' }}></span>
                                                            <span className='chart-l'>ICO</span>
                                                            <span className='chart-p'>20%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#00e396' }}></span>
                                                            <span className='chart-l'>Founders</span>
                                                            <span className='chart-p'>20%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#feb019' }}></span>
                                                            <span className='chart-l'>Circulating Supply</span>
                                                            <span className='chart-p'>50%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#ff4560' }}></span>
                                                            <span className='chart-l'>Bonuses, Bounties, & Rewards</span>
                                                            <span className='chart-p'>1%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#775dd0' }}></span>
                                                            <span className='chart-l'>M&A & Treasury</span>
                                                            <span className='chart-p'>9%</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <h3 className="sub-heading-s2 animated" data-animate="fadeInUp" data-delay=".1" style={{ marginBottom: '20px' }}>Operating Allocation</h3>
                                            <div className='pie_panel'>
                                                <div className='pie_chart' style={{ width: '569px' }}>
                                                    <ReactApexChart options={ {
                                                    chart: {
                                                        type: 'donut',
                                                    },
                                                    labels: ["Admin & Costs", "Legal & Advisory", "Marketing & Sales", "Business development & Operations"],
                                                    legend: {
                                                        show: true,
                                                        position: 'right',
                                                    },
                                                    responsive: [
                                                        {
                                                            breakpoint: 992,
                                                            options: {
                                                                chart: {
                                                                    width: 500
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 650,
                                                            options: {
                                                                chart: {
                                                                    width: 500
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 533,
                                                            options: {
                                                                chart: {
                                                                    width: 450
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 484,
                                                            options: {
                                                                chart: {
                                                                    width: 400
                                                                },
                                                                legend: {
                                                                    position: 'right'
                                                                }
                                                            },
                                                        },
                                                        {
                                                            breakpoint: 425,
                                                            options: {
                                                                chart: {
                                                                    width: 350
                                                                },
                                                                legend: {
                                                                    position: 'bottom'
                                                                }
                                                            },
                                                        }
                                                        ]
                                                    } } 
                                                    series={[2, 3, 5, 90]} 
                                                    type="donut" 
                                                    />
                                                </div>
                                                <div className='pie_chart_detail' style={{ width: '70%', margin: 'auto', paddingTop: '40px' }}>
                                                    <ul className='chart-data'>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#008ffb' }}></span>
                                                            <span className='chart-l'>Admin & Costs</span>
                                                            <span className='chart-p'>2%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#00e396' }}></span>
                                                            <span className='chart-l'>Legal & Advisory</span>
                                                            <span className='chart-p'>3%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#feb019' }}></span>
                                                            <span className='chart-l'>Marketing & Sales</span>
                                                            <span className='chart-p'>5%</span>
                                                        </li>
                                                        <li>
                                                            <span className='chart-c' style={{ backgroundColor: '#ff4560' }}></span>
                                                            <span className='chart-l'>Business development & Operations</span>
                                                            <span className='chart-p'>90%</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>
                        </section>

                        <section className="section bg-light" id="whitepaper">
                            <div className="container">
                                <div className="section-head section-head-s9 wide-md">
                                    <h6
                                        className="title title-xs title-s1 tc-primary animated"
                                        data-animate="fadeInUp"
                                        data-delay=".1">Download Documents</h6>
                                    <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Read Our Documents</h2>
                                    <div className="wide-sm">
                                        <p className="animated" data-animate="fadeInUp" data-delay=".3">Here is our full
                                            documents that help you to understand about us.</p>
                                    </div>
                                </div>

                                <div className="nk-block nk-block-features">
                                    <div className="row gutter-vr-30px">
                                        <div className="col-xl-3 col-sm-6 col-mb-10">
                                            <div
                                                className="doc doc-s2 bg-white animated"
                                                data-animate="fadeInUp"
                                                data-delay=".4">
                                                <div className="doc-photo no-hover">
                                                    <img src="images/docs/alt-sm-a.png" alt="doc"/>
                                                </div>
                                                <div className="doc-text">
                                                    <h6 className="doc-title title-xs-alt">Whitepaper</h6>
                                                    <ul className="btn-grp gutter-10px">
                                                        <li>
                                                            <a className="btn btn-outline btn-xxs btn-auto btn-light" href="download/Satoshiminig_Whitepaper.pdf" target="_blank">ENG</a>
                                                        </li>
                                                        {/* <li>
                                                            <a className="btn btn-outline btn-xxs btn-auto btn-light" href="#">RUS</a>
                                                        </li> */}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xl-3 col-sm-6 col-mb-10">
                                            <div
                                                className="doc doc-s2 bg-white animated"
                                                data-animate="fadeInUp"
                                                data-delay=".5">
                                                <div className="doc-photo no-hover">
                                                    <img src="images/docs/Financial.png" alt="doc"/>
                                                </div>
                                                <div className="doc-text">
                                                    <h6 className="doc-title title-xs-alt">Financial forecast</h6>
                                                    <ul className="btn-grp gutter-10px">
                                                        <li>
                                                            <a className="btn btn-outline btn-xxs btn-auto btn-light" href="download/Forecasted Financial Performance.pdf" target="_blank">ENG</a>
                                                        </li>
                                                        {/* <li>
                                                            <a className="btn btn-outline btn-xxs btn-auto btn-light" href="#">RUS</a>
                                                        </li> */}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="section bg-white" id="roadmap">
                            <div className="container">
                                <div className="section-head section-head-s9 wide-md">
                                    <h6
                                        className="title title-xs title-s1 tc-primary animated"
                                        data-animate="fadeInUp"
                                        data-delay=".1">Timeline</h6>
                                    <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Roadmap</h2>
                                    <div className="wide-sm">
                                        <p className="animated" data-animate="fadeInUp" data-delay=".3">Founded in 2021, Satoshi Mining is at the forefront of bitcoin mining.  We have achieved great things since our inception and we were able to lay a strong foundation to build even more powerful tools. The ecosystem is continuously evolving, so are we.</p>
                                    </div>
                                </div>

                                <div className="nk-block nk-block-left">
                                    <div
                                        className="roadmap-all mgb-m50 animated"
                                        data-animate="fadeInUp"
                                        data-delay=".4">
                                        <div
                                            className="roadmap-wrap roadmap-wrap-s1 roadmap-wrap-s1-alt mb-0 ml-0">
                                            <div className="row no-gutters">
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt roadmap-done text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">Sep 2021</span>
                                                                <span className="roadmap-title roadmap-title-s1">Developed Satoshi Mining token (SATM), a decentralized bitcoin mining cryptocurrency</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>Developed Satoshi Mining token (SATM),</li>
                                                                <li>a decentralized bitcoin mining cryptocurrency</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-current roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">Dec 2021</span>
                                                                <span className="roadmap-title roadmap-title-s1">Website development, marketing and technology team added</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>Website development,</li>
                                                                <li>marketing and technology team added</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">May 2022</span>
                                                                <span className="roadmap-title roadmap-title-s1"> Launch Private-sale of SATM at the price of 1 SATM = $0.90</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>Platform design and technical demonstration</li>
                                                                <li>Building the MVP</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="roadmap-wrap roadmap-wrap-s1 roadmap-wrap-s1-alt mb-0 ml-0">
                                            <div className="row flex-row-reverse no-gutters">
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">May 2022</span>
                                                                <span className="roadmap-title roadmap-title-s1">Launch Crowdsale of SATM at the price of 1 SATM = $1.00</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>Public financing &amp; Seed funding raised</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg">
                                                    <div
                                                        className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">June 2022</span>
                                                                <span className="roadmap-title roadmap-title-s1">Listing of SATM tokens on the Uniswap exchange at the price of 1 SATM = $1.11</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>Private closed beta</li>
                                                                <li>Open beta launched to public and improvement the app</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">May 2022</span>
                                                                <span className="roadmap-title roadmap-title-s1">Deploy capital to mining/cloud mining/immersion mining operations</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>ICO Press Tour</li>
                                                                <li>Open global sales of ICOblock token</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="roadmap-wrap roadmap-wrap-s1 roadmap-wrap-s1-alt mb-lg-0 ml-0">
                                            <div className="row no-gutters">
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">Dec 2022</span>
                                                                <span className="roadmap-title roadmap-title-s1">Develop an A.I. Derivatives hedging strategy on Satoshi Mining’s bitcoin treasury.</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>In-house testing of functional</li>
                                                                <li>Prototype published and linked to Ethereum blockchain with real-time scanning</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">Mar 2023</span>
                                                                <span className="roadmap-title roadmap-title-s1">Launch Governance platform or token and Lending platform on SATM.</span>
                                                            </div>
                                                            {/* <ul className="roadmap-step-list roadmap-step-list-s1">
                                                                <li>Smart contracts support creators</li>
                                                                <li>Ethereum tokens support</li>
                                                            </ul> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg">
                                                    <div className="roadmap roadmap-s1  roadmap-s1-alt text-lg-center">
                                                        <div className="roadmap-step roadmap-step-s1">
                                                            <div className="roadmap-head roadmap-head-s1">
                                                                <span className="roadmap-time roadmap-time-s1">Dec 2025</span>
                                                                <span className="roadmap-title roadmap-title-s1">100% of all mining operations will be using renewable energy.</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="section bg-light-alt" id="team">
                            <div className="background-shape bs-right"></div>
                            <div className="container">
                                <div className="section-head section-head-s9 wide-md">
                                    <h6
                                        className="title title-xs title-s1 tc-primary animated"
                                        data-animate="fadeInUp"
                                        data-delay=".1">MEET THE TEAM</h6>
                                    <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Executive team</h2>
                                    <div className="wide-sm">
                                        <p className="animated" data-animate="fadeInUp" data-delay=".3">The Satoshi Mining team combines a passion for Bitcoin and Blockchain.  The team has a bitcoin mining expertise and a proven track record. The team is also very well versed in finance, business development, and marketing.</p>
                                    </div>
                                </div>

                                <div className="nk-block nk-block-left nk-block-team-list team-list">
                                    <div className="row justify-content-start">
                                        <div className="col-lg-3 col-sm-6">
                                            <div
                                                className="team team-s4 round bg-white ml-0 animated"
                                                data-animate="fadeInUp"
                                                data-delay=".4">
                                                <div className="team-photo team-photo-s1 round-full">
                                                    <img src="assets/custom/3.jpeg" alt="team" className="round-full" style={{ width: '160px', height: '160px' }} />
                                                </div>
                                                <h5 className="team-name">Ahmed Khaleel</h5>
                                                <span className="team-position tc-primary">Co-founder</span>
                                                <div className="team-desc">
                                                    {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                        tempor incide.</p> */}
                                                </div>
                                                <ul className="team-social team-social-s2">
                                                    <li>
                                                        <a href="http://linkedin.com/in/ahmed-khaleel-b232287a">
                                                            <em className="fab fa-linkedin-in"></em>
                                                        </a>
                                                    </li>
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="fab fa-facebook-f"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <em className="fab fa-twitter"></em>
                                                        </a>
                                                    </li> */}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div
                                                className="team team-s4 round bg-white ml-0 animated"
                                                data-animate="fadeInUp"
                                                data-delay=".5">
                                                <div className="team-photo team-photo-s1 round-full">
                                                    <img src="assets/custom/1.png" alt="team" className="round-full" style={{ width: '160px', height: '160px' }} />
                                                </div>
                                                <h5 className="team-name">Jon Vaz</h5>
                                                <span className="team-position tc-primary">Chief Marketing Officer</span>
                                                <div className="team-desc">
                                                    {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                        tempor incide.</p> */}
                                                </div>
                                                <ul className="team-social team-social-s2">
                                                    <li>
                                                        <a href="http://linkedin.com/in/daniel-dismukes-06762a16">
                                                            <em className="fab fa-linkedin-in"></em>
                                                        </a>
                                                    </li>
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="fab fa-facebook-f"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <em className="fab fa-twitter"></em>
                                                        </a>
                                                    </li> */}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div
                                                className="team team-s4 round bg-white ml-0 animated"
                                                data-animate="fadeInUp"
                                                data-delay=".6">
                                                <div className="team-photo team-photo-s1 round-full">
                                                    <img src="assets/custom/4.png" alt="team" className="round-full" style={{ width: '160px', height: '160px' }} />
                                                </div>
                                                <h5 className="team-name">Kirill Romanov</h5>
                                                <span className="team-position tc-primary">CTO</span>
                                                <div className="team-desc">
                                                    {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                        tempor incide.</p> */}
                                                </div>
                                                <ul className="team-social team-social-s2">
                                                    <li>
                                                        <a href="http://linkedin.com/in/kirill-romanov-7b341a233">
                                                            <em className="fab fa-linkedin-in"></em>
                                                        </a>
                                                    </li>
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="fab fa-facebook-f"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <em className="fab fa-twitter"></em>
                                                        </a>
                                                    </li> */}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6">
                                            <div
                                                className="team team-s4 round bg-white ml-0 animated"
                                                data-animate="fadeInUp"
                                                data-delay=".7">
                                                <div className="team-photo team-photo-s1 round-full">
                                                    <img src="assets/custom/2.JPG" alt="team" className="round-full" style={{ width: '160px', height: '160px' }} />
                                                </div>
                                                <h5 className="team-name">Dan Dismukes</h5>
                                                <span className="team-position tc-primary">Co-founder</span>
                                                <div className="team-desc">
                                                    {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                                        tempor incide.</p> */}
                                                </div>
                                                <ul className="team-social team-social-s2">
                                                    <li>
                                                        <a href="http://linkedin.com/in/daniel-dismukes-06762a16">
                                                            <em className="fab fa-linkedin-in"></em>
                                                        </a>
                                                    </li>
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="fab fa-facebook-f"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="#">
                                                            <em className="fab fa-twitter"></em>
                                                        </a>
                                                    </li> */}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </section>

                       

                        <section className="section bg-light" id="faqs">
                            <div className="container">
                                <div className="section-head section-head-s9 wide-md">
                                    <h6
                                        className="title title-xs title-s1 tc-primary animated"
                                        data-animate="fadeInUp"
                                        data-delay=".1">FAQ</h6>
                                    <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Frequently Asked Questions</h2>
                                    {/* <div className="wide-sm">
                                        <p className="animated" data-animate="fadeInUp" data-delay=".3">Below we’ve
                                            provided a bit of ICO, ICO Token, cryptocurrencies, and few others. If you have
                                            any other questions, please get in touch using the contact form below.</p>
                                    </div> */}
                                </div>

                                <div className="nk-block">
                                    <div className="row justify-content-center align-items-center">
                                        {/* <div className="col-md-12">
                                            <ul
                                                className="nav tab-nav tab-nav-btn pdb-r justify-content-start animated"
                                                data-animate="fadeInUp"
                                                data-delay=".4">
                                                <li>
                                                    <a className="active" data-toggle="tab" href="#general-questions-13">General</a>
                                                </li>
                                                <li>
                                                    <a data-toggle="tab" href="#ico-questions-13">Pre-ICO &amp; ICO</a>
                                                </li>
                                                <li>
                                                    <a data-toggle="tab" href="#tokens-sales-13">Token</a>
                                                </li>
                                            </ul>
                                        </div> */}
                                        <div className="col-lg-12">
                                            <div className="tab-content animated" data-animate="fadeInUp" data-delay=".5">
                                                <div className="tab-pane fade show active" id="general-questions-13">
                                                    <div className="accordion accordion-faq" id="faq-47">
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-1">
                                                                What is the total outstanding supply of SATM?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-1" className="collapse show" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>100,000,000 SATM</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-2">
                                                                What is the token circulating supply?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-2" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>20,000,000 ICO</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-3">
                                                                What is the token price?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-3" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>During the first week of the private sale $900 = 1000 SATM, during the second week, the crowdsale will be priced at $1000 = 1000 SATM.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-4">
                                                                Is there minimum to invest?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-4" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>There is no minimum to invest in the crowdsale.  The private sale has a minimum investment of $2500 in Eth.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-5">
                                                                What determines the price of SATM?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-5" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>After the Initial Coin Offering the supply of SATM will remain fixed. The price will be determined by supply and demand.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-6">
                                                                Can I buy SATM with fiat or other cryptocurrencies?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-6" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>You will be able to buy SATM with ETH only.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-7">
                                                                What wallet can I use to contribute
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-7" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Any ERC20 standard supporting wallet, we recommend, Metamask, Trust, Jaxx and MEW . Do NOT contribute from an exchange wallet.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-8">
                                                                Is there a whitelist (private sale)?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-8" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Yes, there is a whitelist that will be used strictly for those investing in the private sale. Currently our whitelist is for the first 2000 investors willing to invest a minimum of 1Eth.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-9">
                                                                The guide says I need to register for the sale and do KYC — how do I do it?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-9" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Registering your contribution and KYC (required for $10,000 or more ) will be available on token sale page which we will announce and share shortly before the sale starts on March 15th.</p>
                                                                </div>
                                                            </div>
                                                        </div> */}
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-10">
                                                                What is the total token supply?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-10" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Total supply will be determined by the outcome of ICO. 100,000,000 outstanding tokens and 50,000,000 circulating tokens if the token sale is 100% successful.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-11">
                                                                Will SATM support decimals?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-11" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>SATM is divisible up to 18 decimals. So you can send a minimum of 0.000000000000000001
SATM.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-12">
                                                                Is there a buyback program?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-12" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Yes, 10% of annual profits will be used to buyback and burn SATM tokens.  This decreases the circulating supply and theoretically increases the token’s price.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-13">
                                                                What if I contributed during private sale?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-13" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Your tokens will be distributed along with everyone else’s after the ICO. You can verify your
pre-sale contribution via Etherscan.io using the address of pre-sale: 0x4aadress You don’t
need to do anything extra during the crowdsale.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="accordion-item accordion-item-s2 bg-white">
                                                            <h5
                                                                className="accordion-title accordion-title-sm collapsed"
                                                                data-toggle="collapse"
                                                                data-target="#faq-47-14">
                                                                When will I get the tokens?
                                                                <span className="accordion-icon accordion-icon-s2"></span>
                                                            </h5>
                                                            <div id="faq-47-14" className="collapse" data-parent="#faq-47">
                                                                <div className="accordion-content">
                                                                    <p>Tokens will be distributed to the same wallet address from which you contributed immediately after your participated in the SATM ICO. Tokens will also be tradable on exchanges and we will be announcing the exchanges after the ICO via our newsletter.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="col-lg-4"> */}
                                            {/* <div
                                                className="nk-block-img mt-4 mt-lg-0 animated"
                                                data-animate="fadeInUp"
                                                data-delay=".6">
                                                <img src="images/gfx/gfx-p.png" alt="lungwort"/>
                                            </div> */}
                                        {/* </div> */}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="section section-contact bg-white ov-h" id="contact">
                            <div className="container">

                                <div className="nk-block block-contact">
                                    <div className="row justify-content-center gutter-vr-30px">
                                        <div className="col-lg-3">
                                            <div
                                                className="section-head section-head-sm section-head-s9 text-center text-lg-left">
                                                <h6
                                                    className="title title-xs title-s1 tc-primary animated"
                                                    data-animate="fadeInUp"
                                                    data-delay=".1">Contact</h6>
                                                <h2 className="title animated" data-animate="fadeInUp" data-delay=".2">Get In Touch</h2>
                                                <div className="class">
                                                    <p className="animated" data-animate="fadeInUp" data-delay=".3">Any question? Reach out to us and we’ll get back to you shortly.</p>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column justify-content-between h-100">
                                                <ul className="contact-list contact-list-s2">
                                                    <li className="animated" data-animate="fadeInUp" data-delay=".4">
                                                        <em className="contact-icon contact-icon-s2 fas fa-phone"></em>
                                                        <div className="contact-text">
                                                            <span>1-808-366-5715</span>
                                                        </div>
                                                    </li>
                                                    <li className="animated" data-animate="fadeInUp" data-delay=".5">
                                                        <em className="contact-icon contact-icon-s2 fas fa-envelope"></em>
                                                        <div className="contact-text">
                                                            <span>support@satoshimining.com</span>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 offset-lg-1">
                                            <div className="gap-6x d-none d-lg-block"></div>
                                            <div className="gap-4x d-none d-lg-block"></div>
                                            <form
                                                id="contact-form-01"
                                                className="contact-form nk-form-submit"
                                                action="form/contact.php"
                                                method="post">
                                                <div
                                                    className="field-item field-item-s2 animated"
                                                    data-animate="fadeInUp"
                                                    data-delay=".7">
                                                    <input
                                                        name="c_name"
                                                        type="text"
                                                        className="input-bordered required"
                                                        placeholder="Your Name" 
                                                        onChange={onChangeContact} 
                                                        value={c_name}
                                                        />
                                                </div>
                                                <div
                                                    className="field-item field-item-s2 animated"
                                                    data-animate="fadeInUp"
                                                    data-delay=".8">
                                                    <input
                                                        name="c_email"
                                                        type="email"
                                                        className="input-bordered required email"
                                                        placeholder="Your Email" 
                                                        onChange={onChangeContact}
                                                        value={c_email} />
                                                </div>
                                                <div
                                                    className="field-item field-item-s2 animated"
                                                    data-animate="fadeInUp"
                                                    data-delay=".9">
                                                    <textarea
                                                        name="c_message"
                                                        className="input-bordered input-textarea required"
                                                        placeholder="Your Message"
                                                        onChange={onChangeContact}
                                                        value={c_message}></textarea>
                                                </div>
                                                <input type="text" className="d-none" name="form-anti-honeypot" />
                                                <div className="row">
                                                    <div className="col-sm-12 animated" data-animate="fadeInUp" data-delay="1">
                                                        <button type="button" onClick={() => onContactClick()} className="btn btn-s2 btn-md btn-grad">Submit</button>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-results"></div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-lg-4 align-self-center">
                                            <div className="nk-block-img animated" data-animate="fadeInUp" data-delay="1.1">
                                                <img src="images/gfx/gfx-q.png" alt="lungwort"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                    <footer className="nk-footer">
                        <section className="section py-0">
                            <div className="container">

                                <div className="nk-block">
                                    <div
                                        className="bg-grad-alt round subscribe-wrap tc-light animated"
                                        data-animate="fadeInUp"
                                        data-delay=".2">
                                        <div
                                            className="row text-center text-md-left justify-content-center align-items-center gutter-vr-25px">
                                            <div className="col-lg-6">
                                                <div className="wide-auto-sm">
                                                    <h4 className="title-sm">Don't miss out, Stay updated</h4>
                                                    <p>Sign up for updates and market news. Subscribe to our newsletter and receive updates about ICOs and crypto tips.</p>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="gap-3x d-none d-lg-block"></div>
                                                <form action="form/subscribe.php" className="nk-form-submit" method="post">
                                                    <div
                                                        className="field-inline field-inline-s2 field-inline-s2-sm bg-white shadow-soft">
                                                        <div className="field-wrap">
                                                            <input
                                                                className="input-solid input-solid-md required email"
                                                                type="text"
                                                                name="contact-email"
                                                                placeholder="Enter your email"/>
                                                            <input type="text" className="d-none" name="form-anti-honeypot" />
                                                        </div>
                                                        <div className="submit-wrap">
                                                            <button className="btn btn-md btn-secondary">Subscribe</button>
                                                        </div>
                                                    </div>
                                                    <div className="form-results"></div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="nk-ovm ovm-top ovm-h-50 bg-white bdb ov-h"></div>
                        </section>
                        <div className="section section-footer section-m bg-transparent">
                            <div className="container">

                                <div className="nk-block block-footer">
                                    <div className="row">
                                        <div className="col">
                                            <div className="wgs wgs-text text-center mb-3">
                                                <ul className="social pdb-l justify-content-center">
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="social-icon fab fa-facebook-f"></em>
                                                        </a>
                                                    </li> */}
                                                    <li>
                                                        <a href="https://discord.gg/KMSzSzjk">
                                                            <em className="social-icon fab fa-discord"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="https://www.instagram.com/satoshiminingai/">
                                                            <em className="social-icon fab fa-instagram"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="https://twitter.com/Satoshiminingai">
                                                            <em className="social-icon fab fa-twitter"></em>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="https://t.me/Satoshiminingai">
                                                            <em className="social-icon fab fa-telegram"></em>
                                                        </a>
                                                    </li>
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="social-icon fab fa-youtube"></em>
                                                        </a>
                                                    </li> */}
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="social-icon fab fa-github"></em>
                                                        </a>
                                                    </li> */}
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="social-icon fab fa-bitcoin"></em>
                                                        </a>
                                                    </li> */}
                                                    {/* <li>
                                                        <a href="#">
                                                            <em className="social-icon fab fa-medium-m"></em>
                                                        </a>
                                                    </li> */}
                                                </ul>
                                                <a href="./" className="footer-logo">
                                                    <img src="images/logo/logo1.png" width="200px" height="30px" alt="logo"/>
                                                </a>
                                                {/* <div className="copyright-text copyright-text-s3 pdt-m">
                                                    <p>
                                                        <span className="d-sm-block">Copyright &copy; 2018, ICO Crypto. Template Made By
                                                            <a href="./">Softnio</a>
                                                            &amp; Handcrafted by iO.
                                                        </span>All trademarks and copyrights belong to their respective owners.</p>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="nk-ovm shape-s-sm shape-center-bottom ov-h"></div>
                        </div>
                    </footer>
                </div>

                {/* <div className="preloader"><span className="spinner spinner-round"></span></div> */}
            </div>
        </Fragment>
    )
}

export default Dashboard;