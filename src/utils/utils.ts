import { Types } from 'mongoose';
const TronWeb = require('tronweb');
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
const { Web3 } = require('web3');
export const ECPair = ECPairFactory(ecc);
export const BITCOIN_NETWORK = bitcoin.networks.bitcoin;
export const BITCOIN_NETWORK_MAINNET = bitcoin.networks.bitcoin;
const BN = require('bn.js');

export const bitCoinRootUrl = 'https://api.blockcypher.com/v1/btc/test3';

export const generateStringId = () => new Types.ObjectId().toString();

export const TRON_RPC = 'https://api.trongrid.io';
export const TRON_SCAN_URL = 'https://apilist.tronscan.org' //'https://apilist.tronscan.org' 

export const TRONSCAN_API_KEY = '<YOUR_TRONSCAN_API_KEY>';
export const TRONGRID_API_KEY = '<YOUR_TRONGRID_API_KEY>';

export const BITCOIN_TOKEN = '<YOUR_BITCOIN_TOKEN>';

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider(TRON_RPC);

export const tronWeb = new TronWeb({
    fullHost: fullNode,
    headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY },
});

export const STABLE_ERC_FEE = 6;
export const STABLE_MINIMUM = 50;
export const TRX_GAS_FEE = 15;

const SATOSHI = 100000000;

export const fromSatoshi = (number) => {
    return number / SATOSHI;
};

export const toSatoshi = (number) => {
    return Math.floor(number * SATOSHI);
};

export const fromDecimals = (
    number: string | number | bigint,
    decimals: number,
) => {
    return (Number(number) / Math.pow(10, decimals))?.toString();
};

export const toDecimals = (
    number: string | number | bigint,
    decimals: number,
) => {
    return Math.floor(Number(number) * Math.pow(10, decimals))?.toString();
};

const isBN = function (object) {
    return BN.isBN(object);
};

export const fromWei = (value, decimal) => {
    if (!isBN(value) && !(typeof value === 'string')) {
        throw new Error(
            'Please pass numbers as strings or BN objects to avoid precision errors.',
        );
    }

    const total = value / 10 ** decimal;

    return total.toLocaleString().split(',').join('');
};

export const toWei = (value, decimal) => {
    if (!isBN(value) && !(typeof value === 'string')) {
        throw new Error(
            'Please pass numbers as strings or BN objects to avoid precision errors.',
        );
    }

    const total = value * 10 ** decimal;

    return total.toLocaleString().split(',').join('');
};


