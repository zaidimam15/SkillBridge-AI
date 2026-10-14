const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errors');
const { sendTokenResponse } = require('../utils/jwt');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Prevent self-assigning privileged roles
  const allowedRoles = ['student', 'recruiter'];
  const userRole = allowedRoles.includes(role) ? role : 'student';

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists.', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  // Initialize user progress for students
  if (userRole === 'student') {
    await UserProgress.create({ user: user._id });
  }

  // Welcome notification
  await Notification.create({
    user: user._id,
    type: 'system',
    title: 'Welcome to SkillBridge AI! 🎉',
    message: `Hi ${name}! Start by uploading your resume and analyzing it against a job description to get your ATS compatibility score.`,
    link: '/dashboard',
    icon: 'Sparkles',
  });

  logger.info(`New user registered: ${email} (${userRole})`);
  sendTokenResponse(user, 201, res, 'Account created successfully');
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);
  sendTokenResponse(user, 200, res, 'Logged in successfully');
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: user.toSafeObject(),
  });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
    token: null,
  });
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 400));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // In production, send email. For demo, return token directly
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  user.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  logger.info(`Password reset requested for: ${email}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
    // Only in dev mode return the token
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token. Please request a new one.', 400));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successfully');
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
};
