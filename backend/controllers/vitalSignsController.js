const pool = require('../config/database');

// Registrar prova de vida
const recordVitalSigns = async (req, res) => {
  try {
    const {
      patientId,
      bloodPressure,
      heartRate,
      spo2,
      glucose,
      recordDate,
      recordTime,
      recordedBy
    } = req.body;

    if (!patientId || !bloodPressure || !heartRate || !spo2 || !glucose || !recordDate || !recordTime || !recordedBy) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO vital_signs 
       (patient_id, blood_pressure, heart_rate, spo2, glucose, record_date, record_time, recorded_by, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [patientId, bloodPressure, heartRate, spo2, glucose, recordDate, recordTime, recordedBy, req.user.id]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Prova de vida registrada com sucesso',
      vitalSignsId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar prova de vida' });
  }
};

// Obter provas de vida de um paciente
const getVitalSignsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const connection = await pool.getConnection();
    const [vitalSigns] = await connection.query(
      'SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY record_date DESC, record_time DESC',
      [patientId]
    );
    connection.release();

    res.json(vitalSigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter provas de vida' });
  }
};

// Atualizar prova de vida
const updateVitalSigns = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodPressure, heartRate, spo2, glucose, recordDate, recordTime } = req.body;

    const connection = await pool.getConnection();

    let query = 'UPDATE vital_signs SET ';
    const values = [];
    const updates = [];

    if (bloodPressure) { updates.push('blood_pressure = ?'); values.push(bloodPressure); }
    if (heartRate) { updates.push('heart_rate = ?'); values.push(heartRate); }
    if (spo2) { updates.push('spo2 = ?'); values.push(spo2); }
    if (glucose) { updates.push('glucose = ?'); values.push(glucose); }
    if (recordDate) { updates.push('record_date = ?'); values.push(recordDate); }
    if (recordTime) { updates.push('record_time = ?'); values.push(recordTime); }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    await connection.query(query, values);
    connection.release();

    res.json({ success: true, message: 'Prova de vida atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar prova de vida' });
  }
};

// Deletar prova de vida (apenas admin/technician)
const deleteVitalSigns = async (req, res) => {
  try {
    const { id } = req.params;

    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM vital_signs WHERE id = ?', [id]);
    connection.release();

    res.json({ success: true, message: 'Prova de vida deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar prova de vida' });
  }
};

module.exports = {
  recordVitalSigns,
  getVitalSignsByPatient,
  updateVitalSigns,
  deleteVitalSigns
};
