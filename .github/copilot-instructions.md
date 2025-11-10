# Sistema de Prontuário Eletrônico Hospitalar - Instruções para AI Agents

## Visão Geral da Arquitetura

Este é um **sistema full-stack de prontuário eletrônico hospitalar** construído com:
- **Backend:** Node.js + Express.js + MySQL
- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla
- **Autenticação:** JWT (JSON Web Tokens)
- **Arquitetura:** MVC com separação clara entre rotas, controllers e modelos

### Estrutura de Diretórios
```
hospital/
├── backend/              # Backend (Express)
│   ├── config/          # Conexão BD, variáveis
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Auth, autorização
│   ├── models/          # (queries SQL)
│   └── routes/          # Endpoints API
├── pages/               # HTML do frontend
├── assets/              # CSS, JS, imagens
└── database/            # Scripts SQL
```

## Hierarquia de Permissões

O sistema usa **role-based access control (RBAC)**:

1. **admin/root** - Acesso total a todos os módulos
2. **technician** - Gerencia enfermeiros e pode editar/remover anotações
3. **nurse** - Apenas visualiza e adiciona informações (sem deletar)

**Implementação:** Middleware `authorize()` em `backend/middleware/auth.js` bloqueia acesso não autorizado.

## Pontos Críticos da Arquitetura

### 1. Autenticação
- **Arquivo:** `backend/controllers/authController.js`
- **Fluxo:** Cliente → POST `/api/auth/login` → JWT token → Armazenado em localStorage
- **Senha:** Hash SHA-256 (NÃO é seguro para produção - usar bcrypt)
- **Importante:** Token JWT tem 24h de expiração

### 2. Proteção de Rotas
- **Middleware:** Todas as rotas usam `authenticate` middleware
- **Verificação dupla:** `authenticate` (tem token?) + `authorize` (tem permissão?)
- **Exemplo:** GET `/api/users` requer `admin` ou `root`

### 3. Integração Frontend-Backend
- **API Client:** `assets/js/api.js` - Classe `API` centraliza todas as chamadas
- **Endpoints Base:** `http://localhost:3000/api/`
- **Headers:** Autorização com `Bearer {token}`
- **Padrão:** Todos os controllers retornam `{ success, data, error }`

