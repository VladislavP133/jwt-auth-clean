const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const UserDB = require('../models/user.model');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (UserDB.findByEmail(email)) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
 
    UserDB.addUser({
      email,
      password: hashedPassword,
      isVerified: false,
      emailToken
    });

    const verifyUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${emailToken}`;

    await sendEmail(email, 'Підтвердження пошти', `
      <h1>Підтвердіть email</h1>
      <p>Натисніть <a href="${verifyUrl}">тут</a>, щоб підтвердити свою адресу.</p>
    `);

    res.status(201).json({ message: 'Реєстрація успішна! Перевірте пошту для підтвердження.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.verifyEmail = (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = UserDB.confirmEmail(token);

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    res.redirect('/confirmed.html');
  } catch (err) {
    res.status(400).send('Invalid or expired token');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = UserDB.findByEmail(email);
  if (!user || !user.isVerified) {
    return res.status(400).json({ message: 'Invalid credentials or email not verified' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ message: 'Login successful' });
};

exports.protectedRoute = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: `Hello, ${decoded.email}. You have access.` });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};