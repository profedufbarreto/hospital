# 🎓 Guia para AI Agents - Como Trabalhar com Este Codebase

Bem-vindo! Este guia ajuda você (um AI Agent) a entender e trabalhar com o sistema de prontuário eletrônico.

---

## 🗺️ Mapa Mental do Projeto

```
SISTEMA DE PRONTUÁRIO
│
├─ LOGIN (não autenticado)
│  └─ POST /api/auth/login → JWT Token
│
├─ DASHBOARD (autenticado, todos os roles)
│  ├─ Visualizar estatísticas
│  └─ Acessar 6 módulos
│
├─ PRONTUÁRIO DIGITAL (todos)
│  ├─ GET /api/patients
│  ├─ POST /api/patients (criar)
│  ├─ PUT /api/patients/:id (atualizar - technician/admin)
│  └─ CEP auto-completa via ViaCEP
│
├─ PROVA DE VIDA (todos)
│  ├─ POST /api/vital-signs (criar)
│  ├─ GET /api/vital-signs/patient/:id (listar)
│  └─ DELETE /api/vital-signs/:id (technic/admin)
│
├─ MEDICAÇÕES (todos)
│  ├─ POST /api/medications (criar)
│  ├─ GET /api/medications/patient/:id (listar)
│  ├─ GET /api/medications/standard/list (listar padrão)
│  └─ DELETE /api/medications/:id (technic/admin)
│
├─ CALCULADORA (todos)
│  ├─ mg → ml
│  ├─ ml → gotas
│  ├─ gotas/minuto
│  ├─ dose por peso
│  └─ IMC
│
└─ USUÁRIOS (admin/root apenas)
   ├─ GET /api/users
   ├─ POST /api/users (criar)
   ├─ PUT /api/users/:id (editar)
   └─ DELETE /api/users/:id (deletar)
```

---

## 🔍 Encontrar Código Rápido

### "Preciso entender como funciona o login"
1. Arquivo: `pages/login.html` - Formulário
2. Arquivo: `assets/js/login.js` - Lógica frontend
3. Arquivo: `backend/controllers/authController.js` - Lógica backend
4. Arquivo: `backend/routes/auth.js` - Rota
5. Busca: `hashPassword()` para entender hash de senha

### "Preciso adicionar novo módulo"
1. Copie a estrutura: `backend/controllers/medicationController.js`
2. Crie: `backend/controllers/meuModuloController.js`
3. Crie: `backend/routes/meuModulo.js`
4. Importe em `server.js`: `app.use('/api/meu-modulo', require(...))`
5. Adicione HTML no `pages/dashboard.html` com `id="meu-modulo"`
6. Adicione botão nav com `data-module="meu-modulo"`
7. Adicione funções em `assets/js/dashboard.js`

### "Preciso entender permissões"
1. Arquivo: `backend/middleware/auth.js` - Middleware de autorização
2. Função: `authorize('admin', 'technician')` - Bloqueia roles
3. Exemplo: `backend/routes/users.js` - Usa `authorize('admin', 'root')`

### "Preciso debugar BD"
1. Query: `SELECT * FROM users;` - Ver usuários
2. Query: `SELECT * FROM patients;` - Ver pacientes
3. Query: `SELECT * FROM vital_signs;` - Ver sinais vitais
4. Query: `SELECT * FROM medications;` - Ver medicações
5. Estrutura: `database/schema.sql` - Ver DDL

### "Preciso entender calculadora"
1. Frontend: `assets/js/dosage-calculator.js` - Funções
2. Backend: `backend/controllers/dosageCalculatorController.js` - Lógica
3. Rota: `backend/routes/dosageCalculator.js` - Endpoint
4. Não usa BD - apenas cálculos matemáticos

---

## 💡 Padrões Comuns

### Adicionar Campo em Pacientes

**1. Banco de Dados:**
```sql
ALTER TABLE patients ADD COLUMN peso DECIMAL(5,2);
```

**2. HTML (dashboard.html):**
```html
<div class="form-group">
  <label for="weight">Peso (kg)</label>
  <input type="number" id="weight" name="weight" step="0.01">
</div>
```

**3. JavaScript (dashboard.js):**
```javascript
const patientData = {
  // ... outros campos
  weight: parseFloat(document.getElementById('weight').value),
};
```

**4. Backend (patientController.js):**
```javascript
const [result] = await connection.query(
  'INSERT INTO patients (..., peso, ...) VALUES (..., ?, ...)',
  [..., patientData.weight, ...]
);
```

**5. Exibir em Tabela (dashboard.js):**
```javascript
tbody.innerHTML = allPatients.map(patient => `
  <tr>
    <!-- ... outras colunas ... -->
    <td>${patient.peso} kg</td>
  </tr>
`).join('');
```

### Adicionar Cálculo na Calculadora

**1. Novo tipo de cálculo (controller):**
```javascript
// Em dosageCalculatorController.js
const meuCalculo = (param1, param2) => {
  return (param1 * param2).toFixed(2);
};
```

**2. Adicionar no switch (controller):**
```javascript
case 'meu-calculo':
  result = meuCalculo(params.param1, params.param2);
  break;
```

**3. Frontend - novo card (dashboard.html):**
```html
<div class="calc-card">
  <h3>Meu Cálculo</h3>
  <input type="number" id="param1">
  <input type="number" id="param2">
  <button class="btn btn-primary" onclick="calculateMeuCalculo()">Calcular</button>
  <p id="resultMeuCalculo" class="result"></p>
</div>
```

**4. Função JS (dosage-calculator.js):**
```javascript
async function calculateMeuCalculo() {
  const param1 = parseFloat(document.getElementById('param1').value);
  const param2 = parseFloat(document.getElementById('param2').value);
  
  try {
    const result = await api.calculateDosage('meu-calculo', { param1, param2 });
    displayResult('resultMeuCalculo', `Resultado: <strong>${result.result}</strong>`);
  } catch (error) {
    showNotification('Erro: ' + error.message, 'error');
  }
}
```

