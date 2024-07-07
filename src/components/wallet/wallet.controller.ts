import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { User } from 'src/decorators/user.decorator';
import { TransactionDTO, UpdateTransactionDTO } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoinNetworkDTO, NetworkDTO } from './dto/coinNetwork.dto';
import { SwapDTO, WithdrawDTO, WithdrawFiatDTO } from './dto/withdraw.dto';
import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { Request } from 'express';
import { SetFeeDTO } from './dto/setFee.dto';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private _walletService: WalletService) { }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getWalletWithBalance')
  getWalletWithBalance(@User() user) {
    return this._walletService.getWalletWithBalance(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('getUserWalletWithBalance/:userId')
  getUserWalletWithBalance(@Param("userId") userId: string) {
    return this._walletService.getWalletWithBalance(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getDepositAddress')
  getDepositAddress(@User() user, @Query() networkDTO: NetworkDTO) {
    return this._walletService.getDepositAddress(user.id, networkDTO.networkId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  withdraw(@User() user, @Body() withdrawDTO: WithdrawDTO, @Req() req: Request) {
    req.setTimeout(20 * 60 * 1000);
    withdrawDTO.amount = Number(withdrawDTO.amount);
    return this._walletService.withdraw(user?.id, withdrawDTO);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('withdrawFiat')
  withdrawFiat(@User() user, @Body() withdrawFiatDTO: WithdrawFiatDTO) {
    withdrawFiatDTO.amount = Number(withdrawFiatDTO.amount);
    return this._walletService.withdrawFiat(user.id, withdrawFiatDTO);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('swap')
  swap(@User() user, @Body() swapDTO: SwapDTO, @Req() req: Request) {
    req.setTimeout(20 * 60 * 1000);
    swapDTO.amount = Number(swapDTO.amount);
    return this._walletService.swap(user.id, swapDTO);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getTransactions')
  getTransactions(@Query() transactionDTO: TransactionDTO, @User() user) {
    transactionDTO.userId = user?.id;
    return this._walletService.getTransactions(transactionDTO);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('getTransactionsByAdmin')
  getTransactionsByAdmin(@Query() transactionDTO: TransactionDTO, @User() user) {
    return this._walletService.getTransactionsByAdmin(transactionDTO);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAdminGuard)
  @UseGuards(JwtAuthGuard)
  @Post('updateTransaction')
  updateTransaction(@Body() updateTransactionDTO: UpdateTransactionDTO, @User() user) {
    return this._walletService.updateTransaction(updateTransactionDTO);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAdminGuard)
  @UseGuards(JwtAuthGuard)
  @Get('getStats')
  getStats() {
    return this._walletService.getStats();
  }

  @Post('moralisTransactionWebHook')
  async moralisTransactionWebHook(@Body() transactionDto) {
    console.log("----------------------moralisTransactionWebHook----------------")
    const wallet = await this._walletService.moralisTransactionWebHook(
      transactionDto,
    );
    return wallet;
  }

  @Get('getNonce/:address')
  getNonce(@Param('address') address: string) {
    return this._walletService.getNonce(address);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('getFee')
  getFee() {
    return this._walletService.getFee();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAdminGuard)
  @UseGuards(JwtAuthGuard)
  @Post('setFee')
  setFee(@Body() setFeeDto: SetFeeDTO) {
    return this._walletService.setFee(setFeeDto);
  }
}
