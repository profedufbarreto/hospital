-- Script de criação do banco de dados
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(64) NOT NULL, -- SHA-256 hash
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role ENUM('admin', 'technician', 'nurse') NOT NULL DEFAULT 'nurse',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (username),
  INDEX (role)
);

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth VARCHAR(10) NOT NULL, -- dd-mm-aaaa
  cep VARCHAR(9),
  street VARCHAR(200),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  house_number VARCHAR(10),
  admission_date VARCHAR(10), -- dd-mm-aaaa
  admission_time VARCHAR(5), -- hh:mm
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (first_name, last_name),
  INDEX (cep),
  FULLTEXT INDEX full_text_search (first_name, last_name)
);

-- Tabela de Sinais Vitais (Prova de Vida)
CREATE TABLE IF NOT EXISTS vital_signs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  blood_pressure VARCHAR(20), -- ex: 120/80
  heart_rate INT, -- bpm
  spo2 DECIMAL(5, 2), -- %
  glucose DECIMAL(6, 2), -- mg/dL
  record_date VARCHAR(10), -- dd-mm-aaaa
  record_time VARCHAR(5), -- hh:mm
  recorded_by VARCHAR(100),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (patient_id),
  INDEX (record_date)
);

-- Tabela de Medicações Padrão
CREATE TABLE IF NOT EXISTS standard_medications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  unit VARCHAR(20), -- mg, ml, comp, etc
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (name),
  INDEX (active)
);

-- Tabela de Medicações Administradas
CREATE TABLE IF NOT EXISTS medications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medication_id INT,
  medication_name VARCHAR(150) NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  notes TEXT,
  administered_date VARCHAR(10),
  administered_time VARCHAR(5),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (medication_id) REFERENCES standard_medications(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX (patient_id),
  INDEX (medication_id),
  INDEX (created_at)
);

-- Inserir usuários padrão
INSERT INTO users (username, password, name, email, role, active) VALUES
('adm', SHA2('adm', 256), 'Administrador', 'adm@hospital.com', 'admin', TRUE),
('root', SHA2('root', 256), 'Root', 'root@hospital.com', 'admin', TRUE);

-- Inserir medicações padrão
INSERT INTO standard_medications (name, unit, active) VALUES
('Dipirona', 'mg', TRUE),
('Amoxicilina', 'mg', TRUE),
('Paracetamol', 'mg', TRUE),
('Ibuprofeno', 'mg', TRUE),
('Adrenalina', 'ml', TRUE),
('Metformina', 'mg', TRUE),
('Captopril', 'mg', TRUE),
('Atorvastatina', 'mg', TRUE),
('Omeprazol', 'mg', TRUE),
('Loratadina', 'mg', TRUE),
('Ranitidina', 'mg', TRUE),
('Penicilina G', 'UI', TRUE),
('Gentamicina', 'mg', TRUE),
('Cloreto de Sódio 0.9%', 'ml', TRUE),
('Glicose 5%', 'ml', TRUE),
('Soro Fisiológico', 'ml', TRUE),
('Outros', 'diversos', TRUE);
