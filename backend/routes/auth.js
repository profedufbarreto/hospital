const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');

// Rotas de autenticação (sem proteção)
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
