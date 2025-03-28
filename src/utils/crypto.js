const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// JWT secret key - should be in environment variables in a real application
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-very-long-and-secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Hash a password with SHA-256
 * @param {string} password - Password to hash
 * @return {string} - Hashed password
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Compare a password with a hash
 * @param {string} password - Password to check
 * @param {string} hash - Hash to compare against
 * @return {boolean} - True if password matches hash
 */
const comparePassword = (password, hash) => {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
};

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in the token
 * @return {string} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @return {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @return {string} - Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateRandomString
};
