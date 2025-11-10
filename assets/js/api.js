// api.js - Cliente HTTP para comunicação com a API
class API {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, method = 'GET', data = null) {
    try {
      const options = {
        method,
        headers: this.getHeaders()
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição');
      }

      return result;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }

  // Auth
  login(username, password) {
    return this.request('/auth/login', 'POST', { username, password });
  }

  logout() {
    return this.request('/auth/logout', 'POST');
  }

  // Users
  getUsers() {
    return this.request('/users');
  }

  getUserById(id) {
    return this.request(`/users/${id}`);
  }

  createUser(userData) {
    return this.request('/users', 'POST', userData);
  }

  updateUser(id, userData) {
    return this.request(`/users/${id}`, 'PUT', userData);
  }

  deleteUser(id) {
    return this.request(`/users/${id}`, 'DELETE');
  }

  // Patients
  getPatients() {
    return this.request('/patients');
  }

  getPatientById(id) {
    return this.request(`/patients/${id}`);
  }

  registerPatient(patientData) {
    return this.request('/patients', 'POST', patientData);
  }

  updatePatient(id, patientData) {
    return this.request(`/patients/${id}`, 'PUT', patientData);
  }

  // Vital Signs
  recordVitalSigns(vitalSignsData) {
    return this.request('/vital-signs', 'POST', vitalSignsData);
  }

  getVitalSignsByPatient(patientId) {
    return this.request(`/vital-signs/patient/${patientId}`);
  }

  updateVitalSigns(id, vitalSignsData) {
    return this.request(`/vital-signs/${id}`, 'PUT', vitalSignsData);
  }

  deleteVitalSigns(id) {
    return this.request(`/vital-signs/${id}`, 'DELETE');
  }

  // Medications
  recordMedication(medicationData) {
    return this.request('/medications', 'POST', medicationData);
  }

  getMedicationsByPatient(patientId) {
    return this.request(`/medications/patient/${patientId}`);
  }

  getStandardMedications() {
    return this.request('/medications/standard/list');
  }

  updateMedication(id, medicationData) {
    return this.request(`/medications/${id}`, 'PUT', medicationData);
  }

  deleteMedication(id) {
    return this.request(`/medications/${id}`, 'DELETE');
  }

  // Dosage Calculator
  calculateDosage(type, params) {
    return this.request('/dosage-calculator/calculate', 'POST', { type, params });
  }
}

// Criar instância global
const api = new API();

// Função auxiliar para mostrar notificações
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `${type}-message`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '10000';
  notification.style.minWidth = '300px';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Função para formatar datas
function formatDate(dateString, format = 'dd-mm-yyyy') {
  if (!dateString) return '';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (format === 'dd-mm-yyyy') {
    return `${day}-${month}-${year}`;
  }
  return date.toLocaleDateString('pt-BR');
}

// Função para converter Data String dd-mm-yyyy para objeto Date
function parseDate(dateString) {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('-');
  return new Date(`${year}-${month}-${day}`);
}