### Criar Novo Usuário com Permissão Específica

**1. Adicionar novo role (schema.sql):**
```sql
-- Mudar ENUM de users:
MODIFY COLUMN role ENUM('admin', 'technician', 'nurse', 'coordinator');
```

**2. Autorizar rota (routes):**
```javascript
router.use(authorize('admin', 'coordinator')); // Só admin e coordinator
```

**3. Verificar permissão em controller:**
```javascript
if (!['admin', 'coordinator'].includes(req.user.role)) {
  return res.status(403).json({ error: 'Acesso negado' });
}
```

---

## 🐛 Debugging Passo a Passo

### Erro: "Token inválido"

**Checklist:**
1. ✓ Token está em localStorage? (F12 → Application → Local Storage)
2. ✓ Token está sendo enviado no header? (`Authorization: Bearer ...`)
3. ✓ JWT_SECRET em `.env` é o mesmo usado para criar token?
4. ✓ Token expirou? (JWT tem 24h)

**Solução rápida:** Limpar localStorage
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
// Fazer login novamente
```

### Erro: "Acesso negado" (403)

**Checklist:**
1. ✓ Role do usuário é correto? (`SELECT role FROM users WHERE id = ?`)
2. ✓ Rota está usando `authorize()`?
3. ✓ Role está no array permitido?

**Verificar em DevTools:**
```javascript
// Console
JSON.parse(localStorage.getItem('user')).role
// Deve retornar: 'admin', 'technician', ou 'nurse'
```

### Erro: "Pacientes não aparecem"

**Checklist:**
1. ✓ Existem pacientes no BD? (`SELECT COUNT(*) FROM patients;`)
2. ✓ Usuario está autenticado?
3. ✓ `loadData()` foi chamado? (Verificar no Network)
4. ✓ Response retorna array vazio? (Verificar Response em Network)

**Debug no browser:**
```javascript
// Console
api.getPatients().then(data => console.log(data))
// Deve mostrar array de pacientes
```

### Erro: "CEP não preenche"

**Checklist:**
1. ✓ Número de caracteres >= 8? (CEP válido = 8 números)
2. ✓ Conexão internet funcionando?
3. ✓ ViaCEP está online? (Testar: `curl https://viacep.com.br/ws/01000000/json/`)

**Debug no browser:**
```javascript
// Console
fetch('https://viacep.com.br/ws/01000000/json/')
  .then(r => r.json())
  .then(d => console.log(d))
// Deve retornar endereço
```

---

## 📊 Query SQL Úteis

```sql
-- Ver todos os usuários
SELECT id, username, name, role, active FROM users;

-- Ver pacientes específicos
SELECT * FROM patients WHERE first_name LIKE '%Maria%';

-- Ver sinais vitais do dia
SELECT * FROM vital_signs WHERE record_date = '10-11-2025';

-- Ver medicações de um paciente
SELECT m.medication_name, COUNT(*) as total 
FROM medications m 
WHERE patient_id = 1 
GROUP BY medication_name;

-- Contar estatísticas
SELECT 
  (SELECT COUNT(*) FROM patients) as total_pacientes,
  (SELECT COUNT(*) FROM vital_signs) as total_sinais,
  (SELECT COUNT(*) FROM medications) as total_meds;

-- Ver usuários inativos
SELECT * FROM users WHERE active = 0;

-- Deletar todos os dados (cuidado!)
DELETE FROM medications;
DELETE FROM vital_signs;
DELETE FROM patients;
```

---

## 🚨 Seções Críticas do Código

**Nunca mexer sem motivo:**

1. `backend/middleware/auth.js` - Autenticação
2. `backend/controllers/authController.js` - Login
3. `database/schema.sql` - Estrutura do BD
4. `server.js` - Configuração do Express

**Seguro para modificar:**

1. `backend/controllers/` - Adicionar novas funções
2. `backend/routes/` - Adicionar novas rotas
3. `assets/js/dashboard.js` - Adicionar novos módulos
4. `pages/dashboard.html` - Adicionar novos formulários
5. `assets/css/style.css` - Estilos

---

## 🔑 Palavras-chave Importantes

- **JWT**: JSON Web Token (autenticação segura)
- **RBAC**: Role-Based Access Control (controle por papel)
- **ViaCEP**: API para lookup de CEP
- **Middleware**: Função que processa requisição antes do controller
- **Hash**: SHA-256 (codificar senha)
- **Controller**: Lógica de negócio
- **Route**: Mapeamento de URL → Controller
- **Endpoint**: URL da API (ex: /api/patients)

---

## 📞 Quando Pedir Ajuda

**Clarifique:**
1. Qual arquivo está tendo problema?
2. Qual é o erro exato? (screenshot ou mensagem)
3. O que estava tentando fazer?
4. Qual é o stack trace? (F12 → Console)

**Exemplo bom:**
"Em `pages/dashboard.html`, o formulário de pacientes não está enviando. Erro no console: 'api.registerPatient is not a function'. Estou tentando criar novo paciente."

---

## ✅ Checklist Antes de Fazer Deploy

- [ ] JWT_SECRET é seguro (32+ caracteres)?
- [ ] Senha SHA-256 foi atualizada para bcrypt?
- [ ] `.env` tem todas as variáveis?
- [ ] CORS_ORIGIN é correto (não é localhost)?
- [ ] BD foi feito backup?
- [ ] Todos os testes passaram?
- [ ] Logs estão configurados?
- [ ] Monitoramento está ativo?

---

**Boa sorte! 🚀**
