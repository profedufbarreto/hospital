// dashboard.js - Lógica principal do dashboard
let currentUser = null;
let allPatients = [];
let allVitalSigns = [];
let allMedications = [];
let allUsers = [];
let standardMedications = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  currentUser = JSON.parse(localStorage.getItem('user'));
  api.setToken(token);

  // Inicializar interface
  initializeUI();
  loadData();
  setupEventListeners();
  updateCurrentDate();
  setInterval(updateCurrentDate, 60000);
});

// ==================== UI Initialization ====================
function initializeUI() {
  // Atualizar informações do usuário
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = getRoleLabel(currentUser.role);

  // Mostrar/ocultar módulos baseado no role
  if (!['admin', 'root'].includes(currentUser.role)) {
    document.querySelector('[data-module="users"]').style.display = 'none';
  }
}

function getRoleLabel(role) {
  const roles = {
    'admin': 'Administrador',
    'technician': 'Técnico',
    'nurse': 'Enfermeiro(a)',
    'root': 'Super Admin'
  };
  return roles[role] || role;
}

function updateCurrentDate() {
  const now = new Date();
  const dateString = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('currentDate').textContent = dateString;
}

// ==================== Helpers: Input Masks ====================
// Aplica máscara de data (dd/mm/yyyy) em um input
function applyDateMaskToInput(input) {
  if (!input) return;

  input.addEventListener('input', (e) => {
    const original = input.value;
    // remover tudo que não é dígito
    let digits = original.replace(/\D/g, '');

    if (digits.length > 8) {
      digits = digits.slice(0, 8);
    }

    // inserir barras: dd/mm/yyyy
    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0,2) + '/' + digits.slice(2,4) + '/' + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0,2) + '/' + digits.slice(2);
    }

    input.value = formatted;
  });

  // prevenir colar conteúdo inválido
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const onlyDigits = paste.replace(/\D/g, '').slice(0,8);
    let formatted = onlyDigits;
    if (onlyDigits.length > 4) formatted = onlyDigits.slice(0,2) + '/' + onlyDigits.slice(2,4) + '/' + onlyDigits.slice(4);
    else if (onlyDigits.length > 2) formatted = onlyDigits.slice(0,2) + '/' + onlyDigits.slice(2);
    input.value = formatted;
  });
}

// ==================== Data Loading ====================
async function loadData() {
  try {
    allPatients = await api.getPatients();
    allMedications = await api.getMedicationsByPatient(1).catch(() => []);
    standardMedications = await api.getStandardMedications();

    if (['admin', 'technician', 'root'].includes(currentUser.role)) {
      allUsers = await api.getUsers();
    }

    // Carregar estatísticas
    loadDashboardStats();
    populatePatientSelects();
    renderStandardMedications();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

async function loadDashboardStats() {
  try {
    document.getElementById('totalPatients').textContent = allPatients.length;
    document.getElementById('totalUsers').textContent = allUsers.length;

    let totalVitalSigns = 0;
    let totalMeds = 0;

    for (const patient of allPatients) {
      const vs = await api.getVitalSignsByPatient(patient.id).catch(() => []);
      const meds = await api.getMedicationsByPatient(patient.id).catch(() => []);
      totalVitalSigns += vs.length;
      totalMeds += meds.length;
    }

    document.getElementById('totalVitalSigns').textContent = totalVitalSigns;
    document.getElementById('totalMedications').textContent = totalMeds;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

function populatePatientSelects() {
  const selects = ['vsPatientId', 'medPatientId'];
  
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um paciente</option>';
    allPatients.forEach(patient => {
      const option = document.createElement('option');
      option.value = patient.id;
      option.textContent = `${patient.first_name} ${patient.last_name}`;
      select.appendChild(option);
    });
  });
}

function renderStandardMedications() {
  const select = document.getElementById('medicationSelect');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione uma medicação</option>';
  standardMedications.forEach(med => {
    const option = document.createElement('option');
    option.value = med.id;
    option.textContent = `${med.name} (${med.unit})`;
    select.appendChild(option);
  });
}

// ==================== Event Listeners ====================
function setupEventListeners() {
  // Sidebar Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const module = e.currentTarget.getAttribute('data-module');
      switchModule(module);
    });
  });

  // Toggle Sidebar Mobile
  document.getElementById('openSidebar').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.add('active');
  });

  document.getElementById('closeSidebar').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('active');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await api.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  });

  // ===== PATIENTS =====
  document.getElementById('newPatientBtn')?.addEventListener('click', () => {
    document.getElementById('patientForm').style.display = 'block';
  });

  document.getElementById('cancelPatientBtn')?.addEventListener('click', () => {
    document.getElementById('patientForm').style.display = 'none';
    document.getElementById('patientForm').reset();
  });

  document.getElementById('patientForm')?.addEventListener('submit', submitPatientForm);

  // CEP lookup
  document.getElementById('cep')?.addEventListener('blur', lookupCEP);

  // ===== VITAL SIGNS =====
  document.getElementById('newVitalSignsBtn')?.addEventListener('click', () => {
    document.getElementById('vitalSignsForm').style.display = 'block';
  });

  document.getElementById('cancelVitalSignsBtn')?.addEventListener('click', () => {
    document.getElementById('vitalSignsForm').style.display = 'none';
    document.getElementById('vitalSignsForm').reset();
  });

  document.getElementById('vitalSignsForm')?.addEventListener('submit', submitVitalSignsForm);

  // ===== MEDICATIONS =====
  document.getElementById('newMedicationBtn')?.addEventListener('click', () => {
    document.getElementById('medicationForm').style.display = 'block';
  });

  document.getElementById('cancelMedicationBtn')?.addEventListener('click', () => {
    document.getElementById('medicationForm').style.display = 'none';
    document.getElementById('medicationForm').reset();
  });

  document.getElementById('medicationForm')?.addEventListener('submit', submitMedicationForm);

  // ===== USERS =====
  document.getElementById('newUserBtn')?.addEventListener('click', () => {
    document.getElementById('userForm').style.display = 'block';
  });

  document.getElementById('cancelUserBtn')?.addEventListener('click', () => {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('userForm').reset();
  });

  document.getElementById('userForm')?.addEventListener('submit', submitUserForm);

  // Aplicar máscara de data nos inputs relevantes (dd/mm/yyyy)
  [
    'dateOfBirth',
    'admissionDate',
    'recordDate',
    'administeredDate'
  ].forEach(id => applyDateMaskToInput(document.getElementById(id)));
}

