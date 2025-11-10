# 📋 Estrutura Completa do Projeto

## Árvore de Diretórios

```
hospital/
│
├── 📁 backend/                          # Backend (Node.js + Express)
│   ├── 📁 config/
│   │   └── database.js                  # Conexão MySQL (pool)
│   │
│   ├── 📁 controllers/                  # Lógica de Negócio
│   │   ├── authController.js            # Login/Logout (JWT)
│   │   ├── userController.js            # CRUD de Usuários
│   │   ├── patientController.js         # Registro de Pacientes
│   │   ├── vitalSignsController.js      # Sinais Vitais
│   │   ├── medicationController.js      # Medicações
│   │   └── dosageCalculatorController.js # Cálculos
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                      # authenticate() e authorize()
│   │
│   ├── 📁 routes/                       # Rotas API (RESTful)
│   │   ├── auth.js                      # POST /api/auth/login
│   │   ├── users.js                     # /api/users/* (admin only)
│   │   ├── patients.js                  # /api/patients/*
│   │   ├── vitalSigns.js                # /api/vital-signs/*
│   │   ├── medications.js               # /api/medications/*
│   │   └── dosageCalculator.js          # /api/dosage-calculator/*
│   │
│   └── 📁 models/                       # (Vazio - queries em controllers)
│
├── 📁 pages/                            # Frontend HTML
│   ├── login.html                       # Tela de Login
│   └── dashboard.html                   # Dashboard Principal (6 módulos)
│
├── 📁 assets/                           # Recursos Estáticos
│   ├── 📁 css/
│   │   └── style.css                    # Estilos CSS (responsivo)
│   │
│   ├── 📁 js/                           # JavaScript Frontend
│   │   ├── api.js                       # Cliente HTTP (classe API)
│   │   ├── login.js                     # Lógica de Login
│   │   ├── dashboard.js                 # Lógica Principal
│   │   └── dosage-calculator.js         # Funções de Cálculo
│   │
│   └── 📁 images/                       # (Vazio - para ícones/logos)
│
├── 📁 database/                         # Scripts SQL
│   └── schema.sql                       # Criação de tabelas + dados padrão
│
├── 📁 .github/
│   └── copilot-instructions.md          # Instruções para AI Agents ✨
│
├── server.js                            # Servidor Principal
├── package.json                         # Dependências Node.js
├── .env.example                         # Variáveis de Ambiente (template)
├── .gitignore                           # Arquivos ignorados pelo Git
│
├── README.md                            # Documentação Principal
├── QUICKSTART.md                        # Guia Rápido de Instalação
├── ARCHITECTURE.md                      # Diagrama da Arquitetura
└── TESTING.md                           # Testes e Verificações

```

## 📦 Dependências do Projeto

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.1.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.20.2"
  }
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```
┌─────────────────────┐
│ users               │
├─────────────────────┤
│ id (INT, PK)        │
│ username (VARCHAR)  │
│ password (SHA-256)  │
│ name (VARCHAR)      │
│ email (VARCHAR)     │
│ role (ENUM)         │  ← admin, technician, nurse
│ active (BOOLEAN)    │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────────┐
│ patients                │
├─────────────────────────┤
│ id (INT, PK)            │
│ first_name (VARCHAR)    │
│ last_name (VARCHAR)     │
│ date_of_birth (VARCHAR) │  ← dd-mm-yyyy
│ cep (VARCHAR)           │
│ street (VARCHAR)        │
│ neighborhood (VARCHAR)  │
│ city (VARCHAR)          │
│ house_number (VARCHAR)  │
│ admission_date (VARCHAR)│  ← dd-mm-yyyy
│ admission_time (VARCHAR)│  ← hh:mm
│ created_by (FK)         │  → users.id
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│ vital_signs             │
├─────────────────────────┤
│ id (INT, PK)            │
│ patient_id (FK)         │
│ blood_pressure (VARCHAR)│  ← 120/80
│ heart_rate (INT)        │  ← bpm
│ spo2 (DECIMAL)          │  ← %
│ glucose (DECIMAL)       │  ← mg/dL
│ record_date (VARCHAR)   │  ← dd-mm-yyyy
│ record_time (VARCHAR)   │  ← hh:mm
│ recorded_by (VARCHAR)   │
│ created_by (FK)         │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│ medications             │
├─────────────────────────┤
│ id (INT, PK)            │
│ patient_id (FK)         │
│ medication_id (FK)      │
│ medication_name (VARCHAR)│
│ is_required (BOOLEAN)   │
│ notes (TEXT)            │
│ administered_date       │
│ administered_time       │
│ created_by (FK)         │
│ created_at              │
│ updated_at              │
└─────────────────────────┘

┌──────────────────────────┐
│ standard_medications     │
├──────────────────────────┤
│ id (INT, PK)             │
│ name (VARCHAR)           │
│ unit (VARCHAR)           │  ← mg, ml, etc
│ active (BOOLEAN)         │
│ created_at               │
└──────────────────────────┘
```

