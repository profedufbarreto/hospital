const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient
} = require('../controllers/patientController');

// Todas as rotas de pacientes requerem autenticação
router.use(authenticate);

router.post('/', registerPatient);
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);

module.exports = router;
