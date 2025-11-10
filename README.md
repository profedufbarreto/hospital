# Sistema de Prontuário Eletrônico Hospitalar

Sistema completo de gerenciamento de prontuários eletrônicos com controle de permissões por usuário, múltiplos módulos e integração com banco de dados MySQL.

## 🏗️ Estrutura do Projeto

```
hospital/
├── assets/                 # Recursos estáticos
│   ├── css/               # Folhas de estilo
│   ├── js/                # Scripts do frontend
│   └── images/            # Imagens e ícones
├── backend/               # Backend (Node.js/Express)
│   ├── config/            # Configurações (DB, env)
│   ├── controllers/       # Controladores de lógica
│   ├── models/            # Modelos de dados
│   ├── routes/            # Rotas da API
│   └── middleware/        # Middleware (autenticação, permissões)
├── pages/                 # Páginas HTML (frontend)
├── database/              # Scripts e migrations SQL
├── package.json           # Dependências Node.js
└── .env.example           # Variáveis de ambiente
```

## 🔐 Hierarquia de Usuários

1. **Administrador (adm)** - Acesso total a todos os módulos e permissões
2. **Root** - Acesso total (super admin)
3. **Técnico** - Gerencia enfermeiros e pode editar/remover anotações
4. **Enfermeiro** - Apenas visualiza e adiciona informações de pacientes

## 📋 Módulos

- **Dashboard Principal** - Visão geral do sistema
- **Prontuário Digital** - Registro de pacientes e anotações médicas
- **Prova de Vida** - Registro de sinais vitais (pressão, batimentos, SpO2, glicose)
- **Gerenciamento de Usuários** - CRUD de usuários (apenas adm/root)
- **Calculadora de Dosagens** - Conversões farmacêuticas (mg→ml, gotas, etc)
- **Relatórios e Registros** - Histórico de todas as baixas

## 🚀 Como Começar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar banco de dados:**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Criar arquivo .env:**
   ```bash
   cp .env.example .env
   ```

4. **Iniciar o servidor:**
   ```bash
   npm start
   ```

## 🔑 Credenciais Padrão

- **Usuário:** adm | **Senha:** adm
- **Usuário:** root | **Senha:** root

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js, Express.js
- **Banco de Dados:** MySQL
- **Autenticação:** JWT (JSON Web Tokens)

## 📝 Notas de Desenvolvimento

- Todas as senhas são hash SHA-256
- Tokens JWT expiram em 24 horas
- API segue padrão RESTful
- Permissões verificadas em middleware
