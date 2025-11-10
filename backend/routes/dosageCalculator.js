const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { calculate } = require('../controllers/dosageCalculatorController');

// Calculadora de dosagens - requer autenticação
router.use(authenticate);

router.post('/calculate', calculate);

module.exports = router;
