# Arquitetura do Sistema de Prontuário Eletrônico

## Fluxo Geral da Aplicação

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ login.html → Autentica usuário                            │ │
│  │ dashboard.html → Gerencia todos os módulos               │ │
│  │   ├── Prontuário Digital (Pacientes)                     │ │
│  │   ├── Prova de Vida (Sinais Vitais)                      │ │
│  │   ├── Medicações                                          │ │
│  │   ├── Calculadora de Dosagens                            │ │
│  │   └── Gerenciar Usuários                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                │                                 │
│  Assets (CSS/JS):             │                                 │
│  ├── style.css                │                                 │
│  ├── api.js (HTTP Client)     │                                 │
│  ├── dashboard.js             │                                 │
│  └── dosage-calculator.js     │                                 │
└──────────────┬─────────────────┼─────────────────────────────────┘
               │                 │
         HTTP  │                 │
         HTTPS │                 │ JWT Token
               │                 │
    ┌──────────▼─────────────────▼───────────────────────────────┐
    │              EXPRESS.js SERVER (Backend)                   │
    │  ┌─────────────────────────────────────────────────────┐  │
    │  │  Middleware (Autenticação/Autorização)             │  │
    │  │  - authenticate() → Verifica JWT                   │  │
    │  │  - authorize() → Verifica Role (RBAC)              │  │
    │  └─────────────────────────────────────────────────────┘  │
    │                                                             │
    │  Routes (API Endpoints)                                    │
    │  ├── /api/auth/login (POST)        → authController      │
    │  ├── /api/users/*                  → userController      │
    │  ├── /api/patients/*               → patientController   │
    │  ├── /api/vital-signs/*            → vitalSignsCtrlr     │
    │  ├── /api/medications/*            → medicationCtrlr     │
    │  └── /api/dosage-calculator/*      → dosageCtrlr        │
    │                                                             │
    │  Controllers (Lógica de Negócio)                          │
    │  ├── authController.js                                    │
    │  ├── userController.js                                    │
    │  ├── patientController.js                                 │
    │  ├── vitalSignsController.js                              │
    │  ├── medicationController.js                              │
    │  └── dosageCalculatorController.js                        │
    └──────────────┬──────────────────────────────────────────────┘
                   │
           MySQL   │
           Query   │
                   │
    ┌──────────────▼──────────────────────────────────────────────┐
    │              MYSQL DATABASE                                │
    │  ┌─────────────────────────────────────────────────────┐  │
    │  │ hospital_db                                         │  │
    │  │ ├── users (id, username, password, role)            │  │
    │  │ ├── patients (id, first_name, date_of_birth, cep) │  │
    │  │ ├── vital_signs (id, patient_id, bp, hr, spo2)   │  │
    │  │ ├── medications (id, patient_id, medication_name) │  │
    │  │ └── standard_medications (id, name, unit)          │  │
    │  └─────────────────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────────────────┘
```

## Fluxo de Autenticação

```
1. Usuário faz login
   └─► Form envia username + password
       └─► POST /api/auth/login
           └─► authController.login()
               ├─► Busca usuário no BD
               ├─► Compara SHA-256 hash da senha
               └─► Gera JWT Token
                   └─► Token retorna ao cliente
                       └─► Client armazena em localStorage

2. Requisições subsequentes
   └─► API.js adiciona header: Authorization: Bearer {token}
       └─► Middleware authenticate() verifica token
           ├─► Se válido → req.user = decoded JWT
           ├─► Se inválido → 401 Unauthorized
           └─► authorize() verifica se role tem permissão
               └─► Se autorizado → Executa controller
               └─► Se negado → 403 Forbidden
```

## Fluxo de Criação de Paciente

```
1. Usuário (Enfermeiro) preenche formulário
   ├─ Nome
   ├─ Sobrenome
   ├─ Data Nascimento
   ├─ CEP (dispara ajax para ViaCEP)
   ├─ Número da casa
   ├─ Data de baixa
   └─ Hora de baixa

2. JavaScript executa submitPatientForm()
   └─► api.registerPatient(patientData)
       └─► POST /api/patients com Bearer token
           └─► patientController.registerPatient()
               ├─► Valida campos
               ├─► Extrai user.id do JWT
               └─► INSERT INTO patients
                   └─► Retorna sucesso
                       └─► Frontend mostra notificação
                           └─► Recarrega lista
```

## Fluxo da Calculadora de Dosagens

```
Usuário seleciona tipo de cálculo (mg→ml)
├─ Preenche mg = 500
├─ Preenche concentração = 250
└─ Clica "Calcular"
   └─► calculateMgToMl()
       └─► api.calculateDosage('mg-to-ml', {mg: 500, concentration: 250})
           └─► POST /api/dosage-calculator/calculate
               └─► dosageCalculatorController.calculate()
                   ├─► Valida tipo e parâmetros
                   ├─► Executa convertMgToMl(500, 250)
                   ├─► Resultado: 2.00 ml
                   └─► Retorna {success: true, result: '2.00'}
                       └─► Frontend exibe: "500 mg = 2.00 ml"
```

## Modelo de Dados (ER Diagram)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username        │ ← Índice único
│ password        │
│ name            │
│ email           │
│ role            │ ← admin, technician, nurse
│ active          │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N (created_by)
         │
    ┌────▼─────────────────────┐
    │      patients            │
    ├────────────────────────┐ │
    │ id (PK)                │ │
    │ first_name             │ │
    │ last_name              │ │
    │ date_of_birth (dd-mm)  │ │
    │ cep                    │ │
    │ street                 │ │
    │ neighborhood           │ │
    │ city                   │ │
    │ house_number           │ │
    │ admission_date         │ │
    │ admission_time         │ │
    │ created_by (FK)        │ │
    │ created_at             │ │
    └──┬──────────────────────┘ │
       │                        │
       │ 1:N                    │
       │                        │
    ┌──┴──────────────────────┐ │
    │   vital_signs           │ │
    ├────────────────────────┐ │
    │ id (PK)                │ │
    │ patient_id (FK)        │ │
    │ blood_pressure         │ │ (120/80)
    │ heart_rate             │ │ (bpm)
    │ spo2                   │ │ (%)
    │ glucose                │ │ (mg/dL)
    │ record_date (dd-mm)    │ │
    │ record_time (hh:mm)    │ │
    │ recorded_by            │ │
    │ created_by (FK)        │ │
    │ created_at             │ │
    └────────────────────────┘ │
       │                        │
       │ 1:N                    │
       │                        │
    ┌──┴──────────────────────┐ │
    │    medications          │ │
    ├────────────────────────┐ │
    │ id (PK)                │ │
    │ patient_id (FK)        │ │
    │ medication_id (FK*)    │ │
    │ medication_name        │ │
    │ is_required            │ │
    │ notes                  │ │
    │ administered_date      │ │
    │ administered_time      │ │
    │ created_by (FK)        │ │
    │ created_at             │ │
    └────────────────────────┘ │
       │ (*opcional)            │
       │                        │
    ┌──▼──────────────────────┐ │
    │standard_medications    │ │
    ├────────────────────────┐ │
    │ id (PK)                │ │
    │ name                   │ │
    │ unit                   │ │
    │ active                 │ │
    │ created_at             │ │
    └────────────────────────┘ │
                                │
```

## Tabela de Roles e Permissões

```
┌───────────┬────────┬──────────┬────────┬────────────┐
│  Ação     │ Admin  │ Technic. │ Nurse  │ Root       │
├───────────┼────────┼──────────┼────────┼────────────┤
│ Ver Users │   ✓    │    ✗     │   ✗    │     ✓      │
│ Add Users │   ✓    │    ✗     │   ✗    │     ✓      │
│ Del Users │   ✓    │    ✗     │   ✗    │     ✓      │
├───────────┼────────┼──────────┼────────┼────────────┤
│ Ver Pat.  │   ✓    │    ✓     │   ✓    │     ✓      │
│ Add Pat.  │   ✓    │    ✓     │   ✓    │     ✓      │
│ Edit Pat. │   ✓    │    ✓     │   ✗    │     ✓      │
├───────────┼────────┼──────────┼────────┼────────────┤
│ Ver V.S.  │   ✓    │    ✓     │   ✓    │     ✓      │
│ Add V.S.  │   ✓    │    ✓     │   ✓    │     ✓      │
│ Del V.S.  │   ✓    │    ✓     │   ✗    │     ✓      │
├───────────┼────────┼──────────┼────────┼────────────┤
│ Ver Med.  │   ✓    │    ✓     │   ✓    │     ✓      │
│ Add Med.  │   ✓    │    ✓     │   ✓    │     ✓      │
│ Del Med.  │   ✓    │    ✓     │   ✗    │     ✓      │
├───────────┼────────┼──────────┼────────┼────────────┤
│ Calcular  │   ✓    │    ✓     │   ✓    │     ✓      │
└───────────┴────────┴──────────┴────────┴────────────┘
```