## 🔌 Endpoints da API

### Autenticação (Público)
```
POST   /api/auth/login          → Fazer login
POST   /api/auth/logout         → Fazer logout
```

### Usuários (Admin/Root apenas)
```
GET    /api/users               → Listar usuários
GET    /api/users/:id           → Obter usuário
POST   /api/users               → Criar usuário
PUT    /api/users/:id           → Editar usuário
DELETE /api/users/:id           → Deletar usuário
```

### Pacientes (Todos autenticados)
```
GET    /api/patients            → Listar pacientes
GET    /api/patients/:id        → Obter paciente
POST   /api/patients            → Registrar paciente
PUT    /api/patients/:id        → Editar paciente
```

### Sinais Vitais (Todos autenticados)
```
POST   /api/vital-signs         → Registrar prova
GET    /api/vital-signs/patient/:id → Obter provas do paciente
PUT    /api/vital-signs/:id     → Editar prova (technic/admin)
DELETE /api/vital-signs/:id     → Deletar prova (technic/admin)
```

### Medicações (Todos autenticados)
```
POST   /api/medications         → Registrar medicação
GET    /api/medications/patient/:id → Obter medicações
GET    /api/medications/standard/list → Listar medicações padrão
PUT    /api/medications/:id     → Editar medicação (technic/admin)
DELETE /api/medications/:id     → Deletar medicação (technic/admin)
```

### Calculadora (Todos autenticados)
```
POST   /api/dosage-calculator/calculate → Executar cálculo
   • type: 'mg-to-ml' | 'mg-to-drops' | 'ml-to-drops' | 'drops-per-minute' | 'dose-by-weight' | 'bmi'
```

## 🎨 Módulos do Frontend

### 1. Dashboard
- Visualização de estatísticas
- Cards com totais (pacientes, provas, medicações, usuários)
- Acesso rápido aos módulos

### 2. Prontuário Digital
- Criar/visualizar pacientes
- Campos: nome, sobrenome, data nascimento, CEP, endereço
- CEP auto-completa via ViaCEP
- Data e hora de admissão

### 3. Prova de Vida
- Registrar sinais vitais
- Campos: pressão arterial, batimentos, SpO2, glicose
- Data e hora do registro
- Quem realizou

### 4. Medicações
- Registrar medicações administradas
- Seleção de lista padrão + opção "Outros"
- Marcar se necessária (S/N)
- Data/hora da administração

### 5. Calculadora de Dosagens
- mg → ml
- ml → gotas
- Gotas/minuto
- Dose por peso
- IMC

### 6. Gerenciar Usuários (Admin/Root)
- CRUD de usuários
- Atribuir papéis
- Ativar/desativar

## 🔐 Fluxo de Segurança

```
1. Login (sem proteção)
   ↓
2. Server cria JWT Token
   ↓
3. Client armazena em localStorage
   ↓
4. Todas as requisições incluem: Authorization: Bearer {token}
   ↓
5. Middleware authenticate() valida token
   ↓
6. Middleware authorize() verifica role
   ↓
7. Controller executa lógica
   ↓
8. Database retorna dados
   ↓
9. Resposta JSON ao cliente
```

## 🚀 Como Iniciar

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco de dados
mysql -u root -p < database/schema.sql

# 3. Copiar .env
cp .env.example .env

# 4. Iniciar servidor
npm start

# 5. Abrir browser
http://localhost:3000
```

## ✅ Checklist de Desenvolvimento

- [x] Estrutura de pastas
- [x] Configuração de banco de dados
- [x] Autenticação JWT
- [x] Middleware de autorização
- [x] CRUD de usuários
- [x] CRUD de pacientes
- [x] Registro de sinais vitais
- [x] Gerenciamento de medicações
- [x] Calculadora de dosagens
- [x] Frontend responsivo
- [x] Login e dashboard
- [x] Integração com ViaCEP
- [x] Documentação completa
- [ ] Testes automatizados
- [ ] Deploy em produção

## 📚 Arquivos de Documentação

1. **README.md** - Visão geral do projeto
2. **QUICKSTART.md** - Guia de instalação rápida
3. **ARCHITECTURE.md** - Diagramas e arquitetura
4. **TESTING.md** - Testes e verificações
5. **.github/copilot-instructions.md** - Instruções para AI Agents

---

**Projeto pronto para uso!** 🎉

Todas as peças estão no lugar. Você pode começar a usá-lo agora ou fazer modificações conforme necessário.
