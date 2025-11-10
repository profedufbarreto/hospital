const crypto = require('crypto');
const pool = require('../config/database');

// Hash de senha
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, username, name, email, role, active, created_at FROM users'
    );
    connection.release();

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter usuários' });
  }
};

// Obter usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, username, name, email, role, active, created_at FROM users WHERE id = ?',
      [id]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
};

// Criar novo usuário
const createUser = async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const validRoles = ['admin', 'technician', 'nurse'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Papel inválido' });
    }

    const connection = await pool.getConnection();
    
    // Verificar se usuário já existe
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = hashPassword(password);

    const [result] = await connection.query(
      'INSERT INTO users (username, password, name, email, role, active) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, name, email, role, true]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      userId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Editar usuário
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active } = req.body;

    if (!name && !email && !role && active === undefined) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const connection = await pool.getConnection();

    // Construir query dinâmica
    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      values.push(active);
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    await connection.query(query, values);
    connection.release();

    res.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Deletar usuário
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se não é tentando deletar os admins
    const connection = await pool.getConnection();
    const [user] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

    if (user.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user[0].username === 'adm' || user[0].username === 'root') {
      connection.release();
      return res.status(403).json({ error: 'Não é possível deletar usuários de sistema' });
    }

    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    connection.release();

    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
