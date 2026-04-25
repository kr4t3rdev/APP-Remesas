const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const registeredEmails = new Set(['admin@example.com', 'test@example.com', 'user@finance.app']);
const registeredNicknames = new Set(['admin', 'testuser', 'finance_app']);
const users = new Map();

const generateToken = () => {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    Buffer.from(JSON.stringify({ sub: Math.random().toString(36).substr(2, 9), iat: Date.now(), exp: Date.now() + 86400000 })).toString('base64') +
    '.mock_signature';
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (/^\s|\s$/.test(password)) return false;
  return true;
};

const isValidName = (name) => {
  return name && name.length >= 2 && name.length <= 100;
};

const isValidNickname = (nickname) => {
  if (!nickname) return true;
  const nicknameRegex = /^[a-zA-Z0-9_-]{2,}$/;
  return nicknameRegex.test(nickname);
};

// GET /auth/check-email
app.get('/auth/check-email', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email is required', code: 'MISSING_EMAIL' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format', code: 'INVALID_EMAIL' });
    
    const delay = Math.random() * 150 + 50;
    setTimeout(() => {
      const exists = registeredEmails.has(email.toLowerCase());
      res.json({ exists, email: email.toLowerCase() });
    }, delay);
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// GET /auth/check-nickname
app.get('/auth/check-nickname', (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname) return res.status(400).json({ error: 'nickname is required', code: 'MISSING_NICKNAME' });
    if (!isValidNickname(nickname)) return res.status(400).json({ error: 'Invalid nickname format', code: 'INVALID_NICKNAME' });
    
    const delay = Math.random() * 150 + 50;
    setTimeout(() => {
      const exists = registeredNicknames.has(nickname.toLowerCase());
      res.json({ exists, nickname: nickname.toLowerCase() });
    }, delay);
  } catch (error) {
    console.error('Error checking nickname:', error);
    res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

// POST /auth/register
app.post('/auth/register', (req, res) => {
  try {
    const { email, password, name, nickname } = req.body;

    if (!email || !password || !name) return res.status(400).json({ error: 'email, password, and name are required', code: 'MISSING_FIELDS' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format', code: 'INVALID_EMAIL' });
    if (registeredEmails.has(email.toLowerCase())) return res.status(409).json({ error: 'Este correo ya está registrado', code: 'EMAIL_EXISTS' });
    if (!isValidPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers', code: 'WEAK_PASSWORD' });
    if (!isValidName(name)) return res.status(400).json({ error: 'Name must be between 2 and 100 characters', code: 'INVALID_NAME' });
    if (nickname && !isValidNickname(nickname)) return res.status(400).json({ error: 'Invalid nickname format', code: 'INVALID_NICKNAME' });
    if (nickname && registeredNicknames.has(nickname.toLowerCase())) return res.status(409).json({ error: 'Este nickname ya está en uso', code: 'NICKNAME_EXISTS' });

    const delay = Math.random() * 200 + 100;
    setTimeout(() => {
      const userId = Math.random().toString(36).substr(2, 9);
      const token = generateToken();
      const user = { id: userId, email: email.toLowerCase(), name, nickname: nickname ? nickname.toLowerCase() : null, createdAt: new Date().toISOString() };
      
      users.set(userId, user);
      registeredEmails.add(email.toLowerCase());
      if (nickname) registeredNicknames.add(nickname.toLowerCase());

      res.status(201).json({ success: true, user, access_token: token, token_type: 'Bearer', expires_in: 86400 });
    }, delay);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         🚀 Mock Auth Backend Server Running                   ║
║                                                                ║
║  URL: http://localhost:${PORT}                         ║
║                                                                ║
║  Endpoints:                                                    ║
║    GET  /auth/check-email?email=...                           ║
║    GET  /auth/check-nickname?nickname=...                     ║
║    POST /auth/register                                         ║
║    GET  /health                                                ║
║                                                                ║
║  Pre-registered (exists):                                      ║
║    Emails: admin@example.com, test@example.com                ║
║    Nicknames: admin, testuser                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
