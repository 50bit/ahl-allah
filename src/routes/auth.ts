import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, NormalUser, MohafezUser } from '../models';
import { generateToken } from '../config/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation';
import { UserRole, EjazaEnum, Language, AgeGroup, HefzMethod } from '../types';
import { sendEmail } from '../config/email';

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

    if (!user) {
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

export default router;
