const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  recordMedication,
  getMedicationsByPatient,
  getStandardMedications,
  updateMedication,
  deleteMedication
} = require('../controllers/medicationController');

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post('/', recordMedication);
router.get('/patient/:patientId', getMedicationsByPatient);
router.get('/standard/list', getStandardMedications);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

module.exports = router;