// ==================== Module Switching ====================
function switchModule(moduleName) {
  // Atualizar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-module="${moduleName}"]`).classList.add('active');

  // Ocultar todos os módulos
  document.querySelectorAll('.module').forEach(mod => {
    mod.classList.remove('active');
  });

  // Mostrar módulo selecionado
  const module = document.getElementById(moduleName);
  if (module) {
    module.classList.add('active');
    document.getElementById('pageTitle').textContent = 
      document.querySelector(`[data-module="${moduleName}"] span`).textContent;

    // Carregar dados específicos do módulo
    if (moduleName === 'patients') {
      renderPatientsList();
    } else if (moduleName === 'vital-signs') {
      renderVitalSignsList();
    } else if (moduleName === 'medications') {
      renderMedicationsList();
    } else if (moduleName === 'users') {
      renderUsersList();
    }
  }
}

// ==================== Patients Functions ====================
async function lookupCEP() {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  
  if (cep.length !== 8) {
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      showNotification('CEP não encontrado', 'warning');
      return;
    }

    document.getElementById('street').value = data.logradouro;
    document.getElementById('neighborhood').value = data.bairro;
    document.getElementById('city').value = data.localidade;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
  }
}

async function submitPatientForm(e) {
  e.preventDefault();

  const patientData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    dateOfBirth: document.getElementById('dateOfBirth').value.replace(/\//g, '-'),
    cep: document.getElementById('cep').value,
    street: document.getElementById('street').value,
    neighborhood: document.getElementById('neighborhood').value,
    city: document.getElementById('city').value,
    houseNumber: document.getElementById('houseNumber').value,
    admissionDate: document.getElementById('admissionDate').value.replace(/\//g, '-'),
    admissionTime: document.getElementById('admissionTime').value
  };

  try {
    await api.registerPatient(patientData);
    showNotification('Paciente registrado com sucesso!', 'success');
    document.getElementById('patientForm').reset();
    document.getElementById('patientForm').style.display = 'none';
    loadData();
  } catch (error) {
    showNotification('Erro ao registrar paciente: ' + error.message, 'error');
  }
}

async function renderPatientsList() {
  const tbody = document.getElementById('patientsTableBody');
  
  if (allPatients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum paciente registrado</td></tr>';
    return;
  }

  tbody.innerHTML = allPatients.map(patient => `
    <tr>
      <td>${patient.first_name} ${patient.last_name}</td>
      <td>${patient.date_of_birth}</td>
      <td>${patient.street}, ${patient.house_number} - ${patient.neighborhood}, ${patient.city}</td>
      <td>${patient.admission_date} ${patient.admission_time}</td>
      <td>
        <button class="btn btn-primary" onclick="viewPatientDetails(${patient.id})">Visualizar</button>
      </td>
    </tr>
  `).join('');
}

function viewPatientDetails(patientId) {
  const patient = allPatients.find(p => p.id === patientId);
  if (patient) {
    alert(`Paciente: ${patient.first_name} ${patient.last_name}\nData Nascimento: ${patient.date_of_birth}\nEndereço: ${patient.street}, ${patient.house_number}`);
  }
}

// ==================== Vital Signs Functions ====================
async function submitVitalSignsForm(e) {
  e.preventDefault();

  const vitalSignsData = {
    patientId: document.getElementById('vsPatientId').value,
    bloodPressure: document.getElementById('bloodPressure').value,
    heartRate: parseInt(document.getElementById('heartRate').value),
    spo2: parseFloat(document.getElementById('spo2').value),
    glucose: parseFloat(document.getElementById('glucose').value),
    recordDate: document.getElementById('recordDate').value.replace(/\//g, '-'),
    recordTime: document.getElementById('recordTime').value,
    recordedBy: document.getElementById('recordedBy').value
  };

  try {
    await api.recordVitalSigns(vitalSignsData);
    showNotification('Prova de vida registrada com sucesso!', 'success');
    document.getElementById('vitalSignsForm').reset();
    document.getElementById('vitalSignsForm').style.display = 'none';
    loadData();
  } catch (error) {
    showNotification('Erro ao registrar prova: ' + error.message, 'error');
  }
}

async function renderVitalSignsList() {
  const tbody = document.getElementById('vitalSignsTableBody');
  
  // Carregar todas as provas
  let allVS = [];
  for (const patient of allPatients) {
    const vs = await api.getVitalSignsByPatient(patient.id).catch(() => []);
    allVS = allVS.concat(vs);
  }

  if (allVS.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma prova registrada</td></tr>';
    return;
  }

  tbody.innerHTML = allVS.map(vs => {
    const patient = allPatients.find(p => p.id === vs.patient_id);
    return `
      <tr>
        <td>${patient ? patient.first_name + ' ' + patient.last_name : 'N/A'}</td>
        <td>${vs.blood_pressure}</td>
        <td>${vs.heart_rate} bpm</td>
        <td>${vs.spo2}%</td>
        <td>${vs.glucose} mg/dL</td>
        <td>${vs.record_date} ${vs.record_time}</td>
        <td>${vs.recorded_by}</td>
      </tr>
    `;
  }).join('');
}

// ==================== Medications Functions ====================
async function submitMedicationForm(e) {
  e.preventDefault();

  let medicationName = document.getElementById('medicationSelect').value;
  if (medicationName === '') {
    medicationName = document.getElementById('medicationOther').value;
  } else {
    const selected = standardMedications.find(m => m.id == medicationName);
    medicationName = selected ? `${selected.name}` : medicationName;
  }

  const medicationData = {
    patientId: document.getElementById('medPatientId').value,
    medicationName: medicationName,
    isRequired: document.getElementById('isRequired').checked,
    notes: document.getElementById('medicationNotes').value,
    administeredDate: document.getElementById('administeredDate').value.replace(/\//g, '-'),
    administeredTime: document.getElementById('administeredTime').value
  };

  try {
    await api.recordMedication(medicationData);
    showNotification('Medicação registrada com sucesso!', 'success');
    document.getElementById('medicationForm').reset();
    document.getElementById('medicationForm').style.display = 'none';
    loadData();
  } catch (error) {
    showNotification('Erro ao registrar medicação: ' + error.message, 'error');
  }
}

async function renderMedicationsList() {
  const tbody = document.getElementById('medicationsTableBody');
  
  let allMeds = [];
  for (const patient of allPatients) {
    const meds = await api.getMedicationsByPatient(patient.id).catch(() => []);
    allMeds = allMeds.concat(meds);
  }

  if (allMeds.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma medicação registrada</td></tr>';
    return;
  }

  tbody.innerHTML = allMeds.map(med => {
    const patient = allPatients.find(p => p.id === med.patient_id);
    return `
      <tr>
        <td>${patient ? patient.first_name + ' ' + patient.last_name : 'N/A'}</td>
        <td>${med.medication_name}</td>
        <td>${med.is_required ? 'Sim' : 'Não'}</td>
        <td>${med.administered_date || '-'} ${med.administered_time || ''}</td>
        <td>${med.notes || '-'}</td>
      </tr>
    `;
  }).join('');
}

// ==================== Users Functions ====================
async function submitUserForm(e) {
  e.preventDefault();

  const userData = {
    username: document.getElementById('userUsername').value,
    password: document.getElementById('userPassword').value,
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value
  };

  try {
    await api.createUser(userData);
    showNotification('Usuário criado com sucesso!', 'success');
    document.getElementById('userForm').reset();
    document.getElementById('userForm').style.display = 'none';
    loadData();
  } catch (error) {
    showNotification('Erro ao criar usuário: ' + error.message, 'error');
  }
}

async function renderUsersList() {
  const tbody = document.getElementById('usersTableBody');

  if (!['admin', 'root'].includes(currentUser.role)) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Acesso negado</td></tr>';
    return;
  }

  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum usuário</td></tr>';
    return;
  }

  tbody.innerHTML = allUsers.map(user => `
    <tr>
      <td>${user.username}</td>
      <td>${user.name}</td>
      <td>${user.email || '-'}</td>
      <td>${getRoleLabel(user.role)}</td>
      <td>${user.active ? 'Ativo' : 'Inativo'}</td>
      <td>
        <button class="btn btn-danger" onclick="deleteUserConfirm(${user.id})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

async function deleteUserConfirm(userId) {
  if (confirm('Tem certeza que deseja deletar este usuário?')) {
    try {
      await api.deleteUser(userId);
      showNotification('Usuário deletado com sucesso!', 'success');
      loadData();
    } catch (error) {
      showNotification('Erro ao deletar usuário: ' + error.message, 'error');
    }
  }
}