export const abi: any = {
    token: [
        { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'owner',
                    type: 'address',
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'spender',
                    type: 'address',
                },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'value',
                    type: 'uint256',
                },
            ],
            name: 'Approval',
            type: 'event',
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'from',
                    type: 'address',
                },
                { indexed: true, internalType: 'address', name: 'to', type: 'address' },
                {
                    indexed: false,
                    internalType: 'uint256',
                    name: 'value',
                    type: 'uint256',
                },
            ],
            name: 'Transfer',
            type: 'event',
        },
        {
            inputs: [
                { internalType: 'address', name: 'owner', type: 'address' },
                { internalType: 'address', name: 'spender', type: 'address' },
            ],
            name: 'allowance',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'decimals',
            outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
            ],
            name: 'decreaseAllowance',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'spender', type: 'address' },
                { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
            ],
            name: 'increaseAllowance',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [],
            name: 'name',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'symbol',
            outputs: [{ internalType: 'string', name: '', type: 'string' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [],
            name: 'totalSupply',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'to', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'transfer',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
        {
            inputs: [
                { internalType: 'address', name: 'from', type: 'address' },
                { internalType: 'address', name: 'to', type: 'address' },
                { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            name: 'transferFrom',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export const chainMapping = {
    '137': {
        chain: 'Polygon',
        rpc: 'https://polygon-rpc.com',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0xfEd3c880FF02B195abee916328c5a3953976befD',
        NATIVE: {
            address: '0x0000000000000000000000000000000000001010',
            wrapped_address: '0x4c28f48448720e9000907BC2611F73022fdcE1fA',
        },
    },
    '1': {
        chain: 'Ethereum',
        rpc: 'https://speedy-nodes-nyc.moralis.io/36a3a9840a5f2cc2ea2bbb42/eth/mainnet',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x5e9A385a15cDE1b149Cb215d9cF3151096A37D67',
        NATIVE: {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            wrapped_address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        },
    },
    '250': {
        chain: 'Fantom',
        rpc: 'https://rpc.ftm.tools/',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x621F0549102262148f6a7D289D8330adf7CbC09F',
        NATIVE: {
            address: '0x0100000000000000000000000000000000000001',
            wrapped_address: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
        },
    },
    '42161': {
        chain: 'Arbitrum',
        rpc: 'https://arb1.arbitrum.io/rpc',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x88b1E0ecaC05b876560eF072d51692F53932b16f',
        NATIVE: {
            address: '0x0000000000000000000000000000000000001010',
            wrapped_address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
    },
    '56': {
        chain: 'BSC',
        rpc: 'https://bsc-dataseed.binance.org/',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x45d880647Ec9BEF6Bff58ee6bB985C67d7234b0C',
        NATIVE: {
            address: '0x0100000000000000000000000000000000000001',
            wrapped_address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        },
    },
    '43114': {
        chain: 'Avalanche',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x5febcA23e97c8ead354318e5A3Ed34ec3704459a',
        NATIVE: {
            address: '0x0100000000000000000000000000000000000001',
            wrapped_address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
        },
    },
    '10': {
        chain: 'Optimism',
        rpc: 'https://mainnet.optimism.io',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x88b1E0ecaC05b876560eF072d51692F53932b16f',
        NATIVE: {
            address: '0x0000000000000000000000000000000000001010',
            wrapped_address: '0x4200000000000000000000000000000000000006',
        },
    },
    '25': {
        chain: 'Cronos',
        rpc: 'https://evm.cronos.org',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0xf44Ff799eA2bBFeC96f9A50498209AAc3C2b3b8b',
        NATIVE: {
            address: '0x0000000000000000000000000000000000000001',
            wrapped_address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        },
    },
    '1666600000': {
        chain: 'Harmony',
        rpc: 'https://api.harmony.one',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x8413041a7702603d9d991F2C4ADd29e4e8A241F8',
        NATIVE: {
            address: '0x0000000000000000000000000000000000001010',
            wrapped_address: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
        },
    },
    '1313161554': {
        chain: 'Aurora',
        rpc: 'https://mainnet.aurora.dev',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0x13538f1450Ca2E1882Df650F87Eb996fF4Ffec34',
        NATIVE: {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            wrapped_address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
        },
    },
    '2222': {
        chain: 'Kava',
        rpc: 'https://evm.kava.io',
        reserveHandler_address: '0x6e14f48576265272B6CAA3A7cC500a26050Be64E',
        oneSplit_address: '0xB065a867a1baa919F0A9a3F5C1543D19768CeFBD',
        NATIVE: {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            wrapped_address: '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',
        },
    },
};
export const web3 = new Web3('https://polygon-rpc.com');

export let masterWalletLocks = {
    isEVMLocked: 0,
    isTRONLocked: 0,
    isBTCLocked: 0,
};

export const dbCoins =
    [
        {
            "swapFee": 0,
            "name": "Bitcoin",
            "symbol": "BTC",
            "icon": "https://dynamic-assets.coinbase.com/e785e0181f1a23a30d9476038d9be91e9f6c63959b538eabbc51a1abc8898940383291eede695c3b8dfaa1829a9b57f5a2d0a16b0523580346c6b8fab67af14b/asset_icons/b57ac673f06a4b0338a596817eb0a50ce16e2059f327dc117744449a47915cb2.png",
            "coinNameId": "bitcoin",
            "isToken": false,
            "contractAddress": "",
            "decimal": 8,
            "price": 22988854,
            "priceFormer": 22988853,
            "priceMarket": 29258,
            "networkId": {
                "chainId": 0,
                "nativeCoinAddress": "",
                "name": "Bitcoin",
                "symbol": "BTC",
                "logoUrl": "https://dynamic-assets.coinbase.com/e785e0181f1a23a30d9476038d9be91e9f6c63959b538eabbc51a1abc8898940383291eede695c3b8dfaa1829a9b57f5a2d0a16b0523580346c6b8fab67af14b/asset_icons/b57ac673f06a4b0338a596817eb0a50ce16e2059f327dc117744449a47915cb2.png",
                "rpcUrl": "https://api.blockcypher.com/v1/btc/main",
                "isMainnet": true,
                "networkName": "BTC",
                "networkType": "BTC",
                "isDeleted": false,
                "isActive": true,
                "id": "64c20a95c122a222c4f6b2cf"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-12-12T07:36:15.632Z",
            "updatedAt": "2023-08-21T14:24:18.413Z",
            "priceChange": 0.215310247094047,
            "sort": 1,
            "id": "64a7c06f8efc0fbbb9959e2f",
            "swapAmount": 22988854
        },
        {
            "swapFee": 0,
            "name": "Ethereum",
            "symbol": "ETH",
            "icon": "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
            "coinNameId": "ethereum",
            "isToken": false,
            "contractAddress": "",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "Ethereum",
                "symbol": "ETH",
                "chainId": 1,
                "nativeCoinAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                "logoUrl": "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
                "rpcUrl": "https://rpc.ankr.com/eth",
                "isMainnet": true,
                "networkName": "ETH",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "rpcUrlAlt": "https://rpc.ankr.com/eth",
                "id": "64db5088c55541f0916b6d5b"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-11-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "sort": 2,
            "id": "64db50d6c55541f0916b6d5e",
            "swapAmount": 1860.34
        },
        {
            "swapFee": 0,
            "name": "Tron",
            "symbol": "TRX",
            "icon": "https://dynamic-assets.coinbase.com/49567ec5f7c7a1ccb3ce247297c443b3dd32072ee5b91902abc0f6789654e14fd3b9ed8851580b93b4daf7da13324bc61e143a2d391d9e6d8b98f8d69923e4b4/asset_icons/3c5b36c70a05bad40eee4f711aeefbb1809169a17db047bf91f1ef45828349e5.png",
            "coinNameId": "tron",
            "isToken": false,
            "contractAddress": "",
            "decimal": 6,
            "price": 0.081089,
            "priceFormer": 0.344,
            "priceMarket": 29258,
            "networkId": {
                "chainId": 0,
                "nativeCoinAddress": "",
                "name": "Tron",
                "symbol": "TRX",
                "logoUrl": "https://dynamic-assets.coinbase.com/49567ec5f7c7a1ccb3ce247297c443b3dd32072ee5b91902abc0f6789654e14fd3b9ed8851580b93b4daf7da13324bc61e143a2d391d9e6d8b98f8d69923e4b4/asset_icons/3c5b36c70a05bad40eee4f711aeefbb1809169a17db047bf91f1ef45828349e5.png",
                "rpcUrl": "https://rpc.ankr.com/tron_jsonrpc",
                "isMainnet": true,
                "networkName": "TRON",
                "networkType": "TRON",
                "isDeleted": false,
                "isActive": true,
                "id": "64a55155fb3091c797e79992"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-10-07T07:42:44.371Z",
            "updatedAt": "2023-08-10T12:30:14.350Z",
            "priceChange": 0.269954580270486,
            "sort": 3,
            "id": "64a7c1f48efc0fbbb4959e23",
            "swapAmount": 0.081089
        },
        {
            "swapFee": 0,
            "name": "Binance Coin",
            "symbol": "BNB",
            "icon": "https://dynamic-assets.coinbase.com/36f266bc4826775268588346777c84c1ae035e7de268a6e124bcc22659f0aa2bf4f66dcad89b2ac978cfdb4d51c2d9f63cf7157769efb500b20ca16a6d5719c7/asset_icons/7deb6ff58870072405c0418d85501c4521c3296e33ef58452be98e4ca592ed19.png",
            "coinNameId": "binancecoin",
            "isToken": false,
            "contractAddress": "",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "Binance Smart Chain",
                "symbol": "BSC",
                "chainId": 56,
                "nativeCoinAddress": "",
                "logoUrl": "https://dynamic-assets.coinbase.com/36f266bc4826775268588346777c84c1ae035e7de268a6e124bcc22659f0aa2bf4f66dcad89b2ac978cfdb4d51c2d9f63cf7157769efb500b20ca16a6d5719c7/asset_icons/7deb6ff58870072405c0418d85501c4521c3296e33ef58452be98e4ca592ed19.png",
                "rpcUrl": "https://bsc-dataseed1.binance.org/",
                "isMainnet": true,
                "networkName": "BNB",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "id": "64a54ccafb3091c797e7998e"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-09-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "unit": "BNB",
            "sort": 4,
            "id": "64a54ccafb3091c797e7998e",
            "swapAmount": 1860.34
        },
        {
            "swapFee": 0,
            "name": "Polygon Matic",
            "symbol": "MATIC",
            "icon": "https://dynamic-assets.coinbase.com/085ce26e1eba2ccb210ea85df739a0ca2ef782747e47d618c64e92b168b94512df469956de1b667d93b2aa05ce77947e7bf1b4e0c7276371aa88ef9406036166/asset_icons/57f28803aad363f419a950a5f5b99acfd4fba8b683c01b9450baab43c9fa97ea.png",
            "coinNameId": "matic-network",
            "isToken": false,
            "contractAddress": "",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "Polygon",
                "symbol": "MATIC",
                "chainId": 137,
                "nativeCoinAddress": "",
                "logoUrl": "https://dynamic-assets.coinbase.com/085ce26e1eba2ccb210ea85df739a0ca2ef782747e47d618c64e92b168b94512df469956de1b667d93b2aa05ce77947e7bf1b4e0c7276371aa88ef9406036166/asset_icons/57f28803aad363f419a950a5f5b99acfd4fba8b683c01b9450baab43c9fa97ea.png",
                "rpcUrl": "https://rpc.ankr.com/polygon",
                "isMainnet": false,
                "networkName": "MATIC",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "id": "6508234fafef51cbd07d7765"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-08-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "unit": "MATIC",
            "sort": 5,
            "id": "6508239aafef51cbd07d7768",
            "swapAmount": 1860.34
        },
        {
            "swapFee": 0,
            "name": "AVALANCHE-C",
            "symbol": "AVAX",
            "icon": "https://dynamic-assets.coinbase.com/35f69b8c1f2c2771170e72bdb61a986b17f7d8d20c5e10bc4fc347fe301e6137960c01c31ebbac976b9fd933bf95344d751e052a27eee0dc868f8c036bb2632a/asset_icons/d8a464a40be5c1eba32428ed1d815c878d4933231193edfa483957bd3cbfe750.png",
            "coinNameId": "avalanche-2",
            "isToken": false,
            "contractAddress": "",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "AVALANCHE-C",
                "symbol": "AVAX",
                "chainId": 43114,
                "nativeCoinAddress": "",
                "logoUrl": "https://dynamic-assets.coinbase.com/35f69b8c1f2c2771170e72bdb61a986b17f7d8d20c5e10bc4fc347fe301e6137960c01c31ebbac976b9fd933bf95344d751e052a27eee0dc868f8c036bb2632a/asset_icons/d8a464a40be5c1eba32428ed1d815c878d4933231193edfa483957bd3cbfe750.png",
                "rpcUrl": "https://rpc.ankr.com/avalanche-c",
                "isMainnet": true,
                "networkName": "AVAX",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "id": "6508253dafef51cbd07d7771"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-07-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "unit": "AVAX",
            "sort": 6,
            "id": "6508259bafef51cbd07d7774",
            "swapAmount": 1860.34
        },
        {
            "swapFee": 0,
            "name": "Fantom",
            "symbol": "FTM",
            "icon": "https://dynamic-assets.coinbase.com/e17e84efa456c7d48f037588e37f8eb66c4be2c7ff8386258a0b99d78b3246afa4d8c21fa1f748f6a02b9487cb6f2b6f26d70bdb652a61db2b4cf058bec08dee/asset_icons/1bb53e9ac0259c3e341fea0e730521c42d44d226f60f4fb0cc68c9770296216d.png",
            "coinNameId": "fantom",
            "isToken": false,
            "contractAddress": "",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "FANTOM",
                "symbol": "FTM",
                "chainId": 250,
                "nativeCoinAddress": "",
                "logoUrl": "https://dynamic-assets.coinbase.com/e17e84efa456c7d48f037588e37f8eb66c4be2c7ff8386258a0b99d78b3246afa4d8c21fa1f748f6a02b9487cb6f2b6f26d70bdb652a61db2b4cf058bec08dee/asset_icons/1bb53e9ac0259c3e341fea0e730521c42d44d226f60f4fb0cc68c9770296216d.png",
                "rpcUrl": "https://rpc.ankr.com/fantom",
                "isMainnet": true,
                "networkName": "FTM",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "id": "650825f9afef51cbd07d7777"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-06-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "unit": "FTM",
            "sort": 7,
            "id": "65082741afef51cbd07d777c",
            "swapAmount": 1860.34
        },
        {
            "priceMarket": 0,
            "swapFee": 0,
            "name": "Tether",
            "symbol": "USDT (TRC 20)",
            "icon": "https://dynamic-assets.coinbase.com/41f6a93a3a222078c939115fc304a67c384886b7a9e6c15dcbfa6519dc45f6bb4a586e9c48535d099efa596dbf8a9dd72b05815bcd32ac650c50abb5391a5bd0/asset_icons/1f8489bb280fb0a0fd643c1161312ba49655040e9aaaced5f9ad3eeaf868eadc.png",
            "coinNameId": "tether",
            "isToken": true,
            "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
            "decimal": 6,
            "price": 800,
            "priceFormer": 835,
            "networkId": {
                "chainId": 0,
                "nativeCoinAddress": "",
                "name": "Tron",
                "symbol": "TRX",
                "logoUrl": "https://dynamic-assets.coinbase.com/49567ec5f7c7a1ccb3ce247297c443b3dd32072ee5b91902abc0f6789654e14fd3b9ed8851580b93b4daf7da13324bc61e143a2d391d9e6d8b98f8d69923e4b4/asset_icons/3c5b36c70a05bad40eee4f711aeefbb1809169a17db047bf91f1ef45828349e5.png",
                "rpcUrl": "https://rpc.ankr.com/tron_jsonrpc",
                "isMainnet": true,
                "networkName": "TRON",
                "networkType": "TRON",
                "isDeleted": false,
                "isActive": true,
                "id": "64a55155fb3091c797e79992"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-05-10T04:56:01.772Z",
            "updatedAt": "2023-08-23T14:44:28.462Z",
            "priceChange": 0.0934803024552605,
            "sort": 8,
            "id": "64ab8f61a4179da1e4bd1206",
            "swapAmount": 800
        },
        {
            "name": "Tether",
            "symbol": "USDT (ERC 20)",
            "icon": "https://dynamic-assets.coinbase.com/41f6a93a3a222078c939115fc304a67c384886b7a9e6c15dcbfa6519dc45f6bb4a586e9c48535d099efa596dbf8a9dd72b05815bcd32ac650c50abb5391a5bd0/asset_icons/1f8489bb280fb0a0fd643c1161312ba49655040e9aaaced5f9ad3eeaf868eadc.png",
            "coinNameId": "tether",
            "isToken": true,
            "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "decimal": 6,
            "price": 89,
            "priceFormer": 787,
            "priceMarket": 29258,
            "swapFee": 6,
            "networkId": {
                "name": "Ethereum",
                "symbol": "ETH",
                "chainId": 1,
                "nativeCoinAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                "logoUrl": "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
                "rpcUrl": "https://rpc.ankr.com/eth",
                "isMainnet": true,
                "networkName": "ETH",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "rpcUrlAlt": "https://rpc.ankr.com/eth",
                "id": "64db5088c55541f0916b6d5b"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2023-04-14T09:45:12.185Z",
            "updatedAt": "2023-08-17T11:32:55.614Z",
            "priceChange": 0.0694535910848442,
            "sort": 9,
            "id": "94a7de78b825dfd17c7eb609",
            "swapAmount": -445
        },
        {
            "swapFee": 0,
            "name": "Binance-Peg USD Coin",
            "symbol": "USDC",
            "icon": "https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058742cdf4674bd43f309e69778a26969372310135be97eb183d91c492154176d455b8/asset_icons/9d67b728b6c8f457717154b3a35f9ddc702eae7e76c4684ee39302c4d7fd0bb8.png",
            "coinNameId": "tether",
            "isToken": true,
            "contractAddress": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "Binance Smart Chain",
                "symbol": "BSC",
                "chainId": 56,
                "nativeCoinAddress": "",
                "logoUrl": "https://dynamic-assets.coinbase.com/36f266bc4826775268588346777c84c1ae035e7de268a6e124bcc22659f0aa2bf4f66dcad89b2ac978cfdb4d51c2d9f63cf7157769efb500b20ca16a6d5719c7/asset_icons/7deb6ff58870072405c0418d85501c4521c3296e33ef58452be98e4ca592ed19.png",
                "rpcUrl": "https://bsc-dataseed1.binance.org/",
                "isMainnet": true,
                "networkName": "BNB",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "id": "64a54ccafb3091c797e7998e"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2020-03-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "unit": "USDC",
            "sort": 10,
            "id": "64a54ccafb3091c797e7998g",
            "swapAmount": 1860.34
        },
        {
            "swapFee": 0,
            "name": "Binance USD",
            "symbol": "BUSD",
            "icon": "https://dynamic-assets.coinbase.com/e155811f316fe86805fd984c690b316a916660f3331d93e4eda952bde355160056872add3c54ea7bde7310e5fcea71eb26a28f50962f601fe4f4b9d8f332f4aa/asset_icons/8ff4f66b560b0bd5e292eab3fdf73229c5fc8944024adbe8920d3fa912494590.png",
            "coinNameId": "binance-usd",
            "isToken": true,
            "contractAddress": "0xe9e7cea3dedca5984780bafc599bd69add087d56",
            "decimal": 18,
            "price": 1860.34,
            "priceFormer": 180.34,
            "priceMarket": 1860.34,
            "networkId": {
                "name": "Binance Smart Chain",
                "symbol": "BSC",
                "chainId": 56,
                "nativeCoinAddress": "",
                "logoUrl": "https://dynamic-assets.coinbase.com/36f266bc4826775268588346777c84c1ae035e7de268a6e124bcc22659f0aa2bf4f66dcad89b2ac978cfdb4d51c2d9f63cf7157769efb500b20ca16a6d5719c7/asset_icons/7deb6ff58870072405c0418d85501c4521c3296e33ef58452be98e4ca592ed19.png",
                "rpcUrl": "https://bsc-dataseed1.binance.org/",
                "isMainnet": true,
                "networkName": "BNB",
                "networkType": "EVM",
                "isDeleted": false,
                "isActive": true,
                "id": "64a54ccafb3091c797e7998e"
            },
            "isDeleted": false,
            "isActive": true,
            "createdAt": "2021-02-11T07:32:18.510Z",
            "updatedAt": "2023-08-10T10:50:38.550Z",
            "priceChange": 0.40793865505563,
            "unit": "BUSD",
            "sort": 11,
            "id": "64a54ccafb3091c797e7998f",
            "swapAmount": 1860.34
        }
    ]
