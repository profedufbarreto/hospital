const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  recordVitalSigns,
  getVitalSignsByPatient,
  updateVitalSigns,
  deleteVitalSigns
} = require('../controllers/vitalSignsController');

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post('/', recordVitalSigns);
router.get('/patient/:patientId', getVitalSignsByPatient);
router.put('/:id', updateVitalSigns);
router.delete('/:id', deleteVitalSigns);

module.exports = router;
