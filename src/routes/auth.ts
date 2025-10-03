import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from '../config/passport';
import { User, NormalUser, MohafezUser, PhoneOtp, RefreshToken } from '../models';
import { generateToken } from '../config/jwt';
import { generateRefreshToken, REFRESH_TOKEN_EXPIRES_IN_DAYS } from '../config/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { validateEmail, validatePassword, validateRequired, validatePhoneNumber } from '../utils/validation';
import { UserRole, EjazaEnum, Language, AgeGroup, HefzMethod } from '../types';
import { sendEmail } from '../config/email';
import { handleOAuthCallback, handleOAuthSuccess, handleOAuthFailure, checkNewUser } from '../middleware/oauth';
import { sendSms } from '../config/sms';
import crypto from 'crypto';

const router = Router();

// Login endpoint
router.post('/login', validateRequired(['email', 'password']), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        { model: NormalUser, as: 'NormalUser' },
        { model: MohafezUser, as: 'MohafezUser' }
      ]
    });

    if (!user || !user.password) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Update last activity
    await user.update({ lastActivityDate: new Date() });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        normalUser: user.NormalUser,
        mohafezUser: user.MohafezUser
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Login failed');
  }
});

// Register normal user
router.post('/register', validateRequired(['email', 'password', 'name', 'country', 'birthyear', 'gender']), async (req: Request, res: Response) => {
  try {
    const { email, password, name, country, city, birthyear, gender, ageGroup, levelAtQuran, numberPerWeek, timeForEverytime, language, methodForHefz } = req.body;

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    if (!validatePassword(password)) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return sendError(res, 409, 'User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Calculate age
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthyear;

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      country,
      city,
      birthyear,
      age,
      gender,
      roleId: UserRole.NORMAL,
      creationDate: new Date(),
      lastActivityDate: new Date()
    });

    // Create normal user profile
    const normalUser = await NormalUser.create({
      availableMinutes: 0,
      ageGroup: ageGroup || AgeGroup.ADULT,
      levelAtQuran: levelAtQuran || 1,
      numberPerWeek: numberPerWeek || 1,
      timeForEverytime: timeForEverytime || 30,
      language: language || Language.ARABIC,
      methodForHefz: methodForHefz || HefzMethod.VOICE,
      isPaid: false,
      isFirstTime: true
    });

    // Update user with normal user ID
    await user.update({ normalUserId: normalUser.normalUserId });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    sendSuccess(res, 'Registration successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        normalUser
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 500, 'Registration failed');
  }
});

// Register mohafez
router.post('/register-mohafez', validateRequired(['email', 'password', 'name', 'country', 'birthyear', 'gender', 'summery', 'ejaza', 'myEjazaEnum']), async (req: Request, res: Response) => {
  try {
    const { email, password, name, country, city, birthyear, gender, arabicName, summery, ejaza, myEjazaEnum, degree, language, phoneNumber, whatsappPhoneNumber } = req.body;

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    if (!validatePassword(password)) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return sendError(res, 409, 'User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Calculate age
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthyear;

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      country,
      city,
      birthyear,
      age,
      gender,
      roleId: UserRole.NOT_ACCEPTED_MOHAFEZ, // Initially not accepted
      creationDate: new Date(),
      lastActivityDate: new Date()
    });

    // Create mohafez profile
    const mohafezUser = await MohafezUser.create({
      arabicName,
      summery,
      ejaza,
      myEjazaEnum: myEjazaEnum || EjazaEnum.QURAN,
      degree: degree || 0,
      isAvailable: true,
      freeDaysCount: 0,
      totalHoursCount: 0,
      language: language || Language.ARABIC,
      phoneNumber,
      whatsappPhoneNumber,
      getPaid: false
    });

    // Update user with mohafez ID
    await user.update({ mohafezId: mohafezUser.mohafezId });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    sendSuccess(res, 'Mohafez registration successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        mohafezUser
      }
    });
  } catch (error) {
    console.error('Mohafez registration error:', error);
    sendError(res, 500, 'Mohafez registration failed');
  }
});

