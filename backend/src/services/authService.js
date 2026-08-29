import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: '7d',
  });
};

export const register = async ({ name, email, password, role = 'student' }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('A user with this email already exists.');
    error.statusCode = 400;
    throw error;
  }

  // Allow student or admin role
  const userRole = role === 'admin' ? 'admin' : 'student';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: userRole,
  });

  const token = generateToken(user._id, user.role);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};
