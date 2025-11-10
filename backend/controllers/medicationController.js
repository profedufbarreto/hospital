const pool = require('../config/database');

// Registrar medicação
const recordMedication = async (req, res) => {
  try {
    const {
      patientId,
      medicationId,
      medicationName,
      isRequired,
      notes,
      administeredDate,
      administeredTime
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'ID do paciente é obrigatório' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO medications 
       (patient_id, medication_id, medication_name, is_required, notes, administered_date, administered_time, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [patientId, medicationId || null, medicationName, isRequired ? 1 : 0, notes || null, administeredDate || null, administeredTime || null, req.user.id]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Medicação registrada com sucesso',
      medicationRecordId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar medicação' });
  }
};

// Obter medicações de um paciente
const getMedicationsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const connection = await pool.getConnection();
    const [medications] = await connection.query(
      'SELECT * FROM medications WHERE patient_id = ? ORDER BY created_at DESC',
      [patientId]
    );
    connection.release();

    res.json(medications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter medicações' });
  }
};

// Obter lista de medicações padrão
const getStandardMedications = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [medications] = await connection.query(
      'SELECT id, name, unit FROM standard_medications WHERE active = 1 ORDER BY name'
    );
    connection.release();

    res.json(medications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter medicações padrão' });
  }
};

// Atualizar medicação (apenas admin/technician)
const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRequired, notes } = req.body;

    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE medications SET is_required = ?, notes = ? WHERE id = ?',
      [isRequired ? 1 : 0, notes || null, id]
    );
    connection.release();

    res.json({ success: true, message: 'Medicação atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar medicação' });
  }
};

// Deletar medicação (apenas admin/technician)
const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM medications WHERE id = ?', [id]);
    connection.release();

    res.json({ success: true, message: 'Medicação deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar medicação' });
  }
};

module.exports = {
  recordMedication,
  getMedicationsByPatient,
  getStandardMedications,
  updateMedication,
  deleteMedication
};
