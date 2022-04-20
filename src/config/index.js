require('dotenv').config();

const web3Provider = process.env.REACT_APP_NETWORK_ID === '1'
  ? process.env.REACT_APP_ETH_WEB3_PROVIDER
  : process.env.REACT_APP_ETH_RINKEBY_WEB3_PROVIDER

  // console.log(process.env.REACT_APP_NETWORK_ID)
  const config = {
    web3Provider: web3Provider,
    networkId: process.env.REACT_APP_NETWORK_ID,
    contractAddress: {
      satmToken: {
        1:'', // Replace with the mainnet address
        4:'0xA98D21C3D61A7EB9Dd3BE9C9a1132Abb7c7Be2Dd'
      },
      presale: {
        1: '', // Replace with the mainnet address
        4: '0x1c4dc22a348112c4d932d5a20062c8aef817eeb2'
      }
    }
  }

  module.exports = config;
