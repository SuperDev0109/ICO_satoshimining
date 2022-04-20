import { web3 } from './web3';
import config from '../config';

import presaleContractJSON from './abis/Presale.json';
import tokenJSON from './abis/SATMToken.json';

const networkId = config.networkId;

const tokenContractAddress = config.contractAddress.satmToken[networkId];
const ITokenContract = new web3.eth.Contract(tokenJSON.abi, tokenContractAddress);

const presaleContractAddress = config.contractAddress.presale[networkId];
const IPresaleContractAddress = new web3.eth.Contract(presaleContractJSON.abi, presaleContractAddress);

const tokenContract = {
    address: tokenContractAddress,
    abi: tokenJSON.abi,
    contract: ITokenContract,
    decimals: 18
};

const presaleContract = {
    address: presaleContractAddress,
    abi: presaleContractJSON.abi,
    contract: IPresaleContractAddress,
}

export {
    networkId,
    tokenContract,
    presaleContract,
}
