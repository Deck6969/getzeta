import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Wallet as ethersWallet } from 'ethers';
import { Wallet, WalletDocument } from 'src/schema/Wallet/wallet.schema';
import {
  BITCOIN_NETWORK,
  BITCOIN_NETWORK_MAINNET,
  BITCOIN_TOKEN,
  ECPair,
  STABLE_MINIMUM,
  TRONGRID_API_KEY,
  TRONSCAN_API_KEY,
  TRON_RPC,
  TRON_SCAN_URL,
  TRX_GAS_FEE,
  abi,
  fromDecimals,
  fromSatoshi,
  fromWei,
  masterWalletLocks,
  toDecimals,
  toSatoshi,
  tronWeb,
  web3,
} from 'src/utils/utils';

import * as CryptoJS from 'crypto-js';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/User/user.schema';
import * as bcrypt from 'bcrypt';
import { Network, NetworkDocument } from 'src/schema/Network/network.schema';
const { Web3 } = require('web3');
//import Web3 from 'web3'
//const Web3 = require('web3');
//const bitcoin = require('bitcoinjs-lib');
import * as bitcoin from 'bitcoinjs-lib';
import { Coin, CoinDocument } from 'src/schema/Coin/coin.schema';
import { Balance, BalanceDocument } from 'src/schema/Balance/balance.schema';
import Moralis from 'moralis';
import {
  Transaction,
  TransactionDocument,
} from 'src/schema/Transaction/transaction.schema';
import {
  TRANSACTIONENUM,
  TRANSACTIONSTATUSENUM,
} from 'src/enum/transaction.enum';
import { TransactionDTO, UpdateTransactionDTO } from './dto/transaction.dto';
import { CoinNetworkDTO } from './dto/coinNetwork.dto';
import { NETWORKTYPEENUM } from 'src/enum/network.enum';
import { SwapDTO, WithdrawDTO, WithdrawFiatDTO } from './dto/withdraw.dto';
import { Cron } from '@nestjs/schedule';
var cron = require('node-cron');
const TronWeb = require('tronweb');
import axios from 'axios';
import { UtilsService } from '../utils/utils.service';
import {
  CoinPrice,
  CoinPriceDocument,
} from 'src/schema/CoinPrice/coin-price.schema';
import { SetFeeDTO } from './dto/setFee.dto';
import { FeeInfo, FeeInfoDocument } from 'src/schema/FeeInfo/fee-info.schema';
import {
  Currency,
  CurrencyDocument,
} from 'src/schema/Currency/currency.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private _walletModel: Model<Wallet>,
    @InjectModel(User.name) private _userModel: Model<UserDocument>,
    @InjectModel(Network.name) private _networkModel: Model<NetworkDocument>,
    @InjectModel(Coin.name) private _coinModel: Model<CoinDocument>,
    @InjectModel(Balance.name) private _balanceModel: Model<BalanceDocument>,
    @InjectModel(Transaction.name)
    private _transactionModel: Model<TransactionDocument>,
    @InjectModel(CoinPrice.name)
    private _coinPriceModel: Model<CoinPriceDocument>,
    @InjectModel(FeeInfo.name)
    private _feeInfoModel: Model<FeeInfoDocument>,
    @InjectModel(Currency.name)
    private _currencyModel: Model<CurrencyDocument>,
    private utilsService: UtilsService,
  ) {
    this.createStream();
    this.updateBalanceForAllUsers();
    const bitcoinWallet = this.createBitcoinWallet();
    console.log(bitcoinWallet);
    console.log(
      this.decryptData(
        'U2FsdGVkX1/Ix9b+7z4yWMQ2kG+V0enjlbps8gBFW1YXOpZYgLCvrYd+AzzaLqxoo78BM7t50UJnWerBD+tyKPceTC+ow6ZAZU4hjaclzcb6tl/SVGdG0q6LDNmb8jTe',
        process.env.ENCRYPTION_KEY,
      ),
    );
  }

  encryptData(data: string, encryptionKey: string) {
    try {
      return CryptoJS.AES.encrypt(
        data,
        encryptionKey + process.env.ENCRYPTION_KEY,
      ).toString();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  decryptData(data: string, encryptionKey: string) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        data,
        encryptionKey + process.env.ENCRYPTION_KEY,
      );
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async resetBalance(userId: string) {
    try {
      const walletDocument = await this._walletModel.findOne({
        userId: userId,
      });

      const [networks, coins] = await Promise.all([
        this._networkModel
          .find()
          .then((networks) => JSON.parse(JSON.stringify(networks))),
        this._coinModel
          .find()
          .then((coins) => JSON.parse(JSON.stringify(coins))),
      ]);

      for await (const coin of coins) {
        const network = networks.find(
          (network) => network.id === coin?.networkId,
        );

        if (!network) {
          console.log("Network doesn't exist");
          return;
        }
        let walletAddress;

        if (network?.networkType === NETWORKTYPEENUM.EVM)
          walletAddress = walletDocument.evmAddress;
        else if (network?.networkType === NETWORKTYPEENUM.BTC)
          walletAddress = walletDocument.btcAddress;
        else if (network?.networkType === NETWORKTYPEENUM.TRON)
          walletAddress = walletDocument.tronAddress;

        if (!walletDocument) return;

        const balanceObj = {
          balance: 0,
          balanceInUsd: 0,
          coinId: coin?.id,
          walletId: walletDocument?.id,
          address: walletAddress,
          userId: userId,
          networkId: network?.id,
        };

        await this._balanceModel
          .findOneAndUpdate(
            { walletId: walletDocument?.id, coinId: coin?.id },
            balanceObj,
            { upsert: true },
          )
          .then((balance) => balance)
          .catch((err) => console.log(err));
      }
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async createWallet(userId) {
    const mnemonic = ethersWallet.createRandom().mnemonic;
    const evmWallet = this.createEvmWallet(mnemonic?.phrase);
    const evmKey = this.encryptData(
      evmWallet?.privateKey,
      process.env.ENCRYPTION_KEY,
    );
    await this.addAddressToStream(evmWallet?.address?.toLowerCase());

    const tronWallet = this.createTronWallet(mnemonic?.phrase);
    const tronKey = this.encryptData(
      tronWallet?.privateKey,
      process.env.ENCRYPTION_KEY,
    );

    const bitcoinWallet = this.createBitcoinWallet();
    const bitcoinKey = this.encryptData(
      bitcoinWallet?.privateKey,
      process.env.ENCRYPTION_KEY,
    );

    const walletDoc = await new this._walletModel({
      userId: userId,
      evmAddress: evmWallet?.address?.toLowerCase(),
      evmKey: evmKey,
      tronAddress: tronWallet?.address,
      tronKey: tronKey,
      btcPublicKey: bitcoinWallet?.btcPublicKey.toString(),
      btcAddress: bitcoinWallet?.address,
      btcKey: bitcoinKey,
      currentSwappedBalance: 0,
      totalWithdrawnAmount: 0,
    }).save();

    await this.resetBalance(userId);

    return walletDoc;
  }

  createEvmWallet(mnemonic: string) {
    try {
      const evmWallet = ethersWallet.fromPhrase(mnemonic);

      return {
        address: evmWallet?.address,
        privateKey: evmWallet?.privateKey,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  createTronWallet(mnemonic: string) {
    try {
      const tronWallet = tronWeb.fromMnemonic(mnemonic);

      return {
        address: tronWallet?.address,
        privateKey: tronWallet?.privateKey,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  createBitcoinWallet() {
    try {
      const keyPair = ECPair.makeRandom({
        network: BITCOIN_NETWORK,
      });

      const wif = keyPair.toWIF();

      const data = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: BITCOIN_NETWORK,
      });

      const privateKey = ECPair.fromWIF(wif, BITCOIN_NETWORK);

      // //  console.log(keyPair?.getPublicKey());
      // console.log(keyPair?.publicKey);

      // //    console.log(keyPair?.getPublicKey().toString());
      // console.log(keyPair?.publicKey.toString());

      // console.log("publickey", keyPair?.publicKey)
      // console.log("publickey.toString()", keyPair?.publicKey.toString())
      // console.log("publickey.toString('hex')", keyPair?.publicKey.toString('hex'))
      // console.log("publickey.toString('ascii')", keyPair?.publicKey.toString('ascii'))
      // console.log("publickey.toString('base64')", keyPair?.publicKey.toString('base64'))
      // console.log("publickey to address", data?.address)

      return {
        btcPublicKey: keyPair?.publicKey?.toString('hex'),
        address: data?.address,
        privateKey: wif,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getDepositAddress(userId, networkId) {
    try {
      const networkDocument = await this._networkModel.findOne({
        _id: networkId,
      });
      const walletDocument = await this._walletModel.findOne({
        userId: userId,
      });

      let address = '';
      let publicKey = '';

      if (networkDocument.networkType == NETWORKTYPEENUM.EVM) {
        address = walletDocument.evmAddress;
      } else if (networkDocument.networkType == NETWORKTYPEENUM.BTC) {
        address = walletDocument.btcAddress;
        publicKey = walletDocument.btcPublicKey;
      } else if (networkDocument.networkType == NETWORKTYPEENUM.TRON) {
        address = walletDocument.tronAddress;
      }

      return {
        address,
        publicKey,
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  async getWalletWithBalance(userId) {
    try {
      await this.updateBalance(userId, false);
      const userDocument = await this._userModel.findOne({ _id: userId });
      const walletDocument = await this._walletModel.findOne({
        userId: userId,
      });
      const usdCurrency = await this._currencyModel.findOne({
        coinGeckoId: 'usd',
      });
      const localCurrency = await this._currencyModel.findOne({
        _id: userDocument.currencyId,
      });
      const balanceData = await this._balanceModel.aggregate([
        {
          $match: {
            walletId: walletDocument.id,
            userId: userId,
          },
        },
        {
          $lookup: {
            from: 'coins',
            localField: 'coinId',
            foreignField: '_id',
            as: 'coin',
          },
        },
        {
          $unwind: '$coin',
        },
        {
          $lookup: {
            from: 'coinprices',
            localField: 'coinId',
            foreignField: 'coinId',
            as: 'coinPrice',
            pipeline: [
              {
                $match: {
                  currencyId: userDocument.currencyId,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$coinPrice',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'coinprices',
            localField: 'coinId',
            foreignField: 'coinId',
            as: 'coinPriceInUsd',
            pipeline: [
              {
                $match: {
                  currencyId: usdCurrency?.id,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$coinPriceInUsd',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'networks',
            localField: 'coin.networkId',
            foreignField: '_id',
            as: 'network',
          },
        },
        {
          $unwind: '$network',
        },
        {
          $addFields: {
            id: '$_id',
            'coin.id': '$coin._id',
            'network.id': '$network._id',
            name: '$coin.name',
            symbol: '$coin.symbol',
            logoUrl: '$coin.icon',
            networkName: '$network.name',
            networkSymbol: '$network.symbol',
            networkLogoUrl: '$network.logoUrl',
            price: '$coinPrice.price',
            priceInUsd: '$coinPriceInUsd.price',
            priceChange: '$coinPrice.priceChange',
          },
        },
        {
          $sort: { balance: -1, createdAt: -1 },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            name: 1,
            symbol: 1,
            logoUrl: 1,
            networkName: 1,
            networkSymbol: 1,
            networkLogoUrl: 1,
            price: 1,
            priceInUsd: 1,
            priceChange: 1,
            coinId: 1,
            networkId: 1,
            balance: 1,
            address: 1,
          },
        },
      ]);

      let totalBalanceInLocalCurrency = 0;
      let totalBalanceInUsd = 0;
      const balance = balanceData.map((balanceItem) => {
        const balanceItemReturn = JSON.parse(JSON.stringify(balanceItem));
        balanceItemReturn.balanceInLocalCurrency =
          balanceItem.balance * balanceItem.price;
        balanceItemReturn.balanceInUsd =
          balanceItem.balance * balanceItem.priceInUsd;
        totalBalanceInLocalCurrency =
          totalBalanceInLocalCurrency +
          balanceItemReturn.balanceInLocalCurrency;
        totalBalanceInUsd = totalBalanceInUsd + balanceItemReturn.balanceInUsd;
        return balanceItemReturn;
      });

      const wallet = JSON.parse(JSON.stringify(walletDocument));
      wallet.totalBalanceInLocalCurrency = totalBalanceInLocalCurrency;
      wallet.localCurrency = localCurrency;
      wallet.usdCurrency = usdCurrency;
      wallet.totalBalanceInUsd = totalBalanceInUsd;
      wallet.accountName = userDocument.accountName;
      wallet.accountNumber = userDocument.accountNumber;
      wallet.bankName = userDocument.bankName;
      return {
        wallet: wallet,
        balance: balance,
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  async getBtcBalance(walletAddress: string, networkDocument: Network) {
    try {


      debugger;
      const res = await fetch(
        `${networkDocument?.rpcUrl}/addrs/${walletAddress}?token=${BITCOIN_TOKEN}`,
      );

      if (res.status !== 200) {
        console.log('get balance error');
        return {
          balance: 0,
          finalBalance: 0,
          balanceInUsd: 0,
          error: true,
          transactions: [],
        };
      }

      const balance = await res.json();

      const balanceInBtc = fromSatoshi(Number(balance?.balance));
      //   const finalBalance = fromSatoshi(Number(balance?.final_balance));

      return {
        balance: balanceInBtc,
        //   finalBalance: finalBalance,
      };
    } catch (err) {
      console.log(err);
      return {
        balance: 0,
        finalBalance: 0,
        balanceInUsd: 0,
        error: true,
        transactions: [],
      };
    }
  }

  async getNativeTokenBalance(address: string, rpcUrl: string) {
    try {
      const web3 = new Web3(rpcUrl);

      const balance = await web3.eth.getBalance(address);

      const balanceInEther = Number(web3.utils.fromWei(balance, 'ether'));

      return balanceInEther;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  async getAllEvmBalance(address: string) {
    try {
      const networks = await this._networkModel.find({
        chainName: 'ETH',
      });

      if (!networks) {
        throw new Error('Networks not found');
      }

      const res = await Promise.all(
        networks.map(async (network) => {
          const balance = await this.getNativeTokenBalance(
            address,
            network?.rpcUrl,
          );

          return {
            address: address,
            type: network.networkType,
            name: network?.name,
            symbol: network?.symbol,
            logoUrl: network?.logoUrl,
            balance: balance,
          };
        }),
      );

      return res;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async getTronBalance(address: string) {
    try {
      const tronNetwork = await this._networkModel.findOne({
        chainName: 'TRON',
      });

      if (!tronNetwork) {
        throw new Error('Tron network not found');
      }

      const balance = await tronWeb.trx.getBalance(address);

      const balanceInTrx = Number(tronWeb.fromSun(balance));

      return {
        address: address,
        type: 'TRON',
        name: tronNetwork?.name,
        symbol: tronNetwork?.symbol,
        logoUrl: tronNetwork?.logoUrl,
        balance: balanceInTrx,
      };
    } catch (err) {
      console.log(err);
      return {
        address: address,
        type: 'TRON',
        name: 'undefined',
        symbol: 'undefined',
        logoUrl: 'undefined',
        balance: 0,
      };
    }
  }

  /*
  async getAllBalance(walletId: string, user) {
    try {
      const walletDoc = await this._walletModel.findOne({
        _id: walletId,
        userId: user?.id,
      });

      if (!walletDoc) {
        throw new Error('Wallet not found');
      }

      const wallets = walletDoc?.wallets;

      const evmWallet = wallets?.find(
        (wallet) => wallet?.type === WalletTypeEnum.EVM,
      );

      const tronWallet = wallets?.find(
        (wallet) => wallet?.type === WalletTypeEnum.TRON,
      );

      let bitcoinWallet = wallets?.find(
        (wallet) => wallet?.type === WalletTypeEnum.BTC,
      );

      const [bitcoinBalance, evmBalance, tronBalance] = await Promise.all([
        this.getBtcBalance(bitcoinWallet?.address),
        this.getAllEvmBalance(evmWallet?.address),
        this.getTronBalance(tronWallet?.address),
      ]);

      delete bitcoinWallet?.privateKey;

      bitcoinWallet = JSON.parse(JSON.stringify(bitcoinWallet));

      return [
        {
          ...bitcoinWallet,
          ...bitcoinBalance,
        },
        ...evmBalance,
        {
          ...tronBalance,
        },
      ];
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  async getAllBalanceWithWallet(wallet: WalletDocument) {
    try {
      const wallets = wallet?.wallets;

      const evmWallet = wallets?.find(
        (wallet) => wallet?.type === WalletTypeEnum.EVM,
      );

      const tronWallet = wallets?.find(
        (wallet) => wallet?.type === WalletTypeEnum.TRON,
      );

      let bitcoinWallet = wallets?.find(
        (wallet) => wallet?.type === WalletTypeEnum.BTC,
      );

      const [bitcoinBalance, evmBalance, tronBalance] = await Promise.all([
        this.getBtcBalance(bitcoinWallet?.address),
        this.getAllEvmBalance(evmWallet?.address),
        this.getTronBalance(tronWallet?.address),
      ]);

      delete bitcoinWallet?.privateKey;

      bitcoinWallet = JSON.parse(JSON.stringify(bitcoinWallet));

      return [
        {
          ...bitcoinWallet,
          ...bitcoinBalance,
        },
        ...evmBalance,
        {
          ...tronBalance,
        },
      ];
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err.message);
    }
  }

  */

  async withdraw(userId, withdrawDTO: WithdrawDTO) {
    try {
      // check balance.

      const userData = await this._userModel.findOne({
        _id: userId,
      });
      const coinDocument = await this._coinModel.findOne({
        _id: withdrawDTO.coinId,
      });
      const walletDocument = await this._walletModel.findOne({
        userId: userId,
      });
      const balanceDocument = await this._balanceModel.findOne({
        userId: userId,
        coinId: withdrawDTO.coinId,
      });
      let newBalance = balanceDocument.balance - withdrawDTO.amount;
      if (newBalance < 0) {
        throw new Error('Insufficient Balance');
      }

      // send amount
      let sendAmountData = await this.sendAmount(userId, withdrawDTO, false);

      // update balance
      await balanceDocument.updateOne({ balance: newBalance });

      let transactionDocument = await new this._transactionModel({
        userId: userId,
        walletId: walletDocument.id,
        fromAddress: sendAmountData.fromAddress,
        toAddress: withdrawDTO.address,
        coinId: withdrawDTO.coinId,
        type: TRANSACTIONENUM.WITHDRAW,
        fee: sendAmountData.transactionFee,
        amount: withdrawDTO.amount,
        balance: newBalance,
        swappedAmount: null,
        trxHash: sendAmountData.trxHash,
        status: TRANSACTIONSTATUSENUM.COMPLETED,
        currencyId: userData?.currencyId,
      }).save();

      const text = ` Your withdrawal of ${withdrawDTO.amount} ${coinDocument.symbol} has been successfully processed from your Crypto Wallet account. Please allow up to 20 minutes for the funds to reflect in your designated withdrawal account. For further information or inquiries, consult our FAQs. If you require immediate assistance, start a chat with us within the Crypto Wallet app.`;
      let userDocument = await this._userModel.findOne({ _id: userId });
      const res = await this.utilsService.sendEmail({
        from: process.env.SENDER_MAIL,
        to: [userDocument?.email],
        subject: 'Withdrawal Request Processed',
        text: text,
      });

      return transactionDocument;
    } catch (err) {
      console.log('1');
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async swap(userId, swapDTO: SwapDTO) {
    try {
      console.log('SWAP DTO');
      console.log(swapDTO);
      debugger;
      // check balance.
      const userData = await this._userModel.findOne({
        _id: userId,
      });
      const walletDocument = await this._walletModel.findOne({
        userId: userId,
      });

      const currency = await this._currencyModel.findOne({
        _id: userData?.currencyId,
      });

      let coinDocument = await this._coinModel.findOne({ _id: swapDTO.coinId });
      coinDocument = JSON.parse(JSON.stringify(coinDocument));
      const networkDocument = await this._networkModel.findOne({
        _id: swapDTO.networkId,
      });
      const balanceDocument = await this._balanceModel.findOne({
        userId: userId,
        coinId: swapDTO.coinId,
      });
      let newBalance = balanceDocument.balance - swapDTO.amount;
      if (newBalance < 0) {
        throw new Error('Insufficient Balance');
      }
      debugger;
      const coinPrice = await this._coinPriceModel.findOne({
        coinId: swapDTO.coinId,
        currencyId: userData?.currencyId,
      });

      if (!coinPrice) {
        throw new Error('Coin price not found');
      }
      debugger;
      coinDocument.price = coinPrice.price;

      debugger;
      if (coinDocument.isToken && swapDTO.amount < STABLE_MINIMUM) {
        throw new Error('Minimum swap amount is ' + STABLE_MINIMUM);
      }

      // send amount

      let hotWallet;
      debugger;
      if (networkDocument.networkType == NETWORKTYPEENUM.EVM) {
        hotWallet = process.env.EVM_HOT_WALLET;
      } else if (networkDocument.networkType == NETWORKTYPEENUM.TRON) {
        hotWallet = process.env.TRON_HOT_WALLET;
      } else if (networkDocument.networkType == NETWORKTYPEENUM.BTC) {
        hotWallet = process.env.BTC_HOT_WALLET;
      }
      debugger;
      const withdrawDTO: WithdrawDTO = {
        address: hotWallet,
        amount: swapDTO.amount,
        coinId: swapDTO.coinId,
        networkId: swapDTO.networkId,
      };
      debugger;
      let sendAmountData = await this.sendAmount(userId, withdrawDTO, false);
      debugger;
      console.log('done send amount');
      debugger;
      let swapFee = 0;

      const feeInfo = await this._feeInfoModel.findOne({
        feeName: 'swap_fee',
      });

      swapFee = swapDTO.amount * (feeInfo.feePercentage / 100);
      swapDTO.amount = swapDTO.amount - swapFee;
      // updateBalance

      debugger;
      await balanceDocument.updateOne({ balance: newBalance });

      let swappedAmount = swapDTO.amount * coinDocument.price;
      let currentSwappedBalance =
        swappedAmount + walletDocument.currentSwappedBalance;

      await walletDocument.updateOne({
        currentSwappedBalance: currentSwappedBalance,
      });

      let transactionDocument = await new this._transactionModel({
        userId: userId,
        walletId: walletDocument.id,
        fromAddress: sendAmountData.fromAddress,
        toAddress: hotWallet,
        coinId: swapDTO.coinId,
        type: TRANSACTIONENUM.SWAP,
        fee: sendAmountData.transactionFee,
        swapFee: swapFee,
        amount: swapDTO.amount + swapFee,
        balance: newBalance,
        swappedAmount: swappedAmount,
        swappedPrice: coinDocument?.price,
        trxHash: sendAmountData.trxHash,
        trxUrl: null,
        status: TRANSACTIONSTATUSENUM.COMPLETED,
        currencyId: userData?.currencyId,
      }).save();
      debugger;
      let userDocument = await this._userModel.findOne({ _id: userId });
      debugger;
      const text = `
      Your recent swap of ${transactionDocument.amount} ${coinDocument.symbol} for ${currency?.symbol}${transactionDocument.swappedAmount}  is complete on your Crypto Wallet app. You can review the transaction details and updated asset balances by logging into your account. Need help? Check our FAQs for more guidance. If you have questions about this swap or need additional support, don't hesitate to reach out via the in-app chat.`;
      debugger;
      const res = await this.utilsService.sendEmail({
        from: process.env.SENDER_MAIL,
        to: [userDocument?.email],
        subject: 'Swapping Completed',
        text: text,
      });

      return transactionDocument;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async withdrawFiat(userId, withdrawFiatDTO: WithdrawFiatDTO) {
    try {
      // check balance

      const userData = await this._userModel.findOne({
        _id: userId,
      });

      let walletDocument = await this._walletModel.findOne({ userId: userId });
      let currentSwappedBalance =
        walletDocument.currentSwappedBalance - withdrawFiatDTO.amount;
      //   let totalWithdrawnAmount = walletDocument.totalWithdrawnAmount + withdrawFiatDTO.amount;
      let totalWithdrawnAmountLocked =
        walletDocument.totalWithdrawnAmountLocked + withdrawFiatDTO.amount;

      if (currentSwappedBalance < 0) {
        throw new Error('Insufficient Balance');
      }

      await walletDocument.updateOne({
        currentSwappedBalance: currentSwappedBalance,
        totalWithdrawnAmountLocked: totalWithdrawnAmountLocked,
      });

      const feeInfo = await this._feeInfoModel.findOne({
        feeName: 'withdraw_fiat_fee',
      });

      const feeAmount = withdrawFiatDTO.amount * (feeInfo.feePercentage / 100);
      debugger
      let transactionDocument = await new this._transactionModel({
        userId: userId,
        walletId: walletDocument.id,
        fromAddress: null,
        toAddress: null,
        coinId: null,
        type: TRANSACTIONENUM.WITHDRAW_FIAT,
        amount: withdrawFiatDTO.amount,
        balance: currentSwappedBalance,
        fee: feeAmount,
        swappedAmount: null,
        trxHash: null,
        trxUrl: null,
        bankName: withdrawFiatDTO.bankName,
        accountNumber: withdrawFiatDTO.accountNumber,
        accountName: withdrawFiatDTO.accountName,
        status: TRANSACTIONSTATUSENUM.PENDING,
        currencyId: userData?.currencyId,
      }).save();

      return transactionDocument;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async sendAmount(userId, withdrawDTO: WithdrawDTO, isGasFeeTransfer = false) {
    try {
      console.log('send Amount');
      debugger;

      let fromAddress, fromKey, response;
      const receiverAddress = withdrawDTO?.address;
      const amount = withdrawDTO?.amount;
      const coinId = withdrawDTO?.coinId;
      debugger
      const userDocument = await this._userModel.findOne({
        _id: userId,
      });

      const walletDocument = await this._walletModel.findOne({
        userId: userId,
      });
      debugger;
      if (!userDocument || !walletDocument) {
        throw new Error('Wallet not found');
      }

      const coinDocument = await this._coinModel.findOne({
        _id: coinId,
      });

      if (!coinDocument) {
        throw new Error('Coin not found');
      }
      debugger;
      const networkDocument = await this._networkModel.findOne({
        _id: coinDocument?.networkId,
      });

      if (!networkDocument) {
        throw new Error('Network not found');
      }
      debugger;
      if (networkDocument?.networkType === NETWORKTYPEENUM.EVM) {
        debugger;
        fromAddress = walletDocument?.evmAddress;
        fromKey = this.decryptData(
          walletDocument?.evmKey,
          process.env.ENCRYPTION_KEY,
        );
        debugger;
        const web3 = new Web3(networkDocument?.rpcUrl);
        debugger;
        const isValidAddress = await web3.utils.isAddress(receiverAddress);

        if (!isValidAddress) {
          throw new Error('Invalid address');
        }
        debugger;
        let nonce = await web3.eth.getTransactionCount(fromAddress);
        let noncePending = await web3.eth.getTransactionCount(
          fromAddress,
          'pending',
        );
        debugger;
        while (Number(nonce) != Number(noncePending)) {
          console.log(
            'waiting 10s for correct nonce...',
            Number(nonce),
            Number(noncePending),
          );
          await new Promise((resolve) => {
            setTimeout(resolve, 10000);
          });
          nonce = await web3.eth.getTransactionCount(fromAddress);
          noncePending = await web3.eth.getTransactionCount(
            fromAddress,
            'pending',
          );
        }
        debugger;
        const coinNativeDocument = await this._coinModel.findOne({
          isToken: false,
          networkId: withdrawDTO.networkId,
        });
        const balanceDocumentNative = await this._balanceModel.findOne({
          userId: userId,
          coinId: coinNativeDocument.id,
        });
        debugger;
        if (!coinDocument?.isToken) {
          // native token transfer

          const amountInDecimal = toDecimals(amount, coinDocument?.decimal);
          debugger;
          let gasLimit = await web3.eth.estimateGas({
            from: fromAddress,
            value: amountInDecimal,
          });

          let gasPrice = await web3.eth.getGasPrice();

          gasLimit = Math.floor(Number(gasLimit) * 1.2);
          gasPrice = Math.floor(Number(gasPrice) * 1.2);
          debugger;
          let estimateGasFee = Number(gasLimit) * Number(gasPrice);
          let estimatedGasFeeEth = Number(
            web3.utils.fromWei(estimateGasFee, 'ether'),
          );
          debugger;
          if (amount + estimatedGasFeeEth > balanceDocumentNative.balance) {
            throw new Error(
              'Insufficient Balance for Fee Please Leave Adequate balance for blockchain transaction fee.',
            );
          }
          debugger;
          const txObject = {
            nonce: nonce,
            to: receiverAddress,
            value: amountInDecimal,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          };
          debugger;
          const tx = await web3.eth.accounts.signTransaction(txObject, fromKey);
          debugger;
          const txHash = await web3.eth.sendSignedTransaction(
            tx.rawTransaction,
          );

          response = {
            status: 'success',
            transfer: true,
            txHash: txHash,
            trxHash: txHash?.transactionHash,
            fromAddress: fromAddress,
            transactionFee: Number(
              fromDecimals(
                Number(txHash?.effectiveGasPrice) * Number(txHash?.gasUsed),
                coinDocument?.decimal,
              ),
            ),
          };
        } else {
          // token transfer

          const contract = new web3.eth.Contract(
            abi?.token,
            coinDocument?.contractAddress,
          );

          const amountInDecimal = toDecimals(amount, coinDocument?.decimal);

          let gasLimit = await contract.methods
            .transfer(receiverAddress, amountInDecimal)
            .estimateGas({ from: fromAddress });

          let gasPrice = await web3.eth.getGasPrice();

          gasLimit = Math.floor(Number(gasLimit) * 1.2);
          gasPrice = Math.floor(Number(gasPrice) * 1.2);

          let estimateGasFee = Number(gasLimit) * Number(gasPrice);
          let estimatedGasFeeEth = Number(
            web3.utils.fromWei(estimateGasFee, 'ether'),
          );

          if (isGasFeeTransfer) {
            try {
              debugger;

              while (masterWalletLocks.isEVMLocked) {
                console.log(
                  'wait... masterWalletLocks.isEVMLocked: ',
                  masterWalletLocks.isEVMLocked,
                );
                await new Promise((resolve) => {
                  setTimeout(resolve, 10000);
                });
              }

              masterWalletLocks.isEVMLocked = masterWalletLocks.isEVMLocked + 1;

              await this.sendAmountFromMaster({
                address: fromAddress,
                amount: estimatedGasFeeEth,
                coinId: coinNativeDocument.id,
                networkId: withdrawDTO.networkId,
              });

              console.log('sent evm from master');
              debugger;
              if (masterWalletLocks.isEVMLocked) {
                masterWalletLocks.isEVMLocked =
                  masterWalletLocks.isEVMLocked - 1;
              }

              console.log(
                'evm lock released.. masterWalletLocks.isEVMLocked: ',
                masterWalletLocks.isEVMLocked,
              );
            } catch (error) {
              console.log('error sending transaction fee from master');
              console.log(error);
              if (masterWalletLocks.isEVMLocked) {
                masterWalletLocks.isEVMLocked =
                  masterWalletLocks.isEVMLocked - 1;
              }
              console.log(
                'evm lock released.. masterWalletLocks.isEVMLocked: ',
                masterWalletLocks.isEVMLocked,
              );
              throw new Error(
                'This one is on us and we are doing all we can to fix it. Please wait a few minutes before trying again.',
              );
            } finally {
            }
          } else {
            if (estimatedGasFeeEth > balanceDocumentNative.balance) {
              throw new Error(
                'Insufficient Balance for Fee Please Leave Adequate balance for blockchain transaction fee.',
              );
            }
          }

          const data = contract.methods
            .transfer(receiverAddress, amountInDecimal)
            .encodeABI();

          const txObject = {
            nonce: nonce,
            to: coinDocument?.contractAddress,
            value: 0,
            data: data,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          };
          debugger;
          const tx = await web3.eth.accounts.signTransaction(txObject, fromKey);

          debugger;
          const txHash = await web3.eth.sendSignedTransaction(
            tx.rawTransaction,
          );

          response = {
            status: 'success',
            transfer: true,
            txHash: txHash,
            trxHash: txHash?.transactionHash,
            fromAddress: fromAddress,
            transactionFee: Number(
              fromDecimals(
                Number(txHash?.effectiveGasPrice) * Number(txHash?.gasUsed),
                coinDocument?.decimal,
              ),
            ),
          };
        }
      } else if (networkDocument?.networkType === NETWORKTYPEENUM.TRON) {
        try {
          debugger;
          fromAddress = walletDocument?.tronAddress;
          fromKey = this.decryptData(
            walletDocument?.tronKey,
            process.env.ENCRYPTION_KEY,
          );
          debugger
          if (fromKey.slice(0, 2) === '0x') fromKey = fromKey.slice(2);

          const coinNativeDocument = await this._coinModel.findOne({
            isToken: false,
            networkId: withdrawDTO.networkId,
          });
          const balanceDocumentNative = await this._balanceModel.findOne({
            userId: userId,
            coinId: coinNativeDocument.id,
          });

          if (!coinDocument?.isToken) {
            const estimatedGasFeeTrx = TRX_GAS_FEE;

            if (amount + estimatedGasFeeTrx > balanceDocumentNative.balance) {
              throw new Error(
                'Insufficient Balance for Fee Please Leave Adequate balance for blockchain transaction fee.',
              );
            }

            const amountInSun = tronWeb.toSun(amount);

            const tx = await tronWeb.transactionBuilder.sendTrx(
              receiverAddress,
              amountInSun,
              fromAddress,
            );

            const signedTx = await tronWeb.trx.sign(tx, fromKey);

            const transaction = await tronWeb.trx.sendRawTransaction(signedTx);

            debugger;

            const trxId = transaction?.transaction?.txID;

            if (!trxId) {
              throw new Error('Invalid Transaction');
            }

            let configTronScan = {
              headers: {
                'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
              },
            };
            const confirmationAPIURL =
              TRON_SCAN_URL + `/api/transaction-info?hash=${trxId}`;
            let result = {
              data: {
                confirmed: false,
                confirmations: 0,
                contractRet: 'SUCCESS',
              },
            };
            try {
              result = await axios.get(confirmationAPIURL, configTronScan);
            } catch (error) {
              console.log('error fecting trx details');
            }

            let i = 0;
            debugger
            while (result && result.data && !result.data.confirmed && result.data.confirmations < 10 && i < 12) {
              console.log('----data----');
              console.log(result.data);
              console.log('----data----');
              console.log(result.data.confirmed);
              console.log(result.data.confirmations);
              console.log(result.data.contractRet);
              try {
                let resultDummy = await axios.get(confirmationAPIURL);
                result = resultDummy;
              } catch (error) {
                console.log('error fecting trx details');
              }
              await new Promise((resolve) => {
                setTimeout(resolve, 6000);
              });
              i++;
            }

            if (result && result.data && result?.data?.contractRet) {
              if (result?.data?.contractRet != 'SUCCESS') {
                throw new Error(
                  'Transaction Failed : ' + result?.data?.contractRet,
                );
              }
            }

            response = {
              status: 'success',
              transfer: true,
              txHash: trxId,
              trxHash: trxId,
              fromAddress: fromAddress,
              //transactionFee: Number(fromDecimals(Number(tx?.effectiveGasPrice) * Number(tx?.gasUsed), coinDocument?.decimal))
            };
          } else {
            const amountInDecimal = toDecimals(amount, coinDocument?.decimal);

            const tronWebLocal = new TronWeb({
              fullNode: TRON_RPC,
              solidityNode: TRON_RPC,
              eventServer: TRON_RPC,
              headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY },
              privateKey: fromKey, // The private key of the sender's address
            });

            const usdtContract = await tronWeb
              .contract()
              .at(coinDocument?.contractAddress);

            // const contract = await tronWebLocal.contract(
            //   abi?.token,
            //   coinDocument?.contractAddress,
            // );

            const estimatedGasFeeTrx = TRX_GAS_FEE;

            if (isGasFeeTransfer) {
              try {
                while (masterWalletLocks.isTRONLocked) {
                  console.log(
                    'wait... masterWalletLocks.isTRONLocked: ',
                    masterWalletLocks.isTRONLocked,
                  );
                  await new Promise((resolve) => {
                    setTimeout(resolve, 10000);
                  });
                }

                masterWalletLocks.isTRONLocked =
                  masterWalletLocks.isTRONLocked + 1;

                debugger;

                await this.sendAmountFromMaster({
                  address: fromAddress,
                  amount: estimatedGasFeeTrx,
                  coinId: coinNativeDocument.id,
                  networkId: withdrawDTO.networkId,
                });

                console.log('sent tron from master');
                debugger;
                if (masterWalletLocks.isTRONLocked) {
                  masterWalletLocks.isTRONLocked =
                    masterWalletLocks.isTRONLocked - 1;
                }
                console.log(
                  'tron lock released.. masterWalletLocks.isTRONLocked: ',
                  masterWalletLocks.isTRONLocked,
                );
              } catch (error) {
                console.log('error sending transaction fee from master');
                console.log(error);

                if (masterWalletLocks.isTRONLocked) {
                  masterWalletLocks.isTRONLocked =
                    masterWalletLocks.isTRONLocked - 1;
                }

                console.log(
                  'tron lock released.. masterWalletLocks.isTRONLocked: ',
                  masterWalletLocks.isTRONLocked,
                );
                throw new Error(
                  'This one is on us and we are doing all we can to fix it. Please wait a few minutes before trying again.',
                );
              } finally {
              }
            } else {
              if (estimatedGasFeeTrx > balanceDocumentNative.balance) {
                throw new Error(
                  'Insufficient Balance for Fee Please Leave Adequate balance for blockchain transaction fee.',
                );
              }
            }

            const options = {
              //  feeLimit: 10000000,
              callValue: 0,
            };

            const tx =
              await tronWebLocal.transactionBuilder.triggerSmartContract(
                coinDocument?.contractAddress,
                'transfer(address,uint256)',
                options,
                [
                  {
                    type: 'address',
                    value: receiverAddress,
                  },
                  {
                    type: 'uint256',
                    value: amountInDecimal,
                  },
                ],
                tronWeb.address.toHex(fromAddress),
              );

            //            const tx = usdtContract.transfer(receiverAddress, amountInDecimal);

            // Sign the transaction
            const signedTransaction = await tronWebLocal.trx.sign(
              tx.transaction,
              fromKey,
            );

            // Broadcast the transaction
            const transaction = await tronWebLocal.trx.sendRawTransaction(
              signedTransaction,
            );

            // debugger;
            // let receipt;
            // const tx = await contract.methods
            //   .transfer(receiverAddress, amountInDecimal)
            //   .send({
            //     // feeLimit: 100000000,
            //     callValue: 0,
            //     shouldPollResponse: true,
            //   });

            // const signedTx = await tronWeb.trx.sign(tx, fromKey);

            // const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

            const trxId = transaction?.transaction?.txID;

            if (!trxId) {
              throw new Error('Invalid Transaction');
            }

            let configTronScan = {
              headers: {
                'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
              },
            };

            const confirmationAPIURL =
              TRON_SCAN_URL + `/api/transaction-info?hash=${trxId}`;
            let result = {
              data: {
                confirmed: false,
                confirmations: 0,
                contractRet: 'SUCCESS',
              },
            };
            try {
              result = await axios.get(confirmationAPIURL, configTronScan);
            } catch (error) {
              console.log('error fecting trx details');
            }

            let i = 0;
            while (result && result.data && !result.data.confirmed && result.data.confirmations < 10 && i < 12) {
              console.log('----data----');
              console.log(result.data);
              console.log('----data----');
              console.log(result.data.confirmed);
              console.log(result.data.confirmations);
              console.log(result.data.contractRet);
              try {
                let resultDummy = await axios.get(confirmationAPIURL);
                result = resultDummy;
              } catch (error) {
                console.log('error fecting trx details');
              }
              await new Promise((resolve) => {
                setTimeout(resolve, 6000);
              });
              i++;
            }

            if (result && result.data && result?.data?.contractRet) {
              if (result?.data?.contractRet != 'SUCCESS') {
                throw new Error(
                  'Transaction Failed : ' + result?.data?.contractRet,
                );
              }
            }

            debugger;
            response = {
              status: 'success',
              transfer: true,
              txHash: trxId,
              trxHash: trxId,
              fromAddress: fromAddress,
              //       transactionFee: Number(fromDecimals(Number(receipt?.effectiveGasPrice) * Number(receipt?.gasUsed), coinDocument?.decimal))
            };
          }
        } catch (err) {
          console.log('error in tron');
          console.log(err);
          throw new Error(err?.message);
        }
      } else if (networkDocument?.networkType === NETWORKTYPEENUM.BTC) {
        debugger;
        // send amount in btc
        fromAddress = walletDocument?.btcAddress;
        fromKey = this.decryptData(
          walletDocument?.btcKey,
          process.env.ENCRYPTION_KEY,
        );

        const amountInSatoshi = toSatoshi(amount);

        const balance = await this.getBtcBalance(fromAddress, networkDocument);

        if (Number(balance?.balance) < Number(amount)) {
          throw new Error('Insufficient balance');
        }

        const res = await fetch(
          `${networkDocument?.rpcUrl}/addrs/${fromAddress}?token=${BITCOIN_TOKEN}`,
        );

        if (res.status !== 200) {
          throw new Error('Something went wrong');
        }

        const data = await res.json();

        if (data.balance != data.final_balance) {
          throw new Error(
            'Please wait for the other transaction to be confirmed.',
          );
        }

        //  const rawTransaction = new bitcoin.Psbt({ network: BITCOIN_NETWORK });
        const tx = new bitcoin.TransactionBuilder(BITCOIN_NETWORK);

        const trxs = data?.txrefs;

        // trxs?.forEach((txn) => {
        //   console.log('txn', txn);
        //   if (txn.tx_output_n >= 0) {
        //     tx.addInput(txn.tx_hash, txn.tx_output_n);
        //     // rawTransaction.addInput({
        //     //   hash: txn.tx_hash,
        //     //   index: txn.tx_output_n,
        //     // });
        //   }
        // });

        if (trxs.length > 0) {
          tx.addInput(trxs[0].tx_hash, trxs[0].tx_output_n);
        }

        // fee
        // const feeRes = await fetch(
        //   'https://bitcoinfees.earn.com/api/v1/fees/recommended',
        // );
        // if (feeRes?.status !== 200) {

        //   throw new Error('Something went wrong');
        // }

        // const trxFee = await feeRes.json();

        // const pricePerByte = trxFee.fastestFee;

        // const fee = (trxs.length * 148 + 1 * 34 + 10) * pricePerByte;

        try {
          tx.addOutput(receiverAddress, amountInSatoshi);
        } catch {
          throw new Error('Invalid Address');
        }
        // rawTransaction.addOutput({
        //   address: receiverAddress,
        //   value: amountInSatoshi,
        // });
        // rawTransaction.addOutput({
        //   address: fromAddress,
        //   value: amountInSatoshi,
        // });

        try {
          // const response = await fetch('https://api.blockexplorer.com/api/utils/estimatefee?nbBlocks=6');
          // const data = await response.json();
          // const feeRate = data.result; // Fee rate in satoshis per byte
          // const txSize = tx.buildIncomplete().toHex().length / 2; // Size in bytes
          // const estimatedFeeSatoshis = txSize * feeRate;
          // const estimatedFeeBTC = estimatedFeeSatoshis / 100000000; // Convert to BTC
          // console.log('Estimated Fee:', estimatedFeeBTC, 'BTC');
        } catch (error) {
          console.log('error in btc fee');
          console.log(error);
        }

        let txn_no = trxs?.filter((item) => item?.tx_output_n >= 0).length;

        const privateKey = ECPair.fromWIF(fromKey, BITCOIN_NETWORK);

        // if (txn_no === 0) {
        //   tx.sign(0, privateKey);
        //   // rawTransaction.signInput(txn_no - 1, privateKey);
        //   //rawTransaction.finalizeAllInputs();
        // }

        // while (txn_no > 0) {
        //   debugger;
        //   tx.sign(txn_no - 1, privateKey);
        //   //rawTransaction.signInput(txn_no - 1, privateKey);
        //   //    rawTransaction.validateSignaturesOfInput(0);
        //   //rawTransaction.finalizeAllInputs();
        //   txn_no--;
        // }

        tx.sign(0, privateKey);

        const tx_hex = tx.build().toHex();
        //const signed_tx = rawTransaction.extractTransaction().toHex();

        debugger;

        debugger;

        const txHash = await axios.post(`${networkDocument?.rpcUrl}/txs/push?token=${BITCOIN_TOKEN}`, { tx: tx_hex });

        if (txHash.status !== 201) {
          if (txHash.status === 409) {
            debugger;
            throw new Error(
              'Please wait for the other transaction to be confirmed.',
            );
          }

          throw new Error('Something went wrong');
        }
        debugger;
        const txHashJson = await txHash.data;
        // // const txHash = await fetch(`${networkDocument?.rpcUrl}/txs/push?token=${BITCOIN_TOKEN}`, {
        // //   method: 'POST',
        // //   body: JSON.stringify({ tx: tx_hex }),
        // //   //  body: JSON.stringify({ tx: signed_tx }),
        // // });

        // // const txHashJson = await txHash.json();

        // if (txHash.status !== 201) {

        //   throw new Error(txHashJson?.error);
        // }

        response = {
          status: 'success',
          transfer: true,
          txHash: txHashJson,
          trxHash: txHashJson?.tx?.hash,
          fromAddress: fromAddress,
          //     transactionFee: fromSatoshi(Number(txHashJson?.tx?.fee)),
        };
      }

      return response;
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.error) {
        if (err?.response?.data?.error.includes('already')) {
          throw new Error(
            'Please wait for the other transaction to be confirmed.',
          );
        }
      }
      if (err.message) {
        console.log(err.message);
        if (err.message.includes('409')) {
          throw new Error(
            'Please wait for the other transaction to be confirmed.',
          );
        }
      }
      throw new Error(err?.message);
    }
  }

  async sendAmountFromMaster(withdrawDTO: WithdrawDTO) {
    try {
      debugger;
      let fromAddress, fromKey, response;
      const receiverAddress = withdrawDTO?.address;
      const amount = withdrawDTO?.amount;
      const coinId = withdrawDTO?.coinId;

      const coinDocument = await this._coinModel.findOne({
        _id: coinId,
      });

      if (!coinDocument) {
        throw new Error('Coin not found');
      }

      const networkDocument = await this._networkModel.findOne({
        _id: coinDocument?.networkId,
      });

      if (!networkDocument) {
        throw new Error('Network not found');
      }

      if (networkDocument?.networkType === NETWORKTYPEENUM.EVM) {
        fromAddress = process.env.EVM_HOT_WALLET;
        fromKey = process.env.EVM_HOT_WALLET_KEY; //this.decryptData(walletDocument?.evmKey, process.env.ENCRYPTION_KEY);

        const web3 = new Web3(networkDocument?.rpcUrl);

        const isValidAddress = await web3.utils.isAddress(receiverAddress);

        if (!isValidAddress) {
          throw new Error('Invalid address');
        }

        let nonce = await web3.eth.getTransactionCount(fromAddress);
        let noncePending = await web3.eth.getTransactionCount(
          fromAddress,
          'pending',
        );

        while (Number(nonce) != Number(noncePending)) {
          console.log(
            'MASTER: waiting 10s for correct nonce...',
            Number(nonce),
            Number(noncePending),
          );
          await new Promise((resolve) => {
            setTimeout(resolve, 10000);
          });
          nonce = await web3.eth.getTransactionCount(fromAddress);
          noncePending = await web3.eth.getTransactionCount(
            fromAddress,
            'pending',
          );
        }

        if (!coinDocument?.isToken) {
          // native token transfer

          const amountInDecimal = toDecimals(amount, coinDocument?.decimal);

          let gasLimit = await web3.eth.estimateGas({
            from: fromAddress,
            value: amountInDecimal,
          });

          let gasPrice = await web3.eth.getGasPrice();

          gasLimit = Math.floor(Number(gasLimit) * 1.2);
          gasPrice = Math.floor(Number(gasPrice) * 1.2);

          const txObject = {
            nonce: nonce,
            to: receiverAddress,
            value: amountInDecimal,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          };

          const tx = await web3.eth.accounts.signTransaction(txObject, fromKey);

          const txHash = await web3.eth.sendSignedTransaction(
            tx.rawTransaction,
          );

          response = {
            status: 'success',
            transfer: true,
            txHash: txHash,
            trxHash: txHash?.transactionHash,
            fromAddress: fromAddress,
            transactionFee: Number(
              fromDecimals(
                Number(txHash?.effectiveGasPrice) * Number(txHash?.gasUsed),
                coinDocument?.decimal,
              ),
            ),
          };
        } else {
          // token transfer

          const contract = new web3.eth.Contract(
            abi?.token,
            coinDocument?.contractAddress,
          );

          const amountInDecimal = toDecimals(amount, coinDocument?.decimal);

          let gasLimit = await contract.methods
            .transfer(receiverAddress, amountInDecimal)
            .estimateGas({ from: fromAddress });

          let gasPrice = await web3.eth.getGasPrice();

          gasLimit = Math.floor(Number(gasLimit) * 1.2);
          gasPrice = Math.floor(Number(gasPrice) * 1.2);

          const data = contract.methods
            .transfer(receiverAddress, amountInDecimal)
            .encodeABI();

          const txObject = {
            nonce: nonce,
            to: coinDocument?.contractAddress,
            value: 0,
            data: data,
            gasLimit: gasLimit,
            gasPrice: gasPrice,
          };

          const tx = await web3.eth.accounts.signTransaction(txObject, fromKey);

          const txHash = await web3.eth.sendSignedTransaction(
            tx.rawTransaction,
          );

          response = {
            status: 'success',
            transfer: true,
            txHash: txHash,
            trxHash: txHash?.transactionHash,
            fromAddress: fromAddress,
            transactionFee: Number(
              fromDecimals(
                Number(txHash?.effectiveGasPrice) * Number(txHash?.gasUsed),
                coinDocument?.decimal,
              ),
            ),
          };
        }
      } else if (networkDocument?.networkType === NETWORKTYPEENUM.TRON) {
        fromAddress = process.env.TRON_HOT_WALLET;
        fromKey = process.env.TRON_HOT_WALLET_KEY;

        if (fromKey.slice(0, 2) === '0x') fromKey = fromKey.slice(2);

        if (!coinDocument?.isToken) {
          const amountInSun = tronWeb.toSun(amount);

          // const data = tronWeb.transactionBuilder.triggerSmartContract(
          //   contractAddress,
          //   'transfer(address,uint256)',
          //   {},
          //   [{ type: 'address', value: 'recipient_address' }, { type: 'uint256', value: 'amount_in_base_units' }]
          // );

          // const estimatedEnergy = await tronWeb.trx.estimateEnergy({
          //   to: receiverAddress,
          // //  data: '', // Optional data for contract calls
          // });

          // // Get the current energy-to-TRX conversion rate
          // const energyToTrxRate = await tronWeb.trx.getCurrentEnergyPrice();

          // // Calculate the estimated gas fee in TRX
          // const estimatedGasFee = tronWeb.fromSun(estimatedEnergy * energyToTrxRate);

          const tx = await tronWeb.transactionBuilder.sendTrx(
            receiverAddress,
            amountInSun,
            fromAddress,
          );

          const signedTx = await tronWeb.trx.sign(tx, fromKey);

          const txHash = await tronWeb.trx.sendRawTransaction(signedTx);

          response = {
            status: 'success',
            transfer: true,
            txHash: txHash?.txid,
            trxHash: txHash?.txid,
            fromAddress: fromAddress,
            //transactionFee: Number(fromDecimals(Number(tx?.effectiveGasPrice) * Number(tx?.gasUsed), coinDocument?.decimal))
          };
        } else {
          const tronWebLocal = new TronWeb({
            fullNode: TRON_RPC,
            solidityNode: TRON_RPC,
            eventServer: TRON_RPC,
            headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY },
            privateKey: fromKey, // The private key of the sender's address
          });

          const contract = await tronWebLocal.contract(
            abi?.token,
            coinDocument?.contractAddress,
          );

          // tronWeb.setAddress(fromAddress);

          // tronWeb.setPrivateKey(fromKey);

          const amountInDecimal = toDecimals(amount, coinDocument?.decimal);
          let receipt;
          const tx = await contract.methods
            .transfer(receiverAddress, amountInDecimal)
            .send({
              // feeLimit: 100000000,
              callValue: 0,
              shouldPollResponse: true,
            });

          // const signedTx = await tronWeb.trx.sign(tx, fromKey);

          // const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

          response = {
            status: 'success',
            transfer: true,
            //       txHash: tx,
            //       trxHash: tx?.transactionHash,
            fromAddress: fromAddress,
            //       transactionFee: Number(fromDecimals(Number(receipt?.effectiveGasPrice) * Number(receipt?.gasUsed), coinDocument?.decimal))
          };
        }
      } else if (networkDocument?.networkType === NETWORKTYPEENUM.BTC) {
        fromAddress = process.env.BTC_HOT_WALLET;
        fromKey = process.env.BTC_HOT_WALLET_KEY;

        const amountInSatoshi = toSatoshi(amount);

        const balance = await this.getBtcBalance(fromAddress, networkDocument);

        if (Number(balance?.balance) < Number(amount)) {
          throw new Error('Insufficient balance');
        }

        const res = await fetch(
          `${networkDocument?.rpcUrl}/addrs/${fromAddress}?token=${BITCOIN_TOKEN}`,
        );

        if (res.status !== 200) {
          throw new Error('Something went wrong');
        }

        const data = await res.json();
        //  const rawTransaction = new bitcoin.Psbt({ network: BITCOIN_NETWORK });
        const tx = new bitcoin.TransactionBuilder(BITCOIN_NETWORK);

        const trxs = data?.txrefs;

        trxs?.forEach((txn) => {
          console.log('txn', txn);
          if (txn.tx_output_n >= 0) {
            tx.addInput(txn.tx_hash, txn.tx_output_n);
            // rawTransaction.addInput({
            //   hash: txn.tx_hash,
            //   index: txn.tx_output_n,
            // });
          }
        });

        // fee
        // const feeRes = await fetch(
        //   'https://bitcoinfees.earn.com/api/v1/fees/recommended',
        // );
        // if (feeRes?.status !== 200) {

        //   throw new Error('Something went wrong');
        // }

        // const trxFee = await feeRes.json();

        // const pricePerByte = trxFee.fastestFee;

        // const fee = (trxs.length * 148 + 1 * 34 + 10) * pricePerByte;

        try {
          tx.addOutput(receiverAddress, amountInSatoshi);
        } catch {
          throw new Error('Invalid Address');
        }
        // rawTransaction.addOutput({
        //   address: receiverAddress,
        //   value: amountInSatoshi,
        // });
        // rawTransaction.addOutput({
        //   address: fromAddress,
        //   value: amountInSatoshi,
        // });

        try {
          // const response = await fetch('https://api.blockexplorer.com/api/utils/estimatefee?nbBlocks=6');
          // const data = await response.json();
          // const feeRate = data.result; // Fee rate in satoshis per byte
          // const txSize = tx.buildIncomplete().toHex().length / 2; // Size in bytes
          // const estimatedFeeSatoshis = txSize * feeRate;
          // const estimatedFeeBTC = estimatedFeeSatoshis / 100000000; // Convert to BTC
          // console.log('Estimated Fee:', estimatedFeeBTC, 'BTC');
        } catch (error) {
          console.log('error in btc fee');
          console.log(error);
        }

        let txn_no = trxs?.filter((item) => item?.tx_output_n >= 0).length;

        const privateKey = ECPair.fromWIF(fromKey, BITCOIN_NETWORK);

        // if (txn_no === 0) {
        //   tx.sign(0, privateKey);
        //   // rawTransaction.signInput(txn_no - 1, privateKey);
        //   //rawTransaction.finalizeAllInputs();
        // }

        while (txn_no > 0) {
          debugger;
          tx.sign(txn_no - 1, privateKey);
          //rawTransaction.signInput(txn_no - 1, privateKey);
          //    rawTransaction.validateSignaturesOfInput(0);
          //rawTransaction.finalizeAllInputs();
          txn_no--;
        }

        const tx_hex = tx.build().toHex();
        //const signed_tx = rawTransaction.extractTransaction().toHex();

        const txHash = await axios.post(
          `${networkDocument?.rpcUrl}/txs/push?token=${BITCOIN_TOKEN}`,
          { tx: tx_hex },
        );

        if (txHash.status !== 201) {
          if (txHash.status === 409) {
            debugger;
            throw new Error(
              'Please wait for the other transaction to be confirmed',
            );
          }

          throw new Error('Something went wrong');
        }
        debugger;
        const txHashJson = await txHash.data;
        // // const txHash = await fetch(`${networkDocument?.rpcUrl}/txs/push?token=${BITCOIN_TOKEN}`, {
        // //   method: 'POST',
        // //   body: JSON.stringify({ tx: tx_hex }),
        // //   //  body: JSON.stringify({ tx: signed_tx }),
        // // });

        // // const txHashJson = await txHash.json();

        // if (txHash.status !== 201) {

        //   throw new Error(txHashJson?.error);
        // }

        response = {
          status: 'success',
          transfer: true,
          txHash: txHashJson,
          trxHash: txHashJson?.tx?.hash,
          fromAddress: fromAddress,
          //     transactionFee: fromSatoshi(Number(txHashJson?.tx?.fee)),
        };
      }

      return response;
    } catch (err) {
      console.log(err);
      if (err.message) {
        if (err.message.includes('409')) {
          throw new Error(
            'Please wait for the other transaction to be confirmed',
          );
        }
      }
      throw new Error(err?.message);
    }
  }

  async getTransactions(transactionDTO: TransactionDTO) {
    try {
      let pagination = [];
      if (transactionDTO?.limit && transactionDTO?.offset) {
        pagination = [
          { $skip: parseInt(transactionDTO.offset) },
          { $limit: parseInt(transactionDTO.limit) },
        ];
      }

      let query = { userId: transactionDTO.userId };

      if (transactionDTO.type) {
        query['type'] = transactionDTO.type;
      }

      if (transactionDTO.status) {
        query['status'] = transactionDTO.status;
      }

      let transactions = await this._transactionModel.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  fullname: 1,
                  email: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'coins',
            localField: 'coinId',
            foreignField: '_id',
            pipeline: [
              {
                $lookup: {
                  from: 'networks',
                  localField: 'networkId',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        _id: 0,
                        id: '$_id',
                        name: 1,
                        symbol: 1,
                        icon: 1,
                      },
                    },
                  ],
                  as: 'network',
                },
              },
              {
                $unwind: {
                  path: '$network',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  name: 1,
                  symbol: 1,
                  icon: 1,
                  network: 1,
                },
              },
            ],
            as: 'coin',
          },
        },
        {
          $unwind: {
            path: '$coin',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'currencies',
            localField: 'currencyId',
            foreignField: '_id',
            as: 'currency',
          },
        },
        {
          $unwind: {
            path: '$currency',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: 1,
            user: 1,
            walletId: 1,
            fromAddress: 1,
            toAddress: 1,
            coinId: 1,
            coin: 1,
            type: 1,
            amount: 1,
            swappedAmount: 1,
            swappedPrice: 1,
            trxHash: 1,
            trxUrl: 1,
            bankName: 1,
            accountNumber: 1,
            accountName: 1,
            status: 1,
            createdAt: 1,
            currency: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        ...pagination,
      ]);

      return transactions;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async getTransactionsByAdmin(transactionDTO: TransactionDTO) {
    try {
      let pagination = [];
      if (transactionDTO?.limit && transactionDTO?.offset) {
        pagination = [
          { $skip: parseInt(transactionDTO.offset) },
          { $limit: parseInt(transactionDTO.limit) },
        ];
      }

      let query = {};

      if (transactionDTO.type) {
        query['type'] = transactionDTO.type;
      }

      if (transactionDTO.status) {
        query['status'] = transactionDTO.status;
      }

      let transactions = await this._transactionModel.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  fullname: 1,
                  email: 1,
                  bankName: 1,
                  accountNumber: 1,
                  accountName: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'coins',
            localField: 'coinId',
            foreignField: '_id',
            pipeline: [
              {
                $lookup: {
                  from: 'networks',
                  localField: 'networkId',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $project: {
                        _id: 0,
                        id: '$_id',
                        name: 1,
                        symbol: 1,
                        icon: 1,
                      },
                    },
                  ],
                  as: 'network',
                },
              },
              {
                $unwind: {
                  path: '$network',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  name: 1,
                  symbol: 1,
                  icon: 1,
                  network: 1,
                },
              },
            ],
            as: 'coin',
          },
        },
        {
          $unwind: {
            path: '$coin',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'currencies',
            localField: 'currencyId',
            foreignField: '_id',
            as: 'currency',
          },
        },
        {
          $unwind: {
            path: '$currency',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: 1,
            user: 1,
            walletId: 1,
            wallet: 1,
            fromAddress: 1,
            toAddress: 1,
            coinId: 1,
            coin: 1,
            type: 1,
            amount: 1,
            balance: 1,
            swappedAmount: 1,
            swappedPrice: 1,
            trxHash: 1,
            trxUrl: 1,
            bankName: 1,
            accountNumber: 1,
            accountName: 1,
            status: 1,
            createdAt: 1,
            currency: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        ...pagination,
      ]);

      return transactions;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async updateTransaction(updateTransactionDTO: UpdateTransactionDTO) {
    try {
      const transactionDocument = await this._transactionModel.findOne({
        _id: updateTransactionDTO.transactionId,
      });

      if (transactionDocument.type != TRANSACTIONENUM.WITHDRAW_FIAT) {
        throw new Error('Not allowed');
      }

      if (transactionDocument.status != TRANSACTIONSTATUSENUM.PENDING) {
        throw new Error('Transaction is already ' + transactionDocument.status);
      }
      const walletDocument = await this._walletModel.findOne({
        _id: transactionDocument.walletId,
      });

      let currentSwappedBalance = walletDocument.currentSwappedBalance;
      let totalWithdrawnAmount = walletDocument.totalWithdrawnAmount;
      let totalWithdrawnAmountLocked =
        walletDocument.totalWithdrawnAmountLocked;

      if (updateTransactionDTO.status === TRANSACTIONSTATUSENUM.COMPLETED) {
        totalWithdrawnAmount =
          totalWithdrawnAmount + transactionDocument.amount;
        totalWithdrawnAmountLocked =
          totalWithdrawnAmountLocked - transactionDocument.amount;
      } else if (
        updateTransactionDTO.status === TRANSACTIONSTATUSENUM.REJECTED
      ) {
        currentSwappedBalance =
          currentSwappedBalance + transactionDocument.amount;
        totalWithdrawnAmountLocked =
          totalWithdrawnAmountLocked - transactionDocument.amount;
      }

      await transactionDocument.updateOne({
        status: updateTransactionDTO.status,
        trxUrl: updateTransactionDTO.trxUrl,
      });

      await walletDocument.updateOne({
        currentSwappedBalance: currentSwappedBalance,
        totalWithdrawnAmount: totalWithdrawnAmount,
        totalWithdrawnAmountLocked: totalWithdrawnAmountLocked,
      });

      if (updateTransactionDTO.status === TRANSACTIONSTATUSENUM.COMPLETED) {
        let userDocument = await this._userModel.findOne({
          _id: transactionDocument.userId,
        });

        const currency = await this._currencyModel.findOne({
          _id: userDocument.currencyId,
        });
        const text = ` Your withdrawal of ${transactionDocument.amount} ${currency?.name} has been successfully processed from your Crypto Wallet account with fee amount of ${currency?.symbol} ${transactionDocument?.fee}. Please allow up to 20 minutes for the funds to reflect in your designated withdrawal account. For further information or inquiries, consult our FAQs. If you require immediate assistance, start a chat with us within the Crypto Wallet app.`;
        const res = await this.utilsService.sendEmail({
          from: process.env.SENDER_MAIL,
          to: [userDocument?.email],
          subject: 'Withdrawal Request Processed',
          text: text,
        });
      }

      return {
        message: 'success',
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async getStats() {
    try {
      let date = new Date();
      date.setDate(date.getDate() - 7);

      const totalUsers = await this._userModel.count({
        isVerified: true,
        isDeleted: false,
      });

      const activeUsers = await this._userModel.count({
        isActive: true,
        isVerified: true,
        isDeleted: false,
      });

      const newUsers = await this._userModel.count({
        isActive: true,
        isVerified: true,
        isDeleted: false,
        createdAt: { $gt: date },
      });

      const withdrawsFiat = await this._transactionModel.count({
        type: TRANSACTIONENUM.WITHDRAW_FIAT,
        status: TRANSACTIONSTATUSENUM.COMPLETED,
      });

      return {
        totalUsers,
        activeUsers,
        newUsers,
        withdrawsFiat,
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async createStream() {
    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 10000);
      });

      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });

      return 'OK';
    } catch (err) {
      console.log(err);
    }
  }

  async addAddressToStream(address) {
    try {
      await Moralis.Streams.addAddress({ address, id: process.env.STREAM_ID });

      return { message: 'Address added to stream!' };
    } catch (err) {
      console.log(err);
      return { message: 'Error: Address added to stream!' };
      // throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async moralisTransactionWebHook(transactionDto) {
    try {
      console.log('moralis event dto');
      console.log(transactionDto);
      debugger;
      if (!transactionDto.confirmed) {
        let chainId = parseInt(transactionDto.chainId);
        console.log(chainId);
        let networkDocument = await this._networkModel.findOne({
          chainId: chainId,
          networkType: NETWORKTYPEENUM.EVM,
          isDeleted: false,
        });
        console.log('networkDocument');
        console.log(networkDocument);
        if (networkDocument) {
          const nativeTransactions = transactionDto.txs;
          const tokenTransactions = transactionDto.erc20Transfers;

          let fromAddress, toAddress, amountWei, hash;
          let gas,
            gasPrice,
            receiptCumulativeGasUsed,
            receiptGasUsed,
            transactionFee,
            transactionFeeEth;

          let walletDocument: WalletDocument;
          let coinDocument: CoinDocument;

          for await (const transaction of nativeTransactions) {
            fromAddress = transaction?.fromAddress?.toLowerCase();
            hash = transaction?.hash?.toLowerCase();
            gasPrice = transaction.gasPrice;
            gas = transaction.gas;
            receiptCumulativeGasUsed = transaction.receiptCumulativeGasUsed;
            receiptGasUsed = transaction.receiptGasUsed;
            transactionFee = (
              Number(receiptGasUsed) * Number(gasPrice)
            ).toString();
            toAddress = transaction?.toAddress?.toLowerCase();
            transactionFeeEth = Number(
              web3.utils.fromWei(transactionFee, 'ether'),
            );

            coinDocument = await this._coinModel.findOne({
              networkId: networkDocument.id,
              isToken: false,
              isDeleted: false,
            });

            console.log('coinDocument');
            console.log(coinDocument);

            const balanceDocument = await this._balanceModel.findOne({
              address: toAddress,
              networkId: networkDocument.id,
              coinId: coinDocument.id,
            });

            if (coinDocument && balanceDocument) {
              amountWei = transaction?.value;

              console.log('balanceDocument');
              console.log(balanceDocument);

              const amount = Number(amountWei) / 10 ** coinDocument.decimal;
              const balance = balanceDocument.balance + amount;

              // await balanceDocument.updateOne({ balance: balance });

              if (
                process.env.EVM_HOT_WALLET.toLocaleLowerCase() == fromAddress
              ) {
                continue;
              }

              const tranxObj = {
                userId: balanceDocument.userId,
                walletId: balanceDocument.walletId,
                fromAddress: fromAddress,
                toAddress: toAddress,
                coinId: coinDocument.id,
                type: TRANSACTIONENUM.DEPOSIT,
                fee: transactionFeeEth,
                amount: amount,
                balance: balance,
                swappedAmount: null,
                trxHash: hash,
                status: TRANSACTIONSTATUSENUM.COMPLETED,
              };
              console.log('tranxObj');
              console.log(tranxObj);
              let transactionDocument = await new this._transactionModel(
                tranxObj,
              ).save();

              const text = `Your deposit of ${amount} ${coinDocument.symbol} is now credited to your Crypto Wallet account. Log in to your Crypto Wallet app to view your updated balance. If you have any questions, please refer to our FAQs for assistance. For personalized support, feel free to initiate a chat with us directly through the app.`;
              let userDocument = await this._userModel.findOne({
                _id: balanceDocument.userId,
              });
              const res = await this.utilsService.sendEmail({
                from: process.env.SENDER_MAIL,
                to: [userDocument?.email],
                subject: 'Deposit Successful',
                text: text,
              });
            } else {
              console.log('else');
              console.log('toAddress', toAddress);
              console.log('networkId', networkDocument.id);
              coinDocument = await this._coinModel.findOne({
                contractAddress: toAddress,
                networkId: networkDocument.id,
                isToken: true,
                isDeleted: false,
              });

              console.log('coinDocument');
              console.log(coinDocument);

              if (coinDocument) {
                for await (const transactionToken of tokenTransactions) {
                  if (
                    transactionToken?.contract?.toLowerCase() ==
                    transaction?.toAddress?.toLowerCase() &&
                    hash == transactionToken?.transactionHash?.toLowerCase() &&
                    fromAddress == transactionToken?.from?.toLowerCase()
                  ) {
                    toAddress = transactionToken?.to?.toLowerCase();
                    amountWei = transactionToken?.value;

                    const balanceDocument = await this._balanceModel.findOne({
                      address: toAddress,
                      networkId: networkDocument.id,
                      coinId: coinDocument.id,
                    });

                    console.log('balanceDocument');
                    console.log(balanceDocument);

                    if (balanceDocument) {
                      const amount =
                        Number(amountWei) / 10 ** coinDocument.decimal;
                      const balance = balanceDocument.balance + amount;

                      // await balanceDocument.updateOne({
                      //   balanceFunding: balance,
                      // });

                      let transactionDocument =
                        await new this._transactionModel({
                          userId: balanceDocument.userId,
                          walletId: balanceDocument.walletId,
                          fromAddress: fromAddress,
                          toAddress: toAddress,
                          coinId: coinDocument.id,
                          type: TRANSACTIONENUM.DEPOSIT,
                          amount: amount,
                          fee: transactionFeeEth,
                          balance: balance,
                          swappedAmount: null,
                          trxHash: hash,
                          status: TRANSACTIONSTATUSENUM.COMPLETED,
                        }).save();

                      let userDocument = await this._userModel.findOne({
                        _id: balanceDocument.userId,
                      });
                      const text = `Your deposit of ${amount} ${coinDocument.symbol} is now credited to your Crypto Wallet account. Log in to your Crypto Wallet app to view your updated balance. If you have any questions, please refer to our FAQs for assistance. For personalized support, feel free to initiate a chat with us directly through the app.`;
                      const res = await this.utilsService.sendEmail({
                        from: process.env.SENDER_MAIL,
                        to: [userDocument?.email],
                        subject: 'Deposit Successful',
                        text: text,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      return { message: 'Transaction successfully created!' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getBalance(
    walletAddress: string,
    coin: any,
    network: Network,
    walletId,
    userId,
    i,
  ) {
    try {
      const userData = await this._userModel.findOne({
        _id: userId,
      });

      if (!userData) {
        throw new Error('User not found');
      }

      coin = JSON.parse(JSON.stringify(coin));

      const coinPrice = await this._coinPriceModel.findOne({
        coinId: coin?.id,
        currencyId: userData?.currencyId,
      });

      coin.price = coinPrice?.price;

      console.log('inner start', i);
      if (network?.networkType === NETWORKTYPEENUM.EVM) {
        const web3 = new Web3(network?.rpcUrl);
        const isListening = await web3.eth.net.isListening();
        console.log(isListening);
        if (coin?.isToken) {
          const contract = new web3.eth.Contract(
            abi?.token,
            coin?.contractAddress,
          );
          const balance = await contract.methods
            .balanceOf(walletAddress)
            .call();

          console.log(
            'evm token balance',
            coin?.contractAddress,
            balance,
            coin.decimal,
          );

          const balanceInEth = Number(
            fromWei(balance.toString(), coin.decimal),
          );
          const balanceInUsd = balanceInEth * coin?.price;

          console.log('inner end', i);
          return {
            balance: balanceInEth,
            balanceInUsd: balanceInUsd,
            error: false,
            transactions: [],
          };
        } else {
          const balance = await web3.eth.getBalance(walletAddress);

          const balanceInEth = Number(web3.utils.fromWei(balance, 'ether'));
          const balanceInUsd = balanceInEth * coin?.price;
          console.log('inner end', i);
          return {
            balance: balanceInEth,
            balanceInUsd: balanceInUsd,
            error: false,
            transactions: [],
          };
        }
      } else if (network?.networkType === NETWORKTYPEENUM.TRON) {
        if (coin?.isToken) {
          const contract = await tronWeb.contract(
            abi?.token,
            coin?.contractAddress,
          );

          tronWeb.setAddress(walletAddress);

          const balance = await contract.balanceOf(walletAddress).call();

          const balanceInTrx = Number(fromDecimals(balance, coin?.decimal));

          const balanceInUsd = balanceInTrx * coin?.price;
          console.log('inner end', i);
          return {
            balance: balanceInTrx,
            balanceInUsd: balanceInUsd,
            error: false,
            transactions: [],
          };
        } else {
          const balance = await tronWeb.trx.getBalance(walletAddress);

          const balanceInTrx = Number(tronWeb.fromSun(balance));

          const balanceInUsd = balanceInTrx * coin?.price;
          console.log('inner end', i);
          return {
            balance: balanceInTrx,
            balanceInUsd: balanceInUsd,
            error: false,
            transactions: [],
          };
        }
      } else if (network?.networkType === NETWORKTYPEENUM.BTC) {
        const res = await fetch(
          `${network?.rpcUrl}/addrs/${walletAddress}?token=${BITCOIN_TOKEN}`,
        );

        if (res.status !== 200) {
          console.log('inner end', i);
          return {
            balance: 0,
            balanceInUsd: 0,
            error: true,
            transactions: [],
          };
        }

        const balance = await res.json();

        const balanceInBtc = fromSatoshi(Number(balance?.balance));

        const balanceInUsd = balanceInBtc * coin?.price;

        const balanceObj = {
          balance: balanceInBtc,
          balanceInUsd: balanceInUsd,
          error: false,
          transactions: balance?.txrefs,
        };
        console.log('inner end', i);
        return balanceObj;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async updateBalance(userId: string, skipBitcoin = false) {
    try {
      let coinsData = await this._coinModel.find({
        isDeleted: false,
        isActive: true,
      });

      let walletDocument = await this._walletModel.findOne({ userId: userId });

      const userData = await this._userModel.findOne({
        _id: userId,
      });

      if (!userData) {
        throw new Error('User not found');
      }

      const currency = userData?.currencyId;

      let i = 0;

      let tronAddress;
      for await (let coinItem of coinsData) {
        coinItem = JSON.parse(JSON.stringify(coinItem));
        i++;
        let walletAddress;
        let networkDocument = await this._networkModel.findOne({
          _id: coinItem.networkId,
        });

        if (networkDocument.networkType == NETWORKTYPEENUM.EVM) {
          walletAddress = walletDocument.evmAddress;
        } else if (networkDocument.networkType == NETWORKTYPEENUM.TRON) {
          walletAddress = walletDocument.tronAddress;
          tronAddress = walletDocument.tronAddress;
        } else if (networkDocument.networkType == NETWORKTYPEENUM.BTC) {
          walletAddress = walletDocument.btcAddress;
        }

        if (networkDocument.networkType == NETWORKTYPEENUM.BTC && skipBitcoin) {
          continue;
        }

        const coinPrice = await this._coinPriceModel.findOne({
          coinId: coinItem?.id,
          currencyId: currency,
        });

        coinItem.price = coinPrice?.price;

        console.log('outer start', i);
        const balance = await this.getBalance(
          walletAddress,
          coinItem,
          networkDocument,
          walletDocument.id,
          walletDocument.userId,
          i,
        );

        console.log('outer end', i);
        const balanceObj = {
          balance: balance?.balance,
          coinId: coinItem?.id,
          walletId: walletDocument?.id,
          address: walletAddress,
          userId: userId,
          networkId: networkDocument?.id,
        };

        try {
          if (networkDocument.networkType == NETWORKTYPEENUM.TRON) {
            //   debugger;
            if (coinItem.isToken) {
              let configTronGrid = {
                headers: {
                  'TRON-PRO-API-KEY': TRONGRID_API_KEY,
                },
              };


              let resultTRC20 = await axios.get(TRON_RPC + `/v1/accounts/${walletAddress}/transactions/trc20?limit=100&contract_address=${coinItem.contractAddress}`, configTronGrid);
              if (resultTRC20?.data && resultTRC20?.data?.data && resultTRC20?.data?.data?.length > 0) {
                for await (const trx of resultTRC20?.data?.data) {
                  if (trx.to == walletAddress) {
                    const valueInTrx = Number(
                      fromDecimals(trx?.value, coinItem?.decimal),
                    );

                    const tranxObj = {
                      userId: userId,
                      walletId: walletDocument.id,
                      fromAddress: trx?.from,
                      toAddress: walletAddress,
                      coinId: coinItem.id,
                      type: TRANSACTIONENUM.DEPOSIT,
                      amount: valueInTrx,
                      swappedAmount: null,
                      trxHash: trx?.transaction_id,
                      balance: balance?.balance,
                      status: TRANSACTIONSTATUSENUM.COMPLETED,
                    };
                    console.log('tron tranxObj');
                    console.log(tranxObj);
                    let existingTrx = await this._transactionModel.findOne({
                      trxHash: tranxObj.trxHash,
                    });
                    if (!existingTrx) {
                      let transactionDocument =
                        await new this._transactionModel(tranxObj).save();

                      const text = `Your deposit of ${valueInTrx} ${coinItem.symbol} is now credited to your Crypto Wallet account. Log in to your Crypto Wallet app to view your updated balance. If you have any questions, please refer to our FAQs for assistance. For personalized support, feel free to initiate a chat with us directly through the app.`;
                      let userDocument = await this._userModel.findOne({
                        _id: userId,
                      });
                      const res = await this.utilsService.sendEmail({
                        from: process.env.SENDER_MAIL,
                        to: [userDocument?.email],
                        subject: 'Deposit Successful',
                        text: text,
                      });
                    }
                  }
                }
              }
            } else {
              let configTronScan = {
                headers: {
                  'TRON-PRO-API-KEY': TRONSCAN_API_KEY,
                },
              };
              let resultNative = await axios.get(
                TRON_SCAN_URL +
                `/api/transaction?sort=-timestamp&count=true&limit=20&start=0&address=${walletAddress}`,
                configTronScan,
              );
              if (
                resultNative?.data &&
                resultNative?.data?.data &&
                resultNative?.data?.data?.length > 0
              ) {
                for await (const trx of resultNative?.data?.data) {
                  if (trx.toAddress == walletAddress) {
                    const valueInTrx = Number(
                      fromDecimals(trx?.amount, coinItem?.decimal),
                    );

                    if (
                      process.env.TRON_HOT_WALLET.toLocaleLowerCase() ==
                      trx?.ownerAddress?.toLowerCase()
                    ) {
                      continue;
                    }

                    const tranxObj = {
                      userId: userId,
                      walletId: walletDocument.id,
                      fromAddress: trx?.ownerAddress,
                      toAddress: trx?.toAddress,
                      coinId: coinItem.id,
                      type: TRANSACTIONENUM.DEPOSIT,
                      amount: valueInTrx,
                      swappedAmount: null,
                      trxHash: trx?.hash,
                      balance: balance?.balance,
                      status: TRANSACTIONSTATUSENUM.COMPLETED,
                    };
                    console.log('tron tranxObj');
                    console.log(tranxObj);
                    let existingTrx = await this._transactionModel.findOne({
                      trxHash: tranxObj.trxHash,
                    });
                    if (!existingTrx) {
                      let transactionDocument =
                        await new this._transactionModel(tranxObj).save();

                      const text = `Your deposit of ${valueInTrx} ${coinItem.symbol} is now credited to your Crypto Wallet account. Log in to your Crypto Wallet app to view your updated balance. If you have any questions, please refer to our FAQs for assistance. For personalized support, feel free to initiate a chat with us directly through the app.`;
                      let userDocument = await this._userModel.findOne({
                        _id: userId,
                      });
                      const res = await this.utilsService.sendEmail({
                        from: process.env.SENDER_MAIL,
                        to: [userDocument?.email],
                        subject: 'Desposit Successful',
                        text: text,
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log('error is tron transactions');
          console.log(error?.message);
        }

        if (networkDocument.networkType == NETWORKTYPEENUM.BTC) {
          if (!balance || !balance.transactions || balance.error) {
            continue;
          } else {
            for await (const trxItem of balance?.transactions) {
              const valueInBtc = fromSatoshi(Number(trxItem?.value));
              const tranxObj = {
                userId: userId,
                walletId: walletDocument.id,
                fromAddress: null,
                toAddress: walletAddress,
                coinId: coinItem.id,
                type: TRANSACTIONENUM.DEPOSIT,
                amount: valueInBtc,
                swappedAmount: null,
                trxHash: trxItem?.tx_hash,
                balance: balance?.balance,
                status: TRANSACTIONSTATUSENUM.COMPLETED,
              };
              console.log('tranxObj');
              console.log(tranxObj);
              let existingTrx = await this._transactionModel.findOne({
                trxHash: tranxObj.trxHash,
              });
              if (!existingTrx) {
                let transactionDocument = await new this._transactionModel(
                  tranxObj,
                ).save();

                const text = `Your deposit of ${valueInBtc} ${coinItem.symbol} is now credited to your Crypto Wallet account. Log in to your Crypto Wallet app to view your updated balance. If you have any questions, please refer to our FAQs for assistance. For personalized support, feel free to initiate a chat with us directly through the app.`;
                let userDocument = await this._userModel.findOne({
                  _id: userId,
                });
                const res = await this.utilsService.sendEmail({
                  from: process.env.SENDER_MAIL,
                  to: [userDocument?.email],
                  subject: 'Deposit Successful',
                  text: text,
                });
              }
            }
          }
        }
        console.log(walletDocument?.id, coinItem?.id, balanceObj);
        await this._balanceModel.findOneAndUpdate(
          { walletId: walletDocument?.id, coinId: coinItem?.id },
          balanceObj,
          { upsert: true },
        );
      }

      // debugger
      // const tronTransactions = await tronWeb.trx.getTransactionsRelated(tronAddress);

      const balanceDocuments = await this._balanceModel.find({
        userId: userId,
      });

      return balanceDocuments;
    } catch (err) {
      console.log(err);
    }
  }

  //  @Cron('*/1 * * * *')
  async updateBalanceForAllUsers() {
    try {
      cron.schedule('*/30 * * * *', async () => {
        console.log('cron job');
        const users = await this._userModel.find({});
        for await (const user of users) {
          await this.updateBalance(user?.id, true);
        }
      });

      cron.schedule('*/10 * * * *', async () => {
        console.log('cron job reset');
        masterWalletLocks.isBTCLocked = 0;
        masterWalletLocks.isEVMLocked = 0;
        masterWalletLocks.isTRONLocked = 0;
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getNonce(address) {
    debugger;
    const web3 = new Web3('https://rpc.ankr.com/eth');
    const nonce = await web3.eth.getTransactionCount(address);
    const pending = await web3.eth.getTransactionCount(address, 'pending');
    return {
      nonce: Number(nonce),
      pending: Number(pending),
    };
  }

  async getFee() {
    try {
      const feeInfo = await this._feeInfoModel.find();
      return feeInfo;
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }

  async setFee(setFeeDto: SetFeeDTO) {
    try {
      // fee must be less than or equal to 5%
      if (setFeeDto?.feePercentage > 5) {
        throw new Error('Fee must be less than or equal to 5%');
      }

      await this._feeInfoModel.updateOne(
        {
          feeName: setFeeDto?.feeName,
        },
        { ...setFeeDto },
        { upsert: true },
      );

      return {
        message: 'success',
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException(err?.message);
    }
  }
}