// Forgot password
router.post('/forgot-password', validateRequired(['email']), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await user.update({
      resetPasswordOTP: otp,
      otpExpirationTime: otpExpiration
    });

    // Send email with OTP
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `
    });

    if (!emailSent) {
      return sendError(res, 500, 'Failed to send OTP email');
    }

    sendSuccess(res, 'OTP sent to your email');
  } catch (error) {
    console.error('Forgot password error:', error);
    sendError(res, 500, 'Failed to process forgot password request');
  }
});

// Verify OTP
router.post('/verify-otp', validateRequired(['email', 'otp']), async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (!user.resetPasswordOTP || !user.otpExpirationTime) {
      return sendError(res, 400, 'No OTP found for this user');
    }

    if (user.resetPasswordOTP !== otp) {
      return sendError(res, 400, 'Invalid OTP');
    }

    if (new Date() > user.otpExpirationTime) {
      return sendError(res, 400, 'OTP has expired');
    }

    sendSuccess(res, 'OTP verified successfully');
  } catch (error) {
    console.error('Verify OTP error:', error);
    sendError(res, 500, 'Failed to verify OTP');
  }
});

// Reset password
router.post('/reset-password', validateRequired(['email', 'otp', 'newPassword']), async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (!user.resetPasswordOTP || !user.otpExpirationTime) {
      return sendError(res, 400, 'No OTP found for this user');
    }

    if (user.resetPasswordOTP !== otp) {
      return sendError(res, 400, 'Invalid OTP');
    }

    if (new Date() > user.otpExpirationTime) {
      return sendError(res, 400, 'OTP has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear OTP
    await user.update({
      password: hashedPassword,
      resetPasswordOTP: undefined,
      otpExpirationTime: undefined
    });

    sendSuccess(res, 'Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, 500, 'Failed to reset password');
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  handleOAuthCallback('google')
);

// Apple OAuth routes
router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback', 
  passport.authenticate('apple', { failureRedirect: '/auth/error' }),
  handleOAuthCallback('apple')
);

// OAuth success/failure handlers
router.get('/success', handleOAuthSuccess('oauth'));
router.get('/error', handleOAuthFailure);

// Complete OAuth user profile
router.post('/complete-profile', validateRequired(['country', 'birthyear', 'gender']), async (req: Request, res: Response) => {
  try {
    const { country, city, birthyear, gender, ageGroup, levelAtQuran, numberPerWeek, timeForEverytime, language, methodForHefz } = req.body;
    const userId = req.body.userId; // This should come from the authenticated user

    if (!userId) {
      return sendError(res, 400, 'User ID is required');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Calculate age
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthyear;

    // Update user profile
    await user.update({
      country,
      city,
      birthyear,
      age,
      gender
    });

    // Create normal user profile if it doesn't exist
    let normalUser = await NormalUser.findByPk(user.normalUserId);
    if (!normalUser) {
      normalUser = await NormalUser.create({
        availableMinutes: 0,
        ageGroup: ageGroup || AgeGroup.ADULT,
        levelAtQuran: levelAtQuran || 1,
        numberPerWeek: numberPerWeek || 1,
        timeForEverytime: timeForEverytime || 30,
        language: language || Language.ARABIC,
        methodForHefz: methodForHefz || HefzMethod.VOICE,
        isPaid: false,
        isFirstTime: true
      });

      await user.update({ normalUserId: normalUser.normalUserId });
    }

    // Generate new token with updated user info
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    sendSuccess(res, 'Profile completed successfully', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        provider: user.provider,
        avatar: user.avatar,
        normalUser
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    sendError(res, 500, 'Failed to complete profile');
  }
});

// Link OAuth account to existing account
router.post('/link-oauth', validateRequired(['email', 'password', 'provider', 'providerId']), async (req: Request, res: Response) => {
  try {
    const { email, password, provider, providerId, avatar } = req.body;

    // Find existing user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid password');
    }

    // Update user with OAuth info
    await user.update({
      provider,
      providerId,
      avatar,
      isEmailVerified: true
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    sendSuccess(res, 'OAuth account linked successfully', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        provider: user.provider,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Link OAuth error:', error);
    sendError(res, 500, 'Failed to link OAuth account');
  }
});

// ------------------------
// Phone OTP Authentication
// ------------------------

const MAX_OTP_ATTEMPTS = 5;
const MAX_OTP_RESENDS = 3;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_WINDOW_MS = 60 * 1000; // at least 60s between resends

const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

router.post('/phone/request-otp', validateRequired(['phone']), async (req, res) => {
  try {
    const { phone, purpose } = req.body as { phone: string; purpose?: 'login' | 'link' };
    const normalizedPhone = phone.toString().trim();
    if (!validatePhoneNumber(normalizedPhone)) {
      return sendError(res, 400, 'Invalid phone number');
    }

    const effectivePurpose: 'login' | 'link' = purpose === 'link' ? 'link' : 'login';

    // Rate limit: check existing active OTP
    const existing = await PhoneOtp.findOne({ where: { phone: normalizedPhone, consumed: false }, order: [['createdAt', 'DESC']] });
    if (existing) {
      const since = Date.now() - new Date(existing.lastSentAt).getTime();
      if (existing.resendCount >= MAX_OTP_RESENDS) {
        return sendError(res, 429, 'Resend limit reached');
      }
      if (since < RESEND_WINDOW_MS) {
        return sendError(res, 429, 'Please wait before requesting another OTP');
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    if (existing && existing.expiresAt > new Date() && existing.purpose === effectivePurpose) {
      await existing.update({
        otpHash,
        expiresAt,
        resendCount: existing.resendCount + 1,
        lastSentAt: new Date()
      });
    } else {
      await PhoneOtp.create({
        phone: normalizedPhone,
        otpHash,
        purpose: effectivePurpose,
        expiresAt,
        attemptsUsed: 0,
        resendCount: 0,
        lastSentAt: new Date(),
        consumed: false
      });
    }

    const sent = await sendSms(normalizedPhone, `Your verification code is ${otp}. It expires in 5 minutes.`);
    if (!sent) {
      return sendError(res, 500, 'Failed to send OTP');
    }

    return sendSuccess(res, 'OTP sent');
  } catch (error) {
    console.error('Request OTP error:', error);
    return sendError(res, 500, 'Failed to request OTP');
  }
});

router.post('/phone/verify-otp', validateRequired(['phone', 'otp']), async (req, res) => {
  try {
    const { phone, otp, linkToUserId } = req.body as { phone: string; otp: string; linkToUserId?: string };
    const normalizedPhone = phone.toString().trim();
    if (!validatePhoneNumber(normalizedPhone)) {
      return sendError(res, 400, 'Invalid phone number');
    }

    const record = await PhoneOtp.findOne({ where: { phone: normalizedPhone, consumed: false }, order: [['createdAt', 'DESC']] });
    if (!record) {
      return sendError(res, 400, 'No active OTP found');
    }
    if (new Date() > record.expiresAt) {
      return sendError(res, 400, 'OTP expired');
    }
    if (record.attemptsUsed >= MAX_OTP_ATTEMPTS) {
      return sendError(res, 429, 'Maximum verification attempts reached');
    }

    const providedHash = hashOtp(otp);
    if (providedHash !== record.otpHash) {
      await record.update({ attemptsUsed: record.attemptsUsed + 1 });
      return sendError(res, 400, 'Invalid OTP');
    }

    // Mark consumed
    await record.update({ consumed: true });

    // Linking flow: attach phone to existing account
    if (record.purpose === 'link' && linkToUserId) {
      const user = await User.findByPk(linkToUserId);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }
      // Enforce phone uniqueness across accounts
      const phoneExists = await User.findOne({ where: { phone: normalizedPhone } });
      if (phoneExists && phoneExists.id !== user.id) {
        return sendError(res, 409, 'Phone already linked to another account');
      }
      await user.update({ phone: normalizedPhone, phoneVerified: true });

      const accessToken = generateToken({ userId: user.id, email: user.email, roleId: user.roleId });
      const refresh = generateRefreshToken();
      const refreshHash = crypto.createHash('sha256').update(refresh).digest('hex');
      const refreshExpires = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
      await RefreshToken.create({ userId: user.id, tokenHash: refreshHash, expiresAt: refreshExpires });

      return sendSuccess(res, 'Phone linked and authenticated', {
        token: accessToken,
        refreshToken: refresh,
        user: { id: user.id, email: user.email, phone: user.phone, roleId: user.roleId }
      });
    }

    // Login/registration via phone
    let user = await User.findOne({ where: { phone: normalizedPhone } });
    if (!user) {
      // Create minimal account for phone-only login; can later link email/password or OAuth
      user = await User.create({
        email: `${normalizedPhone}@phone.local`,
        name: 'Phone User',
        country: 'Unknown',
        roleId: UserRole.NORMAL,
        creationDate: new Date(),
        lastActivityDate: new Date(),
        phone: normalizedPhone,
        phoneVerified: true
      } as any);
    } else if (!user.phoneVerified) {
      await user.update({ phoneVerified: true });
    }

    await user.update({ lastActivityDate: new Date() });

    const token = generateToken({ userId: user.id, email: user.email, roleId: user.roleId });
    const refresh = generateRefreshToken();
    const refreshHash = crypto.createHash('sha256').update(refresh).digest('hex');
    const refreshExpires = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user.id, tokenHash: refreshHash, expiresAt: refreshExpires });

    return sendSuccess(res, 'Authenticated with phone', {
      token,
      refreshToken: refresh,
      user: { id: user.id, email: user.email, phone: user.phone, roleId: user.roleId }
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return sendError(res, 500, 'Failed to verify OTP');
  }
});

// Exchange refresh token for new access token
router.post('/token/refresh', validateRequired(['refreshToken']), async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const record = await RefreshToken.findOne({ where: { tokenHash: refreshHash, revoked: false } });
    if (!record) {
      return sendError(res, 401, 'Invalid refresh token');
    }
    if (new Date() > record.expiresAt) {
      return sendError(res, 401, 'Refresh token expired');
    }
    const user = await User.findByPk(record.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    const newAccess = generateToken({ userId: user.id, email: user.email, roleId: user.roleId });
    return sendSuccess(res, 'Token refreshed', { token: newAccess });
  } catch (error) {
    console.error('Refresh token error:', error);
    return sendError(res, 500, 'Failed to refresh token');
  }
});

export default router;
