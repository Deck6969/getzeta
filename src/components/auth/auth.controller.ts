import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { OtpDTO } from './dto/otp.dto';
import { SignupDTO } from './dto/signup.dto';
import { ApiTags, ApiBearerAuth, ApiOAuth2 } from '@nestjs/swagger';
import { EmailDTO } from './dto/email.dto';
import { ChangeEmailDTO, ChangePasswordDTO, PasswordDTO } from './dto/password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { UpdateProfileDTO } from './dto/profile.dto';
import { GetUsersDTO, UpdateUserActiveDTO, UpdateUserRoleDTO } from './dto/users.dto';
import { JwtAdminGuard, JwtSuperAdminGuard } from './jwt-admin.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signup(@Body() signupDto: SignupDTO) {
        signupDto.isAdmin = false;
        return this.authService.signup(signupDto);
    }

    @Post('signupAdmin')
    signupAdmin(@Body() signupDto: SignupDTO) {
        signupDto.isAdmin = true;
        return this.authService.signup(signupDto);
    }

    @Post('verifyEmail')
    verifyEmail(@Body() otpDto: OtpDTO) {
        return this.authService.verifyEmail(otpDto);
    }

    @Post('resendOtp')
    resendOtp(@Body() emailDto: EmailDTO) {
        return this.authService.resendOtp(emailDto)
    }

    @Post('login')
    login(@Body() loginDto: LoginDTO) {
        return this.authService.login(loginDto);
    }

    @Post('forgotPassword')
    forgotPassword(@Body() emailDto: EmailDTO) {
        return this.authService.forgotPassword(emailDto);
    }

    @Post('verifyOtpForForgotPassword')
    verifyOtpForForgotPassword(@Body() otpDto: OtpDTO) {
        return this.authService.verifyOtpForForgotPassword(otpDto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('resetPassword')
    resetPassword(@Body() passwordDto: PasswordDTO, @User() user) {
        return this.authService.resetPassword(passwordDto, user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('changePassword')
    changePassword(@Body() changePasswordDTO: ChangePasswordDTO, @User() user) {
        return this.authService.changePassword(changePasswordDTO, user);
    }


    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('changeEmail')
    changeEmail(@Body() changeEmailDTO: ChangeEmailDTO, @User() user) {
        return this.authService.changeEmail(changeEmailDTO, user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('updateProfile')
    updateProfile(@Body() updateProfile: UpdateProfileDTO, @User() user) {
        return this.authService.updateProfile(updateProfile, user.id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('getLoggedInUser')
    getLoggedInUsers(@User() user) {
        return this.authService.getLoggedInUsers(user)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('deleteUser')
    deleteUser(@User() user) {
        return this.authService.deleteUser(user?.id)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAdminGuard)
    @UseGuards(JwtAuthGuard)
    @Get('getAllUsers')
    getAllUsers(@User() User, @Query() getUsersDTO: GetUsersDTO) {
        return this.authService.getAllUsers(User.id, getUsersDTO)
    }

    @ApiBearerAuth()
    @UseGuards(JwtAdminGuard)
    @UseGuards(JwtAuthGuard)
    @Post('updateUserActive')
    updateUserActive(@Body() updateUserActiveDTO: UpdateUserActiveDTO) {
        return this.authService.updateUserActive(updateUserActiveDTO);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAdminGuard)
    @UseGuards(JwtAuthGuard)
    @Post('updateUserRole')
    updateUserRole(@Body() updateUserRoleDTO: UpdateUserRoleDTO) {
        return this.authService.updateUserRole(updateUserRoleDTO);
    }



    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    // @Get('enable2FA')
    // enable2FA(@User() user) {
    //     return this.authService.enable2FA(user?.id)
    // }

    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    // @Get('enable2FA/:otp')
    // validate2FA(@User() user, @Param("otp") otp: string) {
    //     return this.authService.validate2FA(user?.id, otp)
    // }


}
