const pool = require('../config/database');

// Registrar nova baixa de paciente
const registerPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      cep,
      street,
      neighborhood,
      city,
      houseNumber,
      admissionDate,
      admissionTime
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !cep) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO patients 
       (first_name, last_name, date_of_birth, cep, street, neighborhood, city, house_number, admission_date, admission_time, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [firstName, lastName, dateOfBirth, cep, street, neighborhood, city, houseNumber, admissionDate, admissionTime, req.user.id]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Paciente registrado com sucesso',
      patientId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar paciente' });
  }
};

// Obter pacientes
const getPatients = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [patients] = await connection.query(
      'SELECT * FROM patients ORDER BY created_at DESC'
    );
    connection.release();

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter pacientes' });
  }
};

// Obter paciente por ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [patients] = await connection.query(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
    connection.release();

    if (patients.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    res.json(patients[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter paciente' });
  }
};

// Atualizar paciente
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, cep, street, neighborhood, city, houseNumber } = req.body;

    const connection = await pool.getConnection();

    let query = 'UPDATE patients SET ';
    const values = [];
    const updates = [];

    if (firstName) { updates.push('first_name = ?'); values.push(firstName); }
    if (lastName) { updates.push('last_name = ?'); values.push(lastName); }
    if (dateOfBirth) { updates.push('date_of_birth = ?'); values.push(dateOfBirth); }
    if (cep) { updates.push('cep = ?'); values.push(cep); }
    if (street) { updates.push('street = ?'); values.push(street); }
    if (neighborhood) { updates.push('neighborhood = ?'); values.push(neighborhood); }
    if (city) { updates.push('city = ?'); values.push(city); }
    if (houseNumber) { updates.push('house_number = ?'); values.push(houseNumber); }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    await connection.query(query, values);
    connection.release();

    res.json({ success: true, message: 'Paciente atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
};

module.exports = {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient
};