### 4. Dados de Pacientes
- **Tipo de Data:** String formato `dd-mm-yyyy` no BD (NÃO datetime)
- **CEP Lookup:** Integra com ViaCEP (https://viacep.com.br) automaticamente
- **Fluxo:** User digita CEP → Ajax lookup → Preenchimento automático de endereço

## Fluxos de Dados Principais

### Registrar Novo Paciente
```
Form (dashboard.html) 
  → submitPatientForm() 
  → api.registerPatient() 
  → POST /api/patients 
  → patientController.registerPatient() 
  → INSERT patients table
```

### Registrar Prova de Vida
```
vitalSignsForm
  → submitVitalSignsForm()
  → api.recordVitalSigns()
  → POST /api/vital-signs
  → vitalSignsController.recordVitalSigns()
  → INSERT vital_signs table
```

### Calculadora de Dosagens
```
calculadora (frontend)
  → calculateMgToMl() / calculateDropsPerMinute() etc
  → api.calculateDosage(type, params)
  → POST /api/dosage-calculator/calculate
  → dosageCalculatorController.calculate()
  → Retorna resultado (sem BD)
```

## Convenções de Código

### Controllers
- **Nomenclatura:** `{recurso}Controller.js` (ex: `userController.js`)
- **Funções:** Uma função por endpoint
- **Erro:** try/catch com `res.status(400/401/403/500).json({error})`
- **Sucesso:** `res.json({success: true, data})`

### Rotas
- **Padrão RESTful:** 
  - `GET /api/resource` - listar
  - `GET /api/resource/:id` - obter um
  - `POST /api/resource` - criar
  - `PUT /api/resource/:id` - editar
  - `DELETE /api/resource/:id` - deletar
- **Proteção:** Aplicar `authenticate` e `authorize` em cada rota

### Frontend
- **Modularidade:** Cada módulo (patients, medications, users) tem seu próprio formulário
- **Toggle:** `switchModule()` mostra/oculta módulos e atualiza breadcrumb
- **Carregamento:** `loadData()` executa ao iniciar; rotas chamam `renderXList()` ao ativar

## Dados Padrão do Sistema

### Usuários Iniciais
- **Username:** `adm` | **Senha:** `adm` | **Role:** admin
- **Username:** `root` | **Senha:** `root` | **Role:** admin

### Medicações Padrão
Inseridas em `database/schema.sql` (Dipirona, Amoxicilina, Paracetamol, etc.)
- Lista em dropdown sem permitir deletar (evitar perda de referência histórica)

## Modificações Comuns

### Adicionar Novo Módulo
1. Criar rota em `backend/routes/{modulo}.js`
2. Criar controller em `backend/controllers/{modulo}Controller.js`
3. Importar rota em `server.js`: `app.use('/api/{modulo}', {rotaImportada})`
4. Adicionar HTML em `pages/dashboard.html` com ID do módulo
5. Adicionar botão nav `.nav-item` com `data-module="{modulo}"`
6. Criar funções JS em `assets/js/dashboard.js`

### Adicionar Campo no BD
1. Editar `database/schema.sql`: `ALTER TABLE ... ADD COLUMN ...`
2. Executar script no MySQL
3. Adicionar campo no formulário HTML
4. Adicionar no controller (capturar e salvar)
5. Adicionar no `renderXList()` para exibir na tabela

### Mudar Autenticação (SSH-256 para bcrypt)
1. Em `backend/controllers/authController.js`, substitua:
   ```javascript
   // Antes
   const hashPassword = (password) => {
     return crypto.createHash('sha256').update(password).digest('hex');
   };
   // Depois
   const bcrypt = require('bcryptjs');
   const hashPassword = async (password) => {
     return await bcrypt.hash(password, 10);
   };
   ```
2. Instale: `npm install bcryptjs`

## Debugging

### Login Não Funciona
- [ ] Verificar `database/schema.sql` foi executado: `mysql hospital_db < database/schema.sql`
- [ ] Verificar credenciais em `users` table: `SELECT * FROM users;`
- [ ] Confirmar token JWT em `localStorage` no DevTools (F12 → Application)

### Pacientes Não Aparecem
- [ ] Confirmar pacientes no BD: `SELECT * FROM patients;`
- [ ] Verificar permissão do usuário (todos podem ver)
- [ ] Confirmar `loadData()` foi chamado após login

### Calculadora Não Funciona
- [ ] Endpoint não precisa BD - verifica se `dosageCalculatorController.calculate()` está correto
- [ ] Testar com cURL: `curl -X POST http://localhost:3000/api/dosage-calculator/calculate -H "Content-Type: application/json" -d '{"type":"mg-to-ml","params":{"mg":500,"concentration":250}}'`

### Erro CORS
- [ ] Verificar `CORS_ORIGIN` em `.env`
- [ ] Deve corresponder a `http://localhost:3000` se desenvolvendo localmente

## Próximas Melhorias Sugeridas

- [ ] Usar bcryptjs em vez de SHA-256
- [ ] Adicionar timestamps `updated_at` e auditoria
- [ ] Implementar paginação em listagens
- [ ] Adicionar upload de arquivos (exames, comprovantes)
- [ ] Dashboard com gráficos (tendência de sinais vitais)
- [ ] Relatórios PDF de prontuários
- [ ] Notificações em tempo real via WebSocket
- [ ] Mobile app (React Native)

## Recursos

- **ViaCEP API:** https://viacep.com.br (sem autenticação)
- **JWT.io:** Validar/debugar tokens
- **Postman:** Testar endpoints manualmente
- **MySQL Workbench:** Gerenciar BD visualmente
