const Company = require('../modles/Company');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const register = async (req, res) => {
    try {
        // Check if company already exists
        const existingCompany = await Company.findOne({ email: req.body.email });
        if (existingCompany) {
            throw new BadRequestError('Company with this email already exists');
        }

        // Create company
        const company = await Company.create({ ...req.body });

        // Generate email verification token
        const verificationToken = company.createEmailVerificationToken();
        await company.save({ validateBeforeSave: false });

        // Create verification URL
        const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email?token=${verificationToken}`;

        console.log(verificationURL)

        // Email content
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to Company Portal</h1>
                </div>
                <div style="padding: 40px; background: #f8f9fa;">
                    <h2 style="color: #333;">Verify Your Email Address</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for registering with Company Portal! To complete your registration and secure your account, 
                        please verify your email address by clicking the button below.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationURL}" 
                           style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  display: inline-block;
                                  font-weight: 600;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${verificationURL}" style="color: #3b82f6;">${verificationURL}</a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        This verification link will expire in 24 hours for security reasons.
                    </p>
                </div>
                <div style="background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: company.email,
                subject: 'Verify Your Email Address - Company Portal',
                message
            });

            res.status(StatusCodes.CREATED).json({
                success: true,
                msg: 'Company registered successfully. Please check your email to verify your account.',
                company: {
                    id: company._id,
                    companyName: company.companyName,
                    email: company.email,
                    isVerified: company.isVerified
                }
            });
        } catch (error) {
            company.emailVerificationToken = undefined;
            company.emailVerificationExpires = undefined;
            await company.save({ validateBeforeSave: false });

            throw new BadRequestError('Email could not be sent. Please try again.');
        }
    } catch (error) {
        throw error;
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            throw new BadRequestError('Verification token is required');
        }

        // Hash the token to compare with stored token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const company = await Company.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!company) {
            throw new BadRequestError('Token is invalid or has expired');
        }

        // Verify the company
        company.isVerified = true;
        company.emailVerificationToken = undefined;
        company.emailVerificationExpires = undefined;
        await company.save();

        res.status(StatusCodes.OK).json({
            success: true,
            msg: 'Email verified successfully'
        });
    } catch (error) {
        throw error;
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new BadRequestError('Email is required');
        }

        const company = await Company.findOne({ email });

        if (!company) {
            throw new NotFoundError('No company found with this email');
        }

        if (company.isVerified) {
            throw new BadRequestError('Email is already verified');
        }

        // Generate new verification token
        const verificationToken = company.createEmailVerificationToken();
        await company.save({ validateBeforeSave: false });

        // Create verification URL
        const verificationURL = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email?token=${verificationToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Email Verification</h1>
                </div>
                <div style="padding: 40px; background: #f8f9fa;">
                    <h2 style="color: #333;">Verify Your Email Address</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Please verify your email address by clicking the button below.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationURL}" 
                           style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  display: inline-block;
                                  font-weight: 600;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        This verification link will expire in 24 hours.
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            email: company.email,
            subject: 'Email Verification - Company Portal',
            message
        });

        res.status(StatusCodes.OK).json({
            success: true,
            msg: 'Verification email sent successfully'
        });
    } catch (error) {
        throw error;
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new BadRequestError('Please provide email and password');
        }

        const company = await Company.findOne({ email });

        if (!company) {
            throw new UnauthenticatedError('Invalid credentials');
        }

        const isPasswordCorrect = await company.comparePassword(password);
        if (!isPasswordCorrect) {
            throw new UnauthenticatedError('Invalid credentials');
        }

        if (!company.isVerified) {
            throw new UnauthenticatedError('Please verify your email before logging in');
        }

        const token = company.createJWT();

        res.status(StatusCodes.OK).json({
            success: true,
            company: {
                id: company._id,
                companyName: company.companyName,
                email: company.email,
                industryType: company.industryType,
                registrationNumber: company.registrationNumber,
                isVerified: company.isVerified,
                createdAt: company.createdAt
            },
            token
        });
    } catch (error) {
        throw error;
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new BadRequestError('Email is required');
        }

        const company = await Company.findOne({ email });

        if (!company) {
            throw new NotFoundError('No company found with this email');
        }

        // Generate reset token
        const resetToken = company.createPasswordResetToken();
        await company.save({ validateBeforeSave: false });

        // Create reset URL
        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Password Reset</h1>
                </div>
                <div style="padding: 40px; background: #f8f9fa;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p style="color: #666; line-height: 1.6;">
                        You requested a password reset for your Company Portal account. 
                        Click the button below to reset your password.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetURL}" 
                           style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  display: inline-block;
                                  font-weight: 600;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${resetURL}" style="color: #3b82f6;">${resetURL}</a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        This reset link will expire in 10 minutes for security reasons.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        If you didn't request this password reset, please ignore this email.
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            email: company.email,
            subject: 'Password Reset Request - Company Portal',
            message
        });

        res.status(StatusCodes.OK).json({
            success: true,
            msg: 'Password reset email sent successfully'
        });
    } catch (error) {
        throw error;
    }
};

const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const company = await Company.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!company) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                msg: 'Token is invalid or has expired'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            msg: 'Token is valid'
        });
    } catch (error) {
        throw error;
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            throw new BadRequestError('Token and password are required');
        }

        if (password.length < 6) {
            throw new BadRequestError('Password must be at least 6 characters');
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const company = await Company.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!company) {
            throw new BadRequestError('Token is invalid or has expired');
        }

        // Set new password
        company.password = password;
        company.passwordResetToken = undefined;
        company.passwordResetExpires = undefined;
        await company.save();

        res.status(StatusCodes.OK).json({
            success: true,
            msg: 'Password reset successfully'
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    register,
    verifyEmail,
    resendVerification,
    login,
    forgotPassword,
    validateResetToken,
    resetPassword
};